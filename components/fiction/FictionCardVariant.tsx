import React, { useState } from "react";
import { Fiction } from "@/types/Fiction";
import Image from "next/image";
import { Tag } from "./Tag";
import { useRouter } from "next/navigation";
import {
  StarIcon,
  EyeIcon,
  LockClosedIcon,
  GiftIcon,
} from "@heroicons/react/24/solid";
import { Constant } from "@/util/Constant";

interface FictionCardVariantProps {
  fiction: Fiction;
  variant: "horizontal" | "vertical" | "compact";
  showTags?: boolean;
  showStats?: boolean;
  showType?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const FictionCardVariant: React.FC<FictionCardVariantProps> = ({
  fiction,
  variant,
  showTags = true,
  showStats = true,
  showType = true,
  showStatus = true,
  className = "",
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    router.push(`/fiction/${fiction._id}`);
  };

  const renderImage = () => {
    const imageHeight = variant === "horizontal" ? "h-32" : "h-48";
    return (
      <div
        className={`relative ${imageHeight} w-full cursor-pointer`}
        onClick={handleClick}
      >
        {!imageError ? (
          <Image
            src={`${Constant.API_URL}/fiction/${fiction._id}/cover`}
            alt={fiction.title}
            layout="fill"
            objectFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-light-error-container flex items-center justify-center">
            <p className="text-light-onErrorContainer text-center text-sm font-bold">
              No cover image
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col flex-grow">
        <h3
          className="font-semibold text-light-onSurface cursor-pointer hover:text-light-primary truncate"
          onClick={handleClick}
        >
          {fiction.title}
        </h3>

        {variant !== "compact" && (
          <p className="text-light-onSurfaceVariant text-sm mt-1 line-clamp-2">
            {fiction.description}
          </p>
        )}

        {showType && showStatus && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                fiction.type === "premium"
                  ? "bg-light-tertiary-container text-light-onTertiaryContainer"
                  : "bg-light-secondary-container text-light-onSecondaryContainer"
              }`}
            >
              {fiction.type === "premium" ? (
                <span className="flex items-center">
                  <LockClosedIcon className="w-3 h-3 mr-1" />
                  Premium
                </span>
              ) : (
                <span className="flex items-center">
                  <GiftIcon className="w-3 h-3 mr-1" />
                  Free
                </span>
              )}
            </span>
            <span className="text-xs text-light-secondary">
              {fiction.status.toUpperCase()}
            </span>
          </div>
        )}

        {showStats && (
          <div className="flex items-center gap-4 mt-2 text-sm text-light-onSurfaceVariant">
            <span className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              {fiction.stats.viewCount}
            </span>
            <span className="flex items-center">
              <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
              {fiction.stats.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const baseClasses =
    "bg-light-surface rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden";

  if (variant === "horizontal") {
    return (
      <div className={`${baseClasses} flex ${className}`}>
        <div className="w-1/3">{renderImage()}</div>
        <div className="w-2/3 p-4">{renderContent()}</div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {renderImage()}
      <div className="p-4">{renderContent()}</div>
    </div>
  );
};
