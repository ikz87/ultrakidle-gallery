import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContext, type AuthContextValue } from "@/lib/auth";

function readUrlAuthError(): string | null {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const description =
    params.get("error_description") ??
    hashParams.get("error_description") ??
    params.get("error") ??
    hashParams.get("error");

  return description ? description.replace(/\+/g, " ") : null;
}

function getDiscordId(user: User | null): string | null {
  if (!user) return null;

  const fromMetadata = user.app_metadata?.provider_id;
  if (fromMetadata) return String(fromMetadata);

  const identity = user.identities?.find((i) => i.provider === "discord");
  if (identity) {
    const fromIdentity = identity.id ?? identity.identity_data?.sub;
    if (fromIdentity) return String(fromIdentity);
  }

  // The main app signs users in as <discord_id>@discord.internal. In dev both
  // apps share localhost:5173 (and therefore the same stored session), so the
  // gallery can be handed one of those instead of a Discord OAuth session.
  const match = /^(\d+)@discord\.internal$/.exec(user.email ?? "");
  return match ? match[1] : null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(readUrlAuthError);
  const [ownSubmitterIds, setOwnSubmitterIds] = useState<number[]>([]);

  useEffect(() => {
    let active = true;

    // supabase-js consumes the OAuth redirect itself (detectSessionInUrl), so
    // this picks up the session whether it is a fresh login or a stored one.
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Which submitter profiles belong to the logged-in Discord account. Loaded
  // once per session; also the permission check for deleting a submission.
  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadSubmitterIds() {
      const { data, error } = await supabase.rpc("my_submitter_ids");
      if (cancelled) return;

      setOwnSubmitterIds(
        error ? [] : ((data ?? []) as (number | string)[]).map(Number)
      );
    }

    loadSubmitterIds();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const signInWithDiscord = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/me`,
        scopes: "identify",
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      discordId: getDiscordId(session?.user ?? null),
      ownSubmitterIds,
      loading,
      authError,
      signInWithDiscord,
      signOut,
    }),
    [session, ownSubmitterIds, loading, authError, signInWithDiscord, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
