import { NextResponse } from "next/server";
import {
  createSessionToken,
  isPasswordValid,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { logInfo, logWarn } from "@/lib/logger";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");

  if (typeof password !== "string" || !isPasswordValid(password)) {
    logWarn("auth.login_failed");
    return NextResponse.redirect(new URL("/login?error=wrong", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  logInfo("auth.login_success");

  return response;
}
