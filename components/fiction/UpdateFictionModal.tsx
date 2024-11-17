"use client";

import React, { useState, useRef } from "react";
import { Fiction, Tag } from "@/types/Fiction";
import { Input } from "@/components/common/Input";
import Select from "react-select";
import { z } from "zod";
import { Constant } from "@/util/Constant";
import fetchWithAuth from "@/util/Fetcher";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

enum FictionStatus {
  ONGOING = "ongoing",
  FINISHED = "finished",
  HIATUS = "hiatus",
  DRAFT = "draft",
}

enum FictionType {
  FREE = "free",
  PREMIUM = "premium",
}

interface UpdateFictionModalProps {
  fiction: Fiction;
  tags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const fictionSchema = z.object({
  title: z.string().min(1, "Title must not be empty").max(100),
  description: z.string().min(1, "Description must not be empty"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  status: z.nativeEnum(FictionStatus),
  type: z.nativeEnum(FictionType),
});

export const UpdateFictionModal = ({
  fiction,
  tags,
  isOpen,
  onClose,
  onUpdate,
}: UpdateFictionModalProps) => {
  const [editingFiction, setEditingFiction] = useState<Fiction>(fiction);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>(
    `${Constant.API_URL}/fiction/${fiction._id}/cover`
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await handleCoverUpload(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleCoverUpload(file);
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors({ cover: "Please upload an image file" });
      return;
    }

    const formData = new FormData();
    formData.append("cover", file);

    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${fiction._id}/cover`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setCoverUrl(
          `${Constant.API_URL}/fiction/${fiction._id}/cover?t=${Date.now()}`
        );
        setErrors({});
      } else {
        throw new Error("Failed to upload cover");
      }
    } catch (err) {
      setErrors({ cover: "Failed to upload cover" });
    }
  };

  const handleUpdate = async () => {
    try {
      fictionSchema.parse(editingFiction);

      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${fiction._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingFiction),
        }
      );

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        throw new Error("Failed to update fiction");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          if (e.path) {
            fieldErrors[e.path[0]] = e.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: "Failed to update fiction" });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-light-surface p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Fiction</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-light-primary bg-light-primaryContainer"
                  : "border-light-outline"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="max-w-[240px] mx-auto">
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={coverUrl}
                    alt="Fiction cover"
                    fill
                    className="object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/placeholder-cover.png";
                    }}
                    unoptimized
                    loading="eager"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white">
                    <p>Click or drag to change cover</p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
            {errors.cover && (
              <p className="text-light-error text-sm mt-1">{errors.cover}</p>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label="Title"
              value={editingFiction.title}
              onChange={(e) =>
                setEditingFiction({ ...editingFiction, title: e.target.value })
              }
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={editingFiction.description}
                onChange={(e) =>
                  setEditingFiction({
                    ...editingFiction,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                rows={4}
              />
              {errors.description && (
                <p className="text-light-error text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <Select
                isMulti
                options={tags.map((tag) => ({
                  value: tag._id,
                  label: tag.name,
                }))}
                value={tags
                  .filter((tag) =>
                    (editingFiction.tags as string[]).includes(tag._id)
                  )
                  .map((tag) => ({
                    value: tag._id,
                    label: tag.name,
                  }))}
                onChange={(selected) =>
                  setEditingFiction({
                    ...editingFiction,
                    tags: selected.map((option) => option.value),
                  })
                }
              />
              {errors.tags && (
                <p className="text-light-error text-sm mt-1">{errors.tags}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  options={Object.values(FictionStatus).map((status) => ({
                    value: status,
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                  }))}
                  value={{
                    value: editingFiction.status,
                    label:
                      editingFiction.status.charAt(0).toUpperCase() +
                      editingFiction.status.slice(1),
                  }}
                  onChange={(option) =>
                    option &&
                    setEditingFiction({
                      ...editingFiction,
                      status: option.value as FictionStatus,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Select
                  options={Object.values(FictionType).map((type) => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                  }))}
                  value={{
                    value: editingFiction.type,
                    label:
                      editingFiction.type.charAt(0).toUpperCase() +
                      editingFiction.type.slice(1),
                  }}
                  onChange={(option) =>
                    option &&
                    setEditingFiction({
                      ...editingFiction,
                      type: option.value as FictionType,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {errors.general && (
          <p className="text-light-error text-sm mt-4">{errors.general}</p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-light-onSurface hover:bg-light-surfaceVariant rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-light-primary text-light-onPrimary rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};
