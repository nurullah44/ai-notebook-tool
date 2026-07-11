import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, isPasswordValid, isSessionTokenValid } from "./auth";

describe("founder authentication", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts only the configured password", () => {
    vi.stubEnv("AUTH_PASSWORD", "correct-horse-battery-staple");

    expect(isPasswordValid("correct-horse-battery-staple")).toBe(true);
    expect(isPasswordValid("wrong-password")).toBe(false);
  });

  it("accepts a signed session and rejects a modified session", () => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret-with-enough-entropy");

    const token = createSessionToken();
    const modifiedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    expect(isSessionTokenValid(token)).toBe(true);
    expect(isSessionTokenValid(modifiedToken)).toBe(false);
  });
});
