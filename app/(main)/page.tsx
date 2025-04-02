"use client";

import React, { useState, useEffect } from "react";
import { TrendingFictions } from "@/components/home/TrendingFictions";
import { NewestFictions } from "@/components/home/NewestFictions";
import { PopularFictions } from "@/components/home/PopularFictions";
import { PremiumFictions } from "@/components/home/PremiumFictions";
import { CompletedFictions } from "@/components/home/CompletedFictions";
import { RandomFictions } from "@/components/home/RandomFictions";
import { AdUnit } from "@/components/ad/AdUnit";
import { BannerAd } from "@/components/ad/BannerAd";
import { Constant } from "@/util/Constant";
import { isPremiumUser } from "@/util/premiumUtils";

const Home: React.FC = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      setIsLoading(true);

      try {
        // Check if user is logged in with premium status
        const response = await fetch(`${Constant.API_URL}/me`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.status === "success" && data.data.isPremium) {
          setIsPremium(true);
        } else {
          // Check for premium token in localStorage as fallback
          const localPremiumStatus = isPremiumUser();
          setIsPremium(localPremiumStatus);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
        // Check localStorage as fallback if fetch fails
        const localPremiumStatus = isPremiumUser();
        setIsPremium(localPremiumStatus);
      } finally {
        setIsLoading(false);
      }
    };

    checkPremiumStatus();
  }, []);

  return (
    <div className="mx-auto px-4 md:px-16 py-8">
      <RandomFictions />

      {!isPremium && (
        <>
          <BannerAd />

          {/* Ad after random fictions */}
          <div className="my-8">
            <AdUnit slotId="4408441888" format="horizontal" />
          </div>
        </>
      )}

      <TrendingFictions />
      <NewestFictions />

      {!isPremium && (
        /* Ad in the middle of the page */
        <div className="my-8">
          <AdUnit slotId="4408441888" format="rectangle" />
        </div>
      )}

      <PopularFictions />
      <PremiumFictions />
      <CompletedFictions />

      {!isPremium && (
        /* Ad at the bottom */
        <div className="my-8">
          <AdUnit slotId="4408441888" />
        </div>
      )}
    </div>
  );
};

export default Home;
