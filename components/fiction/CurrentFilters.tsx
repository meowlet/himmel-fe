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
  const hasFilters = Array.from(searchParams.entries()).length > 0;

  return (
    <div className="mb-4">
      <h3 className="text-xl font-medium mb-2">Bộ lọc hiện tại:</h3>
      <div className="flex flex-col gap-2">
        {hasFilters && ( // Kiểm tra có bộ lọc không
          <span className="flex flex-wrap gap-1">
            <span className="font-medium">Tác giả:</span>
            {Array.from(searchParams.entries()).map(([key, value]) => {
              if (key === "author") {
                const author = users.find((user) => user._id === value);
                return (
                  <span
                    key={key}
                    className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm"
                  >
                    {author ? author.username : value}
                  </span>
                );
              }
              return null;
            })}
          </span>
        )}
        {searchParams.getAll("tags").length > 0 && (
          <span className="flex flex-wrap gap-1">
            <span className="font-medium">Tags:</span>
            {searchParams.getAll("tags").map((tagId) => {
              const tag = tags.find((t) => t._id === tagId);
              return (
                <span
                  key={tagId}
                  className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm"
                >
                  {tag ? tag.code : tagId}
                </span>
              );
            })}
          </span>
        )}
        {searchParams.get("type") && (
          <span className="flex flex-wrap gap-1">
            <span className="font-medium">Loại:</span>
            <span className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm">
              {searchParams.get("type")}
            </span>
          </span>
        )}
        {searchParams.get("status") && (
          <span className="flex flex-wrap gap-1">
            <span className="font-medium">Trạng thái:</span>
            <span className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm">
              {searchParams.get("status")}
            </span>
          </span>
        )}
        {hasFilters && ( // Kiểm tra có bộ lọc không
          <span className="flex flex-wrap gap-1">
            <span className="font-medium">Ngày tạo:</span>
            {searchParams.get("createdFrom") && (
              <span className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm">
                Từ: {searchParams.get("createdFrom")}
              </span>
            )}
            {searchParams.get("createdTo") && (
              <span className="bg-light-primary-container text-light-onPrimaryContainer rounded-full px-3 py-1 text-sm">
                Đến: {searchParams.get("createdTo")}
              </span>
            )}
          </span>
        )}
        {Array.from(searchParams.entries()).length > 0 && (
          <Button
            onClick={handleClearFilters}
            className="ml-2"
            variant="outlined"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};
