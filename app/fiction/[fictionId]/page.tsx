"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FictionCover } from "@/components/fiction/FictionCover";
import { FictionInfo } from "@/components/fiction/FictionInfo";
import { Fiction } from "@/types/Fiction";
import { Constant } from "@/util/Constant";

const FictionDetail: React.FC = () => {
  const { fictionId } = useParams();
  const [fiction, setFiction] = useState<Fiction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiction = async () => {
      try {
        const response = await fetch(
          Constant.API_URL + `/fiction/${fictionId}`
        );
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu truyện");
        }
        const data = await response.json();
        setFiction(data.data);
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu truyện");
      } finally {
        setLoading(false);
      }
    };

    fetchFiction();
  }, [fictionId]);

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!fiction)
    return <div className="text-center py-10">Không tìm thấy truyện</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <FictionCover fictionId={fiction._id} title={fiction.title} />
        </div>
        <div className="md:w-2/3">
          <FictionInfo fiction={fiction} />
        </div>
      </div>
    </div>
  );
};

export default FictionDetail;
