import { Constant } from "@/util/Constant";

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const fetchWithRetry = async (): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    const data = await response.json();

    if (data.error?.type === "INVALID_TOKEN") {
      const refreshResponse = await fetch(`${Constant.API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      

      if (refreshResponse.status === 401) {
        window.location.href = "/sign-in";
      }

      if (refreshResponse.ok) {
        return fetchWithRetry();
      }
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };

  return fetchWithRetry();
}

export default fetchWithAuth;
