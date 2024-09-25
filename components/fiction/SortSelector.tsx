import React from "react";
import Select from "react-select";

export enum SortType {
  TITLE = "title",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  VIEW_COUNT = "viewCount",
  AVERAGE_RATING = "averageRating",
}

type SortOption = {
  value: SortType;
  label: string;
};

const sortOptions: SortOption[] = [
  { value: SortType.TITLE, label: "Title" },
  { value: SortType.CREATED_AT, label: "Created At" },
  { value: SortType.UPDATED_AT, label: "Updated At" },
  { value: SortType.VIEW_COUNT, label: "View Count" },
  { value: SortType.AVERAGE_RATING, label: "Average Rating" },
];

const orderOptions = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

interface SortSelectorProps {
  sortType: SortType;
  sortOrder: "asc" | "desc";
  onSortChange: (type: SortType, order: "asc" | "desc") => void;
}

export const SortSelector: React.FC<SortSelectorProps> = ({
  sortType,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="font-medium mb-2 sm:mb-0 text-center">Sort by:</span>
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          options={sortOptions}
          value={sortOptions.find((option) => option.value === sortType)}
          onChange={(selectedOption) => {
            if (selectedOption) {
              onSortChange(selectedOption.value, sortOrder);
            }
          }}
          className="w-full sm:w-60"
        />
        <Select
          options={orderOptions}
          value={orderOptions.find((option) => option.value === sortOrder)}
          onChange={(selectedOption) => {
            if (selectedOption) {
              onSortChange(sortType, selectedOption.value as "asc" | "desc");
            }
          }}
          className="w-full sm:w-40"
        />
      </div>
    </div>
  );
};
