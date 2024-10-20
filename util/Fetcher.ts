import { Constant } from "@/util/Constant";

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const fetchWithRetry = async (): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
      });

      // Kiểm tra nếu response không ok (bao gồm cả 401)
      if (!response.ok) {
        const errorData = await response.json();

        // Xử lý trường hợp token không hợp lệ
        if (
          errorData.error?.type === "INVALID_TOKEN" ||
          errorData.error?.type === "NO_TOKEN_PROVIDED"
        ) {
          const refreshResponse = await fetch(
            `${Constant.API_URL}/auth/refresh`,
            {
              method: "POST",
              credentials: "include",
            }
          );

          if (!refreshResponse.ok) {
            // Nếu refresh token cũng thất bại, chuyển hướng đến trang đăng nhập
            window.location.href = "/sign-in";
            throw new Error(
              "Unauthorized access. Redirecting to sign-in page."
            );
          }

          // Nếu refresh thành công, thử lại request ban đầu
          return fetchWithRetry();
        }

        // Ném lỗi cho các trường hợp khác
        throw new Error(errorData.message || "Request failed");
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  return fetchWithRetry();
}

export default fetchWithAuth;
