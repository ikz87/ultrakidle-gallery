import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Modal from "@/components/ui/Modal";
import PageLayout from "@/components/layout/PageLayout";
import GraphLevelGuessed from "@/components/ui/GraphLevelGuessed";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list";
import SEO from "@/components/SEO";
import SubmitterProfilePicture from "@/components/ui/SubmitterProfilePicture";



interface Submission {
  id: number;
  storage_path: string;
  times_picked: number;
  avg_score: number;
  avg_time: number;
  created_at: string;
  level_id: number;
  submitter: {
    discord_name: string;
    discord_avatar_url: string;
  };
  guesses?: {
    level_id: number;
    amount: number;
  }[];
}

export default function LevelGallery() {
  const { layerPath, levelSlug, imgId } = useParams(); // Ensure destructuring levelSlug
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubData, setSelectedSubData] = useState<Submission | null>(null);
  const [loadingGuesses, setLoadingGuesses] = useState(false);
  const scrollRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  const currentSub = submissions.find((s) => s.id.toString() === imgId);
  const ogImage = currentSub 
    ? `https://images.ultrakidle.online/${currentSub.storage_path}` 
    : undefined;

  const level = levels.find((l) => {
    return l.levelNumber.toLowerCase() === levelSlug?.toLowerCase();
  });

  useEffect(() => {
    if (!level) return;

    async function fetchLevelData() {
      const { data, error } = await supabase
      .from("image_submissions")
      .select(
        `
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
        `
      )
      .eq("level_id", level!.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

      if (!error && data) setSubmissions(data as unknown as Submission[]);
      setLoading(false);
    }

    fetchLevelData();
  }, [level]);

  useEffect(() => {
    if (!imgId || submissions.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSubData(null);
      return;
    }

    const baseSub = submissions.find((s) => s.id.toString() === imgId);
    if (!baseSub) {
      navigate(`/${layerPath}/${levelSlug}`);
      return;
    }

    async function fetchGuesses(sub: Submission) {
      setLoadingGuesses(true);
      const { data, error } = await supabase
        .from("inferno_image_guesses")
        .select("level_id:id_level, amount")
        .eq("id_image_submit", imgId);

      if (!error && data) {
        setSelectedSubData({
          ...sub,
          guesses: data as unknown as Submission["guesses"],
        });
      } else {
        setSelectedSubData({ ...sub, guesses: [] });
      }
      setLoadingGuesses(false);
    }

    fetchGuesses(baseSub);
  }, [imgId, submissions, navigate, layerPath, levelSlug]);

  useEffect(() => {
    if (!loading && imgId && scrollRefs.current[imgId]) {
      scrollRefs.current[imgId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, imgId]);

  if (!level) {
    return (
      <PageLayout title="NOT FOUND" backPath={`/${layerPath}`}>
        <div className="text-center py-20 text-2xl uppercase opacity-50">
          Level not found
        </div>
      </PageLayout>
    );
  }

  const maxItemsPerRow = 3;
  const gap = 0.5;
  const pad = 7;
  const subCalc = (n: number) => (pad + (n - 1) * gap) / n;
  const itemWidth = `max(calc(${100 / maxItemsPerRow}vw - ${subCalc(
    maxItemsPerRow
  )}rem), 20rem)`;

  return (
    <div>
      <SEO
        title={`${level.name.toUpperCase()} - Gallery`}
        description={`View community submissions for ${level.name}`}
        image={ogImage}
      />
      <PageLayout title={level.name.toUpperCase()} backPath={`/${layerPath}`}>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col md:flex-row gap-6 items-center ">
            <img
              src={level.thumbnail}
              alt={level.name}
              className="w-full md:w-80 aspect-video object-cover "
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-bold">{level.levelNumber}</h2>
              <p className="text-xl text-white/70 italic uppercase tracking-tighter">
                {submissions.length} Approved Submissions
              </p>
            </div>
          </div>
          <div className="w-full h-0.5 bg-white mb-3"/>

          {loading ? (
            <div className="text-center py-20 text-2xl animate-pulse uppercase opacity-50">
              Fetching Data...
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap justify-center">
              {submissions.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/${layerPath}/${levelSlug}/${sub.id}`}
                  ref={(el) => { scrollRefs.current[sub.id] = el; }}
                  style={{ width: itemWidth }}
                  className="relative flex flex-col bg-black/40 p-4 [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0_calc(100%-8px),0_8px)]"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <SubmitterProfilePicture url={sub.submitter.discord_avatar_url} />
                      <span className="text-sm font-bold truncate max-w-[120px]">
                        {sub.submitter.discord_name}
                      </span>
                    </div>
                    <span className="text-xs text-white/40 uppercase">
                      #{sub.id}
                    </span>
                  </div>

                  <div className="w-full h-0.5 bg-white mb-3" />

                  <div className="w-full px-5 mt-auto mb-auto flex justify-center">
                    <div className="w-full aspect-video bg-zinc-900 overflow-hidden">
                      <img
                        src={`https://images.ultrakidle.online/${sub.storage_path}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="w-full h-0.5 bg-white mt-3" />

                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <div className="text-center">
                      <p className="text-xs text-white uppercase tracking-tighter">
                        Times Picked
                      </p>
                      <p className="text-sm ">{sub.times_picked}</p>
                    </div>
                    <div className="text-center border-x-2 border-white">
                      <p className="text-xs text-white uppercase tracking-tighter">
                        Avg Score
                      </p>
                      <p className="text-sm ">{Math.round(sub.avg_score)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white uppercase tracking-tighter">
                        Avg Time
                      </p>
                      <p className="text-sm ">
                        {Number(sub.avg_time).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    <Modal
      isOpen={!!imgId}
      onClose={() => navigate(`/${layerPath}/${levelSlug}`)}
      maxWidth="max-w-5xl"
      showFooterButton={false}
    >
      <div className="flex flex-col md:flex-row min-h-0 h-full w-full">
        <div className="flex-[2] bg-black flex items-center justify-center  md:border-b-0 md:border-r-2 border-white">
          {submissions.find((s) => s.id.toString() === imgId) && (
            <img
              src={`https://images.ultrakidle.online/${
                submissions.find((s) => s.id.toString() === imgId)
                  ?.storage_path
              }`}
              className="max-w-full max-h-[70vh] object-contain bg-black"
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
                    <p className="font-bold text-lg text-white">
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full animate-pulse uppercase">
              Loading Stats...
            </div>
          )}
        </div>
      </div>
    </Modal>
    </div>
  );
}
