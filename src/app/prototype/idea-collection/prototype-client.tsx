"use client";

import {
  ArrowRight,
  ArrowsClockwise,
  MagnifyingGlass,
  Plus,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import styles from "./prototype.module.css";

type Idea = {
  id: number;
  title: string;
  detail: string;
  source: string;
  age: string;
};

const seedIdeas: Idea[] = [
  {
    id: 1,
    title: "Tools should help us return to our own thinking.",
    detail: "The valuable moment is not capture. It is meeting an earlier thought exactly when it becomes useful again.",
    source: "Your thought",
    age: "2 months ago",
  },
  {
    id: 2,
    title: "A product can become a place you return to.",
    detail: "Utility creates the first visit. Ritual, memory, and ownership create the hundredth.",
    source: "Product notes",
    age: "Last summer",
  },
  {
    id: 3,
    title: "Small rituals become personal infrastructure.",
    detail: "A repeated action can slowly become a dependable structure for attention and creative work.",
    source: "Saved from web",
    age: "3 weeks ago",
  },
  {
    id: 4,
    title: "The tools we buy reveal the work we are avoiding.",
    detail: "Buying a new system can feel like progress while protecting us from choosing the difficult next step.",
    source: "Your thought",
    age: "7 months ago",
  },
  {
    id: 5,
    title: "Good defaults feel like empathy.",
    detail: "A thoughtful default removes a decision without removing the user's agency.",
    source: "Design notes",
    age: "11 days ago",
  },
  {
    id: 6,
    title: "A quiet network for unfinished thoughts.",
    detail: "People may need a place to share work before it becomes polished enough for performance.",
    source: "Saved from web",
    age: "4 months ago",
  },
  {
    id: 7,
    title: "Memory is not storage. It is a relationship.",
    detail: "What we revisit changes meaning as our circumstances and questions change.",
    source: "Book note",
    age: "1 year ago",
  },
  {
    id: 8,
    title: "The best interface may be a well-timed question.",
    detail: "Instead of presenting every tool, ask what the person is trying to understand at this exact moment.",
    source: "UX idea",
    age: "5 days ago",
  },
  {
    id: 9,
    title: "Personal software should age with its owner.",
    detail: "The product becomes more valuable when past choices, language, and abandoned directions remain useful context.",
    source: "Your thought",
    age: "9 months ago",
  },
  {
    id: 10,
    title: "An idea becomes valuable when it changes a decision.",
    detail: "Collection is only the beginning. The product should notice the moment an old idea can alter present action.",
    source: "Product principle",
    age: "6 weeks ago",
  },
  {
    id: 11,
    title: "Calm technology can still create anticipation.",
    detail: "Excitement does not require noise. Controlled reveal and meaningful return can create a stronger pull.",
    source: "Design notes",
    age: "Yesterday",
  },
  {
    id: 12,
    title: "The collection should feel richer every time you return.",
    detail: "Resurfacing, relationships, and changed context can make familiar material feel newly useful.",
    source: "Your thought",
    age: "3 months ago",
  },
];

export function IdeaCollectionPrototype() {
  const [ideas, setIdeas] = useState(seedIdeas);
  const [batchStart, setBatchStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"keyword" | "ai">("keyword");
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDetail, setDraftDetail] = useState("");

  const orderedIdeas = useMemo(
    () => [...ideas.slice(batchStart), ...ideas.slice(0, batchStart)],
    [ideas, batchStart],
  );

  const visibleIdeas = orderedIdeas.slice(0, visibleCount);
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? ideas
        .filter((idea) =>
          searchMode === "ai"
            ? semanticMatch(idea, normalizedQuery)
            : `${idea.title} ${idea.detail}`.toLowerCase().includes(normalizedQuery),
        )
        .slice(0, 3)
    : [];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBatchStart((current) => (current + 3) % ideas.length);
      setVisibleCount(3);
      setFlipped(new Set());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [ideas.length]);

  useEffect(() => {
    function loadNearBottom() {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (window.scrollY > 200 && nearBottom) {
        setVisibleCount((current) => Math.min(current + 3, ideas.length));
      }
    }

    window.addEventListener("scroll", loadNearBottom, { passive: true });
    return () => window.removeEventListener("scroll", loadNearBottom);
  }, [ideas.length]);

  function flipIdea(id: number) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addIdea() {
    const title = draftTitle.trim();
    const detail = draftDetail.trim();
    if (!title || !detail) return;
    setIdeas((current) => [
      {
        id: Date.now(),
        title,
        detail,
        source: "Your thought",
        age: "Just now",
      },
      ...current,
    ]);
    setDraftTitle("");
    setDraftDetail("");
    setBatchStart(0);
    setVisibleCount(3);
    setComposerOpen(false);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#" aria-label="Idea Store home">
          <span>IS</span>
          <strong>Idea Store</strong>
        </a>
        <button className={styles.searchLauncher} type="button" onClick={() => setSearchOpen(true)}>
          <MagnifyingGlass />
          <span>Search your ideas</span>
          <Sparkle weight="fill" />
        </button>
        <div className={styles.headerMeta}>
          <span>{ideas.length} ideas</span>
          <span>Private</span>
        </div>
      </header>

      <section className={styles.collectionHeader}>
        <div>
          <span>Living collection</span>
          <h1>Ideas worth returning to.</h1>
        </div>
      </section>

      <section className={styles.collection} aria-label="Ideas">
        {visibleIdeas.map((idea, index) => (
          <article
            className={`${styles.ideaSlot} ${flipped.has(idea.id) ? styles.isFlipped : ""}`}
            key={idea.id}
            style={{ "--delay": `${index % 3 * 70}ms` } as React.CSSProperties}
          >
            <button className={styles.ideaObject} type="button" onClick={() => flipIdea(idea.id)} aria-label={`Flip idea: ${idea.title}`}>
              <span className={`${styles.ideaFace} ${styles.ideaFront}`}>
                <span className={styles.objectNumber}>{String(index + 1).padStart(2, "0")}</span>
                <strong>{idea.title}</strong>
                <span className={styles.flipHint}><ArrowsClockwise /> Turn over</span>
              </span>
              <span className={`${styles.ideaFace} ${styles.ideaBack}`}>
                <span className={styles.ideaMeta}><span>{idea.source}</span><span>{idea.age}</span></span>
                <small>Idea</small>
                <p>{idea.detail}</p>
                <span className={styles.flipHint}><ArrowsClockwise /> Return to title</span>
              </span>
            </button>
          </article>
        ))}
        <div className={styles.loadMarker}>
          {visibleCount < ideas.length ? <span>Scroll for the next three</span> : <span>You reached the current beginning.</span>}
        </div>
      </section>

      <button className={styles.createButton} type="button" onClick={() => setComposerOpen(true)} aria-label="Create an idea">
        <Plus weight="bold" />
      </button>

      {searchOpen && (
        <div className={styles.searchWorld} onMouseDown={() => { setSearchOpen(false); setQuery(""); }}>
          <button className={styles.closeOverlay} type="button" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search"><X /></button>
          <div className={styles.searchStage} onMouseDown={(event) => event.stopPropagation()}>
            <div className={`${styles.expandedSearch} ${searchMode === "ai" ? styles.aiMode : ""}`}>
              {searchMode === "ai" ? <Sparkle weight="fill" /> : <MagnifyingGlass />}
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchMode === "ai" ? "Describe the idea you half remember…" : "Search exact words in your ideas…"}
              />
              <button type="button" className={styles.modeButton} onClick={() => setSearchMode((mode) => mode === "ai" ? "keyword" : "ai")}>
                {searchMode === "ai" ? <><MagnifyingGlass /> Keyword</> : <><Sparkle weight="fill" /> Ask AI</>}
              </button>
            </div>
            <p className={styles.searchModeLabel}>{searchMode === "ai" ? "AI finds the three closest meanings" : "Keyword search checks exact title and text"}</p>
            <div className={styles.searchResults}>
              {searchResults.map((idea) => (
                <button type="button" key={idea.id} onClick={() => { setSearchOpen(false); setQuery(""); setBatchStart(ideas.findIndex((item) => item.id === idea.id)); setVisibleCount(3); }}>
                  <span>{idea.source}</span>
                  <strong>{idea.title}</strong>
                  <ArrowRight />
                </button>
              ))}
              {normalizedQuery && searchResults.length === 0 && <div className={styles.noResult}>No close idea found.</div>}
            </div>
          </div>
        </div>
      )}

      {composerOpen && (
        <div className={styles.composerWorld} onMouseDown={() => setComposerOpen(false)}>
          <button className={`${styles.closeOverlay} ${styles.composerClose}`} type="button" onClick={() => setComposerOpen(false)} aria-label="Close composer"><X /></button>
          <div className={styles.composer} onMouseDown={(event) => event.stopPropagation()}>
            <span>New idea</span>
            <input autoFocus value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Idea title" />
            <textarea value={draftDetail} onChange={(event) => setDraftDetail(event.target.value)} placeholder="Explain the idea…" />
            <button type="button" onClick={addIdea}>Keep idea <ArrowRight /></button>
          </div>
        </div>
      )}
    </main>
  );
}

function semanticMatch(idea: Idea, query: string) {
  const concepts: Record<string, string[]> = {
    memory: ["remember", "return", "past", "relationship", "age"],
    product: ["product", "software", "tool", "interface", "default"],
    creativity: ["idea", "thought", "creative", "unfinished", "question"],
    avoidance: ["avoiding", "buy", "difficult", "progress", "work"],
  };
  const text = `${idea.title} ${idea.detail}`.toLowerCase();
  const queryWords = query.split(/\s+/);
  const expanded = new Set(queryWords);

  Object.entries(concepts).forEach(([concept, words]) => {
    if (query.includes(concept) || words.some((word) => query.includes(word))) {
      words.forEach((word) => expanded.add(word));
    }
  });

  return [...expanded].some((word) => word.length > 2 && text.includes(word));
}
