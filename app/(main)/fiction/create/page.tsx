"use client";

import React from "react";
import { AddFictionForm } from "@/components/fiction/AddFictionForm";
import { useRouter } from "next/navigation";

export default function CreateFictionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl">Create New Fiction</h1>
          <button onClick={() => router.back()}>Back</button>
        </div>

        <div>
          <AddFictionForm />
        </div>
      </div>
    </div>
  );
}
