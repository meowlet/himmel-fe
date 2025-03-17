"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Constant } from "@/util/Constant";
import { format } from "date-fns";
import Link from "next/link";

interface ValidationResponse {
  isValid: boolean;
  expiryDate?: string;
  premiumToken?: string;
}

const PREMIUM_TOKEN_KEY = "himmel_premium_token";
const PREMIUM_EXPIRY_KEY = "himmel_premium_expiry";

function PremiumActivation() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid or missing activation token");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${Constant.API_URL}/me/validate/${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to validate token");
        }

        const data = await response.json();

        if (data.status === "success") {
          setValidationResult(data.data);

          // Store premium token and expiry date in local storage
          if (data.data.isValid) {
            localStorage.setItem(PREMIUM_TOKEN_KEY, token);

            if (data.data.expiryDate) {
              localStorage.setItem(PREMIUM_EXPIRY_KEY, data.data.expiryDate);
            }
          }
        } else {
          setError(
            data.error?.details || "Failed to activate premium subscription"
          );
        }
      } catch (err) {
        setError(
          "An error occurred while activating your premium subscription"
        );
        console.error("Token validation error:", err);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-light-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-light-surface rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light-onSurface">
            Premium Activation
          </h1>
        </div>

        {/* Rest of your component rendering logic */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-light-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-light-onSurfaceVariant">
              Validating your premium subscription...
            </p>
          </div>
        ) : error ? (
          <div className="bg-light-error-container p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-light-error mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-bold text-light-onErrorContainer">
                Activation Failed
              </h2>
            </div>
            <p className="text-light-onErrorContainer mb-6">{error}</p>
            <div className="flex justify-center">
              <Link
                href="/payment/premium"
                className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-md hover:bg-light-primary/90 transition-colors"
              >
                Try Again
              </Link>
            </div>
          </div>
        ) : validationResult?.isValid ? (
          <div className="bg-light-primaryContainer p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-light-primary mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-bold text-light-onPrimaryContainer">
                Activation Successful
              </h2>
            </div>
            <p className="text-light-onPrimaryContainer mb-2">
              Congratulations! Your premium subscription has been activated
              successfully.
            </p>
            {validationResult?.expiryDate && (
              <p className="text-light-onPrimaryContainer mb-6">
                Your subscription is valid until:{" "}
                <strong>{formatDate(validationResult.expiryDate)}</strong>
              </p>
            )}
            <div className="flex justify-center mt-6">
              <Link
                href="/"
                className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-md hover:bg-light-primary/90 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-light-error-container p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-light-error mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-bold text-light-onErrorContainer">
                Invalid Token
              </h2>
            </div>
            <p className="text-light-onErrorContainer mb-6">
              This activation link is invalid or has already been used.
            </p>
            <div className="flex justify-center">
              <Link
                href="/payment/premium"
                className="px-4 py-2 bg-light-primary text-light-onPrimary rounded-md hover:bg-light-primary/90 transition-colors"
              >
                Purchase Premium
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fallback component to show while the main component is loading
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-light-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-light-surface rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light-onSurface">
            Premium Activation
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-light-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-light-onSurfaceVariant">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function PremiumAccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PremiumActivation />
    </Suspense>
  );
}
