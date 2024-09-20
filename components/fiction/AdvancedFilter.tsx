import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import Select from "react-select";
import { Tag, User } from "@/types/Fiction";

// Định nghĩa kiểu cho filterParams
type FilterParams = {
  query: string;
  authors: string[];
  tags: string[];
  type: string;
  createdFrom: string;
  createdTo: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
};

interface AdvancedFilterProps {
  onApply: (filterParams: any) => void;
  onClose: () => void;
  tags: Tag[];
  users: User[];
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  onApply,
  onClose,
  tags,
  users,
}) => {
  const [filterParams, setFilterParams] = useState<FilterParams>({
    query: "",
    authors: [],
    tags: [],
    type: "",
    createdFrom: "",
    createdTo: "",
    sortBy: "title",
    sortOrder: "asc",
    page: 1,
    limit: 5,
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
    onApply(filterParams);
  };

  const tagOptions = tags.map((tag) => ({ value: tag._id, label: tag.name }));
  const typeOptions = [
    { value: "free", label: "Miễn phí" },
    { value: "paid", label: "Trả phí" },
  ];
  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.username,
  }));

  return (
    <div className="p-6 bg-light-surface text-light-onSurface rounded-lg">
      <div className="grid grid-cols-1 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-light-onSurfaceVariant mb-1">
            Tác giả
          </label>
          <Select
            isMulti
            name="authors"
            options={userOptions}
            className="basic-multi-select bg-light-surfaceVariant"
            classNamePrefix="select"
            onChange={handleMultiSelectChange("authors")}
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thẻ
          </label>
          <Select
            isMulti
            name="tags"
            options={tagOptions}
            className="basic-multi-select w-full"
            classNamePrefix="select"
            onChange={handleMultiSelectChange("tags")}
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại truyện
          </label>
          <Select
            name="type"
            options={typeOptions}
            className="basic-multi-select w-full"
            classNamePrefix="select"
            onChange={handleSelectChange("type")}
          />
        </div>
        <Input
          label="Từ ngày"
          name="createdFrom"
          type="date"
          value={filterParams.createdFrom}
          onChange={handleInputChange}
          className="w-full"
        />
        <Input
          label="Đến ngày"
          name="createdTo"
          type="date"
          value={filterParams.createdTo}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button
          onClick={onClose}
          variant="outlined"
          className="mr-2 border-light-outline text-light-primary"
        >
          Hủy
        </Button>
        <Button
          onClick={handleApply}
          variant="filled"
          className="bg-light-primary text-light-onPrimary"
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );
};
