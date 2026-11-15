-- Discord account linking for the gallery (read-only phase)
--
-- Identity comes exclusively from the signed Supabase session (Discord OAuth),
-- never from anything the client sends, so nobody can claim another user's
-- submissions by passing a discord_user_id around.
--
-- Required dashboard steps BEFORE this is useful:
--   1. Authentication > Providers > Discord -> enable, paste Client ID + Secret
--      (Discord dev portal > OAuth2 > Redirects must include:
--       https://sbvjehmbkmdlflocjjtu.supabase.co/auth/v1/callback )
--   2. Authentication > URL Configuration > Redirect URLs -> add:
--       https://ultrakidle.online/me
--       http://localhost:5173/me
--
-- Nothing here touches existing data. It only adds functions + one SELECT policy.

-- Discord id of the current session, taken from the JWT (signed by Supabase),
-- with a fallback to auth.identities in case provider_id is not in app_metadata.
create or replace function public.current_discord_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'provider_id',
    (
      select coalesce(i.provider_id, i.identity_data ->> 'sub')
      from auth.identities i
      where i.user_id = auth.uid()
        and i.provider = 'discord'
      limit 1
    )
  );
$$;

-- submitter_profiles rows that belong to the current session.
create or replace function public.my_submitter_ids()
returns setof bigint
language sql
stable
security definer
set search_path = public
as $$
  select p.id::bigint
  from public.submitter_profiles p
  where public.current_discord_id() is not null
    and p.discord_user_id::text = public.current_discord_id();
$$;

-- Only logged-in users may call these.
revoke execute on function public.current_discord_id() from public;
revoke execute on function public.my_submitter_ids() from public;
grant execute on function public.current_discord_id() to authenticated;
grant execute on function public.my_submitter_ids() to authenticated;

-- Logged-in submitters can read their own submissions, whatever the status.
-- (The existing policy keeps approved ones public.)
drop policy if exists "submitter can read own submissions" on public.image_submissions;
create policy "submitter can read own submissions"
on public.image_submissions
for select
to authenticated
using (submitter_id in (select public.my_submitter_ids()));

-- Safety net: whatever anonymous visitors can read today, logged-in visitors
-- must keep seeing too (the gallery breaks otherwise). Both policies are
-- permissive, so they only add to the existing ones.
drop policy if exists "authenticated can read approved submissions" on public.image_submissions;
create policy "authenticated can read approved submissions"
on public.image_submissions
for select
to authenticated
using (status = 'approved');

drop policy if exists "authenticated can read submitter profiles" on public.submitter_profiles;
create policy "authenticated can read submitter profiles"
on public.submitter_profiles
for select
to authenticated
using (true);

-- ---------------------------------------------------------------------------
-- PART 2 - delete flow (added 2026-11-15)
--
-- Images live in the Cloudflare R2 bucket "level-images" (key = storage_path),
-- not in Supabase Storage, so the row and the object have to be deleted
-- together by the delete-submission edge function (service role). There is
-- deliberately NO delete policy for `authenticated`: if the browser could
-- delete the row on its own, the R2 object would be left orphaned and still
-- publicly reachable.
--
-- These FK changes are what makes an actual row delete possible at all; today
-- every child constraint is NO ACTION.
-- ---------------------------------------------------------------------------

-- Per-image guesses die with the image.
alter table public.inferno_image_guesses
  drop constraint if exists inferno_image_guesses_id_image_submit_fkey;
alter table public.inferno_image_guesses
  add constraint inferno_image_guesses_id_image_submit_fkey
  foreign key (id_image_submit)
  references public.image_submissions (id)
  on delete cascade;

-- IG cybergrind rounds keep their row (and their own public_image_url copy).
alter table public.ig_cybergrind_rounds
  drop constraint if exists ig_cybergrind_rounds_image_submission_id_fkey;
alter table public.ig_cybergrind_rounds
  add constraint ig_cybergrind_rounds_image_submission_id_fkey
  foreign key (image_submission_id)
  references public.image_submissions (id)
  on delete set null;

-- Daily rounds keep their row too, but the image reference is dropped. The
-- set's round structure and scores stay intact; that day's round falls back to
-- its stored public_image_url (which will 404 once the object is gone).
-- The edge function refuses to delete an image that is in the daily that is
-- live right now, so this only ever applies to past dailies.
alter table public.inferno_daily_rounds
  alter column image_submission_id drop not null;
alter table public.inferno_daily_rounds
  drop constraint if exists inferno_daily_rounds_image_submission_id_fkey;
alter table public.inferno_daily_rounds
  add constraint inferno_daily_rounds_image_submission_id_fkey
  foreign key (image_submission_id)
  references public.image_submissions (id)
  on delete set null;

-- make the new functions/policies visible to the API immediately
notify pgrst, 'reload schema';
