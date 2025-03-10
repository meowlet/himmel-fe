import { useState, useEffect } from "react";
import { User } from "@/types/Fiction";
import { Constant } from "@/util/Constant";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${Constant.API_URL}/me`, {
          credentials: "include",
        });

        const data = await response.json();

        if (data.status === "success") {
          setUser(data.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};
