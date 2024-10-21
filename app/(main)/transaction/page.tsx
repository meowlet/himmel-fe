"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { Constant } from "@/util/Constant";
import fetchWithAuth from "@/util/Fetcher";
import Pagination from "@/components/common/Pagination";
import {
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/24/solid";

interface Transaction {
  _id: string;
  amount: string;
  type: string;
  orderInfo: string;
  status: string;
  createdAt: string;
}

enum TransactionStatus {
  SUCCESS = "success",
  NOT_SUCCESS = "not-success",
}

enum SortField {
  CREATED_AT = "createdAt",
  AMOUNT = "amount",
}

const sortOptions = [
  { value: SortField.CREATED_AT, label: "Date" },
  { value: SortField.AMOUNT, label: "Amount" },
];

const TransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>(SortField.CREATED_AT);
  const [sortAscending, setSortAscending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "">("");

  const router = useRouter();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortField,
      });

      if (statusFilter) {
        queryParams.append("status", statusFilter);
      }

      const response = await fetchWithAuth(
        `${Constant.API_URL}/transaction?${queryParams}`
      );
      if (!response.ok) {
        throw new Error("Unable to load transaction data");
      }
      const data = await response.json();
      setTransactions(data.data.transactions);
      setTotalPages(Math.ceil(data.data.total / itemsPerPage));
    } catch (err) {
      setError("An error occurred while loading transaction data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, itemsPerPage, sortField, statusFilter]);

  useEffect(() => {
    if (transactions.length > 0) {
      const sortedTransactions = [...transactions].sort((a, b) => {
        if (sortField === SortField.AMOUNT) {
          return sortAscending
            ? parseFloat(a.amount) - parseFloat(b.amount)
            : parseFloat(b.amount) - parseFloat(a.amount);
        } else {
          return sortAscending
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
      setTransactions(sortedTransactions);
    }
  }, [sortAscending, sortField]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSortChange = (selectedOption: any) => {
    setSortField(selectedOption.value);
  };

  const handleSortOrderChange = () => {
    setSortAscending(!sortAscending);
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(event.target.value as TransactionStatus | "");
    setCurrentPage(1);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-light-error">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-light-onSurface mb-6">
        Transaction History
      </h1>

      <div className="mb-4 flex justify-between items-center">
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="p-2 border rounded"
        >
          <option value="">All Status</option>
          <option value={TransactionStatus.SUCCESS}>Success</option>
          <option value={TransactionStatus.NOT_SUCCESS}>Not Success</option>
        </select>

        <div className="flex items-center">
          <Select
            options={sortOptions}
            onChange={handleSortChange}
            value={sortOptions.find((option) => option.value === sortField)}
            className="w-40 mr-2"
            styles={{
              control: (provided) => ({
                ...provided,
                minHeight: "38px",
                height: "38px",
              }),
              valueContainer: (provided) => ({
                ...provided,
                height: "38px",
                padding: "0 6px",
              }),
              input: (provided) => ({
                ...provided,
                margin: "0px",
              }),
              indicatorSeparator: () => ({
                display: "none",
              }),
              indicatorsContainer: (provided) => ({
                ...provided,
                height: "38px",
              }),
            }}
          />
          <button
            onClick={handleSortOrderChange}
            className="p-2 border rounded"
          >
            {sortAscending ? (
              <ChevronDoubleDownIcon className="w-4 h-4" />
            ) : (
              <ChevronDoubleUpIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-light-surface shadow rounded-lg overflow-hidden p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-light-onSurface">
                {transaction.type}
              </h2>
              <span
                className={`px-2 py-1 rounded ${
                  transaction.status === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-light-error-container text-light-onErrorContainer"
                }`}
              >
                {transaction.status}
              </span>
            </div>
            <p className="text-sm text-light-onSurface-600 mb-2">
              {transaction.orderInfo}
            </p>
            <p className="text-sm text-light-onSurface-400">
              Amount:{" "}
              <span className="font-semibold text-light-secondary">
                {transaction.amount}
              </span>
            </p>
            <p className="text-xs text-light-onSurface-400 mt-2">
              Transaction Date:{" "}
              {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>
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
};

export default TransactionPage;
