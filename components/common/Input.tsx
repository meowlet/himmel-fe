import { XMarkIcon } from "@heroicons/react/24/solid";
import React, { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  variant?: "filled" | "outlined";
  helperText?: string;
  onClear?: () => void;
  showClearButton?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  variant = "outlined",
  helperText,
  onClear,
  showClearButton,
  ...props
}) => {
  const baseInputClasses =
    "w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-light-primary transition-all duration-200";
  const variantClasses = {
    outlined: "bg-transparent border border-light-outline text-light-onSurface",
    filled: "bg-light-surfaceVariant text-light-onSurfaceVariant",
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-light-onSurface mb-2 text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`${baseInputClasses} ${variantClasses[variant]} ${
            error ? "border-light-error" : ""
          } ${icon ? "pl-10" : ""} ${
            showClearButton ? "pr-10" : ""
          } ${className}`}
          {...props}
        />
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-onSurfaceVariant">
            {icon}
          </span>
        )}
        {showClearButton && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-onSurfaceVariant hover:text-light-primary focus:outline-none"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${
            error ? "text-light-error" : "text-light-onSurfaceVariant"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
