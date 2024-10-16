"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../(main)/globals.css";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";

// Google Sans font
const googleSans = localFont({
  src: [
    {
      path: "../(main)/fonts/GoogleSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../(main)/fonts/GoogleSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../(main)/fonts/GoogleSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../(main)/fonts/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../(main)/fonts/GoogleSans-Medium.ttf",
      weight: "500",
      style: "medium",
    },
    {
      path: "../(main)/fonts/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-google-sans",
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="vi" className="scroll-smooth">
      <body
        className={`${googleSans.variable} font-sans antialiased bg-light-surface text-light-onSurface`}
      >
        <main className="">{children}</main>
      </body>
    </html>
  );
}
