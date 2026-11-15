import GalleryImage from "@/components/ui/GalleryImage";
import { levels } from "@/lib/levels_list";
import type { Submission } from "@/lib/types";

interface SubmissionCardProps {
  submission: Submission;
  width?: string;
  onClick?: () => void;
  innerRef?: (el: HTMLDivElement | null) => void;
}

export default function SubmissionCard({
  submission,
  width,
  onClick,
  innerRef,
}: SubmissionCardProps) {
  const matchedLevel = levels.find((l) => l.id === submission.level_id);

  return (
    <div
      ref={innerRef}
      onClick={onClick}
      style={{ width }}
      className={`relative flex flex-col bg-black/40 p-4 [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0_calc(100%-8px),0_8px)] ${
        onClick ? "cursor-pointer hover:bg-white/[0.02]" : ""
      }`}
    >
      <div className="flex justify-between items-center gap-2 mb-2">
        <span className="text-sm font-bold uppercase truncate max-w-[180px]">
          {matchedLevel
            ? `${matchedLevel.levelNumber} ${matchedLevel.name}`
            : "Unknown Level"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-white/40 uppercase">
            #{submission.id}
          </span>
        </div>
      </div>

      <div className="w-full h-0.5 bg-white mb-3" />

      <div className="w-full px-5 mt-auto mb-auto flex justify-center">
        <div className="w-full aspect-video bg-zinc-900 overflow-hidden">
          <GalleryImage
            src={`https://images.ultrakidle.online/${submission.storage_path}`}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="w-full h-0.5 bg-white mt-3" />

      <div className="grid grid-cols-3 gap-1 mt-2">
        <div className="text-center">
          <p className="text-xs text-white uppercase tracking-tighter">
            Times Picked
          </p>
          <p className="text-sm ">{submission.times_picked}</p>
        </div>
        <div className="text-center border-x-2 border-white">
          <p className="text-xs text-white uppercase tracking-tighter">
            Total Guesses
          </p>
          <p className="text-sm ">{submission.total_guesses}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white uppercase tracking-tighter">
            Average Score
          </p>
          <p className="text-sm ">{Math.round(submission.avg_score)}</p>
        </div>
      </div>
    </div>
  );
}
