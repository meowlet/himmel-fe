"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "himmel_notification_dismissed";

export const useNotificationPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kiểm tra localStorage để xem user đã tick "không hiện lại" chưa
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    
    if (!isDismissed) {
      // Delay một chút để trang load xong trước khi hiện popup
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  // Function để reset (dành cho testing)
  const resetNotification = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsVisible(true);
  };

  return {
    isVisible,
    closePopup,
    dontShowAgain,
    resetNotification,
  };
};
