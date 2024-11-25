"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const AddChapterForm = dynamic(
  () =>
    import("@/components/fiction/AddChapterForm").then((mod) => ({
      default: mod.AddChapterForm,
    })),
  { ssr: false }
);

export default function CreateChapterPage() {
  const { fictionId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-light-onSurface text-center">
        Create New Chapter
      </h1>
      <AddChapterForm fictionId={fictionId as string} />
    </div>
  );
}
