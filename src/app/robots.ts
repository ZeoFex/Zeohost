import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/register", "/login", "/brand/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/dashboard",
          "/domains",
          "/hosting",
          "/sites",
          "/dns",
          "/billing",
          "/orders",
          "/support",
          "/account",
          "/checkout",
          "/cart",
          "/sms",
          "/p/",
          "/verify-email",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
