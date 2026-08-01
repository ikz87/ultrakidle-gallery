import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelGrid from "@/components/ui/LevelGrid";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list.ts";

export default function Act3() {
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

  const layer7 = getLayerData("7");
  const layer8 = getLayerData("8");

  const layer9Placeholders = [
    {
      id: -1,
      levelNumber: "9-1",
      name: "???",
      thumbnail: "/images/locked.webp",
    },
    {
      id: -1,
      levelNumber: "9-2",
      name: "???",
      thumbnail: "/images/locked.webp",
    },
  ];

  return (
    <PageLayout title="ACT III: GODFIST SUICIDE">
      <LevelGrid
        title="Layer 7: Violence"
        levels={layer7.layerLevels}
        maxItemsPerRow={4}
        layerPath="act-3"
        counts={counts}
        secretLevel={layer7.secretLevel}
      />
      <LevelGrid
        title="Layer 8: Fraud"
        levels={layer8.layerLevels}
        maxItemsPerRow={4}
        layerPath="act-3"
        counts={counts}
        secretLevel={layer8.secretLevel}
      />
      <LevelGrid
        title="Layer 9: Treachery"
        levels={layer9Placeholders}
        maxItemsPerRow={2}
        maxImgPerRow={4}
        layerPath="act-3"
        counts={{ [-1]: "???" }}
      />
    </PageLayout>
  );
}
