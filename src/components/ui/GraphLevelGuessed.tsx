import { levels } from "../../lib/levels_list";
import Tooltip from "./Tooltip";
import { useMemo } from "react";

interface GraphLevelGuessedProps {
  guessesMap: Map<number, number>;
  correct_level_id: number;
  showLabel?: boolean;
}

const GraphLevelGuessed = ({
  guessesMap,
  correct_level_id,
  showLabel = true,
}: GraphLevelGuessedProps) => {
    const { total, max } = useMemo(() => {
      if (!guessesMap || !(guessesMap instanceof Map)) {
        return { total: 0, max: 0 };
      }
      const values = Array.from(guessesMap.values());
      return {
        total: values.reduce((a, b) => a + b, 0),
          max: values.length > 0 ? Math.max(...values) : 0,
      };
    }, [guessesMap]);

  return (
    <div className="w-full pt-2">
      <div className="flex flex-row items-end h-[40px] w-full gap-[1px]">
        {levels.map((level) => {
          const count = guessesMap.get(level.id) || 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const barHeight = max > 0 ? Math.max(4, (100 * count) / max) : 4;
          const isCorrect = correct_level_id === level.id;

          return (
            <div
              key={level.id}
              className="relative flex flex-col items-center h-full justify-end flex-1"
            >
              <Tooltip
                content={
                  <div className="text-center text-[10px]">
                    <p className="font-bold">{level.levelNumber}</p>
                    <p>{count} Guesses ({percent}%)</p>
                  </div>
                }
                placement="top"
              >
                <div
                  className={`w-full transition-opacity ${
                    isCorrect ? "bg-green-500 opacity-100" : "bg-white/20 opacity-60 hover:opacity-100"
                  }`}
                  style={{ height: `${barHeight}%`, borderRadius: "1px" }}
                />
              </Tooltip>
            </div>
          );
        })}
      </div>
      {showLabel && (
        <p className="text-white/30 text-center text-xs mt-1 uppercase tracking-widest">
          Guess Distribution
        </p>
      )}
    </div>
  );
};

export default GraphLevelGuessed;
