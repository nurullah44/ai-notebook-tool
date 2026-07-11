import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listRecentNotes, searchNotes } from "@/lib/notes";
import NotebookShell from "./notebook-shell";

type HomeProps = {
  searchParams: Promise<{
    error?: string;
    q?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const params = await searchParams;
  const noteError =
    params.error === "empty-note" ? "Write something before saving." : undefined;
  const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
  const notes = searchQuery ? searchNotes(searchQuery, 100) : listRecentNotes(100);

  return (
    <NotebookShell
      noteError={noteError}
      recentNotes={notes}
      searchQuery={searchQuery}
    />
  );
}
