import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";

const TEST_TEXT = "A selected product idea worth capturing.";

let installedListener;
let contextMenuClickListener;
let chromeMock;
let originalChrome;
let originalFetch;
let originalSetTimeout;
let originalClearTimeout;
let importNumber = 0;

async function importBackground() {
  importNumber += 1;
  await import(`./background.js?test=${importNumber}`);
}

async function waitForCall(mockFunction, expectedCalls = 1) {
  for (
    let attempt = 0;
    attempt < 20 && mockFunction.mock.calls.length < expectedCalls;
    attempt += 1
  ) {
    await Promise.resolve();
  }

  assert.equal(mockFunction.mock.calls.length, expectedCalls);
}

describe("Idea Store extension service worker", () => {
  beforeEach(() => {
    originalChrome = globalThis.chrome;
    originalFetch = globalThis.fetch;
    originalSetTimeout = globalThis.setTimeout;
    originalClearTimeout = globalThis.clearTimeout;
    globalThis.setTimeout = mock.fn(() => 1);
    globalThis.clearTimeout = mock.fn();
    installedListener = undefined;
    contextMenuClickListener = undefined;
    chromeMock = {
      action: {
        setBadgeBackgroundColor: mock.fn(async () => undefined),
        setBadgeText: mock.fn(async () => undefined),
        setTitle: mock.fn(async () => undefined),
      },
      contextMenus: {
        create: mock.fn(),
        onClicked: {
          addListener: mock.fn((listener) => {
            contextMenuClickListener = listener;
          }),
        },
        removeAll: mock.fn((callback) => callback()),
      },
      runtime: {
        onInstalled: {
          addListener: mock.fn((listener) => {
            installedListener = listener;
          }),
        },
      },
      storage: {
        local: {
          get: mock.fn(async () => ({
            appUrl: "http://localhost:3000",
            captureToken: "test-capture-token",
          })),
        },
      },
    };

    globalThis.chrome = chromeMock;
  });

  afterEach(() => {
    globalThis.chrome = originalChrome;
    globalThis.fetch = originalFetch;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  });

  it("registers one context-menu action for selected text", async () => {
    await importBackground();

    assert.equal(typeof installedListener, "function");
    installedListener();

    assert.deepEqual(chromeMock.contextMenus.create.mock.calls[0].arguments, [{
      id: "save-to-idea-store",
      title: "Save to Idea Store",
      contexts: ["selection"],
    }]);
  });

  it("sends an authenticated request and shows success status", async () => {
    const fetchMock = mock.fn(async () =>
      new Response(JSON.stringify({ id: "note-1", title: "Captured Idea" }), {
        status: 201,
      }),
    );
    globalThis.fetch = fetchMock;
    await importBackground();

    contextMenuClickListener({
      menuItemId: "save-to-idea-store",
      selectionText: TEST_TEXT,
    });
    await waitForCall(fetchMock);

    assert.deepEqual(fetchMock.mock.calls[0].arguments, [
      "http://localhost:3000/api/capture",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-capture-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: TEST_TEXT }),
      },
    ]);

    await waitForCall(chromeMock.action.setTitle, 2);
    assert.deepEqual(chromeMock.action.setBadgeText.mock.calls[0].arguments, [{ text: "..." }]);
    assert.deepEqual(chromeMock.action.setBadgeText.mock.calls[1].arguments, [{ text: "\u2713" }]);
    assert.deepEqual(chromeMock.action.setTitle.mock.calls.at(-1).arguments, [{
      title: "Selection saved to Idea Store.",
    }]);

    await waitForCall(globalThis.setTimeout);
    globalThis.setTimeout.mock.calls[0].arguments[0]();
    await waitForCall(chromeMock.action.setBadgeText, 3);
    assert.deepEqual(chromeMock.action.setBadgeText.mock.calls.at(-1).arguments, [{ text: "" }]);
  });

  it("shows the server error in the failure tooltip", async () => {
    globalThis.fetch = mock.fn(async () =>
      new Response(JSON.stringify({ error: "Invalid capture token." }), {
        status: 401,
      }),
    );
    await importBackground();

    contextMenuClickListener({
      menuItemId: "save-to-idea-store",
      selectionText: TEST_TEXT,
    });
    await waitForCall(chromeMock.action.setTitle, 2);

    assert.deepEqual(chromeMock.action.setBadgeText.mock.calls.at(-1).arguments, [{ text: "!" }]);
    assert.deepEqual(chromeMock.action.setTitle.mock.calls.at(-1).arguments, [{
      title: "Idea Store capture failed: Invalid capture token.",
    }]);
    await waitForCall(globalThis.setTimeout);
  });

  it("ignores another capture while the first request is active", async () => {
    let finishRequest;
    const fetchMock = mock.fn(
      () =>
        new Promise((resolve) => {
          finishRequest = () => resolve(new Response("{}", { status: 201 }));
        }),
    );
    globalThis.fetch = fetchMock;
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

    assert.equal(fetchMock.mock.calls.length, 1);
    finishRequest();
    await waitForCall(chromeMock.action.setTitle, 2);
    await waitForCall(globalThis.setTimeout);
  });
});
