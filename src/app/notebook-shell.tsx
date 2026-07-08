"use client";

import {
  ArrowClockwise,
  ArrowsOutSimple,
  Check,
  DotsThree,
  FileText,
  Feather,
  Gear,
  Hash,
  MagnifyingGlass,
  Paperclip,
  PencilSimple,
  Plus,
  SignOut,
  SidebarSimple,
  Sparkle,
  Tag,
  Trash,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { CurrentNote, RecentNote } from "@/lib/notes";
import styles from "./page.module.css";

const navItems = [
  { label: "Notes", icon: FileText, active: true, href: "/" },
  { label: "AI Recall", icon: Sparkle },
  { label: "Settings", icon: Gear },
];

const recallExamples = [
  "That idea about...",
  "What did I think about...",
  "Find the note about...",
];

type NotebookShellProps = {
  currentNote?: CurrentNote;
  mode?: "read" | "edit";
  noteError?: string;
  recentNotes: RecentNote[];
  searchQuery?: string;
};

type RecallMatch = {
  noteId: string;
  title: string;
  reason: string;
};

type RecallResult = {
  answer: string;
  matches: RecallMatch[];
};

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function isRecallMatch(value: unknown): value is RecallMatch {
  return (
    typeof value === "object" &&
    value !== null &&
    "noteId" in value &&
    "title" in value &&
    "reason" in value &&
    typeof value.noteId === "string" &&
    typeof value.title === "string" &&
    typeof value.reason === "string"
  );
}

export default function NotebookShell({
  currentNote,
  mode = "read",
  noteError,
  recentNotes,
  searchQuery = "",
}: NotebookShellProps) {
  const [isCreatingNote, setIsCreatingNote] = useState(Boolean(noteError));
  const [openRecentActionId, setOpenRecentActionId] = useState<string | null>(null);
  const [recallQuestion, setRecallQuestion] = useState("");
  const [recallResult, setRecallResult] = useState<RecallResult | null>(null);
  const [recallError, setRecallError] = useState<string | null>(null);
  const [isRecalling, setIsRecalling] = useState(false);
  const isExistingNote = Boolean(currentNote);
  const isEditingNote = isExistingNote && mode === "edit";
  const isReadingNote = isExistingNote && !isEditingNote;
  const showEditor = isExistingNote || isCreatingNote || Boolean(noteError);
  const formAction = currentNote ? `/api/notes/${currentNote.id}` : "/api/notes";
  const heading = isEditingNote ? "Edit Note" : isReadingNote ? "Saved Note" : "New Note";
  const statusText = isEditingNote
    ? "Editing draft"
    : isReadingNote
      ? "Saved note"
      : "Draft until saved";
  const hasSearchQuery = searchQuery.length > 0;
  const notesSectionTitle = hasSearchQuery ? "Search results" : "Recent notes";
  const emptyNotesMessage = hasSearchQuery ? "No matching notes" : "No saved notes yet";
  const wordCount = currentNote ? countWords(currentNote.body) : 0;
  const resetHomeUi = () => {
    setIsCreatingNote(false);
    setOpenRecentActionId(null);
  };
  const handleRecallSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = recallQuestion.trim();

    if (!question) {
      setRecallError("Write a rough memory first.");
      setRecallResult(null);
      return;
    }

    setIsRecalling(true);
    setRecallError(null);

    try {
      const response = await fetch("/api/ai/recall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });
      const payload = (await response.json()) as {
        answer?: unknown;
        error?: unknown;
        matches?: unknown;
      };

      if (!response.ok) {
        setRecallError(typeof payload.error === "string" ? payload.error : "Recall failed.");
        setRecallResult(null);
        return;
      }

      if (typeof payload.answer !== "string" || !Array.isArray(payload.matches)) {
        throw new Error("Invalid recall response.");
      }

      setRecallResult({
        answer: payload.answer,
        matches: payload.matches.filter(isRecallMatch),
      });
    } catch {
      setRecallError("Recall failed.");
      setRecallResult(null);
    } finally {
      setIsRecalling(false);
    }
  };

  return (
    <main className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Notebook navigation">
        <Link
          className={styles.logo}
          href="/"
          aria-label="AI Notebook home"
          onClick={resetHomeUi}
        >
          <span>
            <Feather size={28} weight="fill" />
          </span>
        </Link>

        <nav className={styles.navList}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return item.href ? (
              <Link
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
                href={item.href}
                key={item.label}
                onClick={resetHomeUi}
              >
                <Icon size={24} weight={item.active ? "duotone" : "regular"} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
                key={item.label}
                type="button"
              >
                <Icon size={24} weight={item.active ? "duotone" : "regular"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <form action="/api/logout" method="post" className={styles.logoutForm}>
            <button className={styles.logoutButton} type="submit">
              <SignOut size={24} />
              <span>Logout</span>
            </button>
          </form>
          <div className={styles.avatar} aria-label="Current user">
            <UserCircle size={38} weight="duotone" />
            <span />
          </div>
        </div>
      </aside>

      {showEditor ? (
        <form
          action={formAction}
          method="post"
          className={styles.editorPane}
          aria-label={isReadingNote ? "Saved note reader" : "Note editor"}
        >
          <header className={styles.editorTopbar}>
            <h1>{heading}</h1>

            <div className={styles.editorActions}>
              <button className={styles.iconButton} type="button" aria-label="More actions">
                <DotsThree size={24} weight="bold" />
              </button>
              <span className={styles.actionDivider} />
              <button className={styles.layoutButton} type="button" aria-label="Toggle panels">
                <SidebarSimple size={22} />
              </button>
              {isReadingNote && currentNote ? (
                <button
                  className={styles.deleteButton}
                  type="submit"
                  formAction={`/api/notes/${currentNote.id}/delete`}
                  formNoValidate
                  onClick={(event) => {
                    if (!window.confirm("Delete this note?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <Trash size={18} weight="bold" />
                  <span>Delete</span>
                </button>
              ) : null}
              {isReadingNote && currentNote ? (
                <Link className={styles.secondaryButton} href={`/notes/${currentNote.id}?mode=edit`}>
                  <PencilSimple size={18} weight="bold" />
                  <span>Edit</span>
                </Link>
              ) : null}
              {isEditingNote && currentNote ? (
                <Link className={styles.secondaryButton} href={`/notes/${currentNote.id}`}>
                  <X size={18} weight="bold" />
                  <span>Cancel</span>
                </Link>
              ) : null}
              {isReadingNote ? null : (
                <button className={styles.saveButton} type="submit">
                  <Check size={18} weight="bold" />
                  <span>{isEditingNote ? "Save changes" : "Save"}</span>
                </button>
              )}
              <p className={styles.savedStatus}>
                <span />
                {statusText}
              </p>
            </div>
          </header>

          <section className={styles.editorCard}>
            {noteError ? (
              <p className={styles.noteError} role="alert">
                {noteError}
              </p>
            ) : null}
            <input
              className={styles.titleInput}
              aria-label="Note title"
              name="title"
              placeholder="Note title (optional)"
              defaultValue={currentNote?.title}
              readOnly={isReadingNote}
            />

            <div className={styles.bodyFrame}>
              <textarea
                className={styles.bodyInput}
                aria-label="Note body"
                name="body"
                placeholder="Start writing your thoughts..."
                defaultValue={currentNote?.body}
                readOnly={isReadingNote}
                required={!isReadingNote}
              />

              <footer className={styles.editorToolbar}>
                <div className={styles.toolbarGroup}>
                  <button type="button" aria-label="Tags">
                    <Tag size={22} />
                  </button>
                  <button type="button" aria-label="Heading">
                    <Hash size={22} />
                  </button>
                  <button type="button" aria-label="Attach file">
                    <Paperclip size={22} />
                  </button>
                </div>

                <div className={styles.toolbarGroup}>
                  <span>{isReadingNote ? `${wordCount} words` : "Plain text"}</span>
                  <button type="button" aria-label="Undo">
                    <ArrowClockwise size={20} className={styles.undoIcon} />
                  </button>
                  <button type="button" aria-label="Redo">
                    <ArrowClockwise size={20} />
                  </button>
                  <button type="button" aria-label="Expand">
                    <ArrowsOutSimple size={20} />
                  </button>
                </div>
              </footer>
            </div>
          </section>
        </form>
      ) : (
        <section className={styles.startPane} aria-label="Create a note">
          <button
            className={styles.createNoteButton}
            type="button"
            aria-label="Create new note"
            onClick={() => setIsCreatingNote(true)}
          >
            <Plus size={70} weight="bold" />
          </button>
        </section>
      )}

      <aside className={styles.inspector} aria-label="Search, recent notes, and AI recall">
        <section className={styles.searchSection}>
          <h2>Quick search</h2>
          <form className={styles.searchField} action="/" method="get">
            <button className={styles.searchButton} type="submit" aria-label="Search notes">
              <MagnifyingGlass size={24} />
            </button>
            <input
              aria-label="Search notes"
              defaultValue={searchQuery}
              key={searchQuery}
              name="q"
              placeholder="Search your notes..."
            />
          </form>
        </section>

        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2>{notesSectionTitle}</h2>
            {hasSearchQuery ? (
              <Link href="/">Clear</Link>
            ) : (
              <button type="button">View all</button>
            )}
          </div>

          <div className={styles.recentList}>
            {recentNotes.length === 0 ? (
              <p className={styles.emptyState}>{emptyNotesMessage}</p>
            ) : (
              recentNotes.map((note) => (
                <article
                  className={`${styles.recentRow} ${
                    currentNote?.id === note.id ? styles.recentRowActive : ""
                  }`}
                  key={note.id}
                >
                  <div className={styles.fileIcon}>
                    <FileText size={18} />
                  </div>
                  <h3>
                    <Link className={styles.recentTitle} href={`/notes/${note.id}`}>
                      {note.title}
                    </Link>
                  </h3>
                  <time dateTime={note.updatedAt}>{note.updatedAtLabel}</time>
                  {openRecentActionId === note.id ? (
                    <form
                      action={`/api/notes/${note.id}/delete`}
                      className={styles.recentDeleteForm}
                      method="post"
                    >
                      <button
                        className={styles.recentDeleteButton}
                        type="submit"
                        aria-label={`Delete ${note.title}`}
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      aria-label={`More actions for ${note.title}`}
                      onClick={() => setOpenRecentActionId(note.id)}
                    >
                      <DotsThree size={20} weight="bold" />
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        <section className={styles.recallSection}>
          <div className={styles.recallHeader}>
            <div>
              <Sparkle size={22} weight="fill" />
              <h2>AI rough recall</h2>
            </div>
            <button type="button" aria-label="Collapse AI recall">
              ^
            </button>
          </div>

          <form className={styles.recallField} onSubmit={handleRecallSubmit}>
            <textarea
              aria-label="AI rough recall"
              onChange={(event) => setRecallQuestion(event.target.value)}
              placeholder="What are you trying to recall?"
              value={recallQuestion}
            />
            <button type="submit" aria-label="Ask AI" disabled={isRecalling}>
              <Sparkle size={18} weight="fill" />
            </button>
          </form>

          {recallError ? (
            <p className={styles.recallError} role="alert">
              {recallError}
            </p>
          ) : null}

          {recallResult ? (
            <div className={styles.recallResult}>
              <p>{recallResult.answer}</p>
              {recallResult.matches.length > 0 ? (
                <ol>
                  {recallResult.matches.map((match) => (
                    <li key={match.noteId}>
                      <Link href={`/notes/${match.noteId}`}>{match.title}</Link>
                      <span>{match.reason}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}

          <div className={styles.examples}>
            <p>Try examples</p>
            <div>
              {recallExamples.map((example) => (
                <button
                  type="button"
                  key={example}
                  onClick={() => {
                    setRecallQuestion(example);
                    setRecallError(null);
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}
