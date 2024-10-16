"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Constant } from "@/util/Constant";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const idToken = hashParams.get("id_token");

      if (idToken) {
        try {
          const response = await fetch(Constant.API_URL + "/auth/google-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token: idToken }),
          });

          const data = await response.json();

          if (data.status === "success") {
            if (data.data.isNewUser) {
              router.push("/onboarding"); // Nếu là người dùng mới
            } else {
              router.push("/dashboard"); // Nếu là người dùng đã tồn tại
            }
          } else {
            console.error("Xác thực Google thất bại:", data.error);
            router.push("/sign-in?error=google_auth_failed");
          }
        } catch (error) {
          console.error("Lỗi trong quá trình xác thực Google:", error);
          router.push("/sign-in?error=google_auth_error");
        }
      } else {
        console.error("Không tìm thấy id_token trong URL");
        router.push("/sign-in?error=no_id_token");
      }
    };

    handleCallback();
  }, [router]);

  return <div>Processing Google Sign-In...</div>;
}
