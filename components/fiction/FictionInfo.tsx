import {
  StarIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  GifIcon,
  GiftIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { Chapter, Fiction, Tag, User } from "@/types/Fiction";
import { Tag as TagComponent } from "./Tag";
import { ChapterList } from "./ChapterList";
import { useEffect, useState } from "react";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { Constant } from "@/util/Constant";
import { CommentSection } from "./CommentSection";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import fetchWithAuth from "@/util/Fetcher";
import { useRouter } from "next/navigation";

interface FictionInfoProps {
  fiction: Fiction;
  onFictionUpdate: (updatedFiction: Fiction) => void;
}

export const FictionInfo: React.FC<FictionInfoProps> = ({
  fiction: initialFiction,
  onFictionUpdate,
}) => {
  const router = useRouter();
  const [fiction, setFiction] = useState<Fiction>(initialFiction);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const favoriteStyle = isFavorite
    ? "bg-light-errorContainer text-light-onErrorContainer"
    : "bg-light-secondary-container text-light-onSecondaryContainer";

  useEffect(() => {
    fetchUserRating();
    checkFavoriteStatus();
  }, [fiction._id]);

  const fetchUserRating = async () => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/interaction/${fiction._id}/rate`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setUserRating(data.data.score);
      }
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá của người dùng:", error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetchWithAuth(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        setIsFavorite(data.data.favorites.includes(fiction._id));
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
    }
  };

  const handleRating = async (score: number) => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/interaction/${fiction._id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ score }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setUserRating(score);
        await refetchFictionInfo();
      } else {
        console.error("Lỗi khi gửi đánh giá");
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${fiction._id}/favorite`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        setIsFavorite(!isFavorite);
        // Cập nhật lại thông tin fiction
        await refetchFictionInfo();
      } else {
        console.error("Lỗi khi thay đổi trạng thái yêu thích");
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
    }
  };

  const refetchFictionInfo = async () => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${fiction._id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setFiction(data.data);
        onFictionUpdate(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin fiction:", error);
    }
  };

  const handleAuthorClick = () => {
    if (fiction.author && "_id" in (fiction.author as User)) {
      router.push(`/profile/${(fiction.author as User)._id}`);
    }
  };

  return (
    <div>
      <h1 className="text-light-onSurface text-3xl font-bold mb-4">
        {fiction.title}
      </h1>
      <p className="text-light-onSurfaceVariant mb-4">{fiction.description}</p>
      <div className="flex items-center mb-4">
        <span className="font-semibold mr-2">Author:</span>
        <span
          className="cursor-pointer text-light-primary hover:underline"
          onClick={handleAuthorClick}
        >
          {(fiction.author as User).username}
        </span>
      </div>
      <div className="flex items-center mb-4">
        <span className="font-semibold mr-2">Tags:</span>
        <div className="flex flex-wrap gap-2">
          {fiction.tags.map((tag) => (
            <TagComponent
              key={(tag as Tag).name}
              name={(tag as Tag).name}
              code={(tag as Tag).code}
              description={(tag as Tag).description}
              textSize="text-sm"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center mb-4">
        <span className="font-semibold mr-2">Status:</span>
        <span className="capitalize">{fiction.status}</span>
      </div>
      <div className="flex items-center mb-4">
        <span className="font-semibold mr-2">Type:</span>
        <span
          className={`flex items-center px-2 py-1 rounded-full ${
            fiction.type === "premium"
              ? "bg-light-tertiary-container text-light-onTertiaryContainer"
              : "bg-light-secondary-container text-light-onSecondaryContainer"
          }`}
        >
          {fiction.type === "premium" ? (
            <>
              <LockClosedIcon className="w-4 h-4 mr-1" />
              <span>Premium</span>
            </>
          ) : (
            <>
              <GiftIcon className="w-4 h-4 mr-1" />
              <span>Free</span>
            </>
          )}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center">
          <EyeIcon className="w-5 h-5 text-gray-500 mr-1" />
          <span>{fiction.stats.viewCount} views</span>
        </div>
        <div className="flex items-center">
          <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
          <span>
            {fiction.stats.averageRating.toFixed(1)} (
            {fiction.stats.ratingCount} votes)
          </span>
        </div>
        <div className="flex items-center">
          <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500 mr-1" />
          <span>{fiction.stats.commentCount} comments</span>
        </div>
        <div className="flex items-center">
          <HeartIcon className="w-5 h-5 text-light-error mr-1" />
          <span>
            {fiction.stats.favoriteCount ? fiction.stats.favoriteCount : 0}{" "}
            favorites
          </span>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <span className="font-semibold mr-2">Cast your vote:</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="focus:outline-none"
            >
              {star <= (userRating || 0) ? (
                <StarIcon className="w-6 h-6 text-yellow-400" />
              ) : (
                <StarIconOutline className="w-6 h-6 text-gray-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center mb-4">
        <button
          onClick={handleFavorite}
          className={`flex items-center px-4 py-2 rounded-full focus:outline-none transition-colors ${
            isFavorite
              ? "bg-light-error-container text-light-onErrorContainer"
              : "bg-light-surfaceVariant text-light-onSurfaceVariant"
          }`}
        >
          {isFavorite ? (
            <HeartIcon className="w-5 h-5 mr-2" />
          ) : (
            <HeartIconOutline className="w-5 h-5 mr-2" />
          )}
          <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
        </button>
      </div>

      <div className="text-sm text-light-onSurfaceVariant">
        <p>Created at: {new Date(fiction.createdAt).toLocaleDateString()}</p>
        <p>Updated at: {new Date(fiction.updatedAt).toLocaleDateString()}</p>
      </div>

      <ChapterList
        fictionId={fiction._id}
        chapters={fiction.chapters as Chapter[]}
        isPremiumFiction={fiction.type === "premium"}
      />

      <CommentSection fictionId={fiction._id} />
    </div>
  );
};
