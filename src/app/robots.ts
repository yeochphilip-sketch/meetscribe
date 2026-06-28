import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings", "/new", "/meeting", "/checkout"],
    },
    sitemap: "https://meetscribe.vercel.app/sitemap.xml",
  };
}
