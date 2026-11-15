import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

/**
 * /me is just a pointer: it resolves the logged-in Discord account to its
 * submitter profile and sends the user to the public gallery for that
 * profile, where the owner sees their extra summary.
 */
export default function Me() {
  const { session, loading } = useAuth();
  const [submitterId, setSubmitterId] = useState<number | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function resolveSubmitter() {
      const { data, error } = await supabase.rpc("my_submitter_ids");
      if (cancelled) return;

      const ids = error ? [] : ((data ?? []) as (number | string)[]).map(Number);
      setSubmitterId(ids[0] ?? null);
      setResolved(true);
    }

    resolveSubmitter();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading || (session && !resolved)) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-black">
        <p className="text-2xl animate-pulse uppercase opacity-50">
          Finding Your Gallery...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace state={{ openLogin: true }} />;
  }

  if (submitterId === null) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={`/submitter/${submitterId}`} replace />;
}
