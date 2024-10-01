"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Fiction, Tag } from "@/types/Fiction";
import { Constant } from "@/util/Constant";
import { FictionCard } from "@/components/fiction/FictionCard";
import Pagination from "@/components/common/Pagination";
import { SortSelector, SortType } from "@/components/fiction/SortSelector";

export default function TagPage() {
  const { code } = useParams();
  const [tag, setTag] = useState<Tag | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [fictions, setFictions] = useState<Fiction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortType, setSortType] = useState<SortType>(SortType.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchTagFictions();
    fetchTags();
  }, [code, currentPage, itemsPerPage, sortType, sortOrder]);

  const fetchTagFictions = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortType,
        sortOrder: sortOrder,
      });
      const res = await fetch(
        `${Constant.API_URL}/tag/${code}/fictions?${queryParams}`
      );
      const data = await res.json();
      if (data.status === "success") {
        setTag(data.data.tag);
        setFictions(data.data.fictions);
        setTotalPages(Math.ceil(data.data.total / itemsPerPage));
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách truyện theo tag:", error);
    }
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSortChange = (
    newSortType: SortType,
    newSortOrder: "asc" | "desc"
  ) => {
    setSortType(newSortType);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12"></section>

      {tag && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{tag.name}</h1>
          <p className="text-gray-600">{tag.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Số truyện: {tag.workCount}
          </p>
        </div>
      )}

      <div className="mb-8 flex justify-end">
        <SortSelector
          sortType={sortType}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fictions.map((fiction) => (
          <FictionCard key={fiction._id} fiction={fiction} allTags={tags} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
