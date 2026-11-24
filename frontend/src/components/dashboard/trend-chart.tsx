
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", activity: 35 },
  { day: "Tue", activity: 48 },
  { day: "Wed", activity: 42 },
  { day: "Thu", activity: 65 },
  { day: "Fri", activity: 58 },
  { day: "Sat", activity: 82 },
  { day: "Sun", activity: 94 },
];

export function TrendChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C50337" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#C50337" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            opacity={0.1}
          />

          <XAxis
            dataKey="day"
            stroke="currentColor"
            tick={{ fill: "currentColor", fontSize: 12 }}
          />

          <YAxis
            stroke="currentColor"
            tick={{ fill: "currentColor", fontSize: 12 }}
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="activity"
            stroke="#C50337"
            strokeWidth={3}
            fill="url(#trendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
