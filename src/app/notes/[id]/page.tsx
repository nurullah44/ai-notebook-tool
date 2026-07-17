import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getNote, listRecentNotes } from "@/lib/notes";
import NotebookShell from "../../notebook-shell";

type NotePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    mode?: string;
  }>;
};

export default async function NotePage({ params, searchParams }: NotePageProps) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const { id } = await params;
  const query = await searchParams;
  const note = getNote(id);

  if (!note) {
    notFound();
  }

  const noteError =
    query.error === "empty-note" ? "Write something before saving." : undefined;
  const mode = query.mode === "edit" ? "edit" : "read";

  return (
    <NotebookShell
      key={`${note.id}-${mode}`}
      currentNote={note}
      mode={mode}
      noteError={noteError}
      recentNotes={listRecentNotes(100)}
    />
  );
}
