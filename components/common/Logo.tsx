import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex space-x-2">
      <div className="w-8 h-8 rounded-full bg-light-primary flex items-center justify-center">
        <span className="text-light-onPrimary font-medium text-lg">空</span>
      </div>
      <span className="text-xl font-bold text-light-primary">Himmel</span>
    </Link>
  );
};
