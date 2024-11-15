"use client";

import { AddChapterForm } from "@/components/fiction/AddChapterForm";
import { useParams } from "next/navigation";

export default function CreateChapterPage() {
  const { fictionId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-light-onSurface">
        Create New Chapter
      </h1>
      <AddChapterForm fictionId={fictionId as string} />
    </div>
  );
}
