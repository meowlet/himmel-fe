"use client";

import React, { useState, useEffect } from "react";
import { Constant } from "@/util/Constant";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import fetchWithAuth from "@/util/Fetcher";
import { Input } from "@/components/common/Input";
import { z } from "zod";

enum AuthorApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  role?: string;
  isActive?: boolean;
  authorApplicationStatus?: AuthorApplicationStatus;
  premiumExpiryDate?: string;
  bio?: string;
}

enum UserSortField {
  USERNAME = "username",
  CREATED_AT = "createdAt",
  EARNINGS = "earnings",
}

type SortOrder = "asc" | "desc";

interface Role {
  _id: string;
  name: string;
  code: string;
  description: string;
  permissions: {
    resource: string;
    actions: string[];
  }[];
}

interface AuthorApplication {
  _id: string;
  user: string;
  status: string;
  applicationDate: string;
  notes: string;
}

const signUpSchema = z.object({
  username: z.string().min(4, "Username must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"
    ),
});

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isAuthor, setIsAuthor] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<UserSortField>(UserSortField.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [createErrors, setCreateErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [applications, setApplications] = useState<AuthorApplication[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    searchTerm,
    selectedRole,
    isPremium,
    isAuthor,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.status === "success") {
          const userResource = data.data.role?.permissions.find(
            (p: any) => p.resource === "user"
          );
          setUserPermissions(userResource?.actions || []);
        }
      } catch (err) {
        console.error("Error fetching user permissions:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchPendingApplicationsCounts = async () => {
      try {
        const promises = users.map(async (user) => {
          const response = await fetchWithAuth(
            `${Constant.API_URL}/user/author-application?user=${user._id}`,
            {
              credentials: "include",
            }
          );
          const data = await response.json();

          if (data.status === "success") {
            const pendingCount = data.data.filter(
              (app: AuthorApplication) =>
                app.user === user._id && app.status === "pending"
            ).length;
            return { userId: user._id, count: pendingCount };
          }
          return { userId: user._id, count: 0 };
        });

        const results = await Promise.all(promises);
        const countsMap = results.reduce(
          (acc, { userId, count }) => ({
            ...acc,
            [userId]: count,
          }),
          {}
        );

        setPendingApplicationsCount(countsMap);
      } catch (err) {
        console.error("Error fetching pending applications counts:", err);
      }
    };

    if (users.length > 0) {
      fetchPendingApplicationsCounts();
    }
  }, [users]);

  const hasPermission = (action: string) => {
    return userPermissions.includes(action);
  };

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        query: searchTerm,
      });

      if (selectedRole) queryParams.append("role", selectedRole);
      if (isPremium !== null)
        queryParams.append("isPremium", isPremium.toString());
      if (isAuthor !== null)
        queryParams.append("isAuthor", isAuthor.toString());
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      const response = await fetchWithAuth(
        `${Constant.API_URL}/user?${queryParams}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setUsers(data.data.users);
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

  const fetchRoles = async () => {
    try {
      const response = await fetchWithAuth(`${Constant.API_URL}/role`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "success") {
        setRoles(data.data.items);
      }
    } catch (err) {
      setError("Error fetching roles");
    }
  };

  const roleOptions = [
    { value: null, label: "User" },
    ...roles.map((role) => ({
      value: role._id,
      label: role.name,
    })),
  ];

  const sortOptions = [
    { value: UserSortField.USERNAME, label: "Username" },
    { value: UserSortField.CREATED_AT, label: "Created At" },
    { value: UserSortField.EARNINGS, label: "Earnings" },
  ];

  const orderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/user/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (err) {
      setError("Error deleting user");
    }
  };

  const getRoleName = (roleId: string | undefined): string => {
    if (!roleId) return "User";
    const role = roles.find((role) => role._id === roleId);
    return role ? role.name : "User";
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    try {
      const validatedData = signUpSchema.parse(newUser);

      const response = await fetchWithAuth(`${Constant.API_URL}/auth/sign-up`, {
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
        setNewUser({ username: "", email: "", password: "" });
        fetchUsers(); // Refresh danh sách user
      } else {
        setCreateErrors({
          root: data.error?.details || data.message || "Failed to create user",
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
        console.error("Create user error:", error);
        setCreateErrors({
          root: error instanceof Error ? error.message : "Error creating user",
        });
      }
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditErrors({});

    try {
      const updateData = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        username: editingUser.username,
        role: editingUser.role || null,
        isPremium: editingUser.isPremium,
        isActive: editingUser.isActive,
        authorApplicationStatus: editingUser.authorApplicationStatus,
        premiumExpiryDate: editingUser.premiumExpiryDate
          ? new Date(editingUser.premiumExpiryDate).toISOString()
          : undefined,
        bio: editingUser.bio,
      };

      const response = await fetchWithAuth(
        `${Constant.API_URL}/user/${editingUser._id}`,
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
        setEditingUser(null);
        fetchUsers();
      } else {
        setEditErrors({
          root: data.error?.details || data.message || "Failed to update user",
        });
      }
    } catch (error) {
      console.error("Update user error:", error);
      setEditErrors({
        root: error instanceof Error ? error.message : "Error updating user",
      });
    }
  };

  const fetchAuthorApplications = async (userId: string) => {
    setApplicationLoading(true);
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/user/author-application?user=${userId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setApplications(
          data.data.filter((app: AuthorApplication) => app.user === userId)
        );
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleApplication = async (
    applicationId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/user/author-application/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: action === "approve" ? "approved" : "rejected",
          }),
        }
      );

      if (response.ok) {
        fetchAuthorApplications(selectedUserId);
        const updatedPendingCount = { ...pendingApplicationsCount };
        updatedPendingCount[selectedUserId] = Math.max(
          0,
          updatedPendingCount[selectedUserId] - 1
        );
        setPendingApplicationsCount(updatedPendingCount);
        fetchUsers();
      }
    } catch (err) {
      console.error("Error handling application:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-light-error">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select
          options={roleOptions}
          value={roleOptions.find((option) => option.value === selectedRole)}
          onChange={(option) => setSelectedRole(option?.value || null)}
          placeholder="Select Role"
          isClearable
        />

        <div className="flex gap-2">
          <button
            onClick={() =>
              setIsPremium((prev) => (prev === true ? null : true))
            }
            className={`px-4 py-2 rounded-lg ${
              isPremium === true
                ? "bg-light-primary text-light-onPrimary"
                : "bg-light-surfaceVariant"
            }`}
          >
            Premium
          </button>
          <button
            onClick={() => setIsAuthor((prev) => (prev === true ? null : true))}
            className={`px-4 py-2 rounded-lg ${
              isAuthor === true
                ? "bg-light-primary text-light-onPrimary"
                : "bg-light-surfaceVariant"
            }`}
          >
            Author
          </button>
        </div>

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
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Full Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Author</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-light-outline">
                <td className="px-6 py-4">{user.username || "-"}</td>
                <td className="px-6 py-4">{user.fullName || "-"}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{getRoleName(user.role)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.isPremium
                        ? "bg-light-primary text-light-onPrimary"
                        : "bg-light-surfaceVariant text-light-onSurfaceVariant"
                    }`}
                  >
                    {user.isPremium ? "Premium" : "Free"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.authorApplicationStatus ===
                      AuthorApplicationStatus.APPROVED
                        ? "bg-light-tertiary text-light-onTertiary"
                        : "bg-light-surfaceVariant text-light-onSurfaceVariant"
                    }`}
                  >
                    {user.authorApplicationStatus ===
                    AuthorApplicationStatus.APPROVED
                      ? "Author"
                      : "Reader"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {hasPermission("update") && (
                      <button
                        className="p-2 hover:bg-light-surfaceVariant rounded-full"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {hasPermission("delete") && (
                      <button
                        className="p-2 hover:bg-light-errorContainer rounded-full"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <TrashIcon className="w-5 h-5 text-light-error" />
                      </button>
                    )}
                    <button
                      className="p-2 hover:bg-light-surfaceVariant rounded-full relative"
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setIsApplicationModalOpen(true);
                        fetchAuthorApplications(user._id);
                      }}
                    >
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      {pendingApplicationsCount[user._id] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-light-error text-light-onError rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {pendingApplicationsCount[user._id]}
                        </span>
                      )}
                    </button>
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
            <UserPlusIcon className="w-5 h-5" />
            Create User
          </button>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-light-surface p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {createErrors.root && (
                <div className="text-light-error text-sm">
                  {createErrors.root}
                </div>
              )}
              <div>
                <Input
                  label="Username"
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  error={createErrors.username}
                />
              </div>
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  error={createErrors.email}
                />
              </div>
              <div>
                <Input
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  error={createErrors.password}
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

      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-light-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              {editErrors.root && (
                <div className="text-light-error text-sm">
                  {editErrors.root}
                </div>
              )}

              <div>
                <Input
                  label="Username"
                  type="text"
                  value={editingUser.username || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                  error={editErrors.username}
                />
              </div>

              <div>
                <Input
                  label="Full Name"
                  type="text"
                  value={editingUser.fullName || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, fullName: e.target.value })
                  }
                  error={editErrors.fullName}
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  error={editErrors.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  value={editingUser.bio || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, bio: e.target.value })
                  }
                />
              </div>

              <div>
                <Select
                  options={roleOptions}
                  value={roleOptions.find(
                    (option) => option.value === editingUser.role
                  )}
                  onChange={(option) =>
                    setEditingUser({
                      ...editingUser,
                      role: option?.value || undefined,
                    })
                  }
                  placeholder="Select Role"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUser.isPremium}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          isPremium: e.target.checked,
                        })
                      }
                    />
                    Premium User
                  </label>
                </div>

                {editingUser.isPremium && (
                  <div>
                    <Input
                      label="Premium Expiry Date"
                      type="datetime-local"
                      value={
                        editingUser.premiumExpiryDate
                          ? new Date(editingUser.premiumExpiryDate)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          premiumExpiryDate: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active User
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Author Status
                </label>
                <Select
                  options={[
                    {
                      value: AuthorApplicationStatus.PENDING,
                      label: "Pending",
                    },
                    {
                      value: AuthorApplicationStatus.APPROVED,
                      label: "Approved",
                    },
                    {
                      value: AuthorApplicationStatus.REJECTED,
                      label: "Rejected",
                    },
                  ]}
                  value={{
                    value: editingUser.authorApplicationStatus || "",
                    label:
                      editingUser.authorApplicationStatus || "Select Status",
                  }}
                  onChange={(option) =>
                    setEditingUser({
                      ...editingUser,
                      authorApplicationStatus:
                        option?.value as AuthorApplicationStatus,
                    })
                  }
                  placeholder="Select Author Status"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
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

      {isApplicationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-light-surface p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Author Applications</h2>
            {applicationLoading ? (
              <div>Loading applications...</div>
            ) : (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p>No applications found</p>
                ) : (
                  applications.map((app) => (
                    <div key={app._id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-light-onSurfaceVariant">
                            Date:{" "}
                            {new Date(app.applicationDate).toLocaleDateString()}
                          </p>
                          <p className="mt-2">{app.notes}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            app.status === "pending"
                              ? "bg-light-warning text-light-onWarning"
                              : app.status === "approved"
                              ? "bg-light-tertiary text-light-onTertiary"
                              : "bg-light-error text-light-onError"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      {app.status === "pending" && (
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleApplication(app._id, "reject")}
                            className="px-3 py-1 bg-light-errorContainer text-light-onErrorContainer rounded"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleApplication(app._id, "approve")
                            }
                            className="px-3 py-1 bg-light-primary text-light-onPrimary rounded"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsApplicationModalOpen(false)}
                className="px-4 py-2 text-light-onSurfaceVariant hover:bg-light-surfaceVariant rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
