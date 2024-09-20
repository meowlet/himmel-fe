import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/mangadex-logo.svg"
        alt="MangaDex Logo"
        width={32}
        height={32}
      />
      <span className="text-xl font-bold text-light-primary">MangaDex</span>
    </Link>
  );
};
