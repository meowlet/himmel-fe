"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Fiction, User } from "@/types/Fiction";
import { Constant } from "@/util/Constant";
import { Util } from "@/util/Util";
import { Input } from "@/components/common/Input";
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

interface Tag {
  _id: string;
  name: string;
  code: string;
  description: string;
  workCount: number;
}

export const FictionList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fictions, setFictions] = useState<Fiction[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const itemsPerPage = 12;

  const fetchFictions = useCallback(
    async (queryString: string) => {
      try {
        const res = await fetch(
          `${Constant.API_URL}/fiction?${queryString}&page=${currentPage}&limit=${itemsPerPage}`
        );
        const data = await res.json();
        if (data.status === "success") {
          setFictions(data.data.fictions);
          setTotalPages(Math.ceil(data.data.total / itemsPerPage));
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách truyện:", error);
      }
    },
    [currentPage]
  );

  const fetchTags = async () => {
    try {
      const res = await fetch(Constant.API_URL + "/tag");
      const data = await res.json();
      if (data.status === "success") {
        setTags(data.data);
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
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    const queryParams = { ...Object.fromEntries(searchParams.entries()) };
    const queryString = Util.buildQueryString(queryParams);
    fetchFictions(queryString);
  }, [searchParams, fetchFictions]);

  useEffect(() => {
    fetchTags();
    fetchUsers();
  }, []);

  // Cập nhật hàm handleSearch
  const handleSearch = useCallback(
    (value: string) => {
      const newQuery = value ? `query=${encodeURIComponent(value)}` : "";
      router.push(`?${newQuery}`, { scroll: false });
    },
    [router]
  );

  // Thêm useEffect để đồng bộ searchTerm với URL
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
    const newQuery = "";
    router.push(`?${newQuery}`, { scroll: false });
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilter = (filterParams: any) => {
    const queryString = Util.buildQueryString(filterParams);
    router.push(`?${queryString}`, { scroll: false });
    fetchFictions(queryString);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex">
        <Input
          placeholder="Tìm kiếm truyện"
          className="w-full"
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
        <Button
          onClick={handleOpenFilterModal}
          className="ml-2"
          variant="outlined"
        >
          <i className="fas fa-filter mr-2"></i>
          Bộ lọc
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fictions.map((fiction) => (
          <FictionCard key={fiction._id} fiction={fiction} allTags={tags} />
        ))}
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        className="w-3/4 max-w-4xl"
      >
        <AdvancedFilter
          onApply={handleApplyFilter}
          onClose={handleCloseFilterModal}
          tags={tags}
          users={users}
        />
      </Modal>
    </div>
  );
};
