"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, ExternalLink } from "lucide-react";
import { getTrends, type TrendVideo } from "@/lib/api";

type SortOption = "score" | "views" | "likes" | "comments";

export function TrendingList() {
  const [videos, setVideos] = useState<TrendVideo[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVideos() {
      try {
        const data = await getTrends();
        setVideos(data.trending_videos ?? []);
      } catch {
        setError("Unable to load trending videos.");
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = videos.filter((video) => {
      return (
        (video.title ?? "").toLowerCase().includes(query) ||
        (video.channel_name ?? "").toLowerCase().includes(query)
      );
    });

    const sortValues: Record<
      SortOption,
      (video: TrendVideo) => number
    > = {
      score: (video) => video.trend_score ?? -1,
      views: (video) => video.latest_views ?? -1,
      likes: (video) => video.latest_likes ?? -1,
      comments: (video) => video.latest_comments ?? -1,
    };

    return filtered.sort(
      (a, b) => sortValues[sortBy](b) - sortValues[sortBy](a)
    );
  }, [videos, search, sortBy]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading trends...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="w-full space-y-4">
      {/* Search */}
      <div className="relative w-full">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search videos or channels..."
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200/10 bg-background py-3 pl-10 pr-10 text-sm text-foreground outline-none focus:border-[#C50337]"
        />

        {search.length > 0 && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Sorting */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {filteredVideos.length} videos found
        </p>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as SortOption)
          }
          className="rounded-lg border border-slate-200/10 bg-background px-3 py-2 text-xs text-foreground outline-none"
        >
          <option value="score">Trend Score</option>
          <option value="views">Views</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
        </select>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredVideos.length === 0 ? (
          <div className="rounded-xl border border-slate-200/10 p-6 text-center">
            <p className="text-sm text-slate-400">
              No matching videos found.
            </p>
          </div>
        ) : (
          filteredVideos.slice(0, 10).map((video) => (
            <div
              key={video.content_id}
              className="rounded-xl border border-slate-200/10 bg-white/[0.03] p-4 transition hover:border-[#C50337]/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold">
                    {video.title}
                  </h3>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {video.channel_name}
                  </p>
                </div>

                <span className="shrink-0 rounded-lg bg-[#C50337]/10 px-2 py-1 text-xs font-semibold text-[#C50337]">
                  {video.trend_score !== null
                    ? video.trend_score.toFixed(1)
                    : "N/A"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>
                  Views: {(video.latest_views ?? 0).toLocaleString()}
                </span>
                <span>
                  Likes: {(video.latest_likes ?? 0).toLocaleString()}
                </span>
                <span>
                  Comments: {(video.latest_comments ?? 0).toLocaleString()}
                </span>
              </div>

              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-[#C50337] hover:underline"
              >
                Watch video <ExternalLink size={13} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
