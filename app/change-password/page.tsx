"use client";
import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { z } from "zod";
import { Constant } from "@/util/Constant";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password must not be empty"),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "New password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"
      ),
    confirmNewPassword: z.string().min(1, "Please confirm new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Confirm password does not match",
    path: ["confirmNewPassword"],
  });

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const data = changePasswordSchema.parse({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      const response = await fetch(Constant.API_URL + "/me/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Change password successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setErrors({ root: result.error.details || "An error occurred" });
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
        setErrors({ root: "An error occurred" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-surface">
      <div className="max-w-md w-full space-y-8 p-10 bg-light-surface rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-light-onSurface">
            Change password
          </h2>
        </div>
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
          <div>
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={errors.currentPassword}
              className="rounded-md"
            />
          </div>
          <div>
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              className="rounded-md"
            />
          </div>
          <div>
            <Input
              label="Confirm new password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={errors.confirmNewPassword}
              className="rounded-md"
            />
          </div>
          <Button type="submit" className="w-full">
            Change password
          </Button>
          <div className="text-center">
            <p className="text-sm text-light-onSurfaceVariant">
              <Link
                href="/profile"
                className="font-medium text-light-primary hover:text-light-primaryContainer"
              >
                Back to profile page
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
