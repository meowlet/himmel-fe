"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Constant } from "@/util/Constant";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowTurnDownRightIcon,
  ArrowTurnRightDownIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/common/Button";

interface ChapterData {
  _id: string;
  title: string;
  chapterIndex: number;
  pageCount: number;
}

interface FictionData {
  type: string;
  chapters: ChapterData[];
}

const ReaderPage: React.FC = () => {
  const { fictionId, chapterId } = useParams();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [fictionData, setFictionData] = useState<FictionData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageBlobs, setImageBlobs] = useState<string[]>([]);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTopBar, setShowTopBar] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthChecked && fictionId && chapterId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [fictionResponse, chapterResponse] = await Promise.all([
            fetch(`${Constant.API_URL}/fiction/${fictionId}`),
            fetch(`${Constant.API_URL}/fiction/chapter/${chapterId}`),
          ]);
          const fictionData = (await fictionResponse.json()).data;
          const chapterData = (await chapterResponse.json()).data;
          setFictionData(fictionData);
          setChapterData(chapterData);
          await fetchImages(fictionData, chapterData);
        } catch (error) {
          console.error("Error:", error);
          setError(
            "An error occurred while loading the data. Please try again later."
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthChecked, fictionId, chapterId]);

  useEffect(() => {
    if (chapterData) {
      fetchImages(fictionData!, chapterData);
    }
  }, [chapterData]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();
      setIsUserPremium(data.data.isPremium);
      console.log(data.data.isPremium);
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setIsUserPremium(false);
    } finally {
      setIsAuthChecked(true);
    }
  };

  const fetchImages = async (
    fictionData: FictionData,
    chapterData: ChapterData
  ) => {
    setIsLoading(true);
    try {
      if (!chapterData || !fictionData || !isUserPremium) return;

      const imageUrls = [];
      const blobs = [];
      for (let i = 1; i <= chapterData.pageCount; i++) {
        const url =
          fictionData.type === "premium"
            ? `${Constant.API_URL}/fiction/${fictionId}/premium-chapter/${chapterId}/${i}`
            : `${Constant.API_URL}/fiction/${fictionId}/chapter/${chapterId}/${i}`;
        imageUrls.push(url);

        if (fictionData.type === "premium") {
          try {
            const response = await fetch(url, {
              credentials: "include",
              cache: "no-store",
            });
            if (!response.ok) {
              throw new Error("Failed to load image");
            }
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobs.push(blobUrl);
          } catch (error) {
            console.error("Error loading premium image:", error);
            blobs.push(""); // Thêm URL trống nếu có lỗi
          }
        }
      }
      setImages(imageUrls);
      if (fictionData.type === "premium") {
        setImageBlobs(blobs);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBars = () => {
    setShowBar(!showBar);
    setShowTopBar(!showTopBar);
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const clickPositionX = (clientX - left) / width;
    const clickPositionY = (clientY - top) / height;

    if (clickPositionY < 0.2 || clickPositionY > 0.8) {
      toggleBars();
    } else if (clickPositionX > 0.7) {
      handleNextPage();
    } else if (clickPositionX < 0.3) {
      handlePrevPage();
    } else {
      toggleBars();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < chapterData?.pageCount!) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleReadingMode = () => {
    setIsHorizontal(!isHorizontal);
  };

  const handlePrevChapter = () => {
    if (fictionData && chapterData) {
      const currentIndex = fictionData.chapters.findIndex(
        (chapter) => chapter._id === chapterData._id
      );
      if (currentIndex > 0) {
        const prevChapter = fictionData.chapters[currentIndex - 1];
        // Navigate to the previous chapter
        window.location.href = `/fiction/${fictionId}/chapter/${prevChapter._id}`;
      }
    }
  };

  const handleNextChapter = () => {
    if (fictionData && chapterData) {
      const currentIndex = fictionData.chapters.findIndex(
        (chapter) => chapter._id === chapterData._id
      );
      if (currentIndex < fictionData.chapters.length - 1) {
        const nextChapter = fictionData.chapters[currentIndex + 1];
        // Navigate to the next chapter
        window.location.href = `/fiction/${fictionId}/chapter/${nextChapter._id}`;
      }
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (
    !chapterData ||
    images.length === 0 ||
    (fictionData?.type === "premium" && !isUserPremium)
  ) {
    return <div>Nội dung này chỉ dành cho người dùng premium</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div
        className={`fixed top-0 left-0 right-0 bg-light-surface shadow-lg p-4 border-b border-light-outline z-10 transition-transform duration-300 ease-in-out ${
          showTopBar ? "transform translate-y-0" : "transform -translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div className="text-light-onSurface truncate flex-grow mr-4">
            Chapter {chapterData?.chapterIndex}
            {" - "}
            <span className="font-bold">{chapterData?.title}</span>
          </div>
          <Button
            variant="text"
            onClick={toggleReadingMode}
            className="bg-light-primary text-light-onPrimary p-2 rounded-full flex-shrink-0"
            aria-label={
              isHorizontal
                ? "Switch to vertical mode"
                : "Switch to horizontal mode"
            }
          >
            {isHorizontal ? (
              <ArrowTurnRightDownIcon className="h-4 w-4" />
            ) : (
              <ArrowTurnDownRightIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="relative" ref={containerRef}>
        {isHorizontal ? (
          <div className="flex justify-center items-center h-screen bg-light-surface">
            <Image
              src={
                fictionData?.type === "premium" && isUserPremium
                  ? imageBlobs[currentPage - 1]
                  : images[currentPage - 1]
              }
              alt={`Trang ${currentPage}`}
              layout="fill"
              objectFit="contain"
              onClick={handleImageClick}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center bg-light-surface w-full">
            {images.map((image, index) => (
              <div
                key={index}
                className="w-full sm:max-w-3xl sm:px-4"
                onClick={handleImageClick}
              >
                <Image
                  src={
                    fictionData?.type === "premium" && isUserPremium
                      ? imageBlobs[index]
                      : image
                  }
                  alt={`Trang ${index + 1}`}
                  width={800}
                  height={1200}
                  layout="responsive"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-light-surface shadow-lg p-4 border-t border-light-outline z-10 transition-transform duration-300 ease-in-out ${
          showBar ? "transform translate-y-0" : "transform translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <button
            onClick={handlePrevChapter}
            className="bg-light-primary text-light-onPrimary px-4 py-2 rounded-full mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !fictionData ||
              !chapterData ||
              fictionData.chapters[0]._id === chapterData._id
            }
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="text-light-onSurface">
            Page {currentPage} / {chapterData?.pageCount}
          </div>
          <button
            onClick={handleNextChapter}
            className="bg-light-primary text-light-onPrimary px-4 py-2 rounded-full ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !fictionData ||
              !chapterData ||
              fictionData.chapters[fictionData.chapters.length - 1]._id ===
                chapterData._id
            }
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;
