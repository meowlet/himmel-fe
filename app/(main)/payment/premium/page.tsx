"use client";

import { Constant } from "@/util/Constant";
import React, { useState } from "react";

enum Duration {
  ONE_MONTH = "ONE_MONTH",
  THREE_MONTH = "THREE_MONTH",
  SIX_MONTH = "SIX_MONTH",
  ONE_YEAR = "ONE_YEAR",
}

const prices = {
  [Duration.ONE_MONTH]: "5000",
  [Duration.THREE_MONTH]: "14000",
  [Duration.SIX_MONTH]: "26000",
  [Duration.ONE_YEAR]: "50000",
};

// Tính % tiết kiệm so với gói 1 tháng
const calculateSavings = (duration: Duration, price: string): number => {
  const monthlyPrice = parseInt(prices[Duration.ONE_MONTH]);
  const currentPrice = parseInt(price);
  const months =
    duration === Duration.THREE_MONTH
      ? 3
      : duration === Duration.SIX_MONTH
      ? 6
      : 12;
  const saving =
    ((monthlyPrice * months - currentPrice) / (monthlyPrice * months)) * 100;
  return Math.round(saving);
};

const formatDuration = (duration: string): string => {
  return duration
    .replace("_", " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function PremiumPage() {
  const [selectedDuration, setSelectedDuration] = useState<Duration>(
    Duration.ONE_MONTH
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(Constant.API_URL + "/me/purchase-premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: selectedDuration,
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (result.status === "success" && result.data.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        alert(result.error.details);
      }
    } catch (error) {
      console.error("Error when registering Premium:", error);
    }
  };

  return (
    <div className="min-h-screen bg-light-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-light-onBackground mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-light-onBackground/70">
            Get access to exclusive content and features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(prices).map(([duration, price]) => {
              const savings =
                duration !== Duration.ONE_MONTH
                  ? calculateSavings(duration as Duration, price)
                  : 0;

              return (
                <div
                  key={duration}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
                    selectedDuration === duration
                      ? "border-light-primary bg-light-primaryContainer shadow-lg scale-105"
                      : "border-light-outline hover:border-light-primary hover:shadow bg-light-surface"
                  }`}
                  onClick={() => setSelectedDuration(duration as Duration)}
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-light-onSurface">
                      {formatDuration(duration)}
                    </h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-2xl font-bold text-light-onSurface">
                        {parseInt(price).toLocaleString()}
                      </span>
                      <span className="text-light-onSurface/70 ml-1">VND</span>
                    </div>
                    {savings > 0 && (
                      <div className="absolute top-2 right-2 bg-light-tertiary text-light-onTertiary text-xs font-bold px-2 py-1 rounded-full">
                        Save {savings}%
                      </div>
                    )}
                    <input
                      type="radio"
                      name="duration"
                      value={duration}
                      checked={selectedDuration === duration}
                      onChange={() => setSelectedDuration(duration as Duration)}
                      className="sr-only"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-light-onPrimary bg-light-primary hover:bg-light-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary transition-colors duration-200"
            >
              Upgrade Now
            </button>
          </div>
        </form>

        <div className="mt-12 bg-light-surface rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface">
            Premium Benefits
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center text-light-onSurface">
              <svg
                className="h-5 w-5 text-light-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Access to all premium content
            </li>
            <li className="flex items-center text-light-onSurface">
              <svg
                className="h-5 w-5 text-light-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Ad-free reading experience
            </li>
            <li className="flex items-center text-light-onSurface">
              <svg
                className="h-5 w-5 text-light-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Early access to new releases
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
