import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import SubmitterProfilePicture from "@/components/ui/SubmitterProfilePicture";
import { supabase } from "@/lib/supabase";

interface Submitter {
  id: string;
  discord_name: string;
  discord_avatar_url: string;
  submissions_count: number;
}

export default function SubmitterSearch() {
  const [search, setSearch] = useState("");
  const [submitters, setSubmitters] = useState<Submitter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      async function searchSubmitters() {
        setLoading(true);

        const { data, error } = await supabase
          .from("approved_submitters_v")
          .select("id, discord_name, discord_avatar_url, submissions_count")
          .ilike("discord_name", `%${search}%`)
          .order("submissions_count", { ascending: false });

        if (!error && data) {
          const formatted: Submitter[] = data.map((item: any) => ({
            id: item.id,
            discord_name: item.discord_name,
            discord_avatar_url: item.discord_avatar_url,
            submissions_count: item.submissions_count,
          }));
          setSubmitters(formatted);
        }
        setLoading(false);
      }

      searchSubmitters();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <PageLayout title="SUBMITTER SEARCH" backPath="/">
      <div className="flex flex-1 flex-col gap-6 w-full max-w-4xl mx-auto md:h-[calc(100dvh-175px)] h-[calc(100dvh-110px)]">
        <input
          type="text"
          placeholder="SEARCH BY DISCORD NAME..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-2 border-white w-full bg-black/40 text-white py-2 px-4 uppercase tracking-tighter text-lg md:text-xl font-vcr outline-none placeholder:text-white/30 shrink-0"
        />

        {loading ? (
          <div className="text-center py-10 text-2xl animate-pulse uppercase opacity-50">
            Searching Submitters...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto pr-1">
            {submitters.map((sub) => (
              <Link
                key={sub.id}
                to={`/submitter/${sub.id}`}
                className="flex items-center gap-3 bg-black/40 hover:bg-white/10 transition-colors p-3 [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0_calc(100%-8px),0_8px)] border-b border-transparent "
              >
                <SubmitterProfilePicture
                  url={sub.discord_avatar_url}
                  className="w-10 h-10 rounded-full border border-white/20 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base truncate text-white uppercase">
                    {sub.discord_name}
                  </span>
                  <span className="text-xs text-white/50 uppercase truncate">
                    {sub.submissions_count} Approved
                  </span>
                </div>
              </Link>
            ))}
            {!loading && submitters.length === 0 && (
              <div className="col-span-full text-center py-10 text-xl uppercase opacity-50">
                No submitters found
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
