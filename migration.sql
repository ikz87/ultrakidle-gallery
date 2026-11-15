-- Total guesses per image, so the gallery cards can show it without pulling
-- the whole guess distribution.
--
-- Kept in the same recompute as avg_score (same distribution, same trigger),
-- and cumulative like the distribution itself: the 2-day purge of
-- inferno_guesses can't touch it.
--
-- Safe to run whether or not the previous PART 3 stats migration was applied:
-- the column, function, triggers and backfill are all (re)created here.

alter table public.image_submissions
  add column if not exists total_guesses bigint not null default 0;

create or replace function public.fn_recalc_submission_avg_score(p_submission_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level_id bigint;
  v_correct_order int;
  v_avg numeric(10,2);
  v_total bigint;
begin
  select level_id into v_level_id
  from public.image_submissions
  where id = p_submission_id;

  if v_level_id is null then
    return;
  end if;

  select coalesce(order_index, 0) into v_correct_order
  from public.levels
  where id = v_level_id;

  v_correct_order := coalesce(v_correct_order, 0);

  select round(
           sum(g.amount * round(100.0 * power(0.85, abs(v_correct_order - coalesce(gl.order_index, 0)))))
             / nullif(sum(g.amount), 0),
           2
         ),
         coalesce(sum(g.amount), 0)
  into v_avg, v_total
  from public.inferno_image_guesses g
  left join public.levels gl on gl.id = g.id_level
  where g.id_image_submit = p_submission_id;

  update public.image_submissions
  set avg_score = coalesce(v_avg, 0),
      total_guesses = v_total
  where id = p_submission_id;
end;
$$;

-- Guess distribution changed (both game modes end up here).
create or replace function public.fn_trg_recalc_avg_from_guesses()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'DELETE' then
    perform public.fn_recalc_submission_avg_score(OLD.id_image_submit);
    return null;
  end if;

  if TG_OP = 'UPDATE' and OLD.id_image_submit is distinct from NEW.id_image_submit then
    perform public.fn_recalc_submission_avg_score(OLD.id_image_submit);
  end if;

  perform public.fn_recalc_submission_avg_score(NEW.id_image_submit);
  return null;
end;
$$;

drop trigger if exists trg_recalc_avg_from_guesses on public.inferno_image_guesses;
create trigger trg_recalc_avg_from_guesses
after insert or delete or update of amount, id_level, id_image_submit
on public.inferno_image_guesses
for each row execute function public.fn_trg_recalc_avg_from_guesses();

-- The correct answer changed (admin fixing a submission's level).
create or replace function public.fn_trg_recalc_avg_from_submission()
returns trigger
language plpgsql
as $$
begin
  perform public.fn_recalc_submission_avg_score(NEW.id);
  return null;
end;
$$;

drop trigger if exists trg_recalc_avg_from_submission on public.image_submissions;
create trigger trg_recalc_avg_from_submission
after update of level_id
on public.image_submissions
for each row execute function public.fn_trg_recalc_avg_from_submission();

-- Retire the old purge-driven recompute if it is still around (no-op otherwise).
drop trigger if exists trg_sync_submission_stats on public.inferno_guesses;
drop function if exists public.fn_sync_submission_stats();

-- The hot path filters by image; the only unique key is (id_level, id_image_submit).
create index if not exists idx_inferno_image_guesses_image
  on public.inferno_image_guesses (id_image_submit);

-- Backfill both counters from the distribution we still have.
do $$
declare
  r record;
begin
  for r in select id from public.image_submissions loop
    perform public.fn_recalc_submission_avg_score(r.id);
  end loop;
end;
$$;

-- make the new column/functions visible to the API immediately
notify pgrst, 'reload schema';
