const PREMIUM_TOKEN_KEY = "himmel_premium_token";
const PREMIUM_EXPIRY_KEY = "himmel_premium_expiry";

export const isPremiumUser = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const token = localStorage.getItem(PREMIUM_TOKEN_KEY);
    const expiryDate = localStorage.getItem(PREMIUM_EXPIRY_KEY);

    if (!token || !expiryDate) return false;

    // Check if premium has expired
    const expiry = new Date(expiryDate);
    const now = new Date();

    return expiry > now;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};

// Include premium token in API requests that need it
export const getPremiumHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem(PREMIUM_TOKEN_KEY);
    if (token) {
      headers["Premium-Token"] = token;
    }
  }

  return headers;
};

// Use this function to make API calls that require premium access
export const fetchPremiumData = async (
  url: string,
  options: RequestInit = {}
) => {
  const headers = getPremiumHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: "include",
  });

  return response;
};

// Clear premium token on logout
export const clearPremiumStatus = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PREMIUM_TOKEN_KEY);
  localStorage.removeItem(PREMIUM_EXPIRY_KEY);
};
