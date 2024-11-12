"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Constant } from "@/util/Constant";
import { useRouter } from "next/navigation";
import fetchWithAuth from "@/util/Fetcher";

const navLinks = [
  { href: "/sign-in", text: "Đăng nhập" },
  { href: "/sign-up", text: "Đăng ký" },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetchWithAuth(Constant.API_URL + "/me");
      const data = await response.json();

      if (data.status === "success") {
        setUsername(data.data.fullName || data.data.username);
        setIsAdmin(data.data.isAdmin || false);
        setUserId(data.data._id);
      } else {
        throw new Error("Failed to get user info");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUsername(null);
      setIsAdmin(false);
      setUserId(null);
      // router.push("/sign-in");
    }
  };

  const handleProfile = async () => {
    router.push(`/profile/${userId}`);
  };

  const handleHistory = async () => {
    router.push("/history");
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch(Constant.API_URL + "/me/sign-out", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "success") {
        setUsername(null);
        setIsDropdownOpen(false);
      } else {
        throw new Error("Đăng xuất thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const handlePremium = async () => {
    router.push("/payment/premium");
  };

  const handleChangePassword = async () => {
    router.push("/change-password");
  };

  const handleManagement = async () => {
    router.push("/dashboard");
  };

  return (
    <header className="bg-light-surface shadow-md fixed top-0 left-0 right-0 z-50 nav-bar">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <nav>
          <ul className="flex space-x-2">
            {username ? (
              <li className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="font-medium px-3 py-2 rounded-full text-light-onSurface hover:bg-light-surfaceVariant hover:text-light-primary transition-all duration-200 ease-in-out"
                >
                  Xin chào, {username}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <button
                      onClick={handleProfile}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    {isAdmin && (
                      <button
                        onClick={handleManagement}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Management
                      </button>
                    )}
                    <button
                      onClick={handlePremium}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Premium
                    </button>
                    <button
                      onClick={handleHistory}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      History
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </li>
            ) : (
              navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-medium px-3 py-2 rounded-full text-light-onSurface hover:bg-light-surfaceVariant hover:text-light-primary transition-all duration-200 ease-in-out relative overflow-hidden group"
                  >
                    <span className="relative z-10">{link.text}</span>
                    <span className="absolute inset-0 bg-light-primary opacity-0 group-hover:opacity-8 transition-opacity duration-200 ease-in-out"></span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};
