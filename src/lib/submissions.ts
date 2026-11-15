import { supabase } from "@/lib/supabase";

/**
 * Deletes one of the caller's own approved submissions.
 *
 * The row and the R2 object are removed together by the `delete-submission`
 * edge function (main repo: src/supabase/functions/delete-submission). The
 * function re-checks ownership against the Discord id in the session JWT, so
 * nothing here is trusted from the client.
 *
 * Refusals come back as a non-2xx response with `{ error: "..." }`, which we
 * surface verbatim - e.g. "This image is part of today's daily."
 */
export async function deleteSubmission(submissionId: number): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-submission", {
    body: { submissionId },
  });

  if (!error) return;

  const response = (error as { context?: Response }).context;
  if (response) {
    const payload = await response
      .json()
      .catch(() => null as { error?: string } | null);
    if (payload?.error) throw new Error(payload.error);
  }

  throw new Error(error.message);
}
