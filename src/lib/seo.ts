import { getAppUrl } from "@/lib/env";

export const SITE_NAME = "Zeohost";
/** Canonical production origin used for SEO when env is missing or still local. */
export const SITE_ORIGIN = "https://www.zeohost.store";
export const SITE_TAGLINE = "Domain registration, DNS, hosting, and SMS — built for growing businesses.";
export const SITE_DESCRIPTION =
  "Search and buy domains, manage DNS, and launch hosting with Zeohost. Simple checkout, live availability, and tools built for your business.";

export const SEO_KEYWORDS = [
  "domain registration",
  "buy domain",
  "domain search",
  "DNS management",
  "web hosting",
  "SMS API",
  "OTP verification",
  "Zeohost",
  "zeohost.store",
];

export function siteOrigin() {
  const fromEnv = getAppUrl();
  if (!fromEnv || fromEnv.includes("localhost") || fromEnv.includes("127.0.0.1")) {
    return SITE_ORIGIN;
  }
  return fromEnv.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  const base = siteOrigin();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/mark.png"),
    description: SITE_DESCRIPTION,
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
