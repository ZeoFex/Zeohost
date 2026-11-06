import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { requireAuthSecret } from "@/lib/security/auth-secret";
import { isApiKeyScope, type ApiKeyScope } from "@/lib/security/api-scopes";

export { API_KEY_SCOPES, isApiKeyScope, type ApiKeyScope } from "@/lib/security/api-scopes";

export type ApiKeyEnvironment = "DEVELOPMENT" | "PRODUCTION";

const TOKEN = /^(?:zh|md)_(live|test)_([a-f0-9]{8})_(.+)$/;

export function normalizeScopes(values: string[]) {
  const scopes = [...new Set(values.filter(isApiKeyScope))];
  return scopes;
}

export function parseApiToken(token: string) {
  const match = token.trim().match(TOKEN);
  if (!match || match[3].length < 20) return null;
  const kind = match[1];
  const hex = match[2];
  const secret = match[3];
  const brand = token.trim().startsWith("md_") ? "md" : "zh";
  return {
    prefix: `${brand}_${kind}_${hex}`,
    secret,
    environment: (kind === "live" ? "PRODUCTION" : "DEVELOPMENT") as ApiKeyEnvironment,
  };
}

export function createApiKeyMaterial(environment: ApiKeyEnvironment = "DEVELOPMENT") {
  const kind = environment === "PRODUCTION" ? "live" : "test";
  const prefix = `zh_${kind}_${randomBytes(4).toString("hex")}`;
  const secret = randomBytes(24).toString("base64url");
  const token = `${prefix}_${secret}`;
  return { prefix, secret, token, secretHash: hashApiSecret(secret), environment };
}

export function hashApiSecret(secret: string) {
  return createHmac("sha256", requireAuthSecret()).update(secret).digest("hex");
}

export function apiSecretMatches(secret: string, secretHash: string) {
  const expected = Buffer.from(hashApiSecret(secret));
  const actual = Buffer.from(secretHash);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function parseScopes(scopesJson: string): ApiKeyScope[] {
  try {
    const parsed = JSON.parse(scopesJson) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ApiKeyScope => typeof item === "string" && isApiKeyScope(item));
  } catch {
    return [];
  }
}
