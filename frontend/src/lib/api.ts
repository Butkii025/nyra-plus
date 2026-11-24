
export interface TrendVideo {
  content_id: number;
  title: string;
  channel_name: string;
  video_url: string;
  latest_views: number | null;
  latest_likes: number | null;
  latest_comments: number | null;
  raw_metrics: {
    growth: number | null;
    engagement: number | null;
    comment_activity: number | null;
    recency: number | null;
  };
  normalized_metrics: {
    growth: number | null;
    engagement: number | null;
    comment_activity: number | null;
    recency: number | null;
  };
  trend_score: number | null;
  data_coverage_percent: number;
  algorithm_version: string;
}

export interface TrendsResponse {
  status: string;
  total_videos: number;
  algorithm: string;
  trending_videos: TrendVideo[];
}

export async function getTrends(): Promise<TrendsResponse> {
  const response = await fetch("/api/trends", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch trend data");
  }

  return response.json();
}


export async function refreshYouTubeTrends(): Promise<void> {
  const response = await fetch("/api/youtube/refresh", {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to refresh YouTube trends");
  }
}
