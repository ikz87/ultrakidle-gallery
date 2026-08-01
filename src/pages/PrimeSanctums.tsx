import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import LevelGrid from "@/components/ui/LevelGrid";
import { supabase } from "@/lib/supabase";
import { levels } from "@/lib/levels_list.ts";

export default function PrimeSanctums() {
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

  const manifestPrimes = levels
    .filter((l) => /^P-[0-9]/.test(l.levelNumber))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const p3Placeholder = {
    id: -1,
    levelNumber: "P-3",
    name: "???",
    thumbnail: "/images/locked.webp",
  };

  const allPrimes = [...manifestPrimes, p3Placeholder];

  return (
    <PageLayout title="PRIME SANCTUMS">
      <LevelGrid
        title="Prime Sanctums"
        levels={allPrimes}
        maxItemsPerRow={3}
        layerPath="prime-sanctums"
        counts={{ ...counts, [-1]: "???" }}
        outerPadding={16}
      />
    </PageLayout>
  );
}
