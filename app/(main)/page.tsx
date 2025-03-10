"use client";

import React from "react";
import { TrendingFictions } from "@/components/home/TrendingFictions";
import { NewestFictions } from "@/components/home/NewestFictions";
import { PopularFictions } from "@/components/home/PopularFictions";
import { PremiumFictions } from "@/components/home/PremiumFictions";
import { CompletedFictions } from "@/components/home/CompletedFictions";
import { RandomFictions } from "@/components/home/RandomFictions";
import { AdUnit } from "@/components/ad/AdUnit";
import { BannerAd } from "@/components/ad/BannerAd";

const Home: React.FC = () => {
  return (
    <div className="mx-auto px-4 md:px-16 py-8">
      <RandomFictions />

      <BannerAd />

      {/* Ad after random fictions */}
      <div className="my-8">
        <AdUnit slotId="4408441888" format="horizontal" />
      </div>

      <TrendingFictions />
      <NewestFictions />

      {/* Ad in the middle of the page */}
      <div className="my-8">
        <AdUnit slotId="4408441888" format="rectangle" />
      </div>

      <PopularFictions />
      <PremiumFictions />
      <CompletedFictions />

      {/* Ad at the bottom */}
      <div className="my-8">
        <AdUnit slotId="4408441888" />
      </div>
    </div>
  );
};

export default Home;
