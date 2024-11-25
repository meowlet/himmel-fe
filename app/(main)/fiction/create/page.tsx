"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useRouter } from "next/navigation";

const AddFictionForm = dynamic(
  () =>
    import("@/components/fiction/AddFictionForm").then((mod) => ({
      default: mod.AddFictionForm,
    })),
  { ssr: false }
);

export default function CreateFictionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-light-onSurface text-center">
          Create New Fiction
        </h1>
        <div>
          <AddFictionForm />
        </div>
      </div>
    </div>
  );
}
