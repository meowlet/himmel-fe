"use client";

import React from "react";
import { FictionList } from "@/components/fiction/FictionList";
import { Header } from "@/components/layout/Header";

const Home: React.FC = () => {
  return (
    <div className="mx-auto py-4">
      <section className="mb-12"></section>

      <section>
        <FictionList />
      </section>
    </div>
  );
};

export default Home;
