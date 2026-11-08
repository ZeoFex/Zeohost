import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

export function getAppUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
  return raw.trim().replace(/\/+$/, "");
}

export function getDatabaseUrl() {
  const raw =
    process.env.DATABASE_URL?.trim() ||
    process.env.Database_URL?.trim() ||
    "";
  if (!raw) return "";
  return normalizePostgresSslMode(raw);
}

/**
 * pg v9 will change sslmode=require semantics. Keep today's verify-full behavior
 * and silence the Node security warning without weakening TLS.
 */
function normalizePostgresSslMode(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const mode = url.searchParams.get("sslmode")?.toLowerCase();
    if (mode === "require" || mode === "prefer" || mode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    } else if (!mode) {
      url.searchParams.set("sslmode", "verify-full");
    }
    url.searchParams.delete("uselibpqcompat");
    return url.toString();
  } catch {
    return connectionString;
  }
}

function emailFromFromHeader(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}

export function smtpAuthUser() {
  const user = process.env.SMTP_USER?.trim() ?? "";
  if (user.includes("@")) return user;
  const from = process.env.SMTP_FROM ?? "";
  return emailFromFromHeader(from);
}

function smtpPurposeConfigured(purpose: "WELCOME" | "SUPPORT" | "SALES") {
  const user =
    process.env[`SMTP_USER_${purpose}`]?.trim() ||
    emailFromFromHeader(process.env[`SMTP_FROM_${purpose}`] ?? "");
  const pass =
    process.env[`SMTP_PASS_${purpose}`]?.trim() || process.env.SMTP_PASS?.trim();
  return Boolean(user && pass);
}

export function isSmtpConfigured() {
  if (!process.env.SMTP_HOST?.trim()) return false;
  if (process.env.SMTP_PASS?.trim() && smtpAuthUser()) return true;
  return (
    smtpPurposeConfigured("WELCOME") ||
    smtpPurposeConfigured("SUPPORT") ||
    smtpPurposeConfigured("SALES")
  );
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}
