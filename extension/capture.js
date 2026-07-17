export const DEFAULT_APP_URL = "http://localhost:3000";
export const MIN_SELECTION_LENGTH = 3;
export const MAX_SELECTION_LENGTH = 5000;

export function normalizeSelection(value) {
  const text = typeof value === "string" ? value.trim() : "";

  if (text.length < MIN_SELECTION_LENGTH) {
    throw new Error(`Selection must be at least ${MIN_SELECTION_LENGTH} characters.`);
  }

  if (text.length > MAX_SELECTION_LENGTH) {
    throw new Error(`Selection must be at most ${MAX_SELECTION_LENGTH} characters.`);
  }

  return text;
}

export function normalizeAppUrl(value) {
  const appUrl = typeof value === "string" ? value.trim() : "";

  if (appUrl !== DEFAULT_APP_URL) {
    throw new Error(`App URL must be exactly ${DEFAULT_APP_URL}.`);
  }

  return appUrl;
}

export function getCaptureEndpoint(appUrl) {
  return `${normalizeAppUrl(appUrl)}/api/capture`;
}

export function buildCaptureRequest(text, captureToken) {
  const token = typeof captureToken === "string" ? captureToken.trim() : "";

  if (!token) {
    throw new Error("Add a capture token in the extension options.");
  }

  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  };
}

export async function getCaptureErrorMessage(response) {
  try {
    const body = await response.json();

    if (typeof body?.error === "string" && body.error.trim()) {
      return body.error.trim();
    }
  } catch {
    // Fall back to status when server response is not JSON.
  }

  return `Idea Store returned HTTP ${response.status}.`;
}

export function createSingleFlight(task) {
  let active = false;

  return async (...args) => {
    if (active) {
      return false;
    }

    active = true;

    try {
      await task(...args);
      return true;
    } finally {
      active = false;
    }
  };
}
