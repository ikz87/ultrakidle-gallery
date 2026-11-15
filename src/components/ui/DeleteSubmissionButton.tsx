import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { isGalleryAdmin, useAuth } from "@/lib/auth";
import { deleteSubmission } from "@/lib/submissions";

interface DeleteSubmissionButtonProps {
  submissionId: number;
  submitterId: number;
  submitterName?: string;
  /** Called after the backend confirmed the deletion. */
  onDeleted: (submissionId: number) => void;
  /** Lets the surrounding dialog stop closing on Escape/backdrop meanwhile. */
  onConfirmOpenChange?: (open: boolean) => void;
}

/**
 * Owner/admin only. Renders the trigger plus its own confirmation dialog, so
 * every image dialog (level gallery, submitter gallery) gets the same flow.
 */
export default function DeleteSubmissionButton({
  submissionId,
  submitterId,
  submitterName,
  onDeleted,
  onConfirmOpenChange,
}: DeleteSubmissionButtonProps) {
  const { session, discordId, ownSubmitterIds } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ownsIt = ownSubmitterIds.includes(Number(submitterId));
  const isAdmin = isGalleryAdmin(discordId);
  const canDelete = Boolean(session) && (ownsIt || isAdmin);

  if (!canDelete) return null;

  const setConfirm = (open: boolean) => {
    if (!open && deleting) return;
    setConfirmOpen(open);
    onConfirmOpenChange?.(open);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      await deleteSubmission(submissionId);
      onConfirmOpenChange?.(false);
      setConfirmOpen(false);
      onDeleted(submissionId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete submission"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="pt-4 border-t-2 border-white/20">
        <Button
          variant="danger"
          size="md"
          className="w-full"
          onClick={() => {
            setError(null);
            setConfirm(true);
          }}
        >
          DELETE SUBMISSION
        </Button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirm(false)}
        title="DELETE SUBMISSION"
        maxWidth="max-w-md"
        showFooterButton={false}
        allowBackdropClose={!deleting}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm md:text-base uppercase tracking-tighter text-white/80">
            Submission #{submissionId} will be removed from the gallery and its
            image deleted. This cannot be undone.
          </p>

          {isAdmin && !ownsIt && submitterName && (
            <p className="text-xs text-white/50 uppercase tracking-tighter">
              Owned by {submitterName}
            </p>
          )}

          {error && (
            <p className="text-xs text-[#FF8000] uppercase tracking-tighter">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="danger"
              size="md"
              className="w-full"
              disabled={deleting}
              onClick={() => {
                void handleDelete();
              }}
            >
              {deleting ? "DELETING..." : "DELETE"}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              disabled={deleting}
              onClick={() => setConfirm(false)}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
