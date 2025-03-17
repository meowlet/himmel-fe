import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { StatCard } from "./StatCard";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface UserStatsProps {
  stats: UserStatsType;
}

export const UserStatsComponent = ({ stats }: UserStatsProps) => {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          subValue={`${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(
            1
          )}%`}
        />
        <StatCard title="New Users" value={stats.newUsersCount} />
      </div>

      <div className="h-80">
        <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={Object.entries(stats.usersByRole).map(([name, value]) => ({
                name,
                value,
              }))}
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
    </div>
  );
};
