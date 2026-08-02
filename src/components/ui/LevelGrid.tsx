import { Link } from "react-router-dom";
import Button from "./Button";
import { useState, useEffect } from "react";

interface Level {
  id: number;
  levelNumber: string;
  name: string;
  thumbnail: string;
}

interface LevelGridProps {
  title: string;
  levels: Level[];
  maxItemsPerRow: number;
  maxImgPerRow?: number;
  layerPath: string;
  counts?: Record<number, number | string>;
  secretLevel?: Level;
  outerPadding?: number;
}

export default function LevelGrid({
  title,
  levels,
  maxItemsPerRow,
  maxImgPerRow,
  layerPath,
  counts = {},
  secretLevel,
  outerPadding = 7,
}: LevelGridProps) {
  const [buttonSize, setButtonSize] = useState<"lg" | "xl">("xl");

  useEffect(() => {
    const handleResize = () => {
      setButtonSize(window.innerWidth < 640 ? "lg" : "xl");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const imgConstraint = maxImgPerRow || maxItemsPerRow;
  const gap = 0.5;
  const pad = outerPadding;
  const sub = (n: number) => (pad + (n - 1) * gap) / n;

  const itemWidth = `max(calc(${100 / maxItemsPerRow}vw - ${
    sub(maxItemsPerRow)
  }rem), 20rem)`;

  const imgWidth = maxImgPerRow
    ? `min(100%, max(calc(${100 / imgConstraint}vw - ${
        sub(imgConstraint) + 4.5
      }rem), 15.5rem))`
    : "100%";

  const sanitizePath = (levelNumber: string) => {
    return levelNumber.toLowerCase();
  };


  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <h1
          className={`text-2xl md:text-6xl uppercase ${
            secretLevel ? "" : "pb-4"
          }`}
        >
          {title}
        </h1>
        {secretLevel && (
          <Link
            to={`/${layerPath}/${sanitizePath(
              secretLevel.levelNumber,
            )}`}
            className="relative"
          >
            <Button className="mb-2" size={buttonSize} variant="outline">
              <div className="py-1 px-4 md:py-2 md:px-6 text-sm md:text-base">
                SECRET MISSION
              </div>
            </Button>
            <div
              className="absolute -top-2 -right-2 bg-white text-black text-xs md:text-md 
              [clip-path:polygon(4px_0,calc(100%-4px)_0,100%_4px,100%_calc(100%-4px),calc(100%-4px)_100%,4px_100%,0_calc(100%-4px),0_4px)] 
              font-bold px-2 py-0.5 pointer-events-none"
            >
              {counts[secretLevel.id] || 0}
            </div>
          </Link>
        )}
      </div>
      <div className="w-full h-0.5 bg-white mb-8" />

      <div className="flex gap-2 flex-wrap justify-center">
        {levels.map((level, idx) => {
          const isPlaceholder = level.id === -1;
          const content = (
            <>
              <p className="w-full text-base md:text-[20px] tracking-tighter text-center">
                {level.levelNumber}: {level.name.toUpperCase()}
              </p>
              <div className="w-full h-0.5 bg-white mb-3" />
              <div className="w-full px-5 mt-auto mb-auto flex justify-center">
                <div style={{ width: imgWidth }}>
                  <img
                    src={level.thumbnail}
                    alt={level.name}
                    className="w-full aspect-video object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="w-full h-0.5 bg-white mt-3" />
              <div className="uppercase text-xs md:text-sm">
                {counts[level.id] ?? (isPlaceholder ? "???" : 0)} SUBMISSIONS
              </div>
            </>
          );

          const className =
            "relative flex flex-col bg-black/40 p-4 will-change-transform [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0_calc(100%-8px),0_8px)]";

          if (isPlaceholder) {
            return (
              <div
                key={`placeholder-${idx}`}
                className={className}
                style={{ width: itemWidth }}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={level.id}
              to={`/${layerPath}/${sanitizePath(
                level.levelNumber,
              )}`}
              className={className}
              style={{ width: itemWidth }}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
