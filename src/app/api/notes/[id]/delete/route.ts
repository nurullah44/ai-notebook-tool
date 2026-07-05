import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteNote } from "@/lib/notes";

type DeleteNoteRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: DeleteNoteRouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { id } = await params;

  deleteNote(id);

  return NextResponse.redirect(new URL("/", request.url), 303);
}
