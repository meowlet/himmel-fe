"use client";

import { Constant } from "@/util/Constant";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { z } from "zod";

enum Duration {
  ONE_MONTH = "ONE_MONTH",
  THREE_MONTH = "THREE_MONTH",
  SIX_MONTH = "SIX_MONTH",
  ONE_YEAR = "ONE_YEAR",
}

const prices = {
  [Duration.ONE_MONTH]: "5000",
  [Duration.THREE_MONTH]: "14000",
  [Duration.SIX_MONTH]: "26000",
  [Duration.ONE_YEAR]: "50000",
};

// Calculate savings percentage compared to monthly plan
const calculateSavings = (duration: Duration, price: string): number => {
  const monthlyPrice = parseInt(prices[Duration.ONE_MONTH]);
  const currentPrice = parseInt(price);
  const months =
    duration === Duration.THREE_MONTH
      ? 3
      : duration === Duration.SIX_MONTH
      ? 6
      : 12;
  const saving =
    ((monthlyPrice * months - currentPrice) / (monthlyPrice * months)) * 100;
  return Math.round(saving);
};

const formatDuration = (duration: string): string => {
  return duration
    .replace("_", " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const emailSchema = z.string().email("Please enter a valid email address");

export default function PremiumPage() {
  const [selectedDuration, setSelectedDuration] = useState<Duration>(
    Duration.ONE_MONTH
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [restoreEmail, setRestoreEmail] = useState("");
  const [restoreEmailError, setRestoreEmailError] = useState("");
  const [restoreProcessing, setRestoreProcessing] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${Constant.API_URL}/me`, {
          credentials: "include",
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setEmailError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      } else {
        setEmailError("Invalid email address");
      }
      return false;
    }
  };

  const validateRestoreEmail = () => {
    try {
      emailSchema.parse(restoreEmail);
      setRestoreEmailError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setRestoreEmailError(error.errors[0].message);
      } else {
        setRestoreEmailError("Invalid email address");
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setProcessing(true);

    // If not logged in, validate email
    if (!isLoggedIn && !validateEmail()) {
      setProcessing(false);
      return;
    }

    try {
      const requestBody = {
        duration: selectedDuration,
        ...(!isLoggedIn && email && { email }),
      };

      const url = isLoggedIn ? "/me/purchase-premium" : "/me/purchase";

      const response = await fetch(Constant.API_URL + url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      const result = await response.json();

      if (result.status === "success" && result.data.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        setGeneralError(
          result.error?.details || "An error occurred. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error when purchasing Premium:", error);
      setGeneralError("An error occurred. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRestorePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setRestoreProcessing(true);
    setRestoreSuccess(false);

    if (!validateRestoreEmail()) {
      setRestoreProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${Constant.API_URL}/me/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: restoreEmail }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setRestoreSuccess(true);
        setRestoreEmail("");
      } else {
        setRestoreEmailError(
          result.error?.details ||
            "Failed to process your request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error when restoring premium:", error);
      setRestoreEmailError("An error occurred. Please try again later.");
    } finally {
      setRestoreProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-light-onBackground mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-light-onBackground/70">
            Get access to exclusive content and features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(prices).map(([duration, price]) => {
              const savings =
                duration !== Duration.ONE_MONTH
                  ? calculateSavings(duration as Duration, price)
                  : 0;

              return (
                <div
                  key={duration}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
                    selectedDuration === duration
                      ? "border-light-primary bg-light-primaryContainer shadow-lg scale-105"
                      : "border-light-outline hover:border-light-primary hover:shadow bg-light-surface"
                  }`}
                  onClick={() => setSelectedDuration(duration as Duration)}
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-light-onSurface">
                      {formatDuration(duration)}
                    </h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-2xl font-bold text-light-onSurface">
                        {parseInt(price).toLocaleString()}
                      </span>
                      <span className="text-light-onSurface/70 ml-1">VND</span>
                    </div>
                    {savings > 0 && (
                      <div className="absolute top-2 right-2 bg-light-tertiary text-light-onTertiary text-xs font-bold px-2 py-1 rounded-full">
                        Save {savings}%
                      </div>
                    )}
                    <input
                      type="radio"
                      name="duration"
                      value={duration}
                      checked={selectedDuration === duration}
                      onChange={() => setSelectedDuration(duration as Duration)}
                      className="sr-only"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!isLoggedIn && (
            <div className="mt-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                required
                placeholder="Enter your email address"
                className="rounded-md"
              />
              <div className="mt-2 text-sm text-light-onSurfaceVariant">
                We'll send premium activation instructions to this email after
                successful payment
              </div>

              <div className="mt-4 bg-light-error-container border-light-error p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-light-error"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-light-onErrorContainer">
                      <strong>Please double-check your email address!</strong>{" "}
                      After payment, you'll need to access this exact email
                      inbox to activate your premium subscription. If you enter
                      an incorrect email, you may lose your payment without
                      gaining premium access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {generalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{generalError}</span>
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={processing}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-light-onPrimary bg-light-primary hover:bg-light-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary transition-colors duration-200 ${
                processing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {processing ? "Processing..." : "Upgrade Now"}
            </button>
          </div>
        </form>

        {!isLoggedIn && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Not logged in?</strong> After payment, check your
                  email for activation instructions. You'll receive a link to
                  activate your premium subscription.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 bg-light-surface rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface">
            Premium Benefits
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center text-light-onSurface">
              <svg
                className="h-5 w-5 text-light-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Access to all premium content
            </li>
            <li className="flex items-center text-light-onSurface">
              <svg
                className="h-5 w-5 text-light-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Ad-free reading experience
            </li>
            <li className="flex items-center text-light-onSurface">
              <svg
                className="h-5 w-5 text-light-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Early access to new releases
            </li>
          </ul>
        </div>

        <div className="mt-12 bg-light-surface rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-light-onSurface">
            Restore Your Premium Subscription
          </h2>
          <p className="mb-4 text-light-onSurface/70">
            Already purchased premium but need to restore access? Enter the
            email you used for purchase below.
          </p>

          <form onSubmit={handleRestorePurchase} className="mt-4">
            <div className="max-w-md">
              <Input
                label="Your Purchase Email"
                type="email"
                value={restoreEmail}
                onChange={(e) => setRestoreEmail(e.target.value)}
                error={restoreEmailError}
                required
                placeholder="Enter the email you used for purchase"
                className="rounded-md"
              />
            </div>

            {restoreSuccess && (
              <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="text-sm">
                  Success! If this email was used for a premium purchase, we've
                  sent restoration instructions to your inbox. Please check your
                  email and follow the activation link.
                </p>
              </div>
            )}

            <div className="mt-4">
              <button
                type="submit"
                disabled={restoreProcessing}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-light-onSecondary bg-light-secondary hover:bg-light-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-secondary transition-colors duration-200 ${
                  restoreProcessing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {restoreProcessing ? "Processing..." : "Restore Purchase"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
