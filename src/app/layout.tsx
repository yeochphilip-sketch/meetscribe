import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import { Analytics } from "@vercel/analytics/next";
import HeaderNav from "@/components/HeaderNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SalesAI - The AI Sales Assistant That Closes More Deals",
  description: "The AI sales assistant that turns every sales call into actionable next steps, follow-up emails, and automatic CRM updates.",
  keywords: ["AI sales assistant", "sales call transcription", "sales coaching", "CRM automation", "sales intelligence", "deal tracking"],
  authors: [{ name: "SalesAI" }],
  creator: "SalesAI",
  metadataBase: new URL("https://meetscribe.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meetscribe.vercel.app",
    siteName: "SalesAI",
    title: "SalesAI - The AI Sales Assistant That Closes More Deals",
    description: "Turn every sales call into actionable next steps, follow-up emails, and automatic CRM updates.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SalesAI - AI Sales Assistant" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SalesAI - The AI Sales Assistant That Closes More Deals",
    description: "Turn every sales call into actionable next steps, follow-up emails, and automatic CRM updates.",
    images: ["/og-image.png"],
    creator: "@salesai",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <HeaderNav />
        <main>{children}</main>
        <FeedbackWidget />
        <Analytics />
      </body>
    </html>
  );
}
