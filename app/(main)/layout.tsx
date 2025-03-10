"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";
import Script from "next/script";

// Google Sans font
const googleSans = localFont({
  src: [
    {
      path: "./fonts/GoogleSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/GoogleSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/GoogleSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GoogleSans-Medium.ttf",
      weight: "500",
      style: "medium",
    },
    {
      path: "./fonts/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-google-sans",
});

const hideHeaderPaths = ["/sign-in", "/sign-up"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const shouldHideHeader = hideHeaderPaths.includes(pathname as any);

  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6001903694968256"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${googleSans.variable} font-sans antialiased bg-light-surface text-light-onSurface`}
      >
        {!shouldHideHeader && <Header />}
        <main className={shouldHideHeader ? "" : "mt-16 px-4"}>{children}</main>
      </body>
    </html>
  );
}
