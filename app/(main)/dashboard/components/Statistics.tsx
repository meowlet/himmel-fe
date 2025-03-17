"use client";

import React, { useState, useEffect } from "react";
import { Constant } from "@/util/Constant";
import fetchWithAuth from "@/util/Fetcher";
import Select from "react-select";
import {
  GroupByOption,
  GeneralStats,
  GroupedGeneralStats,
  FictionStats,
  UserStats,
} from "./statistics/types";
import { GeneralStatsComponent } from "./statistics/GeneralStats";
import { FictionStatsComponent } from "./statistics/FictionStats";
import { UserStatsComponent } from "./statistics/UserStats";
import { TransactionView } from "./statistics/TransactionView";

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
  const [showTransactions, setShowTransactions] = useState(false);

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
        { credentials: "include" }
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

  const handleRevenueClick = () => {
    setShowTransactions(true);
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
        {activeTab === "general" && (
          <GeneralStatsComponent
            stats={generalStats}
            onRevenueClick={handleRevenueClick}
          />
        )}
        {activeTab === "fiction" && (
          <FictionStatsComponent stats={fictionStats} />
        )}
        {activeTab === "user" && <UserStatsComponent stats={userStats} />}
      </div>

      {/* Transaction Modal */}
      {showTransactions && (
        <TransactionView
          fromDate={fromDate}
          toDate={toDate}
          onClose={() => setShowTransactions(false)}
        />
      )}
    </div>
  );
};
