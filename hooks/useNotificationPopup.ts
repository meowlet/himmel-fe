"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "himmel_notification_dismissed";

export const useNotificationPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);

    if (!isDismissed) {
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
