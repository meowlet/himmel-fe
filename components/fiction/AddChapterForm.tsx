"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Constant } from "@/util/Constant";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

// Schema validation
const chapterSchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  chapterIndex: z.number().min(0, "Chapter index must be non-negative"),
  pages: z.array(z.any()).min(1, "At least one page is required"),
  type: z.enum(["free", "premium"]).optional(),
});

interface AddChapterFormProps {
  fictionId: string;
}

interface PageItem {
  id: string;
  file: File;
  preview: string;
}

export const AddChapterForm: React.FC<AddChapterFormProps> = ({
  fictionId,
}) => {
  const router = useRouter();
  const [chapterIndex, setChapterIndex] = useState("");
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const newPageItems = await Promise.all(
      files.map(async (file) => {
        const preview = await readFileAsDataURL(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
        };
      })
    );
    setPages((prev) => [...prev, ...newPageItems]);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;

    setPages((prevPages) => {
      const newPages = [...prevPages];
      const [movedItem] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedItem);
      return newPages;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate data
      chapterSchema.parse({
        title,
        chapterIndex: parseInt(chapterIndex),
        pages: pages.map((p) => p.file),
        type: "free",
      });

      const formData = new FormData();
      formData.append("chapterIndex", chapterIndex);
      formData.append("title", title);
      pages.forEach((page) => {
        formData.append("content", page.file);
      });

      const response = await fetch(
        `${Constant.API_URL}/fiction/${fictionId}/chapter`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        router.push(`/fiction/${fictionId}`);
      } else {
        setErrors({ root: result.error.details || "An error occurred" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ root: "An error occurred" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-4xl mx-auto p-6 space-y-6 bg-light-surface rounded-lg shadow"
    >
      {errors.root && (
        <div className="p-4 bg-light-error-container text-light-onErrorContainer rounded">
          {errors.root}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-light-onSurface mb-1">
            Chapter Index
          </label>
          <Input
            type="number"
            value={chapterIndex}
            onChange={(e) => setChapterIndex(e.target.value)}
            error={errors.chapterIndex}
            placeholder="Enter chapter index"
            min={1}
            max={999999}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-onSurface mb-1">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="Enter chapter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-onSurface mb-1">
            Pages
          </label>
          <div
            className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg border-light-outline"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              handleFiles(files);
            }}
          >
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-light-onSurfaceVariant">
                <label className="relative cursor-pointer rounded-md font-medium text-light-primary hover:text-light-primary/80">
                  <span>Upload pages</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-light-onSurfaceVariant">
                PNG, JPG up to 5MB each
              </p>
            </div>
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-light-error">{errors.content}</p>
          )}
        </div>

        {pages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pages.map((page, index) => (
              <div key={page.id} className="relative group">
                <div className="relative">
                  <Image
                    src={page.preview}
                    alt={`Page ${index + 1}`}
                    width={200}
                    height={300}
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePage(page.id)}
                    className="absolute top-2 right-2 p-1 bg-light-error text-light-onError rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-light-surface/80 px-2 py-1 rounded text-sm">
                    Page {index + 1}
                  </div>
                  <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => movePage(index, index - 1)}
                      disabled={index === 0}
                      className={`p-1 rounded-full ${
                        index === 0
                          ? "bg-light-surface/40 text-light-onSurface/40"
                          : "bg-light-surface/80 text-light-onSurface hover:bg-light-primary hover:text-light-onPrimary"
                      }`}
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePage(index, index + 1)}
                      disabled={index === pages.length - 1}
                      className={`p-1 rounded-full ${
                        index === pages.length - 1
                          ? "bg-light-surface/40 text-light-onSurface/40"
                          : "bg-light-surface/80 text-light-onSurface hover:bg-light-primary hover:text-light-onPrimary"
                      }`}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outlined"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Chapter"}
        </Button>
      </div>
    </form>
  );
};
