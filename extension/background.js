/* global chrome */

import {
  DEFAULT_APP_URL,
  buildCaptureRequest,
  createSingleFlight,
  getCaptureErrorMessage,
  getCaptureEndpoint,
  normalizeSelection,
} from "./capture.js";

const MENU_ID = "save-to-idea-store";
const DEFAULT_TITLE = "Idea Store capture status";
const BADGE_CLEAR_DELAY_MS = 3000;

let clearBadgeTimer;

function errorMessage(error) {
  return error instanceof Error ? error.message : "Unknown capture error.";
}

async function clearBadge() {
  await Promise.all([
    chrome.action.setBadgeText({ text: "" }),
    chrome.action.setTitle({ title: DEFAULT_TITLE }),
  ]);
}

async function showBadge({ text, color, title, clearLater = false }) {
  clearTimeout(clearBadgeTimer);

  await Promise.all([
    chrome.action.setBadgeText({ text }),
    chrome.action.setBadgeBackgroundColor({ color }),
    chrome.action.setTitle({ title }),
  ]);

  if (clearLater) {
    clearBadgeTimer = setTimeout(() => {
      void clearBadge();
    }, BADGE_CLEAR_DELAY_MS);
  }
}

const captureSelection = createSingleFlight(async (selectionText) => {
  await showBadge({
    text: "...",
    color: "#475569",
    title: "Saving selection to Idea Store...",
  });

  try {
    const text = normalizeSelection(selectionText);
    const settings = await chrome.storage.local.get({
      appUrl: DEFAULT_APP_URL,
      captureToken: "",
    });
    const response = await fetch(
      getCaptureEndpoint(settings.appUrl),
      buildCaptureRequest(text, settings.captureToken),
    );

    if (!response.ok) {
      throw new Error(await getCaptureErrorMessage(response));
    }

    await showBadge({
      text: "\u2713",
      color: "#15803d",
      title: "Selection saved to Idea Store.",
      clearLater: true,
    });
  } catch (error) {
    await showBadge({
      text: "!",
      color: "#b91c1c",
      title: `Idea Store capture failed: ${errorMessage(error)}`,
      clearLater: true,
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Save to Idea Store",
      contexts: ["selection"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  void captureSelection(info.selectionText);
});
