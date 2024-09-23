"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Constant } from "@/util/Constant";
import { z } from "zod";

const addFictionSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  tags: z.array(z.string()).min(1, "Phải chọn ít nhất 1 tag"),
  status: z.enum(["ongoing", "completed"]),
  type: z.enum(["novel", "manga"]),
  cover: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Kích thước file không được vượt quá 5MB"
    ),
});

export const AddFictionForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"ongoing" | "completed">("ongoing");
  const [type, setType] = useState<"novel" | "manga">("novel");
  const [cover, setCover] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch(Constant.API_URL + "/tag");
      const data = await response.json();
      if (data.status === "success") {
        setTags(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tag:", error);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      selectedTags.forEach((tag) => formData.append("tags[]", tag));
      formData.append("status", status);
      formData.append("type", type);
      if (cover) formData.append("cover", cover);

      addFictionSchema.parse({
        title,
        description,
        tags: selectedTags,
        status,
        type,
        cover,
      });

      const response = await fetch(Constant.API_URL + "/fiction", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Fiction đã được thêm thành công!");
        // Reset form
        setTitle("");
        setDescription("");
        setSelectedTags([]);
        setStatus("ongoing");
        setType("novel");
        setCover(null);
      } else {
        setErrors({ root: result.error.details || "Đã xảy ra lỗi" });
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
        setErrors({ root: "Đã xảy ra lỗi" });
      }
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {errors.root && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{errors.root}</span>
        </div>
      )}
      <Input
        label="Tiêu đề"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Mô tả"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {errors.description && (
        <p className="text-red-500">{errors.description}</p>
      )}
      <div>
        <label className="block mb-2">Tags</label>
        <select
          multiple
          className="w-full p-2 border rounded"
          value={selectedTags}
          onChange={(e) =>
            setSelectedTags(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        {errors.tags && <p className="text-red-500">{errors.tags}</p>}
      </div>
      <div>
        <label className="block mb-2">Trạng thái</label>
        <select
          className="w-full p-2 border rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value as "ongoing" | "completed")}
        >
          <option value="ongoing">Đang tiến hành</option>
          <option value="completed">Đã hoàn thành</option>
        </select>
      </div>
      <div>
        <label className="block mb-2">Loại</label>
        <select
          className="w-full p-2 border rounded"
          value={type}
          onChange={(e) => setType(e.target.value as "novel" | "manga")}
        >
          <option value="novel">Tiểu thuyết</option>
          <option value="manga">Manga</option>
        </select>
      </div>
      <div>
        <label className="block mb-2">Ảnh bìa</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files ? e.target.files[0] : null)}
        />
        {errors.cover && <p className="text-red-500">{errors.cover}</p>}
      </div>
      <Button type="submit" className="w-full">
        Thêm Fiction
      </Button>
    </form>
  );
};
