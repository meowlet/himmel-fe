"use client";

import React, { useState, useEffect } from "react";
import { Constant } from "@/util/Constant";
import { PencilIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";
import Select from "react-select";
import fetchWithAuth from "@/util/Fetcher";
import { Input } from "@/components/common/Input";
import { z } from "zod";

interface Tag {
  _id: string;
  name: string;
  code: string;
  description?: string;
  workCount: number;
  createdAt: string;
}

enum TagSortField {
  NAME = "name",
  CODE = "code",
  WORK_COUNT = "workCount",
  CREATED_AT = "createdAt",
}

type SortOrder = "asc" | "desc";

const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name must be between 1 and 50 characters")
    .max(50, "Tag name must be between 1 and 50 characters"),
  code: z
    .string()
    .min(1, "Tag code must be between 1 and 20 characters")
    .max(20, "Tag code must be between 1 and 20 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Tag code must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
});

export const TagManagement = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<TagSortField>(TagSortField.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTag, setNewTag] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [createErrors, setCreateErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchTags();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.status === "success") {
          const tagResource = data.data.role?.permissions.find(
            (p: any) => p.resource === "tag"
          );
          setUserPermissions(tagResource?.actions || []);
        }
      } catch (err) {
        console.error("Error fetching user permissions:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const hasPermission = (action: string) => {
    return userPermissions.includes(action);
  };

  const fetchTags = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { query: searchTerm }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder }),
      });

      const response = await fetchWithAuth(
        `${Constant.API_URL}/tag?${queryParams}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setTags(data.data.tags);
        setTotalPages(Math.ceil(data.data.total / 10));
      } else {
        throw new Error(data.error.details || "An error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;

    try {
      const response = await fetchWithAuth(`${Constant.API_URL}/tag/${tagId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setTags(tags.filter((tag) => tag._id !== tagId));
      } else {
        throw new Error("Failed to delete tag");
      }
    } catch (err) {
      setError("Error deleting tag");
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    try {
      const validatedData = tagSchema.parse(newTag);

      const response = await fetchWithAuth(`${Constant.API_URL}/tag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (data.status === "success") {
        setIsCreateModalOpen(false);
        setNewTag({ name: "", code: "", description: "" });
        fetchTags();
      } else {
        setCreateErrors({
          root: data.error?.details || data.message || "Failed to create tag",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setCreateErrors(fieldErrors);
      } else {
        setCreateErrors({
          root: error instanceof Error ? error.message : "Error creating tag",
        });
      }
    }
  };

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    setEditErrors({});

    try {
      const validatedData = tagSchema.parse({
        name: editingTag.name,
        code: editingTag.code,
        description: editingTag.description,
      });

      const response = await fetchWithAuth(
        `${Constant.API_URL}/tag/${editingTag._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(validatedData),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setIsEditModalOpen(false);
        setEditingTag(null);
        fetchTags();
      } else {
        setEditErrors({
          root: data.error?.details || data.message || "Failed to update tag",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setEditErrors(fieldErrors);
      } else {
        setEditErrors({
          root: error instanceof Error ? error.message : "Error updating tag",
        });
      }
    }
  };

  const sortOptions = [
    { value: TagSortField.NAME, label: "Name" },
    { value: TagSortField.CODE, label: "Code" },
    { value: TagSortField.WORK_COUNT, label: "Work Count" },
    { value: TagSortField.CREATED_AT, label: "Created At" },
  ];

  const orderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-light-error">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tags..."
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-2">
          <Select
            options={sortOptions}
            value={sortOptions.find((option) => option.value === sortBy)}
            onChange={(option) => option && setSortBy(option.value)}
            placeholder="Sort by"
          />
          <Select
            options={orderOptions}
            value={orderOptions.find((option) => option.value === sortOrder)}
            onChange={(option) =>
              option && setSortOrder(option.value as SortOrder)
            }
            placeholder="Order"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-light-surface rounded-lg">
          <thead className="bg-light-surfaceVariant">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Code</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Work Count</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag._id} className="border-t border-light-outline">
                <td className="px-6 py-4">{tag.name}</td>
                <td className="px-6 py-4">{tag.code}</td>
                <td className="px-6 py-4">{tag.description || "-"}</td>
                <td className="px-6 py-4">{tag.workCount}</td>
                <td className="px-6 py-4">
                  {new Date(tag.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {hasPermission("update") && (
                      <button
                        className="p-2 hover:bg-light-surfaceVariant rounded-full"
                        onClick={() => {
                          setEditingTag(tag);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {hasPermission("delete") && (
                      <button
                        className="p-2 hover:bg-light-errorContainer rounded-full"
                        onClick={() => handleDeleteTag(tag._id)}
                      >
                        <TrashIcon className="w-5 h-5 text-light-error" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1
                ? "bg-light-primary text-light-onPrimary"
                : "bg-light-surfaceVariant"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {hasPermission("create") && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-light-primary text-light-onPrimary rounded-lg"
          >
            <TagIcon className="w-5 h-5" />
            Create Tag
          </button>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-light-surface p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Tag</h2>
            <form onSubmit={handleCreateTag} className="space-y-4">
              {createErrors.root && (
                <div className="text-light-error text-sm">
                  {createErrors.root}
                </div>
              )}
              <div>
                <Input
                  label="Name"
                  type="text"
                  value={newTag.name}
                  onChange={(e) =>
                    setNewTag({ ...newTag, name: e.target.value })
                  }
                  error={createErrors.name}
                  maxLength={50}
                />
              </div>
              <div>
                <Input
                  label="Code"
                  type="text"
                  value={newTag.code}
                  onChange={(e) =>
                    setNewTag({ ...newTag, code: e.target.value.toLowerCase() })
                  }
                  error={createErrors.code}
                  pattern="^[a-z0-9-]+$"
                  maxLength={20}
                />
                <small className="text-light-onSurfaceVariant">
                  Only lowercase letters, numbers, and hyphens allowed
                </small>
              </div>
              <div>
                <Input
                  label="Description (Optional)"
                  type="text"
                  value={newTag.description}
                  onChange={(e) =>
                    setNewTag({ ...newTag, description: e.target.value })
                  }
                  error={createErrors.description}
                  maxLength={200}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-light-onSurfaceVariant hover:bg-light-surfaceVariant rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-light-surface p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Tag</h2>
            <form onSubmit={handleEditTag} className="space-y-4">
              {editErrors.root && (
                <div className="text-light-error text-sm">
                  {editErrors.root}
                </div>
              )}
              <div>
                <Input
                  label="Name"
                  type="text"
                  value={editingTag.name}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, name: e.target.value })
                  }
                  error={editErrors.name}
                />
              </div>
              <div>
                <Input
                  label="Code"
                  type="text"
                  value={editingTag.code}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, code: e.target.value })
                  }
                  error={editErrors.code}
                />
              </div>
              <div>
                <Input
                  label="Description"
                  type="text"
                  value={editingTag.description}
                  onChange={(e) =>
                    setEditingTag({
                      ...editingTag,
                      description: e.target.value,
                    })
                  }
                  error={editErrors.description}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTag(null);
                  }}
                  className="px-4 py-2 text-light-onSurfaceVariant hover:bg-light-surfaceVariant rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
