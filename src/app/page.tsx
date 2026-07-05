import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listRecentNotes } from "@/lib/notes";
import NotebookShell from "./notebook-shell";

type HomeProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const params = await searchParams;
  const noteError =
    params.error === "empty-note" ? "Write something before saving." : undefined;

  return <NotebookShell noteError={noteError} recentNotes={listRecentNotes()} />;
}
