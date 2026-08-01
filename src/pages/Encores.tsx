import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelGrid from "@/components/ui/LevelGrid";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list.ts";

export default function Encores() {
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

  const manifestEncores = levels
    .filter((l) => /^[0-9]-E$/.test(l.levelNumber))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const placeholders = Array.from({ length: 10 - manifestEncores.length }, (_, i) => {
    const layerNum = manifestEncores.length + i;
    return {
      id: -1,
      levelNumber: `${layerNum}-E`,
      name: "???",
      thumbnail: "/images/locked.webp",
    };
  });

  const allEncores = [...manifestEncores, ...placeholders];

  const placeholderCounts = placeholders.reduce((acc, curr) => {
    acc[curr.id] = "???";
    return acc;
  }, {} as Record<number, number | string>);

  return (
    <PageLayout title="ENCORES">
      <LevelGrid
        title="Encore"
        levels={allEncores}
        maxItemsPerRow={5}
        layerPath="encores"
        counts={{ ...counts, ...placeholderCounts }}
      />
    </PageLayout>
  );
}
