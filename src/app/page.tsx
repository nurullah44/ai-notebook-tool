import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import NotebookShell from "./notebook-shell";

export default async function Home() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return <NotebookShell />;
}
