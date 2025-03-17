import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

import { GroupedGeneralStats, GeneralStats as GeneralStatsType } from "./types";
import { StatCard } from "./StatCard";

interface GeneralStatsProps {
  stats: GeneralStatsType | GroupedGeneralStats[];
  onRevenueClick: () => void;
}

export const GeneralStatsComponent = ({
  stats,
  onRevenueClick,
}: GeneralStatsProps) => {
  if (!stats) return null;

  if (Array.isArray(stats)) {
    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalUsers"
              stroke="#8884d8"
              name="Total Users"
            />
            <Line
              type="monotone"
              dataKey="totalFictions"
              stroke="#82ca9d"
              name="Total Fictions"
            />
            <Line
              type="monotone"
              dataKey="totalViews"
              stroke="#ffc658"
              name="Total Views"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" value={stats.totalUsers} />
      <StatCard title="Total Authors" value={stats.totalAuthors} />
      <StatCard title="Total Fictions" value={stats.totalFictions} />
      <StatCard title="Total Views" value={stats.totalViews} />
      <StatCard
        title="Premium Fictions"
        value={stats.totalPremiumFictions}
        subValue={`${(
          (stats.totalPremiumFictions / stats.totalFictions) *
          100
        ).toFixed(1)}%`}
      />
      <div onClick={onRevenueClick} style={{ cursor: "pointer" }}>
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          format="currency"
          clickable
        />
      </div>
      <StatCard
        title="Total Paid Out"
        value={stats.totalPaidOut}
        format="currency"
      />
    </div>
  );
};
