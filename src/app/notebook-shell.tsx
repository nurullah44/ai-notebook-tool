"use client";

import {
  ArrowRight,
  ArrowsClockwise,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  SignOut,
  Sparkle,
  Trash,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import type { CurrentNote, RecentNote } from "@/lib/notes";
import styles from "./page.module.css";

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

function stopOverlayClose(event: MouseEvent<HTMLElement>) {
  event.stopPropagation();
}

export default function NotebookShell({
  currentNote,
  mode = "read",
  noteError,
  recentNotes,
  searchQuery = "",
}: NotebookShellProps) {
  const ideas = useMemo(() => {
    if (!currentNote || recentNotes.some((note) => note.id === currentNote.id)) return recentNotes;
    return [
      {
        id: currentNote.id,
        title: currentNote.title || "Untitled idea",
        body: currentNote.body,
        updatedAt: currentNote.updatedAt,
        updatedAtLabel: "Selected idea",
      },
      ...recentNotes,
    ];
  }, [currentNote, recentNotes]);
  const selectedIndex = currentNote ? Math.max(0, ideas.findIndex((idea) => idea.id === currentNote.id)) : 0;
  const batchStart = selectedIndex;
  const [visibleCount, setVisibleCount] = useState(3);
  const [flipped, setFlipped] = useState<Set<string>>(
    () => new Set(currentNote && mode === "read" ? [currentNote.id] : []),
  );
  const [searchOpen, setSearchOpen] = useState(Boolean(searchQuery));
  const [searchMode, setSearchMode] = useState<"keyword" | "ai">("keyword");
  const [query, setQuery] = useState(searchQuery);
  const [composerOpen, setComposerOpen] = useState(Boolean(noteError) || mode === "edit");
  const [composerPurpose, setComposerPurpose] = useState<"create" | "edit">(
    currentNote && mode === "edit" ? "edit" : "create",
  );
  const [draftBody, setDraftBody] = useState(currentNote && mode === "edit" ? currentNote.body : "");
  const [recallMatches, setRecallMatches] = useState<RecallMatch[]>([]);
  const [recallError, setRecallError] = useState<string | null>(null);
  const [isRecalling, setIsRecalling] = useState(false);

  const orderedIdeas = useMemo(
    () => [...ideas.slice(batchStart), ...ideas.slice(0, batchStart)],
    [ideas, batchStart],
  );
  const visibleIdeas = orderedIdeas.slice(0, visibleCount);

  useEffect(() => {
    function loadNearBottom() {
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      if (window.scrollY > 150 && nearBottom) {
        setVisibleCount((current) => Math.min(current + 3, ideas.length));
      }
    }
    window.addEventListener("scroll", loadNearBottom, { passive: true });
    return () => window.removeEventListener("scroll", loadNearBottom);
  }, [ideas.length]);

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    setRecallMatches([]);
    setRecallError(null);
  }

  function openNewIdea() {
    setComposerPurpose("create");
    setDraftBody("");
    setComposerOpen(true);
  }

  function flipIdea(id: string) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flipIdea(id);
    }
  }

  async function handleAiSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = query.trim();
    if (!question) return;
    setIsRecalling(true);
    setRecallError(null);
    try {
      const response = await fetch("/api/ai/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const payload = (await response.json()) as { error?: unknown; matches?: unknown };
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "AI search failed.");
      if (!Array.isArray(payload.matches)) throw new Error("AI search returned an invalid result.");
      setRecallMatches(payload.matches.slice(0, 3) as RecallMatch[]);
    } catch (error) {
      setRecallMatches([]);
      setRecallError(error instanceof Error ? error.message : "AI search failed.");
    } finally {
      setIsRecalling(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Idea Store home">
          <span>IS</span>
          <strong>Idea Store</strong>
        </Link>
        <button className={styles.searchLauncher} type="button" onClick={() => setSearchOpen(true)}>
          <MagnifyingGlass />
          <span>Search your ideas</span>
          <Sparkle weight="fill" />
        </button>
        <div className={styles.headerMeta}>
          <span>{ideas.length} ideas</span>
          <form action="/api/logout" method="post">
            <button type="submit" aria-label="Log out"><SignOut /></button>
          </form>
        </div>
      </header>

      <section className={styles.collectionHeader}>
        <span>Living collection</span>
        <h1>Ideas worth returning to.</h1>
      </section>

      <section className={styles.collection} aria-label="Ideas">
        {visibleIdeas.length === 0 ? (
          <p className={styles.emptyCollection}>Your first idea is waiting.</p>
        ) : visibleIdeas.map((idea, index) => (
          <article
            className={`${styles.ideaSlot} ${flipped.has(idea.id) ? styles.isFlipped : ""}`}
            key={idea.id}
            style={{ "--delay": `${(index % 3) * 70}ms` } as React.CSSProperties}
          >
            <div className={styles.ideaObject} role="button" tabIndex={0} onClick={() => flipIdea(idea.id)} onKeyDown={(event) => handleCardKeyDown(event, idea.id)} aria-label={`Flip idea: ${idea.title}`}>
              <span className={`${styles.ideaFace} ${styles.ideaFront}`}>
                <span className={styles.objectNumber}>{String(index + 1).padStart(2, "0")}</span>
                <strong>{idea.title || "Untitled idea"}</strong>
                <span className={styles.flipHint}><ArrowsClockwise /> Turn over</span>
              </span>
              <span className={`${styles.ideaFace} ${styles.ideaBack}`}>
                <span className={styles.ideaMeta}><span>Your idea</span><span>{idea.updatedAtLabel}</span></span>
                <small>Idea</small>
                <p>{idea.body}</p>
                <span className={styles.ideaActions}>
                  <Link href={`/notes/${idea.id}?mode=edit`} onClick={(event) => event.stopPropagation()} aria-label={`Edit ${idea.title}`}><PencilSimple /></Link>
                  <form action={`/api/notes/${idea.id}/delete`} method="post" onClick={(event) => event.stopPropagation()}>
                    <button type="submit" aria-label={`Delete ${idea.title}`} onClick={(event) => { if (!window.confirm("Delete this idea?")) event.preventDefault(); }}><Trash /></button>
                  </form>
                </span>
                <span className={styles.flipHint}><ArrowsClockwise /> Return to title</span>
              </span>
            </div>
          </article>
        ))}
        {ideas.length > 3 ? <div className={styles.loadMarker}><span>{visibleCount < ideas.length ? "Scroll for the next three" : "You reached the current beginning."}</span></div> : null}
      </section>

      <button className={styles.createButton} type="button" onClick={openNewIdea} aria-label="Create an idea"><Plus weight="bold" /></button>

      {searchOpen ? (
        <div className={styles.overlay} onMouseDown={closeSearch}>
          <button className={styles.closeOverlay} type="button" onClick={closeSearch} aria-label="Close search"><X /></button>
          <div className={styles.searchStage} onMouseDown={stopOverlayClose}>
            <form className={`${styles.expandedSearch} ${searchMode === "ai" ? styles.aiMode : ""}`} action={searchMode === "keyword" ? "/" : undefined} method="get" onSubmit={searchMode === "ai" ? handleAiSearch : undefined}>
              <button className={styles.searchSubmit} type="submit" aria-label={searchMode === "ai" ? "Run AI search" : "Run keyword search"}>
                {searchMode === "ai" ? <Sparkle weight="fill" /> : <MagnifyingGlass />}
              </button>
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} name="q" placeholder={searchMode === "ai" ? "Describe the idea you half remember..." : "Search exact words in your ideas..."} />
              <button type="button" className={styles.modeButton} onClick={() => { setSearchMode((value) => value === "ai" ? "keyword" : "ai"); setRecallMatches([]); }}>
                {searchMode === "ai" ? <><MagnifyingGlass /> Keyword</> : <><Sparkle weight="fill" /> Ask AI</>}
              </button>
            </form>
            <p className={styles.searchModeLabel}>{searchMode === "ai" ? "AI finds the three closest meanings" : "Keyword search checks exact title and text"}</p>
            <div className={styles.searchResults}>
              {searchMode === "keyword" && searchQuery ? visibleIdeas.slice(0, 3).map((idea) => (
                <Link href={`/notes/${idea.id}`} key={idea.id}><span>Exact match</span><strong>{idea.title}</strong><ArrowRight /></Link>
              )) : null}
              {recallMatches.map((match) => (
                <Link href={`/notes/${match.noteId}`} key={match.noteId}><span>{match.reason}</span><strong>{match.title}</strong><ArrowRight /></Link>
              ))}
              {isRecalling ? <p className={styles.searchMessage}>Searching your ideas...</p> : null}
              {recallError ? <p className={styles.searchMessage} role="alert">{recallError}</p> : null}
              {searchQuery && ideas.length === 0 ? <p className={styles.searchMessage}>No matching idea found.</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {composerOpen ? (
        <div className={`${styles.overlay} ${styles.editorWorld}`} onMouseDown={() => setComposerOpen(false)}>
          <form
            className={styles.composer}
            action={composerPurpose === "edit" && currentNote ? `/api/notes/${currentNote.id}` : "/api/notes"}
            method="post"
            onMouseDown={stopOverlayClose}
            key={`${composerPurpose}-${composerPurpose === "edit" ? currentNote?.id : "new"}`}
          >
            <header className={styles.composerHeader}>
              <span>{composerPurpose === "edit" ? "Edit idea" : "New idea"}</span>
              <div>
                <button className={styles.editorCancel} type="button" onClick={() => setComposerOpen(false)}>Cancel</button>
                <button className={styles.editorSave} type="submit">{composerPurpose === "edit" ? "Save idea" : "Keep idea"} <ArrowRight /></button>
              </div>
            </header>
            {noteError ? <p className={styles.formError} role="alert">Write an explanation before saving.</p> : null}
            <div className={styles.writingSurface}>
              <input autoFocus name="title" defaultValue={composerPurpose === "edit" ? currentNote?.title : ""} placeholder="Idea title" />
              <textarea name="body" value={draftBody} onChange={(event) => setDraftBody(event.target.value)} placeholder="Explain the idea..." required />
              <footer className={styles.editorFooter}>
                <span>Plain text</span>
                <span>{draftBody.trim() ? draftBody.trim().split(/\s+/).length : 0} words</span>
              </footer>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
