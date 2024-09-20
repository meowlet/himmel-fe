import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  startIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "filled",
  size = "medium",
  className,
  startIcon,
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-full transition-all duration-200 ease-in-out focus:outline-none relative overflow-hidden";

  const variantClasses = {
    filled: "bg-light-primary text-light-onPrimary hover:shadow-md",
    tonal:
      "bg-light-secondaryContainer text-light-onSecondaryContainer hover:shadow-sm",
    outlined:
      "bg-transparent border border-light-outline text-light-primary hover:bg-light-primary/[0.08]",
    text: "bg-transparent text-light-primary hover:bg-light-primary/[0.08]",
  };

  const sizeClasses = {
    small: "px-3 py-1 text-sm",
    medium: "px-6 py-2.5",
    large: "px-8 py-3 text-lg",
  };

  const stateLayerClass =
    "absolute inset-0 bg-current opacity-0 transition-opacity duration-200 ease-in-out";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} group`}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      <span className="relative z-10">{children}</span>
      <span
        className={`${stateLayerClass} group-hover:opacity-[0.08] group-active:opacity-[0.12]`}
      ></span>
    </button>
  );
};
