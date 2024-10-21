"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Constant } from "@/util/Constant";
import { Fiction, Chapter, User } from "@/types/Fiction";
import fetchWithAuth from "@/util/Fetcher";

interface HistoryItem {
  chapter: Chapter | null;
  fiction: Fiction | null;
  lastReadPage: number;
  lastReadTime: string;
  isDeleted: boolean;
}

const HistoryPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingHistory, setReadingHistory] = useState<HistoryItem[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(`${Constant.API_URL}/me`);
        if (!response.ok) {
          throw new Error("Unable to load user data");
        }
        const data = await response.json();
        setUser(data.data);
        await fetchReadingHistory(data.data.readingHistory);
      } catch (err) {
        setError("An error occurred while loading user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchReadingHistory = async (history: any[]) => {
    const historyPromises = history.map(async (item) => {
      try {
        const chapterResponse = await fetchWithAuth(
          `${Constant.API_URL}/fiction/chapter/${item.chapter}`
        );
        if (!chapterResponse.ok) {
          throw new Error("Chapter not found");
        }
        const chapterData = await chapterResponse.json();

        const fictionResponse = await fetchWithAuth(
          `${Constant.API_URL}/fiction/${chapterData.data.fiction}`
        );
        if (!fictionResponse.ok) {
          throw new Error("Fiction not found");
        }
        const fictionData = await fictionResponse.json();

        return {
          chapter: chapterData.data,
          fiction: fictionData.data,
          lastReadPage: item.lastReadPage,
          lastReadTime: item.lastReadTime,
          isDeleted: false,
        };
      } catch (error) {
        console.error("Error fetching history item:", error);
        return {
          chapter: null,
          fiction: null,
          lastReadPage: item.lastReadPage,
          lastReadTime: item.lastReadTime,
          isDeleted: true,
        };
      }
    });

    const historyData = await Promise.all(historyPromises);
    setReadingHistory(historyData);
  };

  const groupHistoryByDate = (history: HistoryItem[]) => {
    const grouped: { [key: string]: HistoryItem[] } = {};
    const sortedHistory = [...history].sort(
      (a, b) =>
        new Date(b.lastReadTime).getTime() - new Date(a.lastReadTime).getTime()
    );

    let lastDate: Date | null = null;
    sortedHistory.forEach((item) => {
      const currentDate = new Date(item.lastReadTime);
      const dateString = currentDate.toLocaleDateString();

      if (lastDate && daysBetween(lastDate, currentDate) > 1) {
        const gapDate = new Date(lastDate.getTime() - 86400000); // Subtract one day
        grouped[gapDate.toLocaleDateString()] = [];
      }

      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(item);
      lastDate = currentDate;
    });
    return grouped;
  };

  const daysBetween = (date1: Date, date2: Date) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(
      Math.abs((date1.getTime() - date2.getTime()) / oneDay)
    );
    return diffDays;
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-light-error">{error}</div>;
  if (!user) return <div className="text-center py-10">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-light-onSurface mb-6">
        Reading History
      </h1>
      {Object.entries(groupHistoryByDate(readingHistory)).map(
        ([date, items]) => (
          <div key={date} className="mb-8">
            <h2 className="text-xl font-semibold text-light-onSurface mb-4">
              {items.length === 0 ? `No activity on ${date}` : date}
            </h2>
            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-light-surface shadow rounded-lg overflow-hidden flex flex-col sm:flex-row"
                  >
                    {item.isDeleted ? (
                      <div className="p-4 flex-grow">
                        <p className="text-light-error">
                          This content is no longer available
                        </p>
                        <p className="text-xs text-light-onSurface-400">
                          Last read on{" "}
                          {new Date(item.lastReadTime).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-full sm:w-24 flex-shrink-0">
                          <div className="relative h-32 sm:h-full w-full">
                            <Image
                              src={`${Constant.API_URL}/fiction/${item.fiction?._id}/cover`}
                              alt={item.fiction?.title || "Fiction cover"}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        </div>
                        <div className="p-4 flex-grow">
                          <h2 className="text-lg font-semibold text-light-onSurface mb-1 line-clamp-1">
                            {item.fiction?.title}
                          </h2>
                          <p className="text-sm text-light-onSurface-600 mb-2">
                            Chapter {item.chapter?.chapterIndex}:{" "}
                            {item.chapter?.title}
                          </p>
                          <p className="text-xs text-light-onSurface-400">
                            Last read:{" "}
                            <span className="font-semibold text-light-secondary">
                              Page {item.lastReadPage} on{" "}
                            </span>
                            {new Date(item.lastReadTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 flex items-center justify-center sm:justify-end">
                          <button
                            onClick={() =>
                              router.push(
                                `/fiction/${item.fiction?._id}/chapter/${item.chapter?._id}`
                              )
                            }
                            className="w-full sm:w-auto px-4 py-2 bg-light-primary text-light-onPrimary rounded-full hover:bg-light-primary-dark transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            Continue Reading
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default HistoryPage;
