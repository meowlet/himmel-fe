import React, { useEffect, useState } from "react";
import { Fiction } from "@/types/Fiction";
import { FictionCardVariant } from "../fiction/FictionCardVariant";
import { Constant } from "@/util/Constant";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export const PremiumFictions = () => {
  const [fictions, setFictions] = useState<Fiction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPremium = async () => {
      try {
        const params = new URLSearchParams({
          limit: "4",
          type: "premium",
          sortBy: "viewCount",
          sortOrder: "desc",
        });

        const res = await fetch(`${Constant.API_URL}/fiction?${params}`);
        const data = await res.json();
        if (data.status === "success") {
          setFictions(data.data.fictions);
        }
      } catch (error) {
        console.error("Error fetching premium fictions:", error);
      }
    };

    fetchPremium();
  }, []);

  return (
    <section className="mb-12 bg-light-tertiary-container p-8 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-light-onTertiaryContainer">
          Premium Selection
        </h2>
        <button
          onClick={() => router.push("/browse?type=premium")}
          className="flex items-center text-light-onTertiaryContainer hover:opacity-80"
        >
          View all
          <ChevronRightIcon className="w-5 h-5 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fictions.map((fiction) => (
          <FictionCardVariant
            key={fiction._id}
            fiction={fiction}
            variant="vertical"
            showTags={false}
            showType={true}
            className="bg-light-surface"
          />
        ))}
      </div>
    </section>
  );
};
