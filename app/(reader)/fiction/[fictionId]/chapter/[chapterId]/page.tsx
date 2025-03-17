"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Constant } from "@/util/Constant";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowsUpDownIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/common/Button";
import fetchWithAuth from "@/util/Fetcher";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";

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
  const router = useRouter();
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
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [lastSavedPage, setLastSavedPage] = useState(0);
  const searchParams = useSearchParams();
  const continueReading = searchParams.get("continueReading") === "true";
  const [isReadyToScroll, setIsReadyToScroll] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    checkBookmarkStatus();
    if (continueReading) {
      console.log("đang tiếp tục đọc");
      loadReadingHistory();
    }
  }, []);

  useEffect(() => {
    if (isReadyToScroll && !isHorizontal) {
      scrollToLastReadPage();
    }
  }, [isReadyToScroll, isHorizontal]);

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

  useEffect(() => {
    const handleScroll = () => {
      if (!isHorizontal && containerRef.current) {
        const images = containerRef.current.querySelectorAll("img");
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const { top, bottom } = image.getBoundingClientRect();
          const imageMiddle = (top + bottom) / 2 + window.scrollY;

          if (scrollPosition >= imageMiddle) {
            setCurrentPage(i + 1);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHorizontal]);

  useEffect(() => {
    if (allImagesLoaded) {
      incrementViewCount();
      if (isReadyToScroll && !isHorizontal) {
        scrollToLastReadPage();
      }
    }
  }, [allImagesLoaded]);

  useEffect(() => {
    const saveReadingHistory = async () => {
      if (currentPage !== lastSavedPage) {
        await saveHistory(currentPage);
        setLastSavedPage(currentPage);
      }
    };

    const debouncedSave = debounce(saveReadingHistory, 2000);
    debouncedSave();

    return () => {
      debouncedSave.clear();
    };
  }, [currentPage, lastSavedPage, chapterId]);

  useEffect(() => {
    if (!isHorizontal) {
      scrollToCurrentPage();
    }
  }, [isHorizontal]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "success") {
        setIsUserPremium(data.data.isPremium);
      } else {
        // If regular authentication fails, check for premium token in localStorage
        checkPremiumToken();
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setIsUserPremium(false);

      // Also try to check premium token if main request fails
      checkPremiumToken();
    } finally {
      setIsAuthChecked(true);
    }
  };

  const checkPremiumToken = async () => {
    if (typeof window !== "undefined") {
      const premiumToken = localStorage.getItem("himmel_premium_token");

      if (premiumToken) {
        try {
          const validateResponse = await fetch(
            `${Constant.API_URL}/me/validate/${premiumToken}`,
            { credentials: "include" }
          );
          const validateData = await validateResponse.json();

          if (validateData.data && validateData.data.isValid) {
            setIsUserPremium(true);
          } else {
            setIsUserPremium(false);
          }
        } catch (tokenError) {
          console.error("Error validating premium token:", tokenError);
          setIsUserPremium(false);
        }
      } else {
        setIsUserPremium(false);
      }
    }
  };

  const fetchImages = async (
    fictionData: FictionData,
    chapterData: ChapterData
  ) => {
    setIsLoading(true);
    try {
      console.log("Fetching images...");
      if (!chapterData || !fictionData) {
        console.log("Missing chapter or fiction data");
        return;
      }

      const imageUrls = [];
      const blobs = [];
      const isPremiumContent = fictionData.type === "premium" && isUserPremium;

      for (let i = 1; i <= chapterData.pageCount; i++) {
        const url = isPremiumContent
          ? `${Constant.API_URL}/fiction/${fictionId}/premium-chapter/${chapterId}/${i}`
          : `${Constant.API_URL}/fiction/${fictionId}/chapter/${chapterId}/${i}`;

        imageUrls.push(url);

        try {
          const response = await fetch(url, {
            credentials: isPremiumContent ? "include" : "omit",
            cache: "no-store",
          });
          if (!response.ok) {
            throw new Error("Failed to load image");
          }
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobs.push(blobUrl);
        } catch (error) {
          console.error(
            `Error loading ${isPremiumContent ? "premium" : "free"} image:`,
            error
          );
          blobs.push("");
        }
      }

      setImages(imageUrls);
      setImageBlobs(blobs);
      setAllImagesLoaded(true); // Set this to true after all images are loaded
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${fictionId}/increment-view`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to increment view count");
      }
      console.log("View count incremented successfully");
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const toggleBars = () => {
    setShowBar(!showBar);
    setShowTopBar(!showTopBar);
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
    setIsHorizontal((prev) => !prev);
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

  const handleBackToFiction = async () => {
    try {
      await saveHistory(currentPage);
      console.log("Đã lưu trang đọc hiện tại vào history");
      router.push(`/fiction/${fictionId}`);
    } catch (error) {
      console.error("Lỗi khi lưu trang đọc vào history:", error);
      router.push(`/fiction/${fictionId}`);
    }
  };

  const handleBackToTopOrFirst = () => {
    if (isHorizontal) {
      setCurrentPage(1);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    if (chapterData) {
      setCurrentPage(chapterData.pageCount);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();
      setIsBookmarked(data.data.bookmarks.includes(chapterId));
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  console.log(isBookmarked);

  const handleBookmark = async () => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/chapter/${chapterId}/bookmark`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        setIsBookmarked((prev) => !prev);
      } else {
        throw new Error("Failed to bookmark chapter");
      }
    } catch (error) {
      console.error("Error bookmarking chapter:", error);
    }
  };

  const saveHistory = async (pageIndex: number) => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/chapter/${chapterId}/history/${pageIndex}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save reading history");
      }
      console.log("Reading history saved successfully");
    } catch (error) {
      console.error("Error saving reading history:", error);
    }
  };

  const loadReadingHistory = async () => {
    try {
      const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();
      const history = data.data.readingHistory;
      const currentChapterHistory = history.find(
        (item: any) => item.chapter === chapterId
      );
      if (currentChapterHistory) {
        const lastReadPage = currentChapterHistory.lastReadPage;
        setCurrentPage(lastReadPage);
        setLastSavedPage(lastReadPage);
        console.log("Trang cuối cùng đã đọc:", lastReadPage);
        setIsReadyToScroll(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử đọc:", error);
    }
  };

  const scrollToLastReadPage = () => {
    const images = containerRef.current?.querySelectorAll("img");
    if (images && images[currentPage - 1]) {
      setTimeout(() => {
        images[currentPage - 1].scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  const scrollToCurrentPage = () => {
    if (!isHorizontal && containerRef.current) {
      const images = containerRef.current.querySelectorAll("img");
      if (images && images[currentPage - 1]) {
        setTimeout(() => {
          images[currentPage - 1].scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!chapterData || images.length === 0) {
    return <div>Đang tải nội dung...</div>;
  }

  if (fictionData?.type === "premium" && !isUserPremium) {
    return <div>Nội dung này chỉ dành cho người dùng premium</div>;
  }

  return (
    <div className="min-h-screen ">
      <div
        className={`fixed top-0 left-0 right-0 bg-light-surface shadow-lg p-4 border-b border-light-outline z-10 transition-transform duration-300 ease-in-out ${
          showTopBar ? "transform translate-y-0" : "transform -translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <button
            className="text-light-onSurface p-2 rounded-full flex-shrink-0 mr-2"
            onClick={handleBackToFiction}
            aria-label="Back to fiction"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="text-light-onSurface truncate flex-grow mr-4">
            Chapter {chapterData?.chapterIndex}
            {" - "}
            <span className="font-bold">{chapterData?.title}</span>
          </div>
          <button
            className="text-light-onSurface p-2 rounded-full flex-shrink-0"
            onClick={handleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <BookmarkSolidIcon className="text-light-primary h-5 w-5" />
            ) : (
              <BookmarkOutlineIcon className="text-light-primary h-5 w-5" />
            )}
          </button>
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
              loading="eager"
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
                  loading="eager"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div
          className={`flex justify-between px-4 mb-2 transition-opacity duration-300 ${
            showBar ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            variant="text"
            onClick={toggleReadingMode}
            aria-label={
              isHorizontal
                ? "Chuyển sang chế độ đọc dọc"
                : "Chuyển sang chế độ đọc ngang"
            }
          >
            {isHorizontal ? (
              <ArrowsUpDownIcon className="h-6 w-6" />
            ) : (
              <ArrowsRightLeftIcon className="h-6 w-6" />
            )}
          </Button>
          {!isHorizontal && (
            <Button
              variant="text"
              onClick={handleBackToTop}
              className="bg-light-primary text-light-onPrimary p-2 rounded-full"
              aria-label="Quay lại đầu trang"
            >
              <ChevronUpIcon className="h-6 w-6" />
            </Button>
          )}
        </div>
        <div
          className={`bg-light-surface shadow-lg p-4 border-t border-light-outline transition-transform duration-300 ease-in-out ${
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
            {isHorizontal && (
              <button
                onClick={handleFirstPage}
                className="bg-light-tertiary-container text-light-onTertiaryContainer px-4 py-2 rounded-full mr-2"
              >
                <ChevronDoubleLeftIcon className="h-6 w-6" />
              </button>
            )}
            <div className="text-light-onSurface">
              Page {currentPage} / {chapterData?.pageCount}
            </div>
            {isHorizontal && (
              <button
                onClick={handleLastPage}
                className="bg-light-tertiary-container text-light-onTertiaryContainer px-4 py-2 rounded-full ml-2"
              >
                <ChevronDoubleRightIcon className="h-6 w-6" />
              </button>
            )}
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
    </div>
  );
};

// Helper function for debouncing
function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFunction = (...args: Parameters<F>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };

  debouncedFunction.clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  };

  return debouncedFunction;
}

export default ReaderPage;
