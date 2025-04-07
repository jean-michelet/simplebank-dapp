import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jean & Co. Bank",
  description: "A simple bank where you can deposit fictitious money",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
          <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
            <div className="space-x-4 mb-7">
              <Link href="/">🏠</Link>
            </div>
            {children}
          </div>
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
