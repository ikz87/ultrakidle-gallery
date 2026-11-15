import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import PageLayout from "@/components/layout/PageLayout";
import GraphLevelGuessed from "@/components/ui/GraphLevelGuessed";
import GalleryImage from "@/components/ui/GalleryImage";
import SubmissionCard from "@/components/ui/SubmissionCard";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list";
import SEO from "@/components/SEO";
import SubmitterProfilePicture from "@/components/ui/SubmitterProfilePicture";
import { isGalleryAdmin, useAuth } from "@/lib/auth";
import { deleteSubmission } from "@/lib/submissions";
import type { Submission } from "@/lib/types";

interface SubmissionCounts {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function SubmitterGallery() {
  const { submitterId, imgId } = useParams();
  const navigate = useNavigate();
  const { session, discordId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubData, setSelectedSubData] = useState<Submission | null>(null);
  const [loadingGuesses, setLoadingGuesses] = useState(false);
  const [ownSubmitterIds, setOwnSubmitterIds] = useState<number[]>([]);
  const [ownCounts, setOwnCounts] = useState<SubmissionCounts | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const isOwner =
    Boolean(session) && ownSubmitterIds.includes(Number(submitterId));
  const isAdmin = isGalleryAdmin(discordId);
  const canDelete = isOwner || isAdmin;

  const currentSub = submissions.find((s) => s.id.toString() === imgId);
  const ogImage = currentSub 
    ? `https://images.ultrakidle.online/${currentSub.storage_path}` 
    : undefined;

  const submitterProfile = submissions[0]?.submitter;

  useEffect(() => {
    async function fetchSubmitterSubmissions() {
      const { data, error } = await supabase
        .from("image_submissions")
        .select(`
          id,
          storage_path,
          times_picked,
          avg_score,
          avg_time,
          created_at,
          level_id,
          submitter:submitter_profiles (
            discord_name,
            discord_avatar_url
          )
        `)
        .eq("submitter_id", submitterId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSubmissions(data as unknown as Submission[]);
      }
      setLoading(false);
    }

    fetchSubmitterSubmissions();
  }, [submitterId]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function fetchOwnSummary() {
      const { data, error } = await supabase.rpc("my_submitter_ids");
      if (cancelled) return;

      const ids = error ? [] : ((data ?? []) as (number | string)[]).map(Number);
      setOwnSubmitterIds(ids);

      if (!ids.includes(Number(submitterId))) {
        setOwnCounts(null);
        return;
      }

      const countFor = (status?: string) => {
        const query = supabase
          .from("image_submissions")
          .select("id", { count: "exact", head: true })
          .in("submitter_id", ids);
        return status ? query.eq("status", status) : query;
      };

      const [total, approved, pending, rejected] = await Promise.all([
        countFor(),
        countFor("approved"),
        countFor("pending"),
        countFor("rejected"),
      ]);
      if (cancelled) return;

      setOwnCounts({
        total: total.count ?? 0,
        approved: approved.count ?? 0,
        pending: pending.count ?? 0,
        rejected: rejected.count ?? 0,
      });
    }

    fetchOwnSummary();

    return () => {
      cancelled = true;
    };
  }, [session, submitterId]);

  useEffect(() => {
    if (!imgId || submissions.length === 0) {
      setSelectedSubData(null);
      return;
    }

    const baseSub = submissions.find((s) => s.id.toString() === imgId);
    if (!baseSub) {
      navigate(`/submitter/${submitterId}`);
      return;
    }

    async function fetchGuesses(sub: Submission) {
      setLoadingGuesses(true);
      const { data, error } = await supabase
        .from("inferno_image_guesses")
        .select("level_id:id_level, amount")
        .eq("id_image_submit", imgId);

      if (!error && data) {
        setSelectedSubData({ ...sub, guesses: data as unknown as Submission["guesses"] });
      } else {
        setSelectedSubData({ ...sub, guesses: [] });
      }
      setLoadingGuesses(false);
    }

    fetchGuesses(baseSub);
  }, [imgId, submissions, navigate, submitterId]);

