
"use client";

import { useEffect, useMemo, useState } from "react";
import {Sidebar} from "@/components/layout/sidebar";
import { getTrends, type TrendVideo } from "@/lib/api";
import {
  Search,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

type SortOption = "score" | "views" | "likes" | "comments" | "coverage";

export default function TrendsPage() {
  const [videos, setVideos] = useState<TrendVideo[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [minScore, setMinScore] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrends() {
    try {
      setLoading(true);
      setError("");
      const result = await getTrends();
      setVideos(result.trending_videos || []);
    } catch (err) {
      console.error(err);
      setError("Could not load trends. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrends();
  }, []);

  const filteredVideos = useMemo(() => {
    const query = search.toLowerCase().trim();
    const threshold = Number(minScore);

    return videos
      .filter((video) => {
        const matchesSearch =
          !query ||
          video.title.toLowerCase().includes(query) ||
          (video.channel_name || "").toLowerCase().includes(query);

        const matchesScore =
          video.trend_score !== null &&
          (video.trend_score ?? 0) >= threshold;

        return matchesSearch && matchesScore;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "views":
            return (b.latest_views ?? -1) - (a.latest_views ?? -1);
          case "likes":
            return (b.latest_likes ?? -1) - (a.latest_likes ?? -1);
          case "comments":
            return (b.latest_comments ?? -1) - (a.latest_comments ?? -1);
          case "coverage":
            return b.data_coverage_percent - a.data_coverage_percent;
          default:
            return (b.trend_score ?? -1) - (a.trend_score ?? -1);
        }
      });
  }, [videos, search, sortBy, minScore]);

  const averageScore =
    videos.filter((v) => v.trend_score !== null).length > 0
      ? videos.reduce((sum, v) => sum + (v.trend_score ?? 0), 0) /
        videos.filter((v) => v.trend_score !== null).length
      : 0;

  function formatNumber(value: number | null) {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      notation: value >= 100000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-5 md:p-8">
          {/* Page header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-crimson">
                NYRA INTELLIGENCE
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Trends Explorer
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Explore, filter, and compare the signals behind trending content.
              </p>
            </div>

            <button
              onClick={loadTrends}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-gray-500/20 px-4 py-2 text-sm hover:bg-navy hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-5">
              <p className="text-sm text-gray-500">Tracked Content</p>
              <p className="mt-2 text-2xl font-bold">{videos.length}</p>
            </div>

            <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-5">
              <p className="text-sm text-gray-500">Average Trend Score</p>
              <p className="mt-2 text-2xl font-bold">
                {videos.length ? averageScore.toFixed(1) : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-5">
              <p className="text-sm text-gray-500">Matching Results</p>
              <p className="mt-2 text-2xl font-bold">{filteredVideos.length}</p>
            </div>
          </div>

          {/* Filters */}
          <section className="mb-6 rounded-2xl border border-gray-500/15 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-crimson" />
              <h2 className="font-semibold">Explore Filters</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="mb-2 block text-xs text-gray-500">
                  Search content or channel
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-500/20 px-3 py-2">
                  <Search size={16} className="shrink-0 text-gray-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search trends..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="mb-2 block text-xs text-gray-500">
                  Sort results by
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-500/20 px-3 py-2">
                  <ArrowUpDown size={16} className="shrink-0 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="score">Trend Score</option>
                    <option value="views">Views</option>
                    <option value="likes">Likes</option>
                    <option value="comments">Comments</option>
                    <option value="coverage">Data Coverage</option>
                  </select>
                </div>
              </div>

              {/* Score filter */}
              <div>
                <label className="mb-2 block text-xs text-gray-500">
                  Minimum trend score
                </label>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  className="w-full rounded-xl border border-gray-500/20 bg-transparent px-3 py-2 text-sm outline-none"
                >
                  <option value="0">All scores</option>
                  <option value="20">20+</option>
                  <option value="40">40+</option>
                  <option value="60">60+</option>
                  <option value="80">80+</option>
                </select>
              </div>
            </div>

            {(search || minScore !== "0") && (
              <button
                onClick={() => {
                  setSearch("");
                  setMinScore("0");
                }}
                className="mt-4 text-xs text-crimson hover:underline"
              >
                Clear filters
              </button>
            )}
          </section>

          {/* Table */}
          <section className="overflow-hidden rounded-2xl border border-gray-500/15 bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-500/10 p-5">
              <div>
                <h2 className="text-lg font-semibold">Trend Database</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Ranked and filtered content signals
                </p>
              </div>
              <span className="rounded-full bg-navy px-3 py-1 text-xs text-white">
                {filteredVideos.length} results
              </span>
            </div>

            {error && (
              <div className="p-5 text-sm text-red-500">{error}</div>
            )}

            {loading ? (
              <div className="p-12 text-center text-sm text-gray-500">
                Loading trend data...
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500">
                No matching content found. Try changing your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-white/5 text-xs text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-medium"># / CONTENT</th>
                      <th className="px-5 py-4 font-medium">TREND SCORE</th>
                      <th className="px-5 py-4 font-medium">VIEWS</th>
                      <th className="px-5 py-4 font-medium">LIKES</th>
                      <th className="px-5 py-4 font-medium">COMMENTS</th>
                      <th className="px-5 py-4 font-medium">COVERAGE</th>
                      <th className="px-5 py-4 font-medium">LINK</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredVideos.map((video, index) => (
                      <tr
                        key={video.content_id}
                        className="border-t border-gray-500/10 transition hover:bg-white/5"
                      >
                        <td className="px-5 py-4">
                          <div className="flex max-w-[350px] items-start gap-3">
                            <span className="mt-1 text-xs text-gray-500">
                              {index + 1}
                            </span>
                            
                            <div className="min-w-0">
                              <p className="line-clamp-2 font-medium">
                                {video.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {video.channel_name || "Unknown channel"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-crimson/10 px-2.5 py-1 font-semibold text-crimson">
                            {video.trend_score?.toFixed(1) ?? "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {formatNumber(video.latest_views)}
                        </td>

                        <td className="px-5 py-4">
                          {formatNumber(video.latest_likes)}
                        </td>

                        <td className="px-5 py-4">
                          {formatNumber(video.latest_comments)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-500/20">
                              <div
                                className="h-full rounded-full bg-crimson"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, video.data_coverage_percent)
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs">
                              {video.data_coverage_percent.toFixed(0)}%
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-crimson hover:underline"
                          >
                            Open <ExternalLink size={14} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-5 text-xs text-gray-500">
            Trend scores are calculated by NYRA PLUS analytics. Missing metrics are
            displayed as N/A instead of being treated as zero.
          </p>
        </main>
      </div>
</div>
  );
}

