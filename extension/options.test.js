import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";

let submitListener;
let appUrlInput;
let captureTokenInput;
let saveButton;
let status;
let storageGet;
let storageSet;
let originalChrome;
let originalDocument;
let importNumber = 0;

async function loadOptions() {
  importNumber += 1;
  await import(`./options.js?test=${importNumber}`);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await Promise.resolve();
  }
}

describe("Idea Store extension options", () => {
  beforeEach(() => {
    originalChrome = globalThis.chrome;
    originalDocument = globalThis.document;
    submitListener = undefined;
    appUrlInput = { value: "" };
    captureTokenInput = { value: "" };
    saveButton = { disabled: false };
    status = {
      textContent: "",
      classList: { toggle: mock.fn() },
    };
    const form = {
      addEventListener: mock.fn((_event, listener) => {
        submitListener = listener;
      }),
      querySelector: mock.fn(() => saveButton),
    };
    const elements = new Map([
      ["#settings-form", form],
      ["#app-url", appUrlInput],
      ["#capture-token", captureTokenInput],
      ["#status", status],
    ]);
    storageGet = mock.fn(async () => ({
      appUrl: "http://localhost:3000",
      captureToken: "stored-capture-token",
    }));
    storageSet = mock.fn(async () => undefined);

    globalThis.document = {
      querySelector: mock.fn((selector) => elements.get(selector)),
    };
    globalThis.chrome = {
      storage: { local: { get: storageGet, set: storageSet } },
    };
  });

  afterEach(() => {
    globalThis.chrome = originalChrome;
    globalThis.document = originalDocument;
  });

  it("loads saved URL and token from local extension storage", async () => {
    await loadOptions();

    assert.equal(appUrlInput.value, "http://localhost:4318");
    assert.equal(captureTokenInput.value, "stored-capture-token");
  });

  it("trims and saves valid settings", async () => {
    await loadOptions();
    appUrlInput.value = "  http://localhost:4318  ";
    captureTokenInput.value = "  new-capture-token  ";

    await submitListener({ preventDefault: mock.fn() });

    assert.deepEqual(storageSet.mock.calls[0].arguments, [{
      appUrl: "http://localhost:4318",
      captureToken: "new-capture-token",
    }]);
    assert.equal(status.textContent, "Settings saved.");
    assert.equal(saveButton.disabled, false);
  });

  it("rejects an empty capture token", async () => {
    await loadOptions();
    captureTokenInput.value = "   ";

    await submitListener({ preventDefault: mock.fn() });

    assert.equal(storageSet.mock.calls.length, 0);
    assert.equal(status.textContent, "Capture token is required.");
    assert.deepEqual(status.classList.toggle.mock.calls.at(-1).arguments, [
      "error",
      true,
    ]);
  });
});