  useEffect(() => {
    if (!loading && imgId && scrollRefs.current[imgId]) {
      scrollRefs.current[imgId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, imgId]);

  const maxItemsPerRow = 3;
  const gap = 0.5;
  const pad = 7;
  const subCalc = (n: number) => (pad + (n - 1) * gap) / n;
  const itemWidth = `max(calc(${100 / maxItemsPerRow}vw - ${subCalc(
    maxItemsPerRow
  )}rem), 20rem)`;

  const handleDelete = async () => {
    if (!selectedSubData) return;

    const deletedId = selectedSubData.id;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteSubmission(deletedId);

      setSubmissions((prev) => prev.filter((s) => s.id !== deletedId));
      setOwnCounts((prev) =>
        prev
          ? {
              ...prev,
              total: Math.max(0, prev.total - 1),
              approved: Math.max(0, prev.approved - 1),
            }
          : prev
      );

      setConfirmDeleteOpen(false);
      setSelectedSubData(null);
      navigate(`/submitter/${submitterId}`);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete submission"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div>
        <SEO
          title={`${submitterProfile?.discord_name || "Submitter"} - Gallery`}
          description={`View approved submissions uploaded by ${submitterProfile?.discord_name}`}
          image={ogImage}
        />
      </div>
      <PageLayout title={submitterProfile?.discord_name.toUpperCase() || "SUBMITTER GALLERY"} backPath="/submitter-search">
        <div className="flex flex-col gap-2 w-full">
          {submitterProfile && (
            <div className="flex gap-4 md:gap-6 items-center">
              <SubmitterProfilePicture
                url={submitterProfile.discord_avatar_url}
                className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-white shrink-0"
              />
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-2xl md:text-4xl font-bold uppercase truncate">
                  {submitterProfile.discord_name}
                </h2>
                <p className="text-sm md:text-xl text-white/70 italic uppercase tracking-tighter">
                  {submissions.length} Approved Submissions
                </p>
              </div>
            </div>
          )}
          <div className="w-full h-0.5 bg-white mb-3" />

          {isOwner && ownCounts && (
            <div className="grid grid-cols-4 border-b-2 border-white pb-2 md:pb-3">
              {[
                { label: "Total", value: ownCounts.total, className: "text-white" },
                {
                  label: "Approved",
                  value: ownCounts.approved,
                  className: "text-white",
                },
                {
                  label: "Pending",
                  value: ownCounts.pending,
                  className: "text-white/60",
                },
                {
                  label: "Rejected",
                  value: ownCounts.rejected,
                  className: "text-[#FF8000]",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`text-center ${
                    index > 0 ? "border-l-2 border-white" : ""
                  }`}
                >
                  <p className="text-[10px] md:text-sm text-white uppercase tracking-tighter">
                    {item.label}
                  </p>
                  <p className={`text-base md:text-2xl ${item.className}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-2xl animate-pulse uppercase opacity-50">
              Fetching Submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-20 text-2xl uppercase opacity-50">
              {isOwner ? "No Approved Submissions Yet" : "Submitter Not Found"}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap justify-center">
              {submissions.map((sub) => {
                const matchedLevel = levels.find((l) => l.id === sub.level_id);
                const levelSlug = matchedLevel ? matchedLevel.levelNumber : "unknown";

                return (
                  <SubmissionCard
                    key={sub.id}
                    submission={sub}
                    width={itemWidth}
                    innerRef={(el) => {
                      scrollRefs.current[sub.id] = el;
                    }}
                    onClick={() =>
                      navigate(
                        `/submitter/${submitterId}/${levelSlug}/${sub.id}`
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

      </PageLayout>
      <Modal
        isOpen={!!imgId}
        onClose={() => navigate(`/submitter/${submitterId}`)}
        maxWidth="max-w-5xl"
        showFooterButton={false}
        allowBackdropClose={!confirmDeleteOpen}
      >
        <div className="flex flex-col md:flex-row min-h-0 h-full w-full">
          <div className="flex-[2] bg-black flex items-center justify-center md:border-b-0 md:border-r-2 border-white">
            {submissions.find((s) => s.id.toString() === imgId) && (
              <GalleryImage
                src={`https://images.ultrakidle.online/${
                  submissions.find((s) => s.id.toString() === imgId)
                    ?.storage_path
                }`}
                className="max-w-full max-h-[70vh] object-contain bg-black"
                eager
              />
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            {selectedSubData ? (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <SubmitterProfilePicture
                      url={selectedSubData.submitter.discord_avatar_url}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div>
                      <p className="font-bold text-lg text-white uppercase">
                        {selectedSubData.submitter.discord_name}
                      </p>
                      <p className="text-xs text-white uppercase">
                        {new Date(
                          selectedSubData.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:gap-4 gap-2 border-y-2 border-white md:py-4 py-2">
                  <div className="text-center">
                    <p className="text-sm text-white uppercase md:mb-1">Times Picked</p>
                    <p className="text-lg md:text-2xl ">{selectedSubData.times_picked}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white uppercase md:mb-1">Total Guesses</p>
                    <p className="text-lg md:text-2xl ">
                      {selectedSubData.guesses?.reduce((acc, g) => acc + Number(g.amount), 0) ||
                        0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white uppercase md:mb-1">Avg Score</p>
                    <p className="text-lg md:text-2xl ">{Math.round(selectedSubData.avg_score)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white uppercase md:mb-1">Avg Time</p>
                    <p className="text-lg md:text-2xl ">
                      {Number(selectedSubData.avg_time).toFixed(2)}s
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  {loadingGuesses ? (
                    <div className="animate-pulse text-xs uppercase opacity-50">
                      Loading Stats...
                    </div>
                  ) : (
                    <GraphLevelGuessed
                      guessesMap={
                        new Map(
                          selectedSubData.guesses?.map((g) => [
                            Number(g.level_id),
                            Number(g.amount),
                          ])
                        )
                      }
                      correct_level_id={selectedSubData.level_id}
                    />
                  )}
                </div>

                {canDelete && (
                  <div className="pt-4 border-t-2 border-white/20">
                    <Button
                      variant="danger"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        setDeleteError(null);
                        setConfirmDeleteOpen(true);
                      }}
                    >
                      DELETE SUBMISSION
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full animate-pulse uppercase">
                Loading Stats...
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          if (!deleting) setConfirmDeleteOpen(false);
        }}
        title="DELETE SUBMISSION"
        maxWidth="max-w-md"
        showFooterButton={false}
        allowBackdropClose={!deleting}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm md:text-base uppercase tracking-tighter text-white/80">
            Submission #{selectedSubData?.id} will be removed from the gallery
            and its image deleted. This cannot be undone.
          </p>

          {isAdmin && !isOwner && (
            <p className="text-xs text-white/50 uppercase tracking-tighter">
              Owned by {selectedSubData?.submitter.discord_name}
            </p>
          )}

          {deleteError && (
            <p className="text-xs text-[#FF8000] uppercase tracking-tighter">
              {deleteError}
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
              onClick={() => setConfirmDeleteOpen(false)}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
