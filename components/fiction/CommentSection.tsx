import React, { useState, useEffect } from "react";
import { Constant } from "@/util/Constant";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbDownIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as HandThumbUpOutline } from "@heroicons/react/24/outline";
import { HandThumbDownIcon as HandThumbDownOutline } from "@heroicons/react/24/outline";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import fetchWithAuth from "@/util/Fetcher";
import Pagination from "../common/Pagination";
import { SortType } from "./SortSelector";
import Select from "react-select";

interface Comment {
  _id: string;
  user: {
    _id: string;
    username?: string;
    fullName?: string;
  };
  content: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
}

interface CommentSectionProps {
  fictionId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  fictionId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [sortType, setSortType] = useState<SortType>(SortType.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();

  const sortComments = (commentsToSort: Comment[]) => {
    return [...commentsToSort].sort((a, b) => {
      switch (sortType) {
        case SortType.CREATED_AT:
          return sortOrder === "desc"
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case SortType.LIKES:
          return sortOrder === "desc"
            ? b.likes.length - a.likes.length
            : a.likes.length - b.likes.length;
        case SortType.DISLIKES:
          return sortOrder === "desc"
            ? b.dislikes.length - a.dislikes.length
            : a.dislikes.length - b.dislikes.length;
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    fetchComments();
    fetchCurrentUser();
  }, [fictionId, currentPage, itemsPerPage]);

  useEffect(() => {
    setComments(sortComments(comments));
  }, [sortType, sortOrder]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `${Constant.API_URL}/interaction/${fictionId}/comments?page=${currentPage}&limit=${itemsPerPage}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setComments(sortComments(data.data.comments));
        setTotalPages(Math.ceil(data.data.total / itemsPerPage));
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        setCurrentUserId(data.data._id);
        setIsUserSignedIn(true);
      } else {
        setIsUserSignedIn(false);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setIsUserSignedIn(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.replace(/^\s+|\s+$/g, "");
    if (!trimmedComment) {
      setError("Comment cannot be empty");
      return;
    }
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/interaction/${fictionId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: trimmedComment }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setNewComment("");
        setError("");
        fetchComments();
      } else if (data.error && data.error.details) {
        setError(data.error.details);
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      setError("An error occurred while submitting the comment");
    }
  };

  const handleRateComment = async (commentId: string, isUseful: boolean) => {
    if (!currentUserId) return;

    const comment = comments.find((c) => c._id === commentId);
    if (!comment) return;

    const hasLiked = comment.likes.includes(currentUserId);
    const hasDisliked = comment.dislikes.includes(currentUserId);

    let url = `${Constant.API_URL}/interaction/comments/${commentId}/rate`;
    let method = "POST";

    if ((isUseful && hasLiked) || (!isUseful && hasDisliked)) {
      method = "DELETE";
    }

    try {
      const response = await fetchWithAuth(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isUseful }),
        credentials: "include",
      });
      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Không thể đánh giá bình luận:", error);
    }
  };

  const handleSignIn = () => {
    // router.push("/sign-in");
  };

  const handleSortChange = (
    newSortType: SortType,
    newSortOrder: "asc" | "desc"
  ) => {
    setSortType(newSortType);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const sortOptions = [
    { value: SortType.CREATED_AT, label: "Lastest" },
    { value: SortType.LIKES, label: "Most likes" },
    { value: SortType.DISLIKES, label: "Most dislikes" },
  ];

  return (
    <div className="mt-8 relative">
      <h2 className="text-2xl font-bold mb-4">Bình luận</h2>
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className={`w-full p-2 border rounded-md ${
            !isUserSignedIn ? "bg-gray-100" : ""
          }`}
          placeholder={
            isUserSignedIn ? "Write your comment..." : "Sign in to comment"
          }
          rows={3}
          disabled={!isUserSignedIn}
        />
        {error && <p className="text-light-error mt-1">{error}</p>}
        {isUserSignedIn ? (
          <button
            type="submit"
            className="mt-2 bg-light-primary text-light-onPrimary px-4 py-2 rounded-full hover:bg-light-primaryContainer transition-colors"
          >
            Send comment
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            className="mt-2 bg-light-primary text-light-onPrimary px-4 py-2 rounded-full hover:bg-light-primaryContainer transition-colors"
          >
            Sign in to comment
          </button>
        )}
      </form>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Select
            options={sortOptions}
            value={
              sortOptions.find((option) => option.value === sortType) || null
            }
            onChange={(selectedOption) => {
              if (selectedOption) {
                handleSortChange(selectedOption.value, sortOrder);
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="bg-light-surface p-4 rounded-lg shadow"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {comment.user.fullName || comment.user.username}
                    </p>
                    <p className="text-sm text-light-onSurfaceVariant">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRateComment(comment._id, true)}
                      className={`flex items-center space-x-1 text-light-primary ${
                        !isUserSignedIn ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!isUserSignedIn}
                    >
                      {comment.likes.includes(currentUserId || "") ? (
                        <HandThumbUpIcon className="w-5 h-5" />
                      ) : (
                        <HandThumbUpOutline className="w-5 h-5" />
                      )}
                      <span>{comment.likes.length}</span>
                    </button>
                    <button
                      onClick={() => handleRateComment(comment._id, false)}
                      className={`flex items-center space-x-1 text-light-secondary ${
                        !isUserSignedIn ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!isUserSignedIn}
                    >
                      {comment.dislikes.includes(currentUserId || "") ? (
                        <HandThumbDownIcon className="w-5 h-5" />
                      ) : (
                        <HandThumbDownOutline className="w-5 h-5" />
                      )}
                      <span>{comment.dislikes.length}</span>
                    </button>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
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
