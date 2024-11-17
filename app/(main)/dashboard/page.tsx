"use client";

import React, { useEffect, useState } from "react";
import { Constant } from "@/util/Constant";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  KeyIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  TagIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  DocumentTextIcon,
  UsersIcon,
  PencilSquareIcon,
  BellIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { UserManagement } from "./components/UserManagement";
import { RoleManagement } from "./components/RoleManagement";
import { Statistics } from "./components/Statistics";
import fetchWithAuth from "@/util/Fetcher";
import { TagManagement } from "./components/TagManagement";
import { FictionManagement } from "./components/FictionManagement";

interface Permission {
  resource: string;
  actions: string[];
}
interface Role {
  _id: string;
  name: string;
  code: string;
  description: string;
  permissions: Permission[];
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: Role;
  isAdmin: boolean;
}

const ResourceComponents: { [key: string]: React.FC } = {
  user: UserManagement,
  role: RoleManagement,
  statistic: Statistics,
  tag: TagManagement,
  fiction: FictionManagement,
  // Thêm các component khác khi được triển khai
  // permission: PermissionManagement,
  // ...
};

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.status === "success") {
          setUser(data.data);
        } else {
          throw new Error("Unable to fetch user data");
        }
      } catch (err) {
        setError("An error occurred while loading user data");
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-light-error">{error}</div>;
  if (!user?.role)
    return <div className="text-center py-10">Access denied</div>;

  const getResourceIcon = (resource: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      user: <UserGroupIcon className="w-5 h-5" />,
      role: <KeyIcon className="w-5 h-5" />,
      permission: <ShieldCheckIcon className="w-5 h-5" />,
      fiction: <BookOpenIcon className="w-5 h-5" />,
      statistic: <ChartBarIcon className="w-5 h-5" />,
      tag: <TagIcon className="w-5 h-5" />,
      comment: <ChatBubbleLeftIcon className="w-5 h-5" />,
      rating: <StarIcon className="w-5 h-5" />,
      chapter: <DocumentTextIcon className="w-5 h-5" />,
      forum: <UsersIcon className="w-5 h-5" />,
      post: <PencilSquareIcon className="w-5 h-5" />,
      notification: <BellIcon className="w-5 h-5" />,
    };
    return icons[resource] || <DocumentTextIcon className="w-5 h-5" />;
  };

  const ResourceComponent = activeResource
    ? ResourceComponents[activeResource]
    : null;

  return (
    <div className="flex min-h-screen bg-light-background">
      {/* Sidebar */}
      <div className="w-64 bg-light-surface shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-bold text-light-onSurface mb-4">
            Dashboard
          </h2>
          <div className="space-y-2">
            {user.role.permissions.map((permission) => (
              <button
                key={permission.resource}
                onClick={() => setActiveResource(permission.resource)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center ${
                  activeResource === permission.resource
                    ? "bg-light-primary text-light-onPrimary"
                    : "hover:bg-light-surfaceVariant text-light-onSurface"
                }`}
              >
                <span className="mr-3">
                  {getResourceIcon(permission.resource)}
                </span>
                {permission.resource.charAt(0).toUpperCase() +
                  permission.resource.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeResource ? (
          <div>
            <h1 className="text-2xl font-bold text-light-onSurface mb-6">
              {activeResource.charAt(0).toUpperCase() + activeResource.slice(1)}{" "}
              Management
            </h1>
            {ResourceComponent ? (
              <ResourceComponent />
            ) : (
              <div className="text-center text-light-onSurfaceVariant">
                Management interface for {activeResource} is under development
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-light-onSurfaceVariant">
            Select a resource from the sidebar to manage
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
