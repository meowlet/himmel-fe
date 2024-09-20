import React from "react";
import { Logo } from "@/components/common/Logo";
import { SignInForm } from "@/components/auth/SignInForm";

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-background flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-light-surface p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-light-onSurface">
            Sign in to your account
          </h2>
        </div>
        <SignInForm />
      </div>
    </div>
  );
};

export default SignInPage;
