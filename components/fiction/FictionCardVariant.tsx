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

  const renderVerticalVariant = () => {
    return (
      <div
        className={`bg-light-surface rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}
      >
        <div
          className="relative h-48 w-full cursor-pointer"
          onClick={handleClick}
        >
          {!imageError ? (
            <Image
              src={`${Constant.API_URL}/fiction/${fiction._id}/cover`}
              alt={fiction.title}
              layout="fill"
              objectFit="cover"
              className="object-center"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-light-error-container flex items-center justify-center">
              <p className="text-light-onErrorContainer text-center text-lg font-bold">
                No cover image
              </p>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3
            className="font-semibold text-light-onSurface text-lg mb-2 cursor-pointer hover:text-light-primary truncate"
            onClick={handleClick}
          >
            {fiction.title}
          </h3>
          <p className="text-light-onSurfaceVariant text-sm mb-4 line-clamp-2">
            {fiction.description}
          </p>
          {renderTypeAndStatus()}
          {renderStats()}
        </div>
      </div>
    );
  };

  const renderHorizontalVariant = () => {
    return (
      <div
        className={`bg-light-surface rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex ${className}`}
      >
        <div className="w-1/3 min-h-[8rem] relative" onClick={handleClick}>
          {!imageError ? (
            <Image
              src={`${Constant.API_URL}/fiction/${fiction._id}/cover`}
              alt={fiction.title}
              layout="fill"
              objectFit="cover"
              className="object-center cursor-pointer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-light-error-container flex items-center justify-center">
              <p className="text-light-onErrorContainer text-center text-sm font-bold">
                No cover
              </p>
            </div>
          )}
        </div>
        <div className="w-2/3 p-4">
          <h3
            className="font-semibold text-light-onSurface text-lg mb-2 cursor-pointer hover:text-light-primary truncate"
            onClick={handleClick}
          >
            {fiction.title}
          </h3>
          <p className="text-light-onSurfaceVariant text-sm mb-4 line-clamp-2">
            {fiction.description}
          </p>
          {renderTypeAndStatus()}
          {renderStats()}
        </div>
      </div>
    );
  };

  const renderCompactVariant = () => {
    return (
      <div
        className={`bg-light-surface rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex min-h-[6rem] ${className}`}
      >
        <div className="w-24 relative" onClick={handleClick}>
          {!imageError ? (
            <Image
              src={`${Constant.API_URL}/fiction/${fiction._id}/cover`}
              alt={fiction.title}
              layout="fill"
              objectFit="cover"
              className="object-center cursor-pointer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-light-error-container flex items-center justify-center">
              <p className="text-light-onErrorContainer text-center text-xs font-bold">
                No cover
              </p>
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <h3
            className="font-semibold text-light-onSurface text-lg mb-2 cursor-pointer hover:text-light-primary truncate"
            onClick={handleClick}
          >
            {fiction.title}
          </h3>
          {renderTypeAndStatus()}
          {renderCompactStats()}
        </div>
      </div>
    );
  };

  const renderTypeAndStatus = () => {
    if (!showType && !showStatus) return null;
    return (
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xs px-2 py-1 rounded-full flex items-center ${
            fiction.type === "premium"
              ? "bg-light-tertiary-container text-light-onTertiaryContainer"
              : "bg-light-secondary-container text-light-onSecondaryContainer"
          }`}
        >
          {fiction.type === "premium" ? (
            <>
              <LockClosedIcon className="w-3 h-3 mr-1" />
              Premium
            </>
          ) : (
            <>
              <GiftIcon className="w-3 h-3 mr-1" />
              Free
            </>
          )}
        </span>
        <span className="text-xs text-light-secondary">
          {fiction.status.toUpperCase()}
        </span>
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats) return null;
    return (
      <div className="flex items-center justify-between text-sm text-light-onSurfaceVariant">
        <span className="flex items-center">
          <EyeIcon className="w-4 h-4 mr-1" />
          {fiction.stats.viewCount}
        </span>
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <StarIcon
              key={index}
              className={`w-4 h-4 ${
                index < Math.floor(fiction.stats.averageRating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-1">{fiction.stats.averageRating.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  const renderCompactStats = () => {
    if (!showStats) return null;
    return (
      <div className="flex items-center justify-between text-sm text-light-onSurfaceVariant">
        <span className="flex items-center">
          <EyeIcon className="w-4 h-4 mr-1" />
          {fiction.stats.viewCount}
        </span>
        <span className="flex items-center">
          <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
          {fiction.stats.averageRating.toFixed(1)}
        </span>
      </div>
    );
  };

  switch (variant) {
    case "horizontal":
      return renderHorizontalVariant();
    case "compact":
      return renderCompactVariant();
    default:
      return renderVerticalVariant();
  }
};
