"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { v4 as uuidv4 } from "uuid";

interface BannerAdProps {
  className?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ className = "" }) => {
  const { user, loading } = useUser();
  const adRef = useRef<HTMLDivElement>(null);
  const adId = useRef(`ad-${uuidv4()}`);

  useEffect(() => {
    if (
      !loading &&
      !(user?.isPremium || user?.disableAds) &&
      typeof window !== "undefined" &&
      adRef.current
    ) {
      try {
        const adElement = adRef.current.querySelector(".adsbygoogle");
        if (adElement && !adElement.getAttribute("data-adsbygoogle-status")) {
          console.log("Attempting to load AdSense ad");
          // Fix cho lỗi TypeScript với window.adsbygoogle
          const adsbygoogle = window.adsbygoogle || [];
          adsbygoogle.push({});
          console.log("AdSense push completed");
        } else {
          console.log("Ad already initialized, skipping push");
        }
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [user, loading]);

  if (loading || user?.isPremium || user?.disableAds) {
    return null;
  }

  return (
    <div className={`banner-ad ${className}`} ref={adRef} id={adId.current}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6001903694968256"
        data-ad-slot="4408441888"
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on"
      />
      <p className="text-xs text-gray-400 text-center mt-1">Advertisement</p>
    </div>
  );
};
