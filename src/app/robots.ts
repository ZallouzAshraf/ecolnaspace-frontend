import { siteUrl } from "@/lib/site-config";
import type { MetadataRoute } from "next";

const PRIVATE_SEGMENTS = [
  "dashboard",
  "students",
  "parents",
  "teachers",
  "staff",
  "classes",
  "attendance",
  "academic",
  "finance",
  "communication",
  "daycare",
  "documents",
  "organization",
  "settings",
  "reset-password",
  "verify-email",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_SEGMENTS.map((segment) => `/*/${segment}`),
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
