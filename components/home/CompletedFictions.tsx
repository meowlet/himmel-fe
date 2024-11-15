import React, { useEffect, useState } from "react";
import { Fiction } from "@/types/Fiction";
import { FictionCardVariant } from "../fiction/FictionCardVariant";
import { Constant } from "@/util/Constant";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export const CompletedFictions = () => {
  const [fictions, setFictions] = useState<Fiction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const params = new URLSearchParams({
          limit: "6",
          status: "finished",
          sortBy: "favoriteCount",
          sortOrder: "desc",
        });

        const res = await fetch(`${Constant.API_URL}/fiction?${params}`);
        const data = await res.json();
        if (data.status === "success") {
          setFictions(data.data.fictions);
        }
      } catch (error) {
        console.error("Error fetching completed fictions:", error);
      }
    };

    fetchCompleted();
  }, []);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-light-onSurface">
          Completed Stories
        </h2>
        <button
          onClick={() => router.push("/browse?status=finished")}
          className="flex items-center text-light-primary hover:text-light-primaryDark"
        >
          View all
          <ChevronRightIcon className="w-5 h-5 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fictions.map((fiction) => (
          <FictionCardVariant
            key={fiction._id}
            fiction={fiction}
            variant="horizontal"
            showTags={true}
            showStats={true}
            showStatus={true}
            className="bg-light-secondary-container"
          />
        ))}
      </div>
    </section>
  );
};
