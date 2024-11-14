"use client";

import React from "react";
import { AddFictionForm } from "@/components/fiction/AddFictionForm";
import { useRouter } from "next/navigation";

export default function CreateFictionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create New Fiction
        </h1>

        <div>
          <AddFictionForm />
        </div>
      </div>
    </div>
  );
}
