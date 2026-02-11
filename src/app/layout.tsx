import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "T20 World Cup Tracker & Predictions",
  description:
    "Live standings, match results and AI-powered qualification predictions for the ICC T20 World Cup.",
  keywords: [
    "T20 World Cup",
    "cricket",
    "standings",
    "predictions",
    "ICC",
    "live scores",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-[#07090f] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
