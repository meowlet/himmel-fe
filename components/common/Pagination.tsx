import React, { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [itemsPerPage, setItemsPerPage] = useState<number>(12); // Giá trị mặc định

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value > 0) {
      setItemsPerPage(value);
      onItemsPerPageChange(value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
      <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
        <label className="hidden sm:inline-block mr-2 text-sm sm:text-base">
          Items per page:
        </label>
        <input
          type="number"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border rounded p-1 w-16 text-sm sm:text-base"
          min={1}
          aria-label="Items per page"
        />
      </div>
      <div className="flex w-full sm:w-auto justify-center sm:justify-end">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-4 py-1 sm:py-2 border rounded-l text-sm sm:text-base ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Prev
        </button>
        <span className="px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-4 py-1 sm:py-2 border rounded-r text-sm sm:text-base ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
