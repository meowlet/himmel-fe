"use client";

import React from "react";
import { TrendingFictions } from "@/components/home/TrendingFictions";
import { NewestFictions } from "@/components/home/NewestFictions";
import { PopularFictions } from "@/components/home/PopularFictions";
import { PremiumFictions } from "@/components/home/PremiumFictions";
import { CompletedFictions } from "@/components/home/CompletedFictions";
import { RandomFictions } from "@/components/home/RandomFictions";

const Home: React.FC = () => {
  return (
    <div className="mx-auto px-4 md:px-16 py-8">
      <RandomFictions />
      <TrendingFictions />
      <NewestFictions />
      <PopularFictions />
      <PremiumFictions />
      <CompletedFictions />
    </div>
  );
};

export default Home;
