"use client";
import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Constant } from "@/util/Constant";

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

export const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState(""); // Thêm state mới

  const handleGoogleSignUp = () => {
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(""); // Đặt lại thông báo thành công

    try {
      const data = signUpSchema.parse({ username, email, password });

      const response = await fetch(Constant.API_URL + "/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccessMessage("Sign up successfully, redirecting..."); // Đặt thông báo thành công
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000); // Chờ 2 giây trước khi chuyển hướng
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
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          className="rounded-md"
        />
      </div>
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
      <div className="flex items-center">
        <input
          id="agree-terms"
          name="agree-terms"
          type="checkbox"
          required
          className="h-4 w-4 text-light-primary focus:ring-light-primary border-light-outline rounded"
        />
        <label
          htmlFor="agree-terms"
          className="ml-2 block text-sm text-light-onSurfaceVariant"
        >
          I agree with{" "}
          <Link
            href="/terms"
            className="font-medium text-light-primary hover:text-light-primaryContainer"
          >
            Terms of use
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-light-primary hover:text-light-primaryContainer"
          >
            Privacy policy
          </Link>
        </label>
      </div>
      <Button type="submit" className="w-full">
        Sign up
      </Button>
      <Button
        variant="outlined"
        onClick={handleGoogleSignUp}
        className="w-full"
      >
        Continue with Google
      </Button>
      <div className="text-center">
        <p className="text-sm text-light-onSurfaceVariant">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-light-primary hover:text-light-primaryContainer"
          >
            Sign in now
          </Link>
        </p>
      </div>
    </form>
  );
};
export function generateNonce(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
