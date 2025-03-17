"use client"; // Thêm dòng này ở đầu file

import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Constant } from "@/util/Constant";
import { generateNonce } from "./SignUpform";
const signInSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignInForm: React.FC = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Load Google Sign-In API
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const data = signInSchema.parse({ identifier, password });

      const response = await fetch(Constant.API_URL + "/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
          rememberMe: rememberMe,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        localStorage.removeItem("himmel_premium_token");
        setSuccessMessage("Sign in successfully, redirecting...");
        // Lưu token vào localStorage hoặc cookie nếu cần
        localStorage.setItem("accessToken", result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem("refreshToken", result.data.refreshToken);
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setErrors({ root: result.error.details || "Sign in failed" });
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

  const handleGoogleSignIn = () => {
    const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const redirectUri = window.location.origin + "/auth/google-callback";

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: generateNonce(), // Hàm tạo nonce ngẫu nhiên
    });

    window.location.href = `${googleAuthUrl}?${params.toString()}`;
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      {successMessage && (
        <div
          className="success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {errors.root && (
        <div
          className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
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
          className="rounded-md identifier"
        />
      </div>
      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          className="rounded-md password"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
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

      <Button
        variant="outlined"
        onClick={handleGoogleSignIn}
        className="w-full"
      >
        Continue with Google
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
