import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { StatCard } from "./StatCard";
import { FictionStats as FictionStatsType } from "./types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface FictionStatsProps {
  stats: FictionStatsType;
}

export const FictionStatsComponent = ({ stats }: FictionStatsProps) => {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Views" value={stats.totalViews} />
        <StatCard title="Total Favorites" value={stats.totalFavorites} />
        <StatCard title="Total Comments" value={stats.totalComments} />
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
          format="decimal"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Views by Type Pie Chart */}
        <div className="h-80">
          <h3 className="text-lg font-semibold mb-4">Views by Type</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Free", value: stats.viewsByType.free },
                  { name: "Premium", value: stats.viewsByType.premium },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) =>
                  `${name} ${new Intl.NumberFormat().format(value)} (${(
                    percent * 100
                  ).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Viewed Fictions */}
        <div className="h-80">
          <h3 className="text-lg font-semibold mb-4">Top Viewed Fictions</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.topViewedFictions.slice(0, 5)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="title"
                type="category"
                width={120}
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    fill="#666"
                    className="text-sm"
                  >
                    <tspan x={x - 5}>
                      {payload.value.length > 35
                        ? payload.value.substring(0, 35) + "..."
                        : payload.value}
                    </tspan>
                  </text>
                )}
              />
              <Tooltip />
              <Bar dataKey="views" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
