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
  PlusSquare,
  SignOut,
  SidebarSimple,
  Sparkle,
  Tag,
  Trash,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { CurrentNote, RecentNote } from "@/lib/notes";
import styles from "./page.module.css";

const navItems = [
  { label: "Notes", icon: FileText, active: true },
  { label: "Search", icon: MagnifyingGlass },
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
};

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export default function NotebookShell({
  currentNote,
  mode = "read",
  noteError,
  recentNotes,
}: NotebookShellProps) {
  const isExistingNote = Boolean(currentNote);
  const isEditingNote = isExistingNote && mode === "edit";
  const isReadingNote = isExistingNote && !isEditingNote;
  const formAction = currentNote ? `/api/notes/${currentNote.id}` : "/api/notes";
  const heading = isEditingNote ? "Edit Note" : isReadingNote ? "Saved Note" : "New Note";
  const statusText = isEditingNote
    ? "Editing draft"
    : isReadingNote
      ? "Saved note"
      : "Draft until saved";
  const wordCount = currentNote ? countWords(currentNote.body) : 0;

  return (
    <main className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Notebook navigation">
        <div className={styles.logo} aria-label="AI Notebook">
          <span>
            <Feather size={28} weight="fill" />
          </span>
        </div>

        <nav className={styles.navList}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
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
          <Link className={styles.newNoteButton} href="/">
            <PlusSquare size={24} />
            <span>New Note</span>
          </Link>
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

      <aside className={styles.inspector} aria-label="Search, recent notes, and AI recall">
        <section className={styles.searchSection}>
          <h2>Quick search</h2>
          <label className={styles.searchField}>
            <MagnifyingGlass size={24} />
            <input aria-label="Search notes" placeholder="Search your notes..." />
            <kbd>Ctrl K</kbd>
          </label>
        </section>

        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2>Recent notes</h2>
            <button type="button">View all</button>
          </div>

          <div className={styles.recentList}>
            {recentNotes.length === 0 ? (
              <p className={styles.emptyState}>No saved notes yet</p>
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
                  <button type="button" aria-label={`More actions for ${note.title}`}>
                    <DotsThree size={20} weight="bold" />
                  </button>
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

          <label className={styles.recallField}>
            <textarea
              aria-label="AI rough recall"
              placeholder="What are you trying to recall?"
            />
            <button type="button" aria-label="Ask AI">
              <Sparkle size={18} weight="fill" />
            </button>
          </label>

          <div className={styles.examples}>
            <p>Try examples</p>
            <div>
              {recallExamples.map((example) => (
                <button type="button" key={example}>
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
