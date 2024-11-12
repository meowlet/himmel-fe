"use client";

import React, { useState, useEffect } from "react";
import { Constant } from "@/util/Constant";
import {
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import fetchWithAuth from "@/util/Fetcher";
import { Input } from "@/components/common/Input";
import { z } from "zod";

// Enums
enum Resource {
  USER = "user",
  ROLE = "role",
  PERMISSION = "permission",
  FICTION = "fiction",
  STATISTIC = "statistic",
  TAG = "tag",
  COMMENT = "comment",
  RATING = "rating",
  CHAPTER = "chapter",
  FORUM = "forum",
  POST = "post",
  NOTIFICATION = "notification",
}

enum Action {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

enum RoleSensitivityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Interfaces
interface Permission {
  resource: Resource;
  actions: Action[];
}

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  sensitivityLevel: RoleSensitivityLevel;
  createdAt: string;
  updatedAt: string;
}

// Validation Schema
const roleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  permissions: z.array(
    z.object({
      resource: z.nativeEnum(Resource),
      actions: z.array(z.nativeEnum(Action)),
    })
  ),
});

export const RoleManagement = () => {
  // States
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [createErrors, setCreateErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
  });
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  // Options for Select components
  const resourceOptions = Object.values(Resource).map((resource) => ({
    value: resource,
    label: resource.charAt(0).toUpperCase() + resource.slice(1),
  }));

  const actionOptions = Object.values(Action).map((action) => ({
    value: action,
    label: action.charAt(0).toUpperCase() + action.slice(1),
  }));

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "createdAt", label: "Created At" },
    { value: "updatedAt", label: "Updated At" },
    { value: "sensitivityLevel", label: "Sensitivity Level" },
  ];

  const orderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  // Effects
  useEffect(() => {
    fetchRoles();
  }, [
    currentPage,
    searchTerm,
    selectedResource,
    selectedAction,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.status === "success") {
          const rolePermissions = data.data.role.permissions;
          console.log("Fetched permissions:", rolePermissions);
          setUserPermissions(rolePermissions);
        }
      } catch (err) {
        console.error("Error fetching user permissions:", err);
      }
    };

    fetchUserPermissions();
  }, []);

  // API calls
  const fetchRoles = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        query: searchTerm,
      });

      if (selectedResource) queryParams.append("resource", selectedResource);
      if (selectedAction) queryParams.append("action", selectedAction);
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      const response = await fetchWithAuth(
        `${Constant.API_URL}/role?${queryParams}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setRoles(data.data.items);
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

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    try {
      const validatedData = roleSchema.parse(newRole);

      const response = await fetchWithAuth(`${Constant.API_URL}/role`, {
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
        setNewRole({
          name: "",
          description: "",
          permissions: [],
        });
        fetchRoles();
      } else {
        setCreateErrors({
          root: data.error?.details || "Failed to create role",
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
          root: error instanceof Error ? error.message : "Error creating role",
        });
      }
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setEditErrors({});

    try {
      const updateData = {
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions,
      };

      const response = await fetchWithAuth(
        `${Constant.API_URL}/role/${editingRole._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setIsEditModalOpen(false);
        setEditingRole(null);
        fetchRoles();
      } else {
        setEditErrors({
          root: data.error?.details || "Failed to update role",
        });
      }
    } catch (error) {
      setEditErrors({
        root: error instanceof Error ? error.message : "Error updating role",
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/role/${roleId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setRoles(roles.filter((role) => role._id !== roleId));
      } else {
        throw new Error("Failed to delete role");
      }
    } catch (err) {
      setError("Error deleting role");
    }
  };

  const hasPermission = (action: Action) => {
    console.log("Current permissions:", userPermissions);
    return userPermissions.some(
      (permission) =>
        permission.resource === Resource.ROLE &&
        permission.actions.includes(action)
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-light-error">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search roles..."
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select
          options={resourceOptions}
          value={resourceOptions.find(
            (option) => option.value === selectedResource
          )}
          onChange={(option) => setSelectedResource(option?.value || null)}
          placeholder="Select Resource"
          isClearable
        />

        <Select
          options={actionOptions}
          value={actionOptions.find(
            (option) => option.value === selectedAction
          )}
          onChange={(option) => setSelectedAction(option?.value || null)}
          placeholder="Select Action"
          isClearable
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
              option && setSortOrder(option.value as "asc" | "desc")
            }
            placeholder="Order"
          />
        </div>
      </div>

      {/* Role Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-light-surface rounded-lg">
          <thead className="bg-light-surfaceVariant">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Permissions</th>
              <th className="px-6 py-3 text-left">Sensitivity</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id} className="border-t border-light-outline">
                <td className="px-6 py-4">{role.name}</td>
                <td className="px-6 py-4">{role.description || "-"}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-light-surfaceVariant rounded-full"
                      >
                        <span className="text-light-primary font-semibold">
                          {perm.resource.toUpperCase()}:{" "}
                        </span>
                        {perm.actions
                          .map((action) => action.toUpperCase())
                          .join(", ")}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      role.sensitivityLevel === RoleSensitivityLevel.HIGH
                        ? "bg-light-error-container text-light-onErrorContainer"
                        : role.sensitivityLevel === RoleSensitivityLevel.MEDIUM
                        ? "bg-light-tertiary text-light-onTertiary"
                        : role.sensitivityLevel ===
                          RoleSensitivityLevel.CRITICAL
                        ? "bg-light-error text-light-onError"
                        : "bg-light-surfaceVariant text-light-onSurfaceVariant"
                    }`}
                  >
                    {role.sensitivityLevel.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(role.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {hasPermission(Action.UPDATE) && (
                      <button
                        className="p-2 hover:bg-light-surfaceVariant rounded-full"
                        onClick={() => {
                          setEditingRole(role);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {hasPermission(Action.DELETE) && (
                      <button
                        className="p-2 hover:bg-light-errorContainer rounded-full"
                        onClick={() => handleDeleteRole(role._id)}
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

      {/* Pagination */}
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

      {/* Create Button */}
      {hasPermission(Action.CREATE) && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-light-primary text-light-onPrimary rounded-lg"
          >
            <ShieldCheckIcon className="w-5 h-5" />
            Create Role
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-light-surface p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-semibold sticky top-0 bg-light-surface py-2">
              Create New Role
            </h2>
            <form onSubmit={handleCreateRole} className="space-y-4">
              {createErrors.root && (
                <div className="text-light-error text-sm">
                  {createErrors.root}
                </div>
              )}

              <Input
                label="Name"
                type="text"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                error={createErrors.name}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Permissions</label>
                {newRole.permissions.map((perm, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-stretch"
                  >
                    <div className="col-span-5">
                      <Select
                        options={resourceOptions}
                        value={resourceOptions.find(
                          (option) => option.value === perm.resource
                        )}
                        onChange={(option) => {
                          const newPermissions = [...newRole.permissions];
                          newPermissions[index] = {
                            ...newPermissions[index],
                            resource: option?.value as Resource,
                          };
                          setNewRole({
                            ...newRole,
                            permissions: newPermissions,
                          });
                        }}
                        placeholder="Select Resource"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({
                            ...base,
                            height: "100%",
                          }),
                        }}
                      />
                    </div>
                    <div className="col-span-6">
                      <Select
                        isMulti
                        options={actionOptions}
                        value={actionOptions.filter((option) =>
                          perm.actions.includes(option.value)
                        )}
                        onChange={(options) => {
                          const newPermissions = [...newRole.permissions];
                          newPermissions[index] = {
                            ...newPermissions[index],
                            actions: options.map((opt) => opt.value),
                          };
                          setNewRole({
                            ...newRole,
                            permissions: newPermissions,
                          });
                        }}
                        placeholder="Select Actions"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({
                            ...base,
                            height: "100%",
                          }),
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPermissions = newRole.permissions.filter(
                          (_, i) => i !== index
                        );
                        setNewRole({ ...newRole, permissions: newPermissions });
                      }}
                      className="col-span-1 w-full h-full bg-light-errorContainer text-light-onErrorContainer rounded hover:bg-light-error hover:text-light-onError flex items-center justify-center"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setNewRole({
                      ...newRole,
                      permissions: [
                        ...newRole.permissions,
                        { resource: Resource.USER, actions: [] },
                      ],
                    });
                  }}
                  className="w-full mt-2 p-2 border-2 border-dashed border-light-outline hover:border-light-primary rounded-lg text-light-primary hover:bg-light-primaryContainer transition-colors"
                >
                  + Add Permission
                </button>
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

      {/* Edit Modal */}
      {isEditModalOpen && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-light-surface p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-semibold sticky top-0 bg-light-surface py-2">
              Edit Role
            </h2>
            <form onSubmit={handleEditRole} className="space-y-4">
              {editErrors.root && (
                <div className="text-light-error text-sm">
                  {editErrors.root}
                </div>
              )}

              <Input
                label="Name"
                type="text"
                value={editingRole.name}
                onChange={(e) =>
                  setEditingRole({ ...editingRole, name: e.target.value })
                }
                error={editErrors.name}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editingRole.description || ""}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Permissions</label>
                {editingRole.permissions.map((perm, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-stretch"
                  >
                    <div className="col-span-5">
                      <Select
                        options={resourceOptions}
                        value={resourceOptions.find(
                          (option) => option.value === perm.resource
                        )}
                        onChange={(option) => {
                          const newPermissions = [...editingRole.permissions];
                          newPermissions[index] = {
                            ...newPermissions[index],
                            resource: option?.value as Resource,
                          };
                          setEditingRole({
                            ...editingRole,
                            permissions: newPermissions,
                          });
                        }}
                        placeholder="Select Resource"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({
                            ...base,
                            height: "100%",
                          }),
                        }}
                      />
                    </div>
                    <div className="col-span-6">
                      <Select
                        isMulti
                        options={actionOptions}
                        value={actionOptions.filter((option) =>
                          perm.actions.includes(option.value)
                        )}
                        onChange={(options) => {
                          const newPermissions = [...editingRole.permissions];
                          newPermissions[index] = {
                            ...newPermissions[index],
                            actions: options.map((opt) => opt.value),
                          };
                          setEditingRole({
                            ...editingRole,
                            permissions: newPermissions,
                          });
                        }}
                        placeholder="Select Actions"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({
                            ...base,
                            height: "100%",
                          }),
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPermissions = editingRole.permissions.filter(
                          (_, i) => i !== index
                        );
                        setEditingRole({
                          ...editingRole,
                          permissions: newPermissions,
                        });
                      }}
                      className="col-span-1 w-full h-full bg-light-errorContainer text-light-onErrorContainer rounded hover:bg-light-error hover:text-light-onError flex items-center justify-center"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setEditingRole({
                      ...editingRole,
                      permissions: [
                        ...editingRole.permissions,
                        { resource: Resource.USER, actions: [] },
                      ],
                    });
                  }}
                  className="w-full mt-2 p-2 border-2 border-dashed border-light-outline hover:border-light-primary rounded-lg text-light-primary hover:bg-light-primaryContainer transition-colors"
                >
                  + Add Permission
                </button>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 text-light-onSurfaceVariant hover:bg-light-surfaceVariant rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
