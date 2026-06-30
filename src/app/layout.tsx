import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SalesAI - The AI Sales Assistant That Closes More Deals",
  description: "The AI sales assistant that turns every sales call into actionable next steps, follow-up emails, and automatic CRM updates. Save time, reduce admin work, increase close rates.",
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

function HeaderNav() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold text-green-400">SalesAI</Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/deals">Deals</NavLink>
            <NavLink href="/actions">Actions</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            <NavLink href="/integrations">Integrations</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/deals/new" className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors">
              + New Deal
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
    >
      {children}
    </Link>
  );
}

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
