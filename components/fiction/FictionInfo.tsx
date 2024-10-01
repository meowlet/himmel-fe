import {
  StarIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  GifIcon,
  GiftIcon,
} from "@heroicons/react/24/solid";
import { Chapter, Fiction, Tag, User } from "@/types/Fiction";
import { Tag as TagComponent } from "./Tag";
import { ChapterList } from "./ChapterList";

interface FictionInfoProps {
  fiction: Fiction;
}

export const FictionInfo: React.FC<FictionInfoProps> = ({ fiction }) => (
  <div>
    <h1 className="text-light-onSurface text-3xl font-bold mb-4">
      {fiction.title}
    </h1>
    <p className="text-light-onSurfaceVariant mb-4">{fiction.description}</p>
    <div className="flex items-center mb-4">
      <span className="font-semibold mr-2">Author:</span>
      <span>{(fiction.author as User).username}</span>
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
    <div className="flex items-center space-x-4 mb-4">
      <div className="flex items-center">
        <EyeIcon className="w-5 h-5 text-gray-500 mr-1" />
        <span>{fiction.stats.viewCount} views</span>
      </div>
      <div className="flex items-center">
        <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
        <span>
          {fiction.stats.averageRating.toFixed(1)} ({fiction.stats.ratingCount}{" "}
          ratings)
        </span>
      </div>
      <div className="flex items-center">
        <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500 mr-1" />
        <span>{fiction.stats.commentCount} comments</span>
      </div>
    </div>
    <div className="text-sm text-light-onSurfaceVariant">
      <p>Created at: {new Date(fiction.createdAt).toLocaleDateString()}</p>
      <p>Updated at: {new Date(fiction.updatedAt).toLocaleDateString()}</p>
    </div>

    <ChapterList
      chapters={fiction.chapters as Chapter[]}
      isPremiumFiction={fiction.type === "premium"}
    />
  </div>
);
