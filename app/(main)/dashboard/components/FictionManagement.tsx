"use client";

import React, { useState, useEffect } from "react";
import { Fiction, Tag } from "@/types/Fiction";
import { Constant } from "@/util/Constant";
import { Input } from "@/components/common/Input";
import Select from "react-select";
import fetchWithAuth from "@/util/Fetcher";
import { Modal } from "@/components/common/Modal";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { z } from "zod";
import { UpdateFictionModal } from "@/components/fiction/UpdateFictionModal";

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

enum SortField {
  TITLE = "title",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  VIEW_COUNT = "viewCount",
  AVERAGE_RATING = "averageRating",
  FAVORITE_COUNT = "favoriteCount",
}

type SortOrder = "asc" | "desc";

const fictionSchema = z.object({
  title: z.string().min(1, "Title must not be empty").max(100),
  description: z.string().min(1, "Description must not be empty"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  status: z.nativeEnum(FictionStatus),
  type: z.nativeEnum(FictionType),
});

export const FictionManagement = () => {
  const [fictions, setFictions] = useState<Fiction[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>(SortField.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFiction, setEditingFiction] = useState<Fiction | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const [newFiction, setNewFiction] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    status: FictionStatus.DRAFT,
    type: FictionType.FREE,
  });

  const [createErrors, setCreateErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchFictions();
    fetchTags();
    fetchUserPermissions();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const fetchUserPermissions = async () => {
    try {
      const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "success") {
        const fictionResource = data.data.role?.permissions.find(
          (p: any) => p.resource === "fiction"
        );
        setUserPermissions(fictionResource?.actions || []);
      }
    } catch (err) {
      console.error("Error fetching user permissions:", err);
    }
  };

  const hasPermission = (action: string) => {
    return userPermissions.includes(action);
  };

  const fetchFictions = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        query: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction?${queryParams}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setFictions(data.data.fictions);
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

  const fetchTags = async () => {
    try {
      const response = await fetch(`${Constant.API_URL}/tag`);
      const data = await response.json();
      if (data.status === "success") {
        setTags(data.data.tags);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleCreateFiction = async () => {
    try {
      fictionSchema.parse(newFiction);

      const response = await fetchWithAuth(`${Constant.API_URL}/fiction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFiction),
        credentials: "include",
      });

      const data = await response.json();

      if (data.status === "success") {
        setIsCreateModalOpen(false);
        fetchFictions();
        setNewFiction({
          title: "",
          description: "",
          tags: [],
          status: FictionStatus.DRAFT,
          type: FictionType.FREE,
        });
        setCreateErrors({});
      } else {
        throw new Error(data.error.details || "Failed to create fiction");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          if (e.path) {
            errors[e.path[0]] = e.message;
          }
        });
        setCreateErrors(errors);
      } else {
        setCreateErrors({
          general: err instanceof Error ? err.message : "An error occurred",
        });
      }
    }
  };

  const handleUpdateFiction = async () => {
    if (!editingFiction) return;

    try {
      fictionSchema.parse(editingFiction);

      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${editingFiction._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingFiction),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setIsEditModalOpen(false);
        fetchFictions();
        setEditingFiction(null);
        setEditErrors({});
      } else {
        throw new Error(data.error.details || "Failed to update fiction");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          if (e.path) {
            errors[e.path[0]] = e.message;
          }
        });
        setEditErrors(errors);
      } else {
        setEditErrors({
          general: err instanceof Error ? err.message : "An error occurred",
        });
      }
    }
  };

  const handleDeleteFiction = async (fictionId: string) => {
    if (!window.confirm("Are you sure you want to delete this fiction?"))
      return;

    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${fictionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchFictions();
      } else {
        throw new Error("Failed to delete fiction");
      }
    } catch (err) {
      setError("Error deleting fiction");
    }
  };

  const sortOptions = [
    { value: SortField.TITLE, label: "Title" },
    { value: SortField.CREATED_AT, label: "Created At" },
    { value: SortField.UPDATED_AT, label: "Updated At" },
    { value: SortField.VIEW_COUNT, label: "View Count" },
    { value: SortField.AVERAGE_RATING, label: "Average Rating" },
    { value: SortField.FAVORITE_COUNT, label: "Favorite Count" },
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
        <Input
          type="text"
          placeholder="Search fictions..."
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
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Author</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Views</th>
              <th className="px-6 py-3 text-left">Rating</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fictions.map((fiction) => (
              <tr key={fiction._id} className="border-t border-light-outline">
                <td className="px-6 py-4">{fiction.title}</td>
                <td className="px-6 py-4">
                  {typeof fiction.author === "string"
                    ? fiction.author
                    : fiction.author.username}
                </td>
                <td className="px-6 py-4">{fiction.status}</td>
                <td className="px-6 py-4">{fiction.type}</td>
                <td className="px-6 py-4">{fiction.stats.viewCount}</td>
                <td className="px-6 py-4">
                  {fiction.stats.averageRating.toFixed(1)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {hasPermission("update") && (
                      <button
                        className="p-2 hover:bg-light-surfaceVariant rounded-full"
                        onClick={() => {
                          setEditingFiction(fiction);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {hasPermission("delete") && (
                      <button
                        className="p-2 hover:bg-light-errorContainer rounded-full"
                        onClick={() => handleDeleteFiction(fiction._id)}
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
            <PlusIcon className="w-5 h-5" />
            Create Fiction
          </button>
        </div>
      )}

      {editingFiction && (
        <UpdateFictionModal
          fiction={editingFiction}
          tags={tags}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingFiction(null);
          }}
          onUpdate={fetchFictions}
        />
      )}
    </div>
  );
};
