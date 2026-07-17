/* global chrome */

import { DEFAULT_APP_URL, normalizeAppUrl } from "./capture.js";

const form = document.querySelector("#settings-form");
const appUrlInput = document.querySelector("#app-url");
const captureTokenInput = document.querySelector("#capture-token");
const status = document.querySelector("#status");
const saveButton = form.querySelector("button[type='submit']");

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get({
      appUrl: DEFAULT_APP_URL,
      captureToken: "",
    });

    appUrlInput.value = settings.appUrl;
    captureTokenInput.value = settings.captureToken;
  } catch {
    showStatus("Could not load settings.", true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveButton.disabled = true;

  try {
    const appUrl = normalizeAppUrl(appUrlInput.value);
    const captureToken = captureTokenInput.value.trim();

    if (!captureToken) {
      throw new Error("Capture token is required.");
    }

    await chrome.storage.local.set({ appUrl, captureToken });
    appUrlInput.value = appUrl;
    captureTokenInput.value = captureToken;
    showStatus("Settings saved.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save settings.";
    showStatus(message, true);
  } finally {
    saveButton.disabled = false;
  }
});

void loadSettings();
