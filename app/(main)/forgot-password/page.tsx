"use client";
import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { z } from "zod";
import { Constant } from "@/util/Constant";

const forgotPasswordSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const data = forgotPasswordSchema.parse({ email });

      const response = await fetch(Constant.API_URL + "/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage(result.message);
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
    <div className="min-h-screen flex items-center justify-center bg-light-surface">
      <div className="max-w-md w-full space-y-8 p-10 bg-light-surface rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-light-onSurface">
            Forgot Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline success-message">
                {successMessage}
              </span>
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              className="rounded-md"
            />
          </div>
          <Button type="submit" className="w-full">
            Send Request
          </Button>
          <div className="text-center">
            <p className="text-sm text-light-onSurfaceVariant">
              Remember password?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-light-primary hover:text-light-primaryContainer"
              >
                Sign in now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
