"use client"; // Thêm dòng này ở đầu file

import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Constant } from "@/util/Constant";

const signInSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignInForm: React.FC = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState(""); // Thêm state mới

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(""); // Đặt lại thông báo thành công

    try {
      const data = signInSchema.parse({ identifier, password });

      const response = await fetch(Constant.API_URL + "/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === "success") {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        setSuccessMessage("Sign in successfully, redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setErrors({ root: result.error.details || "Something went wrong" });
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
        setErrors({ root: "Something went wrong" });
      }
    }
  };

  return (
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
          label="Username or email"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
          className="rounded-md"
        />
      </div>
      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          className="rounded-md"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-light-primary focus:ring-light-primary border-light-outline rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-light-onSurfaceVariant"
          >
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-light-primary hover:text-light-primaryContainer"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
      <div className="text-center">
        <p className="text-sm text-light-onSurfaceVariant">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-light-primary hover:text-light-primaryContainer"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </form>
  );
};
