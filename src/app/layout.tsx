import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetScribe - AI Meeting Notes for Sales Teams",
  description: "Transform your sales meetings into actionable insights with AI-powered transcription, summaries, and CRM integration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
