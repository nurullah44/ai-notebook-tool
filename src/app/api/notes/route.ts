import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createNote, EmptyNoteError } from "@/lib/notes";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  try {
    const note = createNote({
      title: typeof title === "string" ? title : "",
      body: typeof body === "string" ? body : "",
    });

    if (!note) {
      return NextResponse.redirect(new URL("/?error=save-failed", request.url), 303);
    }

    return NextResponse.redirect(new URL(`/notes/${note.id}`, request.url), 303);
  } catch (error) {
    if (error instanceof EmptyNoteError) {
      return NextResponse.redirect(new URL("/?error=empty-note", request.url), 303);
    }

    throw error;
  }
}
