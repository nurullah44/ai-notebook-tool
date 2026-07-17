import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "ai_notebook_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const SESSION_PAYLOAD = "single-user";

type SessionPayload = {
  sub: typeof SESSION_PAYLOAD;
  exp: number;
};

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
  const payload = Buffer.from(
    JSON.stringify({
      sub: SESSION_PAYLOAD,
      exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    } satisfies SessionPayload),
  ).toString("base64url");

  return `${payload}.${signSessionPayload(payload, getRequiredEnv("SESSION_SECRET"))}`;
}

export function isPasswordValid(password: string) {
  return constantTimeEqual(password, getRequiredEnv("AUTH_PASSWORD"));
}

export function isCaptureTokenValid(token: string) {
  const captureToken = process.env.EXTENSION_CAPTURE_TOKEN;

  if (!captureToken || !token) {
    return false;
  }

  return constantTimeEqual(token, captureToken);
}

export function isSessionTokenValid(token: string) {
  const sessionSecret = process.env.SESSION_SECRET;
  const [payload, signature, extra] = token.split(".");

  if (!sessionSecret || extra || !payload || !signature) {
    return false;
  }

  if (!constantTimeEqual(signature, signSessionPayload(payload, sessionSecret))) {
    return false;
  }

  try {
    const parsedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    return parsedPayload.sub === SESSION_PAYLOAD && Date.now() < Number(parsedPayload.exp);
  } catch {
    return false;
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return false;
  }

  return isSessionTokenValid(sessionToken);
}
