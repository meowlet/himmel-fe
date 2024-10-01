import { useRouter } from "next/navigation";
import React from "react";

interface TagProps {
  name: string;
  code: string;
  description: string;
  className?: string;
  textSize?: string;
}

export const Tag: React.FC<TagProps> = ({
  name,
  code,
  description,
  className,
  textSize = "text-xs",
}) => {
  const router = useRouter();
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full ${textSize} font-medium bg-light-surfaceVariant text-light-onSurfaceVariant cursor-pointer transition-all duration-200 ease-in-out hover:bg-light-primary hover:text-light-onPrimary shadow-sm hover:shadow-md ${className}`}
      title={description}
      onClick={() => {
        console.log(`Tag clicked: ${code}`);
        router.push(`/tag/${code}`);
      }}
    >
      {name}
    </span>
  );
};
