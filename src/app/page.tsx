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
  PlusSquare,
  SidebarSimple,
  Sparkle,
  Tag,
  UserCircle,
} from "@phosphor-icons/react";
import styles from "./page.module.css";

const navItems = [
  { label: "Notes", icon: FileText, active: true },
  { label: "Search", icon: MagnifyingGlass },
  { label: "AI Recall", icon: Sparkle },
  { label: "Settings", icon: Gear },
];

const recentNotes = [
  { title: "Product ideas sprint", time: "2m ago" },
  { title: "Why we procrastinate", time: "1h ago" },
  { title: "Book notes - Atomic Habits", time: "3h ago" },
  { title: "Workout plan thoughts", time: "Yesterday" },
  { title: "AI system design notes", time: "Yesterday" },
  { title: "Daily reflection", time: "2 days ago" },
  { title: "Marketing angles", time: "2 days ago" },
  { title: "Long term goals", time: "3 days ago" },
];

const recallExamples = [
  "That idea about...",
  "What did I think about...",
  "Find the note about...",
];

export default function Home() {
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
          <button className={styles.newNoteButton} type="button">
            <PlusSquare size={24} />
            <span>New Note</span>
          </button>
          <div className={styles.avatar} aria-label="Current user">
            <UserCircle size={38} weight="duotone" />
            <span />
          </div>
        </div>
      </aside>

      <section className={styles.editorPane} aria-label="New note editor">
        <header className={styles.editorTopbar}>
          <h1>New Note</h1>

          <div className={styles.editorActions}>
            <button className={styles.iconButton} type="button" aria-label="More actions">
              <DotsThree size={24} weight="bold" />
            </button>
            <span className={styles.actionDivider} />
            <button className={styles.layoutButton} type="button" aria-label="Toggle panels">
              <SidebarSimple size={22} />
            </button>
            <button className={styles.saveButton} type="button">
              <Check size={18} weight="bold" />
              <span>Save</span>
            </button>
            <p className={styles.savedStatus}>
              <span />
              Draft preview only
            </p>
          </div>
        </header>

        <section className={styles.editorCard}>
          <input
            className={styles.titleInput}
            aria-label="Note title"
            placeholder="Note title (optional)"
          />

          <div className={styles.bodyFrame}>
            <textarea
              className={styles.bodyInput}
              aria-label="Note body"
              placeholder="Start writing your thoughts..."
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
                <span>0 words</span>
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
      </section>

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
            {recentNotes.map((note) => (
              <article className={styles.recentRow} key={note.title}>
                <div className={styles.fileIcon}>
                  <FileText size={18} />
                </div>
                <h3>{note.title}</h3>
                <time>{note.time}</time>
                <button type="button" aria-label={`More actions for ${note.title}`}>
                  <DotsThree size={20} weight="bold" />
                </button>
              </article>
            ))}
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
