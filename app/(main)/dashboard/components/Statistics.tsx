"use client";

import React, { useState, useEffect } from "react";
import { Constant } from "@/util/Constant";
import fetchWithAuth from "@/util/Fetcher";
import Select from "react-select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

enum GroupByOption {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

interface GeneralStats {
  totalUsers: number;
  totalAuthors: number;
  totalFictions: number;
  totalPremiumFictions: number;
  totalFreeFictions: number;
  totalViews: number;
  totalRevenue: number;
  totalPaidOut: number;
}

interface GroupedGeneralStats extends GeneralStats {
  date: string;
}

interface FictionStats {
  totalViews: number;
  totalFavorites: number;
  totalComments: number;
  totalRatings: number;
  averageRating: number;
  viewsByType: {
    free: number;
    premium: number;
  };
  topViewedFictions: {
    _id: string;
    title: string;
    views: number;
  }[];
}

interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  newUsersCount: number;
  usersByRole: {
    [key: string]: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const Statistics = () => {
  // States
  const [activeTab, setActiveTab] = useState<"general" | "fiction" | "user">(
    "general"
  );
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [groupBy, setGroupBy] = useState<GroupByOption | null>(null);
  const [generalStats, setGeneralStats] = useState<
    GeneralStats | GroupedGeneralStats[]
  >();
  const [fictionStats, setFictionStats] = useState<FictionStats>();
  const [userStats, setUserStats] = useState<UserStats>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    fetchStats();
  }, [activeTab, fromDate, toDate, groupBy]);

  // Fetch functions
  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append("from", fromDate);
      if (toDate) queryParams.append("to", toDate);
      if (groupBy && activeTab === "general")
        queryParams.append("groupBy", groupBy);

      const response = await fetchWithAuth(
        `${Constant.API_URL}/statistic/${activeTab}?${queryParams}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        switch (activeTab) {
          case "general":
            setGeneralStats(data.data);
            break;
          case "fiction":
            setFictionStats(data.data);
            break;
          case "user":
            setUserStats(data.data);
            break;
        }
      } else {
        throw new Error(data.error?.details || "An error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Render functions
  const renderGeneralStats = () => {
    if (!generalStats) return null;

    if (Array.isArray(generalStats)) {
      return (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={generalStats}>
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
        <StatCard title="Total Users" value={generalStats.totalUsers} />
        <StatCard title="Total Authors" value={generalStats.totalAuthors} />
        <StatCard title="Total Fictions" value={generalStats.totalFictions} />
        <StatCard title="Total Views" value={generalStats.totalViews} />
        <StatCard
          title="Premium Fictions"
          value={generalStats.totalPremiumFictions}
          subValue={`${(
            (generalStats.totalPremiumFictions / generalStats.totalFictions) *
            100
          ).toFixed(1)}%`}
        />
        <StatCard
          title="Total Revenue"
          value={generalStats.totalRevenue}
          format="currency"
        />
        <StatCard
          title="Total Paid Out"
          value={generalStats.totalPaidOut}
          format="currency"
        />
      </div>
    );
  };

  const renderFictionStats = () => {
    if (!fictionStats) return null;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Views" value={fictionStats.totalViews} />
          <StatCard
            title="Total Favorites"
            value={fictionStats.totalFavorites}
          />
          <StatCard title="Total Comments" value={fictionStats.totalComments} />
          <StatCard
            title="Average Rating"
            value={fictionStats.averageRating}
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
                    { name: "Free", value: fictionStats.viewsByType.free },
                    {
                      name: "Premium",
                      value: fictionStats.viewsByType.premium,
                    },
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
                data={fictionStats.topViewedFictions.slice(0, 5)}
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

  const renderUserStats = () => {
    if (!userStats) return null;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Users" value={userStats.totalUsers} />
          <StatCard
            title="Premium Users"
            value={userStats.premiumUsers}
            subValue={`${(
              (userStats.premiumUsers / userStats.totalUsers) *
              100
            ).toFixed(1)}%`}
          />
          <StatCard title="New Users" value={userStats.newUsersCount} />
        </div>

        <div className="h-80">
          <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(userStats.usersByRole).map(
                  ([name, value]) => ({
                    name,
                    value,
                  })
                )}
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-light-error">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "general"
                ? "bg-light-primary text-light-onPrimary"
                : "bg-light-surfaceVariant"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("fiction")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "fiction"
                ? "bg-light-primary text-light-onPrimary"
                : "bg-light-surfaceVariant"
            }`}
          >
            Fiction
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "user"
                ? "bg-light-primary text-light-onPrimary"
                : "bg-light-surfaceVariant"
            }`}
          >
            User
          </button>
        </div>

        <div className="flex gap-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          {activeTab === "general" && (
            <Select
              options={Object.values(GroupByOption).map((option) => ({
                value: option,
                label: option.charAt(0).toUpperCase() + option.slice(1),
              }))}
              value={
                groupBy
                  ? {
                      value: groupBy,
                      label: groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
                    }
                  : null
              }
              onChange={(option) => setGroupBy(option?.value || null)}
              placeholder="Group by"
              isClearable
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-light-surface p-6 rounded-lg">
        {activeTab === "general" && renderGeneralStats()}
        {activeTab === "fiction" && renderFictionStats()}
        {activeTab === "user" && renderUserStats()}
      </div>
    </div>
  );
};

// Helper component for stat cards
const StatCard = ({
  title,
  value,
  subValue,
  format,
}: {
  title: string;
  value: number;
  subValue?: string;
  format?: "currency" | "decimal";
}) => {
  const formatValue = (val: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(val);
    }
    if (format === "decimal") {
      return val.toFixed(2);
    }
    return new Intl.NumberFormat().format(val);
  };

  return (
    <div className="bg-light-surfaceVariant p-4 rounded-lg">
      <h3 className="text-sm text-light-onSurfaceVariant">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{formatValue(value)}</p>
      {subValue && (
        <p className="text-sm text-light-outline mt-1">{subValue}</p>
      )}
    </div>
  );
};
