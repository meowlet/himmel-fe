import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  subValue?: string;
  format?: "currency" | "decimal";
  clickable?: boolean;
}

export const StatCard = ({
  title,
  value,
  subValue,
  format,
  clickable = false,
}: StatCardProps) => {
  const formatValue = (val: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(val);
    }
    if (format === "decimal") {
      return val.toFixed(2);
    }
    return new Intl.NumberFormat().format(val);
  };

  return (
    <div
      className={`bg-light-surfaceVariant p-4 rounded-lg ${
        clickable ? "hover:bg-light-surfaceVariant/80 cursor-pointer" : ""
      }`}
    >
      <h3 className="text-sm text-light-onSurfaceVariant">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{formatValue(value)}</p>
      {subValue && (
        <p className="text-sm text-light-outline mt-1">{subValue}</p>
      )}
    </div>
  );
};
