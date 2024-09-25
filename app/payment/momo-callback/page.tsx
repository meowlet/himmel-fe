"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Constant } from "@/util/Constant";

interface PaymentData {
  resultCode: number;
  responseTime: number;
  transId: number;
  amount: number;
  [key: string]: string | number;
}

export default function MomoCallback() {
  const [status, setStatus] = useState<string>("Đang xử lý...");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      if (!searchParams) {
        setStatus("Không tìm thấy thông tin thanh toán");
        return;
      }

      const paymentData: PaymentData = {
        resultCode: 0,
        responseTime: 0,
        transId: 0,
        amount: 0,
      };

      searchParams.forEach((value, key) => {
        if (["resultCode", "responseTime", "transId", "amount"].includes(key)) {
          paymentData[key] = Number(value);
        } else {
          paymentData[key] = value;
        }
      });

      try {
        const response = await fetch(Constant.API_URL + "/payment/momo-ipn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          throw new Error("Lỗi khi xử lý thanh toán");
        }

        const result = await response.json();
        setStatus(result.message || "Thanh toán thành công");

        // Chuyển hướng người dùng sau 3 giây
        setTimeout(() => {
          //   router.push("/dashboard"); // Thay đổi đường dẫn này theo nhu cầu của bạn
        }, 3000);
      } catch (error) {
        console.error("Lỗi:", error);
        setStatus("Đã xảy ra lỗi khi xử lý thanh toán");
      }
    };

    processCallback();
  }, [searchParams]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kết quả thanh toán MoMo</h1>
      <p className="text-lg">{status}</p>
    </div>
  );
}
