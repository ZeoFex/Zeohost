import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apiSecretMatches, createApiKeyMaterial, normalizeScopes, parseApiToken } from "@/lib/security/api-key";

describe("api keys", () => {
  it("hashes the secret and keeps a public prefix", () => {
    process.env.AUTH_SECRET = "test-auth-secret-must-be-32-characters-min";
    const material = createApiKeyMaterial("DEVELOPMENT");
    const parsed = parseApiToken(material.token);
    assert.ok(parsed);
    assert.equal(parsed?.prefix, material.prefix);
    assert.equal(parsed?.environment, "DEVELOPMENT");
    assert.equal(apiSecretMatches(parsed!.secret, material.secretHash), true);
    assert.equal(apiSecretMatches("wrong-secret-value-not-the-key", material.secretHash), false);
    assert.equal(material.token.includes(material.secretHash), false);
    assert.match(material.prefix, /^zh_test_/);
  });

  it("creates production prefixes", () => {
    process.env.AUTH_SECRET = "test-auth-secret-must-be-32-characters-min";
    const material = createApiKeyMaterial("PRODUCTION");
    const parsed = parseApiToken(material.token);
    assert.ok(parsed);
    assert.equal(parsed?.environment, "PRODUCTION");
    assert.match(material.prefix, /^zh_live_/);
  });

  it("keeps only known scopes", () => {
    assert.deepEqual(normalizeScopes(["otp:send", "otp:send", "admin", "sms:read"]), ["otp:send", "sms:read"]);
  });

  it("rejects malformed tokens", () => {
    assert.equal(parseApiToken("zh_live_short"), null);
    assert.equal(parseApiToken("md_test_abcd1234_tooshort"), null);
  });
});
