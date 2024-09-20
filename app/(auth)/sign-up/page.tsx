import React from "react";
import { Logo } from "@/components/common/Logo";
import { SignUpForm } from "@/components/auth/SignUpform";

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-background flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-light-surface p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-light-onSurface">
            Tạo tài khoản mới
          </h2>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
