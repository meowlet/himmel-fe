"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

interface AdUnitProps {
  slotId: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  slotId,
  format = "auto",
  className = "",
}) => {
  const { user, loading } = useUser();
  const [shouldDisplayAd, setShouldDisplayAd] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const adId = useRef(`ad-${uuidv4()}`);

  useEffect(() => {
    if (!loading) {
      // Only show ads if user is not premium and doesn't have ads disabled
      const showAds = !(user?.isPremium || user?.disableAds);
      setShouldDisplayAd(showAds);

      if (showAds && typeof window !== "undefined" && adRef.current) {
        // Push ad refresh when component mounts and user is not premium
        try {
          const adElement = adRef.current.querySelector(".adsbygoogle");
          if (adElement && !adElement.getAttribute("data-adsbygoogle-status")) {
            console.log(`Initializing ad for slot ${slotId}`);
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } else {
            console.log("Ad already initialized or not found");
          }
        } catch (error) {
          console.error("AdSense error:", error);
        }
      }
    }
  }, [user, loading, slotId]);

  if (loading || !shouldDisplayAd) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`} ref={adRef} id={adId.current}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6001903694968256"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-adtest="on"
      />
    </div>
  );
};
