import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelGrid from "@/components/ui/LevelGrid";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list.ts";

export default function Prelude() {
  const [counts, setCounts] = useState<Record<number, number>>({});

  const preludeLevels = levels
    .filter((l) => /^0-[0-9]/.test(l.levelNumber))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const secretLevel = levels.find((l) => l.levelNumber === "0-S");

  useEffect(() => {
    async function fetchCounts() {
      const { data } = await supabase.from("level_submission_counts").select("*");

      if (data) {
        const map = data.reduce((acc, curr) => {
          acc[curr.level_id] = curr.approved_count;
          return acc;
        }, {} as Record<number, number>);
        setCounts(map);
      }
    }

    fetchCounts();
  }, []);

  return (
    <PageLayout title="PRELUDE">
      <LevelGrid
        title="Overture: The Mouth of Hell"
        levels={preludeLevels}
        maxItemsPerRow={5}
        layerPath="prelude"
        counts={counts}
        secretLevel={secretLevel}
      />
    </PageLayout>
  );
}
