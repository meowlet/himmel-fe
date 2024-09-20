import Image from "next/image";
import { Constant } from "@/util/Constant";

interface FictionCoverProps {
  fictionId: string;
  title: string;
}

export const FictionCover: React.FC<FictionCoverProps> = ({
  fictionId,
  title,
}) => (
  <div className="relative h-64 w-full md:h-96">
    <Image
      src={`${Constant.API_URL}/fiction/${fictionId}/cover`}
      alt={title}
      layout="fill"
      objectFit="cover"
      className="rounded-lg shadow-lg"
    />
  </div>
);
