import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let submitListener;
let appUrlInput;
let captureTokenInput;
let saveButton;
let status;
let storageGet;
let storageSet;

async function loadOptions() {
  await import("./options.js");

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await Promise.resolve();
  }
}

describe("Idea Store extension options", () => {
  beforeEach(() => {
    vi.resetModules();
    submitListener = undefined;
    appUrlInput = { value: "" };
    captureTokenInput = { value: "" };
    saveButton = { disabled: false };
    status = {
      textContent: "",
      classList: { toggle: vi.fn() },
    };
    const form = {
      addEventListener: vi.fn((_event, listener) => {
        submitListener = listener;
      }),
      querySelector: vi.fn(() => saveButton),
    };
    const elements = new Map([
      ["#settings-form", form],
      ["#app-url", appUrlInput],
      ["#capture-token", captureTokenInput],
      ["#status", status],
    ]);
    storageGet = vi.fn().mockResolvedValue({
      appUrl: "http://localhost:3000",
      captureToken: "stored-capture-token",
    });
    storageSet = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("document", {
      querySelector: vi.fn((selector) => elements.get(selector)),
    });
    vi.stubGlobal("chrome", {
      storage: { local: { get: storageGet, set: storageSet } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads saved URL and token from local extension storage", async () => {
    await loadOptions();

    expect(appUrlInput.value).toBe("http://localhost:3000");
    expect(captureTokenInput.value).toBe("stored-capture-token");
  });

  it("trims and saves valid settings", async () => {
    await loadOptions();
    appUrlInput.value = "  http://localhost:3000  ";
    captureTokenInput.value = "  new-capture-token  ";

    await submitListener({ preventDefault: vi.fn() });

    expect(storageSet).toHaveBeenCalledWith({
      appUrl: "http://localhost:3000",
      captureToken: "new-capture-token",
    });
    expect(status.textContent).toBe("Settings saved.");
    expect(saveButton.disabled).toBe(false);
  });

  it("rejects an empty capture token", async () => {
    await loadOptions();
    captureTokenInput.value = "   ";

    await submitListener({ preventDefault: vi.fn() });

    expect(storageSet).not.toHaveBeenCalled();
    expect(status.textContent).toBe("Capture token is required.");
    expect(status.classList.toggle).toHaveBeenLastCalledWith("error", true);
  });
});
