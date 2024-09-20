"use client";

import React from "react";
import { FictionList } from "@/components/fiction/FictionList";
import { Header } from "@/components/layout/Header";

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12"></section>

      <section>
        <FictionList />
      </section>
    </div>
  );
};

export default Home;
