import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "ai_notebook_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const SESSION_PAYLOAD = "single-user";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

function constantTimeEqual(left: string, right: string) {
  return timingSafeEqual(hash(left), hash(right));
}

function signSessionPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken() {
  return `${SESSION_PAYLOAD}.${signSessionPayload(
    SESSION_PAYLOAD,
    getRequiredEnv("SESSION_SECRET"),
  )}`;
}

export function isPasswordValid(password: string) {
  return constantTimeEqual(password, getRequiredEnv("AUTH_PASSWORD"));
}

export function isSessionTokenValid(token: string) {
  const sessionSecret = process.env.SESSION_SECRET;
  const [payload, signature, extra] = token.split(".");

  if (!sessionSecret || extra || payload !== SESSION_PAYLOAD || !signature) {
    return false;
  }

  return constantTimeEqual(signature, signSessionPayload(payload, sessionSecret));
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return false;
  }

  return isSessionTokenValid(sessionToken);
}
