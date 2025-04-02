import React, { useState, useEffect } from "react";
import { Chapter } from "@/types/Fiction";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Constant } from "@/util/Constant";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { AdUnit } from "@/components/ad/AdUnit";
import { BannerAd } from "@/components/ad/BannerAd";

interface ReadingHistoryItem {
  chapter: string;
  lastReadPage: number;
  lastReadTime: string;
}

interface ChapterListProps {
  fictionId: string;
  chapters: Chapter[];
  isPremiumFiction: boolean;
  authorId: string;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  fictionId,
  chapters,
  isPremiumFiction,
  authorId,
}) => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [userBookmarks, setUserBookmarks] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(
    []
  );
  const [visibleChapters, setVisibleChapters] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const response = await fetch(Constant.API_URL + "/me", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "success") {
        setIsPremiumUser(data.data.isPremium);
        setIsUserSignedIn(true);
        setUserBookmarks(data.data.bookmarks || []);
        setReadingHistory(data.data.readingHistory || []);
        setUserId(data.data._id);
      } else {
        setIsUserSignedIn(false);

        // Check localStorage for premium token when not signed in
        if (typeof window !== "undefined") {
          const premiumToken = localStorage.getItem("himmel_premium_token");

          if (premiumToken) {
            try {
              const validateResponse = await fetch(
                `${Constant.API_URL}/me/validate/${premiumToken}`,
                { credentials: "include" }
              );
              const validateData = await validateResponse.json();

              if (validateData.data.isValid) {
                setIsPremiumUser(true);
              }
            } catch (tokenError) {
              console.error("Error validating premium token:", tokenError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking user status:", error);

      // Also check localStorage here in case the main request fails
      if (typeof window !== "undefined") {
        const premiumToken = localStorage.getItem("himmel_premium_token");

        if (premiumToken) {
          try {
            const validateResponse = await fetch(
              `${Constant.API_URL}/me/validate/${premiumToken}`,
              { credentials: "include" }
            );
            const validateData = await validateResponse.json();

            if (validateData.data.isValid) {
              setIsPremiumUser(true);
            }
          } catch (tokenError) {
            console.error("Error validating premium token:", tokenError);
          }
        }
      }
    }
  };

  const sortedChapters = [...chapters].sort(
    (a, b) => b.chapterIndex - a.chapterIndex
  );

  const currentReadingChapter = readingHistory.find((item) =>
    sortedChapters.some((chapter) => chapter._id === item.chapter)
  );

  const handleContinueReading = () => {
    if (currentReadingChapter) {
      const chapter = sortedChapters.find(
        (c) => c._id === currentReadingChapter.chapter
      );
      if (chapter) {
        router.push(
          `/fiction/${fictionId}/chapter/${chapter._id}?continueReading=true`
        );
      }
    }
  };

  const handleStartReading = () => {
    const firstChapter = sortedChapters[sortedChapters.length - 1]; // Get the first chapter
    if (firstChapter) {
      router.push(`/fiction/${fictionId}/chapter/${firstChapter._id}`);
    }
  };

  const handlePremiumUpgrade = () => {
    router.push("/payment/premium");
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleShowMore = () => {
    setVisibleChapters((prev) => Math.min(prev + 5, sortedChapters.length));
  };

  const handleShowAll = () => {
    setShowAll(true);
    setVisibleChapters(sortedChapters.length);
  };

  const handleCollapse = () => {
    setShowAll(false);
    setVisibleChapters(5);
  };

  const displayedChapters = showAll
    ? sortedChapters
    : sortedChapters.slice(0, visibleChapters);

  const shouldShowReadingButtons =
    !isPremiumFiction || (isPremiumFiction && isPremiumUser);

  return (
    <div className="mt-8 relative">
      <h2 className="text-2xl font-bold mb-4">Chapter List</h2>

      {shouldShowReadingButtons && (
        <div className="mb-4 space-x-4">
          {currentReadingChapter && (
            <button
              onClick={handleContinueReading}
              className="bg-light-primary text-light-onPrimary px-4 py-2 rounded-full hover:bg-light-primaryContainer transition-colors"
            >
              Continue (Chapter{" "}
              {
                sortedChapters.find(
                  (c) => c._id === currentReadingChapter.chapter
                )?.chapterIndex
              }
              , Page {currentReadingChapter.lastReadPage})
            </button>
          )}
          {sortedChapters.length > 0 && (
            <button
              onClick={handleStartReading}
              className="bg-light-secondary text-light-onSecondary px-4 py-2 rounded-full hover:bg-light-secondaryContainer transition-colors"
            >
              Start Reading
            </button>
          )}
        </div>
      )}

      {!isPremiumUser && (
        <div className="my-4">
          <BannerAd />
        </div>
      )}

      <div className="relative">
        {sortedChapters.length === 0 ? (
          <>
            {userId === authorId ? (
              <div
                onClick={() =>
                  router.push(`/fiction/${fictionId}/chapter/create`)
                }
                className="p-4 border-2 border-dashed rounded-lg hover:bg-light-secondary-container hover:text-light-onSecondaryContainer transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <PlusCircleIcon className="h-8 w-8" />
                <h3 className="text-lg font-semibold">Add First Chapter</h3>
                <p className="text-sm text-light-onSurfaceVariant">
                  Start your story by adding the first chapter
                </p>
              </div>
            ) : (
              <p className="text-light-onSurfaceVariant text-center py-4">
                This fiction has no chapters yet
              </p>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              {displayedChapters.map((chapter, index) => (
                <React.Fragment key={chapter._id}>
                  <ChapterItem
                    chapter={chapter}
                    isBookmarked={userBookmarks.includes(chapter._id)}
                  />
                  {!isPremiumUser &&
                    index === 2 &&
                    displayedChapters.length > 5 && (
                      <div className="my-4">
                        <AdUnit slotId="4408441888" format="horizontal" />
                      </div>
                    )}
                </React.Fragment>
              ))}

              {userId === authorId && (
                <div
                  onClick={() =>
                    router.push(`/fiction/${fictionId}/chapter/create`)
                  }
                  className="p-4 border border-dashed rounded-lg hover:bg-light-secondary-container hover:text-light-onSecondaryContainer transition-colors cursor-pointer flex justify-center items-center"
                >
                  <h3 className="text-lg font-semibold">+ Add New Chapter</h3>
                </div>
              )}
            </div>

            {!isPremiumUser && displayedChapters.length > 3 && (
              <div className="my-4">
                <AdUnit slotId="4408441888" format="rectangle" />
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {!showAll && visibleChapters < sortedChapters.length && (
                <>
                  <button
                    onClick={handleShowMore}
                    className="bg-light-secondary text-light-onSecondary px-4 py-2 rounded-full hover:bg-light-secondaryContainer transition-colors"
                  >
                    Show more
                  </button>
                  <button
                    onClick={handleShowAll}
                    className="bg-light-tertiary text-light-onTertiary px-4 py-2 rounded-full hover:bg-light-tertiaryContainer transition-colors"
                  >
                    Show all
                  </button>
                </>
              )}
              {(showAll || visibleChapters > 5) && (
                <button
                  onClick={handleCollapse}
                  className="bg-light-error-container text-light-onErrorContainer px-4 py-2 rounded-full hover:bg-light-errorContainer transition-colors"
                >
                  Collapse
                </button>
              )}
            </div>
          </>
        )}
        {isPremiumFiction && !isPremiumUser && sortedChapters.length != 0 ? (
          <div className="absolute inset-[-20px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-light-surface bg-opacity-70 backdrop-blur-sm" />
            <div className="relative z-10 text-center">
              {!isUserSignedIn ? (
                <>
                  <p className="text-lg font-semibold mb-2">
                    This content is only available to premium users
                  </p>
                  <button
                    onClick={handleSignIn}
                    className="bg-light-primary text-light-onPrimary px-4 py-2 rounded-full hover:bg-light-primaryContainer transition-colors"
                  >
                    Sign in to view this content
                  </button>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">
                    You are not a premium user, consider upgrading to view this
                    content
                  </p>
                  <button
                    onClick={handlePremiumUpgrade}
                    className="bg-light-primary text-light-onPrimary px-4 py-2 rounded-full hover:bg-light-primary-container transition-colors"
                  >
                    Upgrade to premium
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {!isPremiumUser && (
        <div className="mt-8">
          <AdUnit slotId="4408441888" />
        </div>
      )}
    </div>
  );
};

interface ChapterItemProps {
  chapter: Chapter;
  isBookmarked: boolean;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  isBookmarked,
}) => {
  const router = useRouter();

  const handleChapterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/fiction/${chapter.fiction}/chapter/${chapter._id}`, {});
  };

  return (
    <div
      onClick={handleChapterClick}
      className="p-4 border rounded-lg hover:bg-light-secondary-container hover:text-light-onSecondaryContainer transition-colors cursor-pointer flex justify-between items-center" // Add flex and items-center
    >
      <div>
        <h3 className="text-lg font-semibold">
          Chapter {chapter.chapterIndex}: {chapter.title}
        </h3>
        <p className="text-sm text-gray-600">
          Updated: {new Date(chapter.updatedAt).toLocaleDateString()}
        </p>
      </div>
      {isBookmarked && (
        <span className="text-light-primary">
          <BookmarkIcon className="text-light-primary h-5 w-5" />
        </span>
      )}
    </div>
  );
};
