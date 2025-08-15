// File này để test notification popup
// Có thể xóa sau khi hoàn thành

"use client";
import React from "react";
import { useNotificationPopup } from "@/hooks/useNotificationPopup";

export const NotificationTestControls = () => {
  const { resetNotification } = useNotificationPopup();

  // Chỉ hiện trong development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[10000]">
      <button
        onClick={resetNotification}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs shadow-lg"
        title="Reset notification popup (Development only)"
      >
        Reset Popup
      </button>
    </div>
  );
};
