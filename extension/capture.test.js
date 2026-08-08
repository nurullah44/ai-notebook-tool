import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
    assert.equal(normalizeSelection("  abc  "), "abc");
    assert.equal(normalizeSelection("a".repeat(5000)).length, 5000);
  });

  it("rejects selections outside the length limits", () => {
    assert.throws(() => normalizeSelection("  ab  "), /at least 3/);
    assert.throws(() => normalizeSelection("a".repeat(5001)), /at most 5000/);
  });
});

describe("capture endpoint", () => {
  it("builds the local V1 endpoint", () => {
    assert.equal(
      getCaptureEndpoint(`  ${DEFAULT_APP_URL}  `),
      "http://localhost:3000/api/capture",
    );
  });

  for (const appUrl of [
    "http://localhost:3000/",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
  ]) {
    it(`rejects unsupported app URL ${appUrl}`, () => {
      assert.throws(
        () => getCaptureEndpoint(appUrl),
        /App URL must be exactly http:\/\/localhost:3000\./,
      );
    });
  }
});

describe("capture request", () => {
  it("creates the authenticated JSON POST request", () => {
    assert.deepEqual(buildCaptureRequest("Selected idea", " capture-secret "), {
      method: "POST",
      headers: {
        Authorization: "Bearer capture-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "Selected idea" }),
    });
  });

  it("rejects an empty capture token", () => {
    assert.throws(
      () => buildCaptureRequest("Selected idea", "  "),
      /Add a capture token/,
    );
  });

  it("uses the server error when one is available", async () => {
    const response = new Response(JSON.stringify({ error: "Invalid capture token." }), {
      status: 401,
    });

    assert.equal(await getCaptureErrorMessage(response), "Invalid capture token.");
  });

  it("falls back to HTTP status for unreadable server errors", async () => {
    const response = new Response("not JSON", { status: 500 });

    assert.equal(
      await getCaptureErrorMessage(response),
      "Idea Store returned HTTP 500.",
    );
  });
});

describe("single-flight guard", () => {
  it("ignores a second call until the active request settles", async () => {
    let finishRequest;
    const calls = [];
    const task = (value) => {
      calls.push(value);

      if (calls.length === 1) {
        return new Promise((resolve) => {
          finishRequest = resolve;
        });
      }

      return Promise.resolve();
    };
    const runOnce = createSingleFlight(task);

    const first = runOnce("first");

    assert.equal(await runOnce("second"), false);
    assert.deepEqual(calls, ["first"]);

    finishRequest();

    assert.equal(await first, true);
    assert.equal(await runOnce("third"), true);
    assert.deepEqual(calls, ["first", "third"]);
  });
});
