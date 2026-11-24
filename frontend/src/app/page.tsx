"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TrendingList } from "@/components/dashboard/trending-list";
import { getTrends, type TrendsResponse } from "@/lib/api";
import { TrendChart } from "@/components/dashboard/trend-chart";


import {
  Search,
  Bell,
  Sun,
  Moon,
  Video,
  TrendingUp,
  Activity,
  Database,
} from "lucide-react";
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-xl border border-slate-200/20 p-2.5 hover:bg-slate-500/10"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

export default function Home() {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await getTrends();
        setData(result);
      } catch {
        setError("Unable to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const videos = data?.trending_videos ?? [];

  const scores = videos
    .map((video) => video.trend_score)
    .filter((score): score is number => score !== null);

  const averageScore =
    scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : null;

  const averageCoverage =
    videos.length > 0
      ? videos.reduce(
          (sum, video) => sum + video.data_coverage_percent,
          0
        ) / videos.length
      : null;

  const stats = [
    {
      title: "Total Videos",
      value: data ? data.total_videos.toLocaleString() : "—",
      icon: Video,
    },
    {
      title: "Trending Videos",
      value: data ? videos.length.toLocaleString() : "—",
      icon: TrendingUp,
    },
    {
      title: "Average Trend Score",
      value: averageScore !== null ? averageScore.toFixed(1) : "—",
      icon: Activity,
    },
    {
      title: "Average Data Coverage",
      value: averageCoverage !== null
        ? `${averageCoverage.toFixed(1)}%`
        : "—",
      icon: Database,
    },
  ];

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <section className="min-w-0 flex-1 p-6 lg:p-8">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              NYRA PLUS · Trend Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your intelligence starts here.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200/20 p-2.5">
              <Search size={19} />
            </button>
            <button className="rounded-xl border border-slate-200/20 p-2.5">
              <Bell size={19} />
            </button>
            <ThemeToggle />
            
          </div>
        </header>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200/10 bg-white/5 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>
                  <Icon className="text-[#C50337]" size={21} />
                </div>

                <h2 className="mt-5 text-3xl font-bold">
                  {loading ? "..." : stat.value}
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                  Live backend data
                </p>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/10 bg-white/5 p-6 xl:col-span-2">
            <h2 className="text-lg font-semibold">
              Trend Intelligence
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Historical trend analytics will appear here.
            </p>

            <div className="mt-6">
             <TrendChart />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/10 bg-white/5 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Trending Now
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Live rankings from NYRA Trend Intelligence
              </p>
            </div>

            <TrendingList />
          </div>
        </div>
      </section>
    </main>
  );
}
