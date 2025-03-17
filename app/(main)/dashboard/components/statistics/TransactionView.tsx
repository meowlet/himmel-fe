import React, { useEffect, useState } from "react";
import { Constant } from "@/util/Constant";
import fetchWithAuth from "@/util/Fetcher";

interface Transaction {
  _id: string;
  user: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
  email: string;
  description: string;
  userDetails?: any;
}

interface TransactionViewProps {
  fromDate: string;
  toDate: string;
  onClose: () => void;
}

export const TransactionView = ({
  fromDate,
  toDate,
  onClose,
}: TransactionViewProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append("from", fromDate);
        if (toDate) queryParams.append("to", toDate);
        if (statusFilter) queryParams.append("status", statusFilter);
        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", pageSize.toString());

        const response = await fetchWithAuth(
          `${Constant.API_URL}/transaction?${queryParams}`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (data.status === "success") {
          setTransactions(data.data.transactions);
          setTotalPages(Math.ceil(data.data.total / pageSize) || 1);
        } else {
          throw new Error(data.error?.details || "An error occurred");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [fromDate, toDate, statusFilter, currentPage]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-light-error">{error}</div>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-light-surface p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transactions</h2>
          <button
            onClick={onClose}
            className="text-light-onSurface hover:text-light-primary"
          >
            Close
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="statusFilter" className="mr-2">
            Filter by status:
          </label>
          <select
            id="statusFilter"
            className="border rounded px-2 py-1"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.userDetails[0]?.username ||
                        `Guest (${transaction.email})` ||
                        transaction.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          // sucess, pending, failed
                          transaction.status === "success"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-light-error-container text-light-onErrorContainer"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{transaction.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-light-primary text-light-onPrimary hover:bg-light-primaryContainer"
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                const pagesToShow = 5;
                const halfWay = Math.floor(pagesToShow / 2);
                let startPage = Math.max(1, currentPage - halfWay);
                const endPage = Math.min(
                  totalPages,
                  startPage + pagesToShow - 1
                );

                if (endPage - startPage + 1 < pagesToShow) {
                  startPage = Math.max(1, endPage - pagesToShow + 1);
                }

                const pageNumber = startPage + i;
                if (pageNumber <= endPage) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        pageNumber === currentPage
                          ? "bg-light-primary text-light-onPrimary"
                          : "bg-light-surface hover:bg-light-primaryContainer"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-light-primary text-light-onPrimary hover:bg-light-primaryContainer"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
