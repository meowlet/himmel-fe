import React, { useState, useEffect, useRef } from "react";
import { Fiction } from "@/types/Fiction";
import Image from "next/image";
import { Tag } from "./Tag";
import { useRouter } from "next/navigation";
import {
  StarIcon,
  EyeIcon,
  LockClosedIcon,
  BookOpenIcon,
  GiftIcon,
} from "@heroicons/react/24/solid";
import { Constant } from "@/util/Constant";

interface FictionCardProps {
  fiction: Fiction;
  allTags: { _id: string; code: string; name: string; description: string }[];
}

export const FictionCard: React.FC<FictionCardProps> = ({
  fiction,
  allTags,
}) => {
  const router = useRouter();
  const [showScrollIndicator, setShowScrollIndicator] = useState({
    start: false,
    end: false,
  });
  const [imageError, setImageError] = useState(false);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (tagsContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } =
          tagsContainerRef.current;
        setShowScrollIndicator({
          start: scrollLeft > 0,
          end:
            scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth,
        });
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    const tagsContainer = tagsContainerRef.current;
    if (tagsContainer) {
      tagsContainer.addEventListener("scroll", checkOverflow);
    }
    return () => {
      window.removeEventListener("resize", checkOverflow);
      if (tagsContainer) {
        tagsContainer.removeEventListener("scroll", checkOverflow);
      }
    };
  }, [fiction.tags]);

  const getTagInfo = (tagId: string) => {
    return allTags.find((tag) => tag._id === tagId);
  };

  const handleTitleClick = () => {
    router.push(`/fiction/${fiction._id}`);
  };

  return (
    <div className="bg-light-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div
        className="relative h-48 w-full cursor-pointer"
        onClick={handleTitleClick}
      >
        {!imageError ? (
          <Image
            src={Constant.API_URL + "/fiction/" + fiction._id + "/cover"}
            alt={fiction.title}
            layout="fill"
            objectFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-light-error-container flex items-center justify-center">
            <p className="text-light-onErrorContainer text-center text-lg font-bold">
              This fiction has no cover image
            </p>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3
          className="font-semibold text-light-onSurface text-lg mb-2 truncate cursor-pointer"
          onClick={handleTitleClick}
        >
          {fiction.title}
        </h3>
        <p className="text-light-onSurfaceVariant text-sm mb-4 line-clamp-2">
          {fiction.description}
        </p>
        <div className="flex justify-between items-center text-sm mb-4">
          <div
            className={`flex items-center px-2 py-1 rounded-full ${
              fiction.type === "premium"
                ? "bg-light-tertiary-container text-light-onTertiaryContainer"
                : "bg-light-secondary-container text-light-onSecondaryContainer"
            }`}
          >
            {fiction.type === "premium" ? (
              <>
                <LockClosedIcon className="w-4 h-4 mr-1" />
                <span>Premium</span>
              </>
            ) : (
              <>
                <GiftIcon className="w-4 h-4 mr-1" />
                <span>Free</span>
              </>
            )}
          </div>
          <span className="text-light-secondary py-1 rounded-full">
            {fiction.status.toUpperCase()}
          </span>
        </div>
        <div className="flex-grow overflow-hidden mb-4 relative">
          <div
            ref={tagsContainerRef}
            className="flex flex-nowrap overflow-x-auto scrollbar-hide"
          >
            {fiction.tags.map((tagId) => {
              const tagInfo = getTagInfo(tagId as string);
              return tagInfo ? (
                <Tag
                  key={tagInfo._id}
                  name={tagInfo.name}
                  code={tagInfo.code}
                  description={tagInfo.description}
                  className="mr-2 mb-2 flex-shrink-0"
                  textSize="text-xs"
                />
              ) : null;
            })}
          </div>
          {showScrollIndicator.start && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-light-surface to-transparent pointer-events-none" />
          )}
          {showScrollIndicator.end && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-light-surface to-transparent pointer-events-none" />
          )}
        </div>
        <div className="flex justify-between items-center text-sm text-light-onSurfaceVariant">
          <span className="flex items-center">
            <EyeIcon className="w-5 h-5 mr-1" />
            {fiction.stats.viewCount}
          </span>
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <StarIcon
                key={index}
                className={`w-5 h-5 ${
                  index < Math.floor(fiction.stats.averageRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-1">
              {fiction.stats.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
