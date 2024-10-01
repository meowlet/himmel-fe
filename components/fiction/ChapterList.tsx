import React, { useState, useEffect } from "react";
import { Chapter } from "@/types/Fiction";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Constant } from "@/util/Constant";

interface ChapterListProps {
  chapters: Chapter[];
  isPremiumFiction: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  isPremiumFiction,
}) => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [visibleChapters, setVisibleChapters] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch(Constant.API_URL + "/me", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "success") {
        setIsPremiumUser(data.data.isPremium);
        setIsUserSignedIn(true);
      } else {
        setIsUserSignedIn(false);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái premium:", error);
    }
  };

  const sortedChapters = [...chapters].sort(
    (a, b) => b.chapterIndex - a.chapterIndex
  );

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

  return (
    <div className="mt-8 relative">
      <h2 className="text-2xl font-bold mb-4">Chapter List</h2>
      <div className="relative">
        {sortedChapters.length === 0 ? (
          <p className="text-light-onSurfaceVariant">
            This fiction has no chapters
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {displayedChapters.map((chapter) => (
                <ChapterItem key={chapter._id} chapter={chapter} />
              ))}
            </div>
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
        {(isPremiumFiction && !isUserSignedIn && sortedChapters.length != 0) ||
        (isUserSignedIn && !isPremiumUser && sortedChapters.length != 0) ? (
          <div className="absolute inset-[-20px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-light-surface bg-opacity-70 backdrop-blur-sm" />
            <div className="relative z-10 text-center">
              {isPremiumFiction && !isUserSignedIn ? (
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
    </div>
  );
};

interface ChapterItemProps {
  chapter: Chapter;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({ chapter }) => {
  return (
    <Link href={`/chapter/${chapter._id}`} className="block">
      <div className="p-4 border rounded-lg hover:bg-light-secondary-container hover:text-light-onSecondaryContainer transition-colors">
        <h3 className="text-lg font-semibold">
          Chapter {chapter.chapterIndex}: {chapter.title}
        </h3>
        <p className="text-sm text-gray-600">
          Updated: {new Date(chapter.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
};
