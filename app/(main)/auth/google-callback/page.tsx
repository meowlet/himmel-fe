"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Constant } from "@/util/Constant";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get the entire hash from the URL
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      // Try to get id_token from hash
      let idToken = params.get("id_token");

      // If not in hash, check query params
      if (!idToken) {
        const urlParams = new URLSearchParams(window.location.search);
        idToken = urlParams.get("id_token");
      }

      if (idToken) {
        try {
          // Send the ID token to your server
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
              router.push("/set-username");
            } else {
              router.push("/");
            }
          } else {
            setError("Google authentication failed: " + data.error);
          }
        } catch (error) {
          setError("Error during Google authentication: " + error);
        }
      } else {
        setError("No ID token found in URL. Please try signing in again.");
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div>
        <h1>Authentication Error</h1>
        <p>{error}</p>
        <button onClick={() => router.push("/sign-in")}>
          Return to Sign In
        </button>
      </div>
    );
  }

  return <div>Processing Google authentication...</div>;
};

export default GoogleCallbackPage;
