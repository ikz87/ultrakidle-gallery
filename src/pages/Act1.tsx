import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelGrid from "@/components/ui/LevelGrid";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list.ts";

export default function Act1() {
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

  const layer1 = getLayerData("1");
  const layer2 = getLayerData("2");
  const layer3 = getLayerData("3");

  return (
    <PageLayout title="ACT I: INFINITE HYPERDEATH">
      <div className="flex flex-col gap-20">
        <LevelGrid
          title="Layer 1: Limbo"
          levels={layer1.layerLevels}
          maxItemsPerRow={4}
          layerPath="act-1"
          counts={counts}
          secretLevel={layer1.secretLevel}
        />
      </div>
      <div className="flex flex-col gap-20">
        <LevelGrid
          title="Layer 2: Lust"
          levels={layer2.layerLevels}
          maxItemsPerRow={4}
          layerPath="act-1"
          counts={counts}
          secretLevel={layer2.secretLevel}
        />
      </div>
      <div className="flex flex-col gap-20">
        <LevelGrid
          title="Layer 3: Gluttony"
          levels={layer3.layerLevels}
          maxItemsPerRow={2}
          maxImgPerRow={4}
          layerPath="act-1"
          counts={counts}
          secretLevel={layer3.secretLevel}
        />
      </div>
    </PageLayout>
  );
}
