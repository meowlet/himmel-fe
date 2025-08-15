import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import Select from "react-select";
import { Tag, User } from "@/types/Fiction";

// Định nghĩa kiểu cho filterParams
type FilterParams = {
  query: string;
  author: string;
  tags: string[];
  type: "free" | "premium";
  status: "finished" | "ongoing" | "hiatus" | "draft";
  createdFrom: string;
  createdTo: string;
  // page: number; // Loại bỏ page
  // limit: number; // Loại bỏ limit
};

interface AdvancedFilterProps {
  onApply: (filterParams: any) => void;
  onClose: () => void;
  tags: Tag[];
  users: User[];
  initialFilters: URLSearchParams;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  onApply,
  onClose,
  tags,
  users,
  initialFilters,
}) => {
  const [filterParams, setFilterParams] = useState<FilterParams>({
    query: initialFilters.get("query") || "",
    author: initialFilters.get("author") || "",
    tags: initialFilters.getAll("tags") || [],
    type: initialFilters.get("type") as "free" | "premium",
    status: initialFilters.get("status") as
      | "finished"
      | "ongoing"
      | "hiatus"
      | "draft",
    createdFrom: initialFilters.get("createdFrom") || "",
    createdTo: initialFilters.get("createdTo") || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilterParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name: string) => (selectedOptions: any) => {
    setFilterParams((prev) => ({
      ...prev,
      [name]: selectedOptions.map((option: any) => option.value),
    }));
  };

  const handleSelectChange = (name: string) => (selectedOption: any) => {
    setFilterParams((prev) => ({
      ...prev,
      [name]: selectedOption.value,
    }));
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    Object.entries(filterParams).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        if (typeof value === "string") {
          params.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        }
      }
    });
    onApply(params);
  };

  const tagOptions = tags.map((tag) => ({ value: tag._id, label: tag.name }));
  const typeOptions = [
    { value: "free", label: "Free" },
    { value: "premium", label: "Premium" },
  ];
  const statusOptions = [
    { value: "finished", label: "Finished" },
    { value: "ongoing", label: "Ongoing" },
    { value: "hiatus", label: "Hiatus" },
    { value: "draft", label: "Draft" },
  ];
  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.fullName ? user.fullName : user.username,
  }));

  return (
    <div className="flex flex-col h-full bg-light-surface text-light-onSurface rounded-lg">
      <div className="flex-grow overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-light-onSurfaceVariant mb-1">
              Author
            </label>
            <Select
              name="author"
              options={userOptions}
              className="basic-select bg-light-surfaceVariant"
              classNamePrefix="select"
              onChange={handleSelectChange("author")}
              value={userOptions.find(
                (option) => option.value === filterParams.author
              )}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Select
              isMulti
              name="tags"
              options={tagOptions}
              className="basic-multi-select w-full"
              classNamePrefix="select"
              onChange={handleMultiSelectChange("tags")}
              value={tagOptions.filter((option) =>
                filterParams.tags.includes(option.value)
              )}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fiction Type
            </label>
            <Select
              name="type"
              options={typeOptions}
              className="basic-select w-full"
              classNamePrefix="select"
              onChange={handleSelectChange("type")}
              value={typeOptions.find(
                (option) => option.value === filterParams.type
              )}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              name="status"
              options={statusOptions}
              className="basic-select w-full"
              classNamePrefix="select"
              onChange={handleSelectChange("status")}
              value={statusOptions.find(
                (option) => option.value === filterParams.status
              )}
            />
          </div>
          <Input
            label="From Date"
            name="createdFrom"
            type="date"
            value={filterParams.createdFrom}
            onChange={handleInputChange}
            className="w-full"
          />
          <Input
            label="To Date"
            name="createdTo"
            type="date"
            value={filterParams.createdTo}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex justify-end p-4 border-t border-light-outline">
        <Button
          onClick={onClose}
          variant="outlined"
          className="mr-2 border-light-outline text-light-primary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="filled"
          className="bg-light-primary text-light-onPrimary apply-button"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};
