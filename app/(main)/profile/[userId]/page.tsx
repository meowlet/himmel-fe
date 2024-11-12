"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Constant } from "@/util/Constant";
import { Fiction, Tag, User } from "@/types/Fiction";
import fetchWithAuth from "@/util/Fetcher";
import { Dialog } from "@/components/common/Dialog";

const UserProfile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [imageError, setImageError] = useState(false);
  const [favorites, setFavorites] = useState<Fiction[]>([]);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [userFictions, setUserFictions] = useState<Fiction[]>([]);
  const [fictionCount, setFictionCount] = useState(0);

  const [userFictionLimit, setUserFictionLimit] = useState(6);
  const [visibleFavorites, setVisibleFavorites] = useState(6);
  const [hasMoreUserFictions, setHasMoreUserFictions] = useState(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [applicationNote, setApplicationNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialogError, setDialogError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(
          `${Constant.API_URL}/user/${userId}`
        );
        if (!response.ok) {
          throw new Error("Unable to load user data");
        }
        const data = await response.json();
        setUser(data.data);
      } catch (err) {
        setError("An error occurred while loading user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user && user.favorites) {
        const favoritePromises = user.favorites.map(async (fictionId) => {
          const response = await fetch(
            `${Constant.API_URL}/fiction/${fictionId}`
          );
          if (!response.ok) {
            throw new Error("Unable to load favorite fiction data");
          }
          const data = await response.json();
          return data.data;
        });

        try {
          const favoriteData = await Promise.all(favoritePromises);
          setFavorites(favoriteData);
        } catch (err) {
          setError("An error occurred while loading favorite fictions");
        }
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [userId, user]);

  useEffect(() => {
    const fetchUserFictions = async () => {
      try {
        const response = await fetch(
          `${Constant.API_URL}/fiction/?author=${userId}&limit=${userFictionLimit}`
        );
        if (!response.ok) {
          throw new Error("Unable to load user's fictions");
        }
        const data = await response.json();
        setUserFictions(data.data.fictions);
        setFictionCount(data.data.total);
        setHasMoreUserFictions(data.data.fictions.length < data.data.total);
      } catch (err) {
        setError("An error occurred while loading user's fictions");
      }
    };

    if (user) {
      fetchUserFictions();
    }
  }, [userId, user, userFictionLimit]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetchWithAuth(`${Constant.API_URL}/me`);
        if (!response.ok) throw new Error("Failed to fetch current user");
        const data = await response.json();
        setCurrentUser(data.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleApplySubmit = async () => {
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/me/apply-author`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: applicationNote }),
        }
      );

      const resData = await response.json();
      if (!response.ok)
        throw new Error(
          resData.error?.details || "Failed to submit application"
        );

      // Refresh user data after successful submission
      const updatedUserResponse = await fetchWithAuth(`${Constant.API_URL}/me`);
      const updatedUserData = await updatedUserResponse.json();
      setCurrentUser(updatedUserData.data);
      setIsApplyDialogOpen(false);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setDialogError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelApplication = async () => {
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const response = await fetchWithAuth(
        `${Constant.API_URL}/me/author-application`,
        {
          method: "DELETE",
        }
      );

      const resData = await response.json();
      if (!response.ok)
        throw new Error(
          resData.error?.details || "Failed to cancel application"
        );

      // Refresh user data
      const updatedUserResponse = await fetchWithAuth(`${Constant.API_URL}/me`);
      const updatedUserData = await updatedUserResponse.json();
      setCurrentUser(updatedUserData.data);
    } catch (err: any) {
      console.error("Error canceling application:", err);
      setDialogError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAuthorStatus = () => {
    if (currentUser?._id === userId) {
      switch (currentUser?.authorApplicationStatus) {
        case "approved":
          return (
            <span className="bg-light-primary-container text-light-onPrimaryContainer text-xs font-medium px-2.5 py-0.5 rounded">
              Author
            </span>
          );
        case "pending":
          return (
            <div className="flex gap-2 w-full justify-center mt-2">
              <span className="bg-light-tertiary-container text-light-onTertiaryContainer text-xs font-medium px-2.5 py-0.5 rounded">
                Application Pending
              </span>
              <button
                onClick={handleCancelApplication}
                className="bg-light-error text-light-onError text-xs font-medium px-2.5 py-0.5 rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Canceling..." : "Cancel Application"}
              </button>
            </div>
          );
        case "rejected":
          return (
            <button
              onClick={() => setIsApplyDialogOpen(true)}
              className="bg-light-error-container text-light-onErrorContainer text-xs font-medium px-2.5 py-0.5 rounded"
            >
              Application Rejected - Apply Again
            </button>
          );
        default:
          return (
            <button
              onClick={() => setIsApplyDialogOpen(true)}
              className="bg-light-secondary text-light-onSecondary text-xs font-medium px-2.5 py-0.5 rounded"
            >
              Apply to be Author
            </button>
          );
      }
    }
    return null;
  };

  const loadMoreUserFictions = () => {
    setUserFictionLimit((prevLimit) => prevLimit + 6);
  };

  const loadMoreFavorites = () => {
    setVisibleFavorites((prevLimit) => prevLimit + 6);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-light-error">{error}</div>;
  if (!user) return <div className="text-center py-10">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-light-surface shadow rounded-lg overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-light-primary to-light-secondary">
          {!imageError ? (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <Image
                src={`${Constant.API_URL}/user/${userId}/avatar`}
                alt={user.username}
                width={128}
                height={128}
                className="rounded-full border-4 border-white"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <Image
                src="https://osu.ppy.sh/images/layout/avatar-guest@2x.png"
                alt={user.username}
                width={128}
                height={128}
                className="rounded-full border-4 border-white"
              />
            </div>
          )}
        </div>
        <div className="pt-16 pb-8 px-6 text-center">
          <h1 className="text-2xl font-semibold text-light-onSurface">
            {user.fullName ? user.fullName : user.username}
          </h1>
          <p className="text-sm text-light-onPrimary-600 mt-1">{user.email}</p>
          {user.bio && (
            <p className="mt-2 text-light-onSurface italic">{user.bio}</p>
          )}
          <div className="mt-2">
            {user.isPremium ? (
              <span className="bg-light-tertiary-container text-light-onTertiaryContainer text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                Premium to{" "}
                {user.premiumExpiryDate
                  ? new Date(user.premiumExpiryDate).toLocaleDateString()
                  : "unlimited"}
              </span>
            ) : (
              <span className="bg-light-tertiary-container text-light-onTertiaryContainer text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                User
              </span>
            )}
            {renderAuthorStatus()}
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-light-onPrimary-600">
                Joined
              </dt>
              <dd className="mt-1 text-sm text-light-onSurface">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-light-onPrimary-600">
                Uploaded fictions
              </dt>
              <dd className="mt-1 text-sm text-light-onSurface">
                {fictionCount}
              </dd>
            </div>
            {/* Thêm các thông tin khác nếu cần */}
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-light-onSurface">
            Uploaded fictions
          </h2>
          <div className="flex-grow mx-4 border-t border-light-outline"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userFictions.map((fiction) => (
            <div
              key={fiction._id}
              className="bg-light-surface rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="relative h-32 w-full cursor-pointer"
                onClick={() => router.push(`/fiction/${fiction._id}`)}
              >
                {!imageErrors[fiction._id] ? (
                  <Image
                    src={`${Constant.API_URL}/fiction/${fiction._id}/cover`}
                    alt={fiction.title}
                    layout="fill"
                    objectFit="cover"
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [fiction._id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-light-error-container flex items-center justify-center">
                    <p className="text-light-onErrorContainer text-center text-sm font-bold">
                      No cover image
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-light-onSurface mb-2 truncate">
                  {fiction.title}
                </h3>
                <p className="text-sm text-light-onSurface-600 mb-2 line-clamp-2">
                  {fiction.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {hasMoreUserFictions && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMoreUserFictions}
              className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-full hover:bg-light-primary-dark transition-colors"
            >
              See more
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-light-onSurface">
            Favorites
          </h2>
          <div className="flex-grow mx-4 border-t border-light-outline"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.slice(0, visibleFavorites).map((fiction) => (
            <div
              key={fiction._id}
              className="bg-light-surface rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="relative h-32 w-full cursor-pointer"
                onClick={() => router.push(`/fiction/${fiction._id}`)}
              >
                {!imageErrors[fiction._id] ? (
                  <Image
                    src={`${Constant.API_URL}/fiction/${fiction._id}/cover`}
                    alt={fiction.title}
                    layout="fill"
                    objectFit="cover"
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [fiction._id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-light-error-container flex items-center justify-center">
                    <p className="text-light-onErrorContainer text-center text-sm font-bold">
                      No cover image
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-light-onSurface mb-2 truncate">
                  {fiction.title}
                </h3>
                <p className="text-sm text-light-onSurface-600 mb-2 line-clamp-2">
                  {fiction.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {visibleFavorites < favorites.length && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMoreFavorites}
              className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-full hover:bg-light-primary-dark transition-colors"
            >
              See more
            </button>
          </div>
        )}
      </div>

      <Dialog
        open={isApplyDialogOpen}
        onClose={() => {
          setIsApplyDialogOpen(false);
          setDialogError(null);
        }}
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Apply to be an Author</h3>
          {dialogError && (
            <div className="mb-4 p-2 bg-light-error-container text-light-onErrorContainer rounded">
              {dialogError}
            </div>
          )}
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={applicationNote}
            onChange={(e) => setApplicationNote(e.target.value)}
            placeholder="Please tell us why you want to become an author..."
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setIsApplyDialogOpen(false);
                setDialogError(null);
              }}
              className="px-4 py-2 text-light-onSurface"
            >
              Cancel
            </button>
            <button
              onClick={handleApplySubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-light-primary text-light-onPrimary rounded disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserProfile;
