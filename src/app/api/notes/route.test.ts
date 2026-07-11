import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("@/lib/notes", () => ({
  createNote: vi.fn(),
  EmptyNoteError: class EmptyNoteError extends Error {},
}));

import { POST } from "./route";
import { createNote } from "@/lib/notes";

describe("note creation authorization", () => {
  it("redirects an unauthenticated request before writing a note", async () => {
    const response = await POST(
      new Request("http://localhost/api/notes", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(createNote).not.toHaveBeenCalled();
  });
});
