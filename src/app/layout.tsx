import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetScribe - AI Meeting Notes for Sales Teams",
  description: "Transform your sales meetings into actionable insights with AI-powered transcription, summaries, and CRM integration.",
  keywords: ["AI meeting notes", "sales meeting transcription", "meeting summary", "sales productivity", "AI transcription"],
  authors: [{ name: "MeetScribe" }],
  creator: "MeetScribe",
  metadataBase: new URL("https://meetscribe.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meetscribe.vercel.app",
    siteName: "MeetScribe",
    title: "MeetScribe - AI Meeting Notes for Sales Teams",
    description: "Transform your sales meetings into actionable insights with AI-powered transcription, summaries, and CRM integration.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MeetScribe - AI Meeting Notes for Sales Teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetScribe - AI Meeting Notes for Sales Teams",
    description: "Transform your sales meetings into actionable insights with AI-powered transcription, summaries, and CRM integration.",
    images: ["/og-image.png"],
    creator: "@meetscribe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <Analytics />
      </body>
    </html>
  );
}
