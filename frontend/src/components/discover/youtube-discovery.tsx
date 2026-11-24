
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Play,
} from "lucide-react";

import {
  getTrends,
  refreshYouTubeTrends,
  type TrendVideo,
} from "@/lib/api";

type SortOption = "score" | "views" | "likes" | "comments";

export function YouTubeDiscovery() {
  const [videos, setVideos] = useState<TrendVideo[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadVideos(isRefresh = false) {
  try {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    // First, collect fresh YouTube statistics
    if (isRefresh) {
      await refreshYouTubeTrends();
    }

    // Then retrieve updated trend rankings
    const data = await getTrends();
    setVideos(data.trending_videos ?? []);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to load YouTube trends."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}

  useEffect(() => {
    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = videos.filter((video) => {
      return (
        video.title.toLowerCase().includes(query) ||
        video.channel_name.toLowerCase().includes(query)
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

    return result.sort(
      (a, b) => sortValues[sortBy](b) - sortValues[sortBy](a)
    );
  }, [videos, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Platform heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-500/10 p-3">
            <Play size={25} className="text-red-500" />
          </div>

          <div>
            <h2 className="text-lg font-bold">YouTube Trends</h2>
            <p className="text-xs text-slate-500">
              Explore collected trending videos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadVideos(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 rounded-xl bg-[#C50337] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#a90230] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Search and sorting */}
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search videos or channels..."
            className="w-full rounded-xl border border-slate-200/10 bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-[#C50337]"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as SortOption)
          }
          className="rounded-xl border border-slate-200/10 bg-background px-3 py-3 text-sm text-foreground outline-none"
        >
          <option value="score">Highest trend score</option>
          <option value="views">Most views</option>
          <option value="likes">Most likes</option>
          <option value="comments">Most comments</option>
        </select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filteredVideos.length} videos found
        </p>
        <p className="text-xs text-slate-500">
          Sorted by {sortBy}
        </p>
      </div>

      {/* Loading and errors */}
      {loading && (
        <p className="py-10 text-center text-sm text-slate-400">
          Loading YouTube trends...
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Video cards */}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredVideos.map((video) => (
            <article
              key={video.content_id}
              className="rounded-2xl border border-slate-200/10 bg-white/[0.03] p-5 transition hover:border-[#C50337]/50"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                  YouTube
                </span>

                <span className="text-sm font-bold text-[#C50337]">
                  {video.trend_score !== null
                    ? video.trend_score.toFixed(1)
                    : "N/A"}
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    Score
                  </span>
                </span>
              </div>

              <h3 className="line-clamp-2 min-h-12 text-sm font-semibold leading-6">
                {video.title}
              </h3>

              <p className="mt-2 truncate text-xs text-slate-500">
                {video.channel_name}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div>
                  <Eye size={15} className="mb-1 text-slate-500" />
                  <p className="text-xs font-semibold">
                    {(video.latest_views ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Views</p>
                </div>

                <div>
                  <Heart size={15} className="mb-1 text-slate-500" />
                  <p className="text-xs font-semibold">
                    {(video.latest_likes ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Likes</p>
                </div>

                <div>
                  <MessageCircle size={15} className="mb-1 text-slate-500" />
                  <p className="text-xs font-semibold">
                    {(video.latest_comments ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Comments</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">Data coverage</span>
                  <span>{video.data_coverage_percent.toFixed(1)}%</span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/10">
                  <div
                    className="h-full rounded-full bg-[#C50337]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, video.data_coverage_percent)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200/10 py-2.5 text-xs font-medium transition hover:bg-white/5"
              >
                Watch on YouTube
                <ExternalLink size={14} />
              </a>
            </article>
          ))}

          {filteredVideos.length === 0 && (
            <div className="col-span-full rounded-xl border border-slate-200/10 p-10 text-center">
              <p className="text-sm text-slate-400">
                No matching videos found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
