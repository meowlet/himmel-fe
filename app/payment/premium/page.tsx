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
      console.error("Lỗi khi đăng ký Premium:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Đăng ký Premium</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Chọn gói Premium:</h2>
          {Object.entries(prices).map(([duration, price]) => (
            <label key={duration} className="block mb-2">
              <input
                type="radio"
                name="duration"
                value={duration}
                checked={selectedDuration === duration}
                onChange={() => setSelectedDuration(duration as Duration)}
                className="mr-2"
              />
              {duration.replace("_", " ")} - {price} VND
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Đăng ký ngay
        </button>
      </form>
    </div>
  );
}
