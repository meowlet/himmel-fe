"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Fiction, User } from "@/types/Fiction";
import { Constant } from "@/util/Constant";
import { Util } from "@/util/Util";
import { Demo, Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { FictionCard } from "@/components/fiction/FictionCard";
import { AdvancedFilter } from "./AdvancedFilter";
import { Modal } from "../common/Modal";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LockClosedIcon,
  MagnifyingGlassCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import Pagination from "../common/Pagination";
import { CurrentFilters } from "./CurrentFilters";
import { SortSelector, SortType } from "./SortSelector";
import { Suspense } from "react";

interface Tag {
  _id: string;
  name: string;
  code: string;
  description: string;
  workCount: number;
}

// Tạo một component mới để xử lý logic chính
const FictionListContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fictions, setFictions] = useState<Fiction[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterParams, setFilterParams] = useState<any>({}); // Thêm state cho filterParams
  const [sortType, setSortType] = useState<SortType>(SortType.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchFictions = useCallback(
    async (queryString: string) => {
      try {
        const res = await fetch(`${Constant.API_URL}/fiction?${queryString}`);
        const data = await res.json();
        if (data.status === "success") {
          setFictions(data.data.fictions);
          setTotalPages(Math.ceil(data.data.total / itemsPerPage));
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách truyện:", error);
      }
    },
    [itemsPerPage]
  );

  const fetchTags = async () => {
    try {
      const res = await fetch(Constant.API_URL + "/tag");
      const data = await res.json();
      if (data.status === "success") {
        setTags(data.data.tags);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tag:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(Constant.API_URL + "/user");
      const data = await res.json();
      if (data.status === "success") {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    const queryString = searchParams.toString();
    fetchFictions(queryString);
  }, [searchParams, fetchFictions]);

  useEffect(() => {
    fetchTags();
    fetchUsers();
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("query", value);
      } else {
        params.delete("query");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const query = searchParams.get("query");
    if (query) {
      setSearchTerm(decodeURIComponent(query));
    } else {
      setSearchTerm("");
    }
  }, [searchParams]);

  const handleClearSearch = () => {
    setSearchTerm("");
    const searchParamsCopy = new URLSearchParams(searchParams.toString());
    searchParamsCopy.delete("query");
    router.push(`?${searchParamsCopy.toString()}`, { scroll: false });
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilter = (filterParams: any) => {
    router.push(`?${filterParams.toString()}`, { scroll: false });
    fetchFictions(filterParams.toString());
    setIsFilterModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString()); // Cập nhật key page
    router.push(`?${params.toString()}`, { scroll: false });
    fetchFictions(params.toString());
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", items.toString());
    router.push(`?${params.toString()}`, { scroll: false });
    fetchFictions(params.toString());
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    router.push(`?${params.toString()}`, { scroll: false });
    fetchFictions(params.toString());
  };

  const handleSortChange = (
    newSortType: SortType,
    newSortOrder: "asc" | "desc"
  ) => {
    setSortType(newSortType);
    setSortOrder(newSortOrder);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortType);
    params.set("sortOrder", newSortOrder);
    router.push(`?${params.toString()}`, { scroll: false });
    fetchFictions(params.toString());
  };

  return (
    <div className="mx-auto px-4 md:px-16">
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2 sm:items-center">
          <div className="w-full sm:w-64 md:w-80">
            <Input
              placeholder="Search for fictions"
              className="w-full h-10"
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                handleSearch(value);
              }}
              onClear={handleClearSearch}
              showClearButton={searchTerm !== ""}
            />
          </div>
          <button
            onClick={handleOpenFilterModal}
            className="inline-flex items-center justify-center px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
          >
            <i className="fas fa-filter mr-2"></i>
            Filter
          </button>
        </div>
        <SortSelector
          sortType={sortType}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>

      <CurrentFilters
        searchParams={searchParams}
        users={users}
        tags={tags}
        handleClearFilters={handleClearFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fictions.map((fiction) => (
          <FictionCard key={fiction._id} fiction={fiction} allTags={tags} />
        ))}
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        className="w-3/4 max-w-4xl"
        title="Advanced Filter"
      >
        <AdvancedFilter
          initialFilters={searchParams}
          onApply={handleApplyFilter}
          onClose={handleCloseFilterModal}
          tags={tags}
          users={users}
        />
      </Modal>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

// Component chính được bọc bởi Suspense
export const FictionList: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FictionListContent />
    </Suspense>
  );
};
