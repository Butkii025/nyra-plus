
"use client";

import { useEffect, useState } from "react";
import { YouTubeDiscovery } from "@/components/discover/youtube-discovery";
import { getTrends, type TrendsResponse } from "@/lib/api";
import { Play, RefreshCw } from "lucide-react";

export default function DiscoverPage() {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrends() {
    try {
      setLoading(true);
      setError("");
      const result = await getTrends();
      setData(result);
    } catch {
      setError("Unable to fetch YouTube trends.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrends();
  }, []);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              NYRA PLUS / Discover
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Discover Trends
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Explore emerging content and trending signals.
            </p>
          </div>

          <button
            onClick={loadTrends}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#C50337] px-4 py-3 text-sm font-medium text-white hover:bg-[#a90230] disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh Trends
          </button>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-3">
              <Play className="text-red-500" size={25} />
            </div>

            <div>
              <h2 className="font-semibold">YouTube Discovery</h2>
              <p className="text-xs text-slate-500">
                Connected to NYRA PLUS analytics backend
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Collected videos</p>
              <p className="mt-1 text-2xl font-bold">
                {loading ? "..." : data?.total_videos ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Platform status</p>
              <p className="mt-1 text-sm font-semibold text-green-500">
                {loading ? "Connecting..." : error ? "Connection error" : "Connected"}
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <p className="rounded-xl border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </p>
        ) : (
          <section className="rounded-2xl border border-slate-200/10 bg-white/5 p-5">
            <h2 className="mb-5 text-lg font-semibold">
              Trending YouTube Videos
            </h2>
            <YouTubeDiscovery />
          </section>
        )}
      </div>
    </main>
  );
}
