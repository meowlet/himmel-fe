import Image from "next/image";
import { Constant } from "@/util/Constant";
import { useState } from "react";

interface FictionCoverProps {
  fictionId: string;
  title: string;
}

export const FictionCover: React.FC<FictionCoverProps> = ({
  fictionId,
  title,
}) => {
  const [imageError, setImageError] = useState(false);
  return (
    <div className="relative h-64 w-full md:h-96">
      {!imageError ? (
        <Image
          src={`${Constant.API_URL}/fiction/${fictionId}/cover`}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg shadow-lg"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-light-error-container flex items-center justify-center rounded-lg shadow-lg">
          <p className="text-light-onErrorContainer text-center text-lg font-bold p-4">
            This fiction has no cover image
          </p>
        </div>
      )}
    </div>
  );
};
