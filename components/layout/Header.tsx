"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Constant } from "@/util/Constant";
import { useRouter } from "next/navigation";
import fetchWithAuth from "@/util/Fetcher";
import Image from "next/image";

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
  const [avatarError, setAvatarError] = useState(false);

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
    <header className="bg-light-surface border-b border-light-outline fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 md:px-16 h-16">
        <div className="flex items-center pl-4 justify-between h-full">
          <Link href="/" className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-light-primary flex-shrink-0 flex items-center justify-center">
              <span className="text-light-onPrimary font-medium text-xl">
                空
              </span>
            </div>
            <span className="text-xl font-bold text-light-primary truncate">
              Himmel
            </span>
          </Link>

          <nav className="flex items-center">
            <ul className="flex items-center space-x-2">
              {username ? (
                <li className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-light-onSurface hover:bg-light-surfaceVariant transition-all duration-200"
                  >
                    <span className="font-medium text-md">{username}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {!avatarError && userId ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden relative">
                        <Image
                          src={`${Constant.API_URL}/user/${userId}/avatar`}
                          alt={username}
                          layout="fill"
                          objectFit="cover"
                          onError={() => setAvatarError(true)}
                          className="rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full overflow-hidden relative">
                        <Image
                          src="https://osu.ppy.sh/images/layout/avatar-guest@2x.png"
                          alt="Default avatar"
                          layout="fill"
                          objectFit="cover"
                          className="rounded-full"
                        />
                      </div>
                    )}
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-56 bg-light-surface rounded-xl shadow-lg ring-1 ring-light-outline ring-opacity-5 divide-y divide-light-outlineVariant origin-top transition-all duration-200 overflow-hidden ${
                      isDropdownOpen
                        ? "transform opacity-100 scale-100"
                        : "transform opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="py-1">
                      <button
                        onClick={handleProfile}
                        className="group flex w-full items-center px-4 py-2.5 text-sm text-light-onSurface hover:bg-light-surfaceVariant transition-colors duration-200"
                      >
                        <span className="mr-3 text-light-onSurfaceVariant">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </span>
                        Profile
                      </button>
                      {isAdmin && (
                        <button
                          onClick={handleManagement}
                          className="group flex w-full items-center px-4 py-2.5 text-sm text-light-onSurface hover:bg-light-surfaceVariant transition-colors duration-200"
                        >
                          <span className="mr-3 text-light-onSurfaceVariant">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </span>
                          Management
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handlePremium}
                        className="group flex w-full items-center px-4 py-2 text-sm text-light-onSurface hover:bg-light-surfaceVariant"
                      >
                        <span className="mr-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                        </span>
                        Premium
                      </button>
                      <button
                        onClick={handleHistory}
                        className="group flex w-full items-center px-4 py-2 text-sm text-light-onSurface hover:bg-light-surfaceVariant"
                      >
                        <span className="mr-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </span>
                        History
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="group flex w-full items-center px-4 py-2 text-sm text-light-onSurface hover:bg-light-surfaceVariant"
                      >
                        <span className="mr-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </span>
                        Change Password
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="group flex w-full items-center px-4 py-2 text-sm text-light-error hover:bg-light-surfaceVariant last:rounded-b-xl"
                      >
                        <span className="mr-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </span>
                        Sign out
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center px-4 py-2 rounded-full text-light-primary font-medium hover:bg-light-primaryContainer hover:text-light-onPrimaryContainer transition-colors duration-200"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
