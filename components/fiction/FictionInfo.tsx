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
  PencilIcon,
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
import Select from "react-select";
import { z } from "zod";

interface FictionInfoProps {
  fiction: Fiction;
  onFictionUpdate: (updatedFiction: Fiction) => void;
}

// Định nghĩa các schema validation
const titleSchema = z
  .string()
  .min(3, "Title must be at least 3 characters")
  .max(100, "Title must not exceed 100 characters")
  .trim()
  .nonempty("Title is required");

const descriptionSchema = z
  .string()
  .min(10, "Description must be at least 10 characters")
  .max(1000, "Description must not exceed 1000 characters")
  .trim()
  .nonempty("Description is required");

const tagsSchema = z
  .array(z.any())
  .min(1, "At least one tag is required")
  .max(10, "Maximum 10 tags allowed");

export const FictionInfo: React.FC<FictionInfoProps> = ({
  fiction: initialFiction,
  onFictionUpdate,
}) => {
  const router = useRouter();
  const [fiction, setFiction] = useState<Fiction>(initialFiction);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);

  const favoriteStyle = isFavorite
    ? "bg-light-errorContainer text-light-onErrorContainer"
    : "bg-light-secondary-container text-light-onSecondaryContainer";

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const [editedTitle, setEditedTitle] = useState(fiction.title);
  const [editedDescription, setEditedDescription] = useState(
    fiction.description
  );
  const [editedTags, setEditedTags] = useState(fiction.tags);
  const [editedStatus, setEditedStatus] = useState(fiction.status);

  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Thêm các state để quản lý lỗi
  const [errors, setErrors] = useState<{
    title?: string[];
    description?: string[];
    tags?: string[];
  }>({});

  const validateTitle = (title: string): boolean => {
    try {
      titleSchema.parse(title);
      setErrors((prev) => ({ ...prev, title: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          title: error.errors.map((e) => e.message),
        }));
      }
      return false;
    }
  };

  const validateDescription = (description: string): boolean => {
    try {
      descriptionSchema.parse(description);
      setErrors((prev) => ({ ...prev, description: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          description: error.errors.map((e) => e.message),
        }));
      }
      return false;
    }
  };

  const validateTags = (tags: Tag[] | string[]): boolean => {
    try {
      tagsSchema.parse(tags);
      setErrors((prev) => ({ ...prev, tags: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          tags: error.errors.map((e) => e.message),
        }));
      }
      return false;
    }
  };

  useEffect(() => {
    fetchUserRating();
    checkFavoriteStatus();
    checkIsAuthor();
    fetchAllTags();
  }, [fiction._id]);

  const fetchUserRating = async () => {
    try {
      const response = await fetch(
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
      const response = await fetch(`${Constant.API_URL}/me`, {
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

  const checkIsAuthor = async () => {
    try {
      const response = await fetch(`${Constant.API_URL}/me`, {
        credentials: "include",
      });
      const data = await response.json();
      setIsAuthor((fiction.author as User)._id === data.data._id);
    } catch (error) {
      console.error(
        "Lỗi khi kiểm tra xem người dùng có là tác giả hay không:",
        error
      );
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
      const response = await fetch(
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

  const handleUpdateFiction = async (updateData: Partial<Fiction>) => {
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/fiction/${fiction._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        await refetchFictionInfo();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating fiction:", error);
      return false;
    }
  };

  const handleSaveTitle = async () => {
    if (!validateTitle(editedTitle)) return;
    if (await handleUpdateFiction({ title: editedTitle })) {
      setIsEditingTitle(false);
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleSaveDescription = async () => {
    if (!validateDescription(editedDescription)) return;
    if (await handleUpdateFiction({ description: editedDescription })) {
      setIsEditingDescription(false);
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleSaveTags = async () => {
    if (!validateTags(editedTags)) return;
    const tagIds = editedTags.map((tag) => (tag as Tag)._id);
    if (await handleUpdateFiction({ tags: tagIds })) {
      setIsEditingTags(false);
      setErrors((prev) => ({ ...prev, tags: undefined }));
    }
  };

  const handleSaveStatus = async () => {
    if (await handleUpdateFiction({ status: editedStatus })) {
      setIsEditingStatus(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      const response = await fetch(`${Constant.API_URL}/tag`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        setAllTags(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tags:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-grow">
            <div className="flex-grow">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className={`text-3xl font-bold bg-light-surfaceVariant p-2 rounded w-full ${
                  errors.title ? "border-2 border-light-error" : ""
                }`}
                autoFocus
              />
              {errors.title &&
                errors.title.map((error, index) => (
                  <p key={index} className="text-light-error text-sm mt-1">
                    {error}
                  </p>
                ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTitle}
                className="px-3 py-1 text-sm bg-light-primary-container text-light-onPrimaryContainer rounded hover:bg-light-primaryDark"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditedTitle(fiction.title);
                  setIsEditingTitle(false);
                }}
                className="px-3 py-1 text-sm bg-light-error-container text-light-onErrorContainer rounded hover:bg-light-errorDark"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <h1 className="text-light-onSurface text-3xl font-bold flex-grow">
              {fiction.title}
            </h1>
            {isAuthor && (
              <button
                className="p-1 rounded hover:bg-light-surfaceVariant"
                onClick={() => setIsEditingTitle(true)}
              >
                <PencilIcon className="w-5 h-5 text-light-onSurfaceVariant" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {isEditingDescription ? (
          <div className="flex gap-2 w-full">
            <div className="flex-grow">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className={`w-full bg-light-surfaceVariant p-2 rounded ${
                  errors.description ? "border-2 border-light-error" : ""
                }`}
                rows={3}
                autoFocus
              />
              {errors.description &&
                errors.description.map((error, index) => (
                  <p key={index} className="text-light-error text-sm mt-1">
                    {error}
                  </p>
                ))}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveDescription}
                className="px-3 py-1 text-sm bg-light-primary-container text-light-onPrimaryContainer rounded hover:bg-light-primaryDark"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditedDescription(fiction.description);
                  setIsEditingDescription(false);
                }}
                className="px-3 py-1 text-sm bg-light-error-container text-light-onErrorContainer rounded hover:bg-light-errorDark"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 w-full">
            <p className="text-light-onSurfaceVariant flex-grow">
              {fiction.description}
            </p>
            {isAuthor && (
              <button
                className="p-1 rounded hover:bg-light-surfaceVariant"
                onClick={() => setIsEditingDescription(true)}
              >
                <PencilIcon className="w-5 h-5 text-light-onSurfaceVariant" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold mr-2">Author:</span>
        <span
          className="cursor-pointer text-light-primary hover:underline"
          onClick={handleAuthorClick}
        >
          {(fiction.author as User).username}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold mr-2">Tags:</span>
        {isEditingTags ? (
          <div className="flex gap-2 flex-grow">
            <div className="flex-grow">
              <Select
                isMulti
                name="tags"
                options={allTags.map((tag) => ({
                  value: tag._id,
                  label: tag.name,
                  description: tag.description,
                }))}
                className={`basic-multi-select ${
                  errors.tags ? "border-2 border-light-error" : ""
                }`}
                classNamePrefix="select"
                value={editedTags.map((tag) => ({
                  value: (tag as Tag)._id,
                  label: (tag as Tag).name,
                  description: (tag as Tag).description,
                }))}
                onChange={(selectedOptions) => {
                  setEditedTags(
                    selectedOptions.map(
                      (option) =>
                        allTags.find((tag) => tag._id === option.value)!
                    )
                  );
                }}
                formatOptionLabel={({ label, description }) => (
                  <div>
                    <div>{label}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                )}
              />
              {errors.tags &&
                errors.tags.map((error, index) => (
                  <p key={index} className="text-light-error text-sm mt-1">
                    {error}
                  </p>
                ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTags}
                className="px-3 py-1 text-sm bg-light-primary-container text-light-onPrimaryContainer rounded hover:bg-light-primaryDark"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditedTags(fiction.tags);
                  setIsEditingTags(false);
                }}
                className="px-3 py-1 text-sm bg-light-error-container text-light-onErrorContainer rounded hover:bg-light-errorDark"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-grow">
            <div className="flex flex-wrap gap-2 flex-grow">
              {fiction.tags.map((tag) => (
                <TagComponent
                  key={(tag as Tag)._id}
                  name={(tag as Tag).name}
                  code={(tag as Tag).code}
                  description={(tag as Tag).description}
                  textSize="text-sm"
                />
              ))}
            </div>
            {isAuthor && (
              <button
                className="p-1 rounded hover:bg-light-surfaceVariant"
                onClick={() => setIsEditingTags(true)}
              >
                <PencilIcon className="w-5 h-5 text-light-onSurfaceVariant" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold mr-2">Status:</span>
        {isEditingStatus ? (
          <div className="flex items-center gap-2">
            <select
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
              className="bg-light-surfaceVariant p-2 rounded"
              autoFocus
            >
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
              <option value="draft">Draft</option>
              <option value="hiatus">Hiatus</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSaveStatus}
                className="px-3 py-1 text-sm bg-light-primary-container text-light-onPrimaryContainer rounded hover:bg-light-primaryDark"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditedStatus(fiction.status);
                  setIsEditingStatus(false);
                }}
                className="px-3 py-1 text-sm bg-light-error-container text-light-onErrorContainer rounded hover:bg-light-errorDark"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="capitalize">{fiction.status}</span>
            {isAuthor && (
              <button
                className="p-1 rounded hover:bg-light-surfaceVariant"
                onClick={() => setIsEditingStatus(true)}
              >
                <PencilIcon className="w-5 h-5 text-light-onSurfaceVariant" />
              </button>
            )}
          </div>
        )}
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
