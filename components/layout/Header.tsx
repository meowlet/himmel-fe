"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Constant } from "@/util/Constant";
import { useRouter } from "next/navigation";
import fetchWithAuth from "@/util/Fetcher";
import Image from "next/image";
import {
  ChevronDownIcon,
  UserIcon,
  Cog8ToothIcon,
  StarIcon,
  ClockIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { href: "/sign-in", text: "Sign in" },
  { href: "/sign-up", text: "Sign up" },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

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
        setIsPremium(data.data.isPremium || false);
      } else {
        throw new Error("Failed to get user info");
      }
    } catch (error) {
      try {
        const token = localStorage.getItem("himmel_premium_token");

        const guestResponse = await fetch(
          `${Constant.API_URL}/me/validate/${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!guestResponse.ok) {
          throw new Error("Failed to validate token");
        }

        const isPremium = await guestResponse
          .json()
          .then((data) => data.data.isValid);

        if (isPremium) {
          setUsername("Guest");
          setIsPremium(true);
        } else {
          setUsername(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUsername(null);
        setIsAdmin(false);
        setUserId(null);
        setIsPremium(false);
      }
    }
  };

  const handleProfile = () => router.push(`/profile/${userId}`);
  const handleHistory = () => router.push("/history");
  const handlePremium = () => router.push("/payment/premium");
  const handleChangePassword = () => router.push("/change-password");
  const handleManagement = () => router.push("/dashboard");

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
        localStorage.removeItem("himmel_premium_token");
        setUsername(null);
        setIsDropdownOpen(false);
        throw new Error("Đăng xuất thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
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
                <>
                  {!isPremium && (
                    <li>
                      <button
                        onClick={handlePremium}
                        className="mr-2 inline-flex items-center px-4 py-2 rounded-full bg-light-tertiary-container text-light-onTertiaryContainer font-medium hover:bg-light-tertiary hover:text-light-onTertiary transition-colors duration-200"
                      >
                        <StarIcon className="w-4 h-4 mr-1.5" />
                        Get Premium
                      </button>
                    </li>
                  )}
                  <li className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-light-onSurface hover:bg-light-surfaceVariant transition-all duration-200"
                    >
                      <span className="font-medium text-md flex items-center">
                        {username}
                        {isPremium && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-light-tertiary-container text-light-onTertiaryContainer font-medium flex items-center">
                            <StarIcon className="w-3 h-3 mr-0.5" />
                            Premium
                          </span>
                        )}
                      </span>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                      <div className="w-8 h-8 rounded-full overflow-hidden relative">
                        <Image
                          src={
                            !avatarError && userId
                              ? `${Constant.API_URL}/user/${userId}/avatar`
                              : "https://osu.ppy.sh/images/layout/avatar-guest@2x.png"
                          }
                          alt={username || "Default avatar"}
                          layout="fill"
                          objectFit="cover"
                          onError={() => setAvatarError(true)}
                          className="rounded-full"
                        />
                      </div>
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
                          <UserIcon className="w-5 h-5 mr-3 text-light-onSurfaceVariant" />
                          Profile
                        </button>
                        {isAdmin && (
                          <button
                            onClick={handleManagement}
                            className="group flex w-full items-center px-4 py-2.5 text-sm text-light-onSurface hover:bg-light-surfaceVariant transition-colors duration-200"
                          >
                            <Cog8ToothIcon className="w-5 h-5 mr-3 text-light-onSurfaceVariant" />
                            Management
                          </button>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handlePremium}
                          className="group flex w-full items-center px-4 py-2 text-sm text-light-onSurface hover:bg-light-surfaceVariant"
                        >
                          <StarIcon className="w-5 h-5 mr-3" />
                          Premium
                        </button>
                        <button
                          onClick={handleHistory}
                          className="group flex w-full items-center px-4 py-2 text-sm text-light-onSurface hover:bg-light-surfaceVariant"
                        >
                          <ClockIcon className="w-5 h-5 mr-3" />
                          History
                        </button>
                        <button
                          onClick={handleChangePassword}
                          className="group flex w-full items-center px-4 py-2 text-sm text-light-onSurface hover:bg-light-surfaceVariant"
                        >
                          <KeyIcon className="w-5 h-5 mr-3" />
                          Change Password
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="group flex w-full items-center px-4 py-2 text-sm text-light-error hover:bg-light-surfaceVariant last:rounded-b-xl"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={handlePremium}
                      className="mr-2 inline-flex items-center px-4 py-2 rounded-full bg-light-tertiary-container text-light-onTertiaryContainer font-medium hover:bg-light-tertiary hover:text-light-onTertiary transition-colors duration-200"
                    >
                      <StarIcon className="w-4 h-4 mr-1.5" />
                      Get Premium
                    </button>
                  </li>
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center px-4 py-2 rounded-full text-light-primary font-medium hover:bg-light-primaryContainer hover:text-light-onPrimaryContainer transition-colors duration-200"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
