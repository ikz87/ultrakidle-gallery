import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelGrid from "@/components/ui/LevelGrid";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list.ts";

export default function Act2() {
  const [counts, setCounts] = useState<Record<number, number>>({});

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

  const getLayerData = (layerNum: string) => {
    const layerLevels = levels
      .filter((l) => new RegExp(`^${layerNum}-[0-9]`).test(l.levelNumber))
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const secretLevel = levels.find((l) => l.levelNumber === `${layerNum}-S`);
    return { layerLevels, secretLevel };
  };

  const layer4 = getLayerData("4");
  const layer5 = getLayerData("5");
  const layer6 = getLayerData("6");

  return (
    <PageLayout title="ACT II: IMPERFECT HATRED">
      <LevelGrid
        title="Layer 4: Greed"
        levels={layer4.layerLevels}
        maxItemsPerRow={4}
        layerPath="act-2"
        counts={counts}
        secretLevel={layer4.secretLevel}
      />
      <LevelGrid
        title="Layer 5: Wrath"
        levels={layer5.layerLevels}
        maxItemsPerRow={4}
        layerPath="act-2"
        counts={counts}
        secretLevel={layer5.secretLevel}
      />
      <LevelGrid
        title="Layer 6: Heresy"
        levels={layer6.layerLevels}
        maxItemsPerRow={4}
        layerPath="act-2"
        counts={counts}
        secretLevel={layer6.secretLevel}
      />
    </PageLayout>
  );
}
