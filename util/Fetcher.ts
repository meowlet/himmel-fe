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

      if (!response.ok) {
        // Kiểm tra 403 trước khi parse JSON
        if (response.status === 403) {
          window.location.href = "/";
          throw new Error("Forbidden access. Redirecting to index page.");
        }

        const errorData = await response.json();
        console.log("Response status:", response.status);
        console.log("Full error data:", errorData);

        // Xử lý trường hợp token không hợp lệ
        console.log(errorData.error?.type);

        if (
          errorData.error?.type === "INVALID_TOKEN" ||
          errorData.error?.type === "NO_TOKEN_PROVIDED"
        ) {
          console.log("Starting token refresh process...");
          const refreshResponse = await fetch(
            `${Constant.API_URL}/auth/refresh`,
            {
              method: "POST",
              credentials: "include",
            }
          );
          console.log("Refresh response status:", refreshResponse.status);

          if (!refreshResponse.ok) {
            // Nếu refresh token cũng thất bại, chuyển hướng đến trang đăng nhập
            // window.location.href = "/sign-in";
            throw new Error(
              "Unauthorized access. Redirecting to sign-in page."
            );
          }

          // Nếu refresh thành công, thử lại request ban đầu
          return fetchWithRetry();
        }

        // Ném lỗi cho các trường hợp khác
        throw new Error(
          errorData.error?.details || errorData.message || "Request failed"
        );
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
