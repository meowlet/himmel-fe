"use client";

import React from "react";
import { TrendingFictions } from "@/components/home/TrendingFictions";
import { NewestFictions } from "@/components/home/NewestFictions";
import { PopularFictions } from "@/components/home/PopularFictions";
import { PremiumFictions } from "@/components/home/PremiumFictions";
import { CompletedFictions } from "@/components/home/CompletedFictions";

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TrendingFictions />
      <NewestFictions />
      <PopularFictions />
      <PremiumFictions />
      <CompletedFictions />
    </div>
  );
};

export default Home;
