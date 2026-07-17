import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_APP_URL,
  buildCaptureRequest,
  createSingleFlight,
  getCaptureErrorMessage,
  getCaptureEndpoint,
  normalizeSelection,
} from "./capture.js";

describe("selection validation", () => {
  it("trims selections and accepts the inclusive length limits", () => {
    expect(normalizeSelection("  abc  ")).toBe("abc");
    expect(normalizeSelection("a".repeat(5000))).toHaveLength(5000);
  });

  it("rejects selections outside the length limits", () => {
    expect(() => normalizeSelection("  ab  ")).toThrow("at least 3");
    expect(() => normalizeSelection("a".repeat(5001))).toThrow("at most 5000");
  });
});

describe("capture endpoint", () => {
  it("builds the local V1 endpoint", () => {
    expect(getCaptureEndpoint(`  ${DEFAULT_APP_URL}  `)).toBe(
      "http://localhost:3000/api/capture",
    );
  });

  it.each([
    "http://localhost:3000/",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
  ])("rejects unsupported app URL %s", (appUrl) => {
    expect(() => getCaptureEndpoint(appUrl)).toThrow(
      "App URL must be exactly http://localhost:3000.",
    );
  });
});

describe("capture request", () => {
  it("creates the authenticated JSON POST request", () => {
    expect(buildCaptureRequest("Selected idea", " capture-secret ")).toEqual({
      method: "POST",
      headers: {
        Authorization: "Bearer capture-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "Selected idea" }),
    });
  });

  it("rejects an empty capture token", () => {
    expect(() => buildCaptureRequest("Selected idea", "  ")).toThrow(
      "Add a capture token",
    );
  });

  it("uses the server error when one is available", async () => {
    const response = new Response(JSON.stringify({ error: "Invalid capture token." }), {
      status: 401,
    });

    await expect(getCaptureErrorMessage(response)).resolves.toBe(
      "Invalid capture token.",
    );
  });

  it("falls back to HTTP status for unreadable server errors", async () => {
    const response = new Response("not JSON", { status: 500 });

    await expect(getCaptureErrorMessage(response)).resolves.toBe(
      "Idea Store returned HTTP 500.",
    );
  });
});

describe("single-flight guard", () => {
  it("ignores a second call until the active request settles", async () => {
    let finishRequest;
    const task = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishRequest = resolve;
          }),
      )
      .mockResolvedValueOnce(undefined);
    const runOnce = createSingleFlight(task);

    const first = runOnce("first");

    expect(await runOnce("second")).toBe(false);
    expect(task).toHaveBeenCalledOnce();

    finishRequest();

    expect(await first).toBe(true);
    expect(await runOnce("third")).toBe(true);
    expect(task).toHaveBeenCalledTimes(2);
  });
});
