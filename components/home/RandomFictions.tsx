import React, { useEffect, useState, useRef } from "react";
import { Fiction } from "@/types/Fiction";
import { Constant } from "@/util/Constant";
import { ChevronLeftIcon, ChevronRightIcon, BookOpenIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const RandomFictions = () => {
  const [fictions, setFictions] = useState<Fiction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchRandom = async () => {
      try {
        const params = new URLSearchParams({});

        const res = await fetch(`${Constant.API_URL}/fiction/random?${params}`);
        const data = await res.json();
        if (data.status === "success") {
          setFictions(data.data);
        }
      } catch (error) {
        console.error("Error fetching random fictions:", error);
      }
    };

    fetchRandom();
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [currentIndex, fictions.length]);

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % fictions.length);
    }, 5000) as NodeJS.Timeout;
  };

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + fictions.length) % fictions.length);
    startAutoScroll();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % fictions.length);
    startAutoScroll();
  };

  const handleFictionClick = (fictionId: string) => {
    router.push(`/fiction/${fictionId}`);
  };

  const renderImage = (fiction: Fiction) => {
    if (imageErrors[fiction._id]) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-light-surfaceVariant">
          <BookOpenIcon className="w-24 h-24 text-light-onSurfaceVariant" />
        </div>
      );
    }

    return (
      <Image
        src={`${Constant.API_URL}/fiction/${fiction._id}/cover`}
        alt={fiction.title}
        layout="fill"
        objectFit="cover"
        className="group-hover:scale-105 transition-transform duration-300"
        onError={() => setImageErrors(prev => ({ ...prev, [fiction._id]: true }))}
      />
    );
  };

  if (fictions.length === 0) return null;

  return (
    <section className="mb-12 relative">
      <div className="relative h-[400px] overflow-hidden rounded-xl">
        {fictions.map((fiction, index) => (
          <div
            key={fiction._id}
            className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${
              index === currentIndex ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`,
            }}
          >
            <div
              className="relative w-full h-full cursor-pointer group"
              onClick={() => handleFictionClick(fiction._id)}
            >
              {renderImage(fiction)}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                <h3 className="text-2xl font-bold mb-2">{fiction.title}</h3>
                <p className="line-clamp-2 text-sm opacity-90">
                  {fiction.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between">
        <button
          onClick={handlePrevious}
          className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
        {fictions.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? "bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => {
              setCurrentIndex(index);
              startAutoScroll();
            }}
          />
        ))}
      </div>
    </section>
  );
};
