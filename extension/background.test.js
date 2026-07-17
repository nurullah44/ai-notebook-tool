import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_TEXT = "A selected product idea worth capturing.";

let installedListener;
let contextMenuClickListener;
let chromeMock;

async function importBackground() {
  await import("./background.js");
}

async function waitForCall(mock, expectedCalls = 1) {
  for (let attempt = 0; attempt < 20 && mock.mock.calls.length < expectedCalls; attempt += 1) {
    await Promise.resolve();
  }

  expect(mock).toHaveBeenCalledTimes(expectedCalls);
}

describe("Idea Store extension service worker", () => {
  beforeEach(() => {
    vi.resetModules();
    installedListener = undefined;
    contextMenuClickListener = undefined;
    chromeMock = {
      action: {
        setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
        setBadgeText: vi.fn().mockResolvedValue(undefined),
        setTitle: vi.fn().mockResolvedValue(undefined),
      },
      contextMenus: {
        create: vi.fn(),
        onClicked: {
          addListener: vi.fn((listener) => {
            contextMenuClickListener = listener;
          }),
        },
        removeAll: vi.fn((callback) => callback()),
      },
      runtime: {
        onInstalled: {
          addListener: vi.fn((listener) => {
            installedListener = listener;
          }),
        },
      },
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({
            appUrl: "http://localhost:3000",
            captureToken: "test-capture-token",
          }),
        },
      },
    };

    vi.stubGlobal("chrome", chromeMock);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("registers one context-menu action for selected text", async () => {
    await importBackground();

    expect(installedListener).toBeTypeOf("function");
    installedListener();

    expect(chromeMock.contextMenus.create).toHaveBeenCalledWith({
      id: "save-to-idea-store",
      title: "Save to Idea Store",
      contexts: ["selection"],
    });
  });

  it("sends an authenticated request and shows success status", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "note-1", title: "Captured Idea" }), {
        status: 201,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await importBackground();

    contextMenuClickListener({
      menuItemId: "save-to-idea-store",
      selectionText: TEST_TEXT,
    });
    await waitForCall(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/capture",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-capture-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: TEST_TEXT }),
      },
    );

    await waitForCall(chromeMock.action.setTitle, 2);
    expect(chromeMock.action.setBadgeText).toHaveBeenNthCalledWith(1, { text: "..." });
    expect(chromeMock.action.setBadgeText).toHaveBeenNthCalledWith(2, {
      text: "\u2713",
    });
    expect(chromeMock.action.setTitle).toHaveBeenLastCalledWith({
      title: "Selection saved to Idea Store.",
    });

    await vi.advanceTimersByTimeAsync(3_000);
    expect(chromeMock.action.setBadgeText).toHaveBeenLastCalledWith({ text: "" });
  });

  it("shows the server error in the failure tooltip", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Invalid capture token." }), {
          status: 401,
        }),
      ),
    );
    await importBackground();

    contextMenuClickListener({
      menuItemId: "save-to-idea-store",
      selectionText: TEST_TEXT,
    });
    await waitForCall(chromeMock.action.setTitle, 2);

    expect(chromeMock.action.setBadgeText).toHaveBeenLastCalledWith({ text: "!" });
    expect(chromeMock.action.setTitle).toHaveBeenLastCalledWith({
      title: "Idea Store capture failed: Invalid capture token.",
    });
  });

  it("ignores another capture while the first request is active", async () => {
    let finishRequest;
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finishRequest = () => resolve(new Response("{}", { status: 201 }));
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await importBackground();

    contextMenuClickListener({
      menuItemId: "save-to-idea-store",
      selectionText: TEST_TEXT,
    });
    contextMenuClickListener({
      menuItemId: "save-to-idea-store",
      selectionText: "A second selected idea that must be ignored.",
    });
    await waitForCall(fetchMock);

    expect(fetchMock).toHaveBeenCalledOnce();
    finishRequest();
    await waitForCall(chromeMock.action.setTitle, 2);
  });
});
