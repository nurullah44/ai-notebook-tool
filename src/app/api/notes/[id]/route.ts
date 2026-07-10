import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { logInfo, logWarn } from "@/lib/logger";
import { EmptyNoteError, updateNote } from "@/lib/notes";

type NoteRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: NoteRouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { id } = await params;
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  try {
    const note = updateNote(id, {
      title: typeof title === "string" ? title : "",
      body: typeof body === "string" ? body : "",
    });

    if (!note) {
      logWarn("notes.update_missing", { noteId: id });
      return NextResponse.redirect(new URL("/", request.url), 303);
    }

    logInfo("notes.updated", { noteId: note.id });

    return NextResponse.redirect(new URL(`/notes/${note.id}`, request.url), 303);
  } catch (error) {
    if (error instanceof EmptyNoteError) {
      logWarn("notes.update_rejected", { noteId: id, reason: "empty_body" });
      return NextResponse.redirect(
        new URL(`/notes/${id}?mode=edit&error=empty-note`, request.url),
        303,
      );
    }

    throw error;
  }
}
