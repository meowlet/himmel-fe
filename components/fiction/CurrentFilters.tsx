import React from "react";
import { Button } from "@/components/common/Button";
import { Tag, User } from "@/types/Fiction";

interface CurrentFiltersProps {
  searchParams: URLSearchParams;
  users: User[];
  tags: Tag[];
  handleClearFilters: () => void;
}

export const CurrentFilters: React.FC<CurrentFiltersProps> = ({
  searchParams,
  users,
  tags,
  handleClearFilters,
}) => {
  const excludedParams = ["sortBy", "sortOrder", "query", "limit", "page"];
  const hasFilters = Array.from(searchParams.entries()).some(
    ([key]) => !excludedParams.includes(key)
  );

  if (!hasFilters) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-medium text-light-secondary">
          Current filters
        </h3>
        <button
          onClick={handleClearFilters}
          className="text-light-primary hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {searchParams.get("author") && (
          <div className="flex items-start gap-2">
            <span className="font-medium whitespace-nowrap">Author:</span>
            <div className="flex flex-wrap gap-1">
              {searchParams.getAll("author").map((authorId) => {
                const author = users.find((user) => user._id === authorId);
                return (
                  <span
                    key={authorId}
                    className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm"
                  >
                    {author?.fullName ? author.fullName : author?.username}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {searchParams.getAll("tags").length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-medium whitespace-nowrap">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {searchParams.getAll("tags").map((tagId) => {
                const tag = tags.find((t) => t._id === tagId);
                return (
                  <span
                    key={tagId}
                    className="bg-light-tertiary-container text-light-onTertiaryContainer rounded-full px-3 py-1 text-sm"
                  >
                    {tag ? tag.code.toLocaleUpperCase() : "N/A"}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {searchParams.get("type") && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Type:</span>
            <span className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm">
              {searchParams.get("type")?.toLocaleUpperCase()}
            </span>
          </div>
        )}
        {searchParams.get("status") && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Status:</span>
            <span className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm">
              {searchParams.get("status")?.toLocaleUpperCase()}
            </span>
          </div>
        )}
        {(searchParams.get("createdFrom") || searchParams.get("createdTo")) && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Created:</span>
            {searchParams.get("createdFrom") && (
              <span className="bg-light-tertiary-container text-light-onTertiaryContainer rounded-full px-3 py-1 text-sm">
                <span className="font-medium">FROM: </span>
                {searchParams.get("createdFrom")}
              </span>
            )}
            {searchParams.get("createdTo") && (
              <span className="bg-light-tertiary-container text-light-onTertiaryContainer rounded-full px-3 py-1 text-sm">
                <span className="font-medium">TO: </span>
                {searchParams.get("createdTo")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
