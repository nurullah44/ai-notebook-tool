import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSessionToken,
  isCaptureTokenValid,
  isPasswordValid,
  isSessionTokenValid,
} from "./auth";

describe("founder authentication", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts only the configured password", () => {
    vi.stubEnv("AUTH_PASSWORD", "correct-horse-battery-staple");

    expect(isPasswordValid("correct-horse-battery-staple")).toBe(true);
    expect(isPasswordValid("wrong-password")).toBe(false);
  });

  it("accepts only the configured extension capture token", () => {
    vi.stubEnv("EXTENSION_CAPTURE_TOKEN", "capture-token-with-enough-entropy");

    expect(isCaptureTokenValid("capture-token-with-enough-entropy")).toBe(true);
    expect(isCaptureTokenValid("wrong-token")).toBe(false);
    expect(isCaptureTokenValid("")).toBe(false);
  });

  it("rejects capture tokens when capture is not configured", () => {
    vi.stubEnv("EXTENSION_CAPTURE_TOKEN", "");

    expect(isCaptureTokenValid("any-token")).toBe(false);
  });

  it("accepts a signed session and rejects a modified session", () => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret-with-enough-entropy");

    const token = createSessionToken();
    const modifiedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    expect(isSessionTokenValid(token)).toBe(true);
    expect(isSessionTokenValid(modifiedToken)).toBe(false);
  });
});
