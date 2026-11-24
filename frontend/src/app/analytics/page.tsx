
"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { getTrends, type TrendVideo } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Eye,
  TrendingUp,
  Heart,
  Database,
  RefreshCw,
  MessageCircle,
  BarChart3,
} from "lucide-react";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 100000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function AnalyticsPage() {
  const [videos, setVideos] = useState<TrendVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");
      const response = await getTrends();
      setVideos(response.trending_videos || []);
    } catch (err) {
      setError("Unable to load analytics data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const validScores = videos
      .map((v) => v.trend_score)
      .filter((score): score is number => score !== null);

    const validViews = videos
      .map((v) => v.latest_views)
      .filter((views): views is number => views !== null);

    const validCoverage = videos.map((v) => v.data_coverage_percent);

    const totalViews = validViews.reduce((sum, views) => sum + views, 0);

    const averageScore =
      validScores.length > 0
        ? validScores.reduce((sum, score) => sum + score, 0) /
          validScores.length
        : 0;

    const averageCoverage =
      validCoverage.length > 0
        ? validCoverage.reduce((sum, coverage) => sum + coverage, 0) /
          validCoverage.length
        : 0;

    const totalLikes = videos.reduce(
      (sum, video) => sum + (video.latest_likes ?? 0),
      0
    );

    const totalComments = videos.reduce(
      (sum, video) => sum + (video.latest_comments ?? 0),
      0
    );

    const engagementRate =
      totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    const buckets = [
      { range: "0–20", min: 0, max: 20 },
      { range: "21–40", min: 20, max: 40 },
      { range: "41–60", min: 40, max: 60 },
      { range: "61–80", min: 60, max: 80 },
      { range: "81–100", min: 80, max: 100 },
    ].map((bucket, index) => ({
      score: bucket.range,
      videos: validScores.filter((score) => {
        if (index === 0) return score >= 0 && score <= 20;
        if (index === 4) return score > 80 && score <= 100;
        return score > bucket.min && score <= bucket.max;
      }).length,
    }));

    const topVideos = [...videos]
      .filter((v) => v.trend_score !== null)
      .sort((a, b) => (b.trend_score ?? 0) - (a.trend_score ?? 0))
      .slice(0, 5);

    return {
      totalViews,
      averageScore,
      averageCoverage,
      totalLikes,
      totalComments,
      engagementRate,
      buckets,
      topVideos,
      scoreCount: validScores.length,
      viewCount: validViews.length,
    };
  }, [videos]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-5 md:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-crimson">
                NYRA INTELLIGENCE
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Analytics Overview
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Understand the performance and strength of discovered trends.
              </p>
            </div>

            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-gray-500/20 px-4 py-2 text-sm transition hover:bg-navy hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh Analytics
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Views"
              value={formatNumber(analytics.totalViews)}
              subtitle={`${analytics.viewCount} videos with view data`}
              icon={<Eye size={20} />}
            />

            <StatCard
              title="Average Trend Score"
              value={analytics.scoreCount ? analytics.averageScore.toFixed(1) : "N/A"}
              subtitle={`${analytics.scoreCount} videos scored`}
              icon={<TrendingUp size={20} />}
            />

            <StatCard
              title="Engagement Rate"
              value={
                analytics.totalViews
                  ? `${analytics.engagementRate.toFixed(2)}%`
                  : "N/A"
              }
              subtitle={`${formatNumber(analytics.totalLikes)} likes · ${formatNumber(analytics.totalComments)} comments`}
              icon={<Heart size={20} />}
            />

            <StatCard
              title="Data Coverage"
              value={`${analytics.averageCoverage.toFixed(1)}%`}
              subtitle="Average metric availability"
              icon={<Database size={20} />}
            />
          </div>

          {/* Charts */}
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Trend distribution */}
            <section className="rounded-2xl border border-gray-500/15 bg-white/5 p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Trend Score Distribution</h2>
                <p className="mt-1 text-sm text-gray-500">
                  How collected videos are distributed across score ranges.
                </p>
              </div>

              <div className="h-[300px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Loading chart...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.buckets}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                      <XAxis dataKey="score" stroke="#7185AB" />
                      <YAxis allowDecimals={false} stroke="#7185AB" />
                      <Tooltip
                        contentStyle={{
                          background: "#0A1024",
                          border: "1px solid #344879",
                          borderRadius: "12px",
                          color: "#F2F4F8",
                        }}
                      />
                      <Bar
                        dataKey="videos"
                        name="Videos"
                        fill="#C50337"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* Top trends */}
            <section className="rounded-2xl border border-gray-500/15 bg-white/5 p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Top Trending Content</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Highest-ranked content according to NYRA's trend algorithm.
                </p>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="py-12 text-center text-sm text-gray-500">
                    Loading trends...
                  </p>
                ) : analytics.topVideos.length === 0 ? (
                  <p className="py-12 text-center text-sm text-gray-500">
                    No scored content available yet.
                  </p>
                ) : (
                  analytics.topVideos.map((video, index) => (
                    <div
                      key={video.content_id}
                      className="flex items-center gap-3 border-b border-gray-500/10 pb-3 last:border-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium">
                          {video.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {video.channel_name || "Unknown channel"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-crimson">
                          {video.trend_score?.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Engagement summary */}
          <section className="rounded-2xl border border-gray-500/15 bg-white/5 p-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Engagement Summary</h2>
              <p className="mt-1 text-sm text-gray-500">
                Interactions recorded across the currently collected videos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniStat
                icon={<BarChart3 size={18} />}
                label="Videos Collected"
                value={formatNumber(videos.length)}
              />

              <MiniStat
                icon={<Heart size={18} />}
                label="Total Likes"
                value={formatNumber(analytics.totalLikes)}
              />

              <MiniStat
                icon={<MessageCircle size={18} />}
                label="Total Comments"
                value={formatNumber(analytics.totalComments)}
              />
            </div>
          </section>

          <p className="mt-6 text-xs text-gray-500">
            Analytics are calculated from the latest collected snapshots.
            Historical growth analysis will become available as more snapshots accumulate.
          </p>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-500/15 bg-white/5 p-5 transition hover:border-crimson/40">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="rounded-xl bg-navy p-2 text-moonlight">{icon}</div>
      </div>

      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
