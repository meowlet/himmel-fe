"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Constant } from "@/util/Constant";
import Select from "react-select";
import { z } from "zod";
import Image from "next/image";

// Enum types từ backend
enum FictionType {
  FREE = "free",
  PREMIUM = "premium",
}

enum FictionStatus {
  DRAFT = "draft",
  FINISHED = "finished",
  ONGOING = "ongoing",
  HIATUS = "hiatus",
}

const addFictionSchema = z.object({
  title: z
    .string()
    .min(1, "Title must not be empty")
    .max(100, "Title must not exceed 100 characters"),
  description: z.string().min(1, "Description must not be empty"),
  tags: z
    .array(z.string())
    .min(1, "Must select at least 1 tag")
    .max(10, "Cannot select more than 10 tags"),
  status: z.nativeEnum(FictionStatus),
  type: z.nativeEnum(FictionType),
  cover: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must not exceed 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Only JPEG and PNG files are allowed"
    )
    .optional(),
});

export const AddFictionForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [status, setStatus] = useState<FictionStatus>(FictionStatus.ONGOING);
  const [type, setType] = useState<FictionType>(FictionType.FREE);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [tags, setTags] = useState<Array<{ value: string; label: string }>>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Thêm một ref để truy cập input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch(`${Constant.API_URL}/tag`);
      const data = await response.json();
      if (data.status === "success") {
        setTags(
          data.data.map((tag: any) => ({
            value: tag._id,
            label: tag.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && ["image/jpeg", "image/png"].includes(file.type)) {
      setCover(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setCover(null);
    setCoverPreview("");
    // Reset giá trị của input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      selectedTags.forEach((tag) => formData.append("tags", tag.value));
      formData.append("status", status);
      formData.append("type", type);
      if (cover) formData.append("cover", cover);

      // Validate data
      addFictionSchema.parse({
        title,
        description,
        tags: selectedTags.map((t) => t.value),
        status,
        type,
        cover,
      });

      const response = await fetch(`${Constant.API_URL}/fiction/create`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Fiction created successfully!");
        resetForm();
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedTags([]);
    setStatus(FictionStatus.ONGOING);
    setType(FictionType.FREE);
    setCover(null);
    setCoverPreview("");
  };

  const statusOptions = [
    { value: FictionStatus.ONGOING, label: "Ongoing" },
    { value: FictionStatus.FINISHED, label: "Finished" },
    { value: FictionStatus.DRAFT, label: "Draft" },
    { value: FictionStatus.HIATUS, label: "Hiatus" },
  ];

  const typeOptions = [
    { value: FictionType.FREE, label: "Free" },
    { value: FictionType.PREMIUM, label: "Premium" },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-4xl mx-auto p-6 space-y-6 bg-light-surface rounded-lg shadow"
    >
      {successMessage && (
        <div className="p-4 bg-light-tertiary-container text-light-onTertiaryContainer rounded">
          {successMessage}
        </div>
      )}

      {errors.root && (
        <div className="p-4 bg-light-error-container text-light-onErrorContainer rounded">
          {errors.root}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-light-onSurface mb-1">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              placeholder="Enter fiction title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-onSurface mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 rounded-lg bg-light-surface text-light-onSurface ${
                errors.description
                  ? "border-light-error"
                  : "border-light-outline"
              } focus:border-light-primary focus:ring-1 focus:ring-light-primary`}
              rows={5}
              placeholder="Enter fiction description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-light-error">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-light-onSurface mb-1">
              Tags
            </label>
            <Select
              isMulti
              options={tags}
              value={selectedTags}
              onChange={(selected) => setSelectedTags(selected as any)}
              className={errors.tags ? "border-light-error" : ""}
              placeholder="Select tags"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: errors.tags
                    ? "var(--light-error)"
                    : "var(--light-outline)",
                  "&:hover": {
                    borderColor: "var(--light-primary)",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "var(--light-surface)",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "var(--light-primary-container)"
                    : "var(--light-surface)",
                  color: "var(--light-onSurface)",
                  "&:hover": {
                    backgroundColor: "var(--light-primary-container)",
                  },
                }),
              }}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-light-error">{errors.tags}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-light-onSurface mb-1">
              Status
            </label>
            <Select
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === status)}
              onChange={(selected) =>
                setStatus(selected?.value as FictionStatus)
              }
              className={errors.status ? "border-light-error" : ""}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: errors.status
                    ? "var(--light-error)"
                    : "var(--light-outline)",
                  "&:hover": {
                    borderColor: "var(--light-primary)",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "var(--light-surface)",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "var(--light-primary-container)"
                    : "var(--light-surface)",
                  color: "var(--light-onSurface)",
                  "&:hover": {
                    backgroundColor: "var(--light-primary-container)",
                  },
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-onSurface mb-1">
              Type
            </label>
            <Select
              options={typeOptions}
              value={typeOptions.find((opt) => opt.value === type)}
              onChange={(selected) => setType(selected?.value as FictionType)}
              className={errors.type ? "border-light-error" : ""}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: errors.type
                    ? "var(--light-error)"
                    : "var(--light-outline)",
                  "&:hover": {
                    borderColor: "var(--light-primary)",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "var(--light-surface)",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "var(--light-primary-container)"
                    : "var(--light-surface)",
                  color: "var(--light-onSurface)",
                  "&:hover": {
                    backgroundColor: "var(--light-primary-container)",
                  },
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-onSurface mb-1">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleCoverChange}
              className="hidden"
              id="cover-upload"
              ref={fileInputRef}
            />
            <div
              className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 ${
                isDragging ? "border-light-primary" : "border-light-outline"
              } border-dashed rounded-lg transition-colors relative`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {coverPreview ? (
                <div className="w-full">
                  <div className="relative w-full h-48 group">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                      <label
                        htmlFor="cover-upload"
                        className="cursor-pointer bg-light-primary text-light-onPrimary px-3 py-1.5 rounded-lg hover:bg-light-primary/90 transition-colors"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="bg-light-error text-light-onError px-3 py-1.5 rounded-lg hover:bg-light-error/90 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-light-onSurfaceVariant text-center mt-2">
                    Drag and drop a new image to replace the current one
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <div className="text-light-onSurfaceVariant">
                    <label
                      htmlFor="cover-upload"
                      className="relative cursor-pointer bg-light-surface rounded-md font-medium text-light-primary hover:text-light-primary/80"
                    >
                      <span>Upload a file</span>
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-light-onSurfaceVariant">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </div>
            {errors.cover && (
              <p className="mt-1 text-sm text-light-error">{errors.cover}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outlined"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Fiction"}
        </Button>
      </div>
    </form>
  );
};
