"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudyWorkspace from "./StudyWorkspace";
import {
  ArrowDownRight, ArrowRight, BookOpen, BrainCircuit, Check, ChevronRight,
  CircleHelp, Clock3, FileText, FolderOpen, GraduationCap, Home, Library,
  LoaderCircle, MessageCircle, Plus, Search, ShieldCheck, Sparkles, Upload,
  WandSparkles, X, PanelLeftClose, PanelLeftOpen
} from "lucide-react";

type View = "home" | "understand" | "study" | "tutor" | "library";
type Analysis = {
  statistics: { characters: number; words: number; sentences: number; entities: number };
  sentences: string[];
  tokens: unknown[];
  entities: { text: string; label: string; description: string | null }[];
  keywords: { word: string; score: number }[];
  model: { name: string; loaded: boolean };
  warnings: string[];
};
type SavedSource = { id: string; name: string; text: string; words: number; savedAt: string };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SAMPLE = "Learning becomes more effective when new information is connected to what we already know. Active recall asks the learner to retrieve an idea from memory instead of simply rereading it. Spaced repetition strengthens that memory by revisiting important ideas over increasing intervals. Together, these techniques make study sessions more focused and help knowledge last longer.";
const NAV: { id: View; label: string; icon: typeof Home; group: string }[] = [
  { id: "home", label: "Home", icon: Home, group: "Workspace" },
  { id: "understand", label: "Understand", icon: BrainCircuit, group: "Workspace" },
  { id: "study", label: "Study room", icon: GraduationCap, group: "Learn" },
  { id: "tutor", label: "Ask Bookie", icon: MessageCircle, group: "Learn" },
  { id: "library", label: "Library", icon: Library, group: "Your material" },
];
const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const titles: Record<View, string> = {
  home: "Your learning desk", understand: "Understand a source",
  study: "Study room", tutor: "Ask Bookie", library: "Your library"
};

function IconButton({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return <button className="icon-button" onClick={onClick} aria-label={label}>{children}</button>;
}

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [greeting, setGreeting] = useState("");
  const [source, setSource] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tab, setTab] = useState<"ideas" | "entities" | "sentences">("ideas");
  const [saved, setSaved] = useState<SavedSource[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<"import" | "analyse" | "">("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const wordCount = useMemo(() => countWords(source), [source]);

  useEffect(() => {
    const readView = () => {
      const candidate = window.location.hash.slice(1).replace("/", "") as View;
      if (["home", "understand", "study", "tutor", "library"].includes(candidate)) setView(candidate);
    };
    readView();
    window.addEventListener("hashchange", readView);
    window.addEventListener("popstate", readView);
    setGreeting(new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()));
    return () => { window.removeEventListener("hashchange", readView); window.removeEventListener("popstate", readView); };
  }, []);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("bookie.library.v1") || "[]");
      if (Array.isArray(data)) setSaved(data);
    } catch { setSaved([]); }
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".global-search")?.focus();
      }
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  function navigate(next: View) {
    if (window.location.hash !== `#${next}`) window.history.pushState(null, "", `#${next}`);
    setView(next); setSidebarOpen(false); setError("");
  }
  function persist(next: SavedSource[]) {
    setSaved(next);
    try { localStorage.setItem("bookie.library.v1", JSON.stringify(next)); }
    catch { setError("Your browser storage is full. Remove an old source and try again."); }
  }
  async function importDocument(file?: File) {
    if (!file) return;
    const allowed = [".txt", ".md", ".pdf", ".docx"].some(ext => file.name.toLowerCase().endsWith(ext));
    if (!allowed) { setError("Choose a TXT, Markdown, PDF or DOCX document."); return; }
    setBusy("import"); setError(""); setAnalysis(null);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch(API + "/api/v1/documents/extract", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Document import failed.");
      setSource(data.text); setSourceName(data.filename || file.name);
      setToast("Document imported");
      if (data.truncated) setError("The document was shortened to 50,000 characters.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not import document."); }
    finally { setBusy(""); }
  }
  async function analyseSource() {
    if (source.trim().length < 20) { setError("Add at least 20 characters before analysing."); return; }
    setBusy("analyse"); setError(""); setAnalysis(null);
    try {
      const response = await fetch(API + "/api/v1/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Analysis failed.");
      setAnalysis(data); setToast("Source analysis complete");
    } catch (e) { setError((e instanceof Error ? e.message : "Analysis failed.") + " Check that the Bookie API is running."); }
    finally { setBusy(""); }
  }
  function saveSource() {
    if (source.trim().length < 20) { setError("Add a source before saving."); return; }
    const item: SavedSource = {
      id: crypto.randomUUID(), name: sourceName || "Untitled source",
      text: source, words: wordCount, savedAt: new Date().toISOString()
    };
    persist([item, ...saved.filter(x => x.text !== source)].slice(0, 50));
    setToast("Saved to your library");
  }
  function openSource(item: SavedSource) {
    setSource(item.text); setSourceName(item.name); setAnalysis(null); navigate("understand");
  }
  function removeSource(id: string) {
    const item = saved.find(source => source.id === id);
    if (!item || !window.confirm(`Remove “${item.name}” from your library? This cannot be undone.`)) return;
    persist(saved.filter(source => source.id !== id)); setToast("Source removed");
  }

  const latest = saved[0];
  const filtered = saved.filter(item => (item.name + " " + item.text).toLowerCase().includes(query.toLowerCase()));


  return (
    <main className={`bookie-frame ${collapsed ? "nav-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`side-rail ${sidebarOpen ? "side-open" : ""}`}>
        <button className="brand-lockup" onClick={() => navigate("home")} aria-label="Bookie home">
          <span className="brand-symbol"><BookOpen size={21}/></span><span className="brand-name">bookie<span>.</span></span>
        </button>
        <div className="rail-label">Your space</div>
        <nav className="rail-nav">
          {NAV.map(({id,label,icon:Icon,group}, index) => (
            <div key={id}>
              {(index === 0 || NAV[index-1].group !== group) && <p className="rail-group">{group}</p>}
              <button type="button" aria-current={view === id ? "page" : undefined} onClick={() => navigate(id)} className={`rail-link ${view === id ? "is-active" : ""}`}>
                <Icon size={17} aria-hidden="true"/><span>{label}</span>{view === id && <i aria-hidden="true"/>}
              </button>
            </div>
          ))}
        </nav>
        <div className="rail-spacer"/>
        <div className="rail-local"><ShieldCheck size={16}/><div><b>Private by default</b><small>Your saved sources stay in this browser.</small></div></div>
        <div className="rail-foot"><span className="rail-avatar">B</span><div><b>Bookie workspace</b><small>Local session</small></div><span className="online-dot"/></div>
      </aside>

      <section className="app-stage">
        <header className="app-topbar">
          <div className="topbar-left">
            <IconButton label="Toggle sidebar" onClick={() => window.innerWidth < 760 ? setSidebarOpen(true) : setCollapsed(x => !x)}>
              {collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}
            </IconButton>
            <div className="top-crumb"><span>Bookie</span><ChevronRight size={13}/><b>{titles[view]}</b></div>
          </div>
          <div className="topbar-right">
            <label className="search-box"><Search size={15} aria-hidden="true"/><input className="global-search" type="search" name="library-search" autoComplete="off" aria-label="Search your library" value={query} onChange={e => { setQuery(e.target.value); if (view !== "library") navigate("library"); }} placeholder="Search your library…"/><kbd>Ctrl K</kbd></label>
            <span className="topbar-divider"/>
            <span className="top-status"><span/>Local workspace</span>
          </div>
        </header>

        <div className="page-wrap" id="main-content" tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} className="page-view" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.18}}>
              {view === "home" && <div className="dashboard dashboard-v2">
<section className="home-heading"><div><p className="eyebrow">{greeting || "Your workspace"} <span>·</span> PERSONAL LEARNING DESK</p><h1>Make learning <em>click.</em></h1><p className="welcome-sub">One place to understand your material, practise what matters, and keep what you learn.</p></div><button className="button-primary home-add" onClick={() => navigate("understand")}><Plus size={17}/> Add a source</button></section>
<section className="home-overview" aria-label="Workspace overview">
<div className="overview-main"><div className="overview-copy"><span className="overview-kicker"><Sparkles size={14}/> YOUR NEXT STEP</span><h2>{latest ? "Pick up where you left off." : "Start with what you're learning."}</h2><p>{latest ? "Your latest source is ready. Continue understanding it, build a study set, or ask Bookie a question." : "Bring in a lecture, a PDF, or your own notes. Bookie will turn the material into a space you can explore and practise."}</p><div className="overview-actions"><button className="button-primary" onClick={() => latest ? openSource(latest) : navigate("understand")}>{latest ? "Continue learning" : "Import your first source"} <ArrowRight size={16}/></button>{latest && <button className="button-quiet" onClick={() => navigate("study")}>Start a study session</button>}</div></div><div className="overview-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><BookOpen size={34}/></div><span className="orbit-chip chip-one"><BrainCircuit size={15}/> Understand</span><span className="orbit-chip chip-two"><GraduationCap size={15}/> Remember</span></div></div>
<div className="overview-stats"><div><span className="stat-icon"><FolderOpen size={17}/></span><span><small>YOUR SOURCES</small><b>{saved.length.toString().padStart(2,"0")}</b><em>Saved in this browser</em></span></div><div><span className="stat-icon stat-icon-blue"><FileText size={17}/></span><span><small>WORDS IN LIBRARY</small><b>{saved.reduce((sum,item)=>sum+item.words,0).toLocaleString()}</b><em>Across your saved material</em></span></div></div>
</section>
<section className="home-workflow"><div className="home-section-heading"><div><span className="section-overline">YOUR WORKFLOW</span><h2>What would you like to do?</h2></div><span className="workflow-hint">Choose a starting point <ArrowDownRight size={15}/></span></div>
<div className="workflow-grid">
<button className="workflow-card workflow-understand" onClick={() => navigate("understand")}><span className="workflow-card-top"><span className="workflow-card-icon"><BrainCircuit size={20}/></span><ArrowRight size={17}/></span><span className="workflow-card-title">Understand</span><span className="workflow-card-description">Break down a document into key ideas, language, entities and structure.</span><span className="workflow-card-foot">Explore a source <ArrowRight size={14}/></span></button>
<button className="workflow-card workflow-study" onClick={() => navigate("study")}><span className="workflow-card-top"><span className="workflow-card-icon"><GraduationCap size={20}/></span><ArrowRight size={17}/></span><span className="workflow-card-title">Study room</span><span className="workflow-card-description">Create revision notes, flip through flashcards and test your understanding.</span><span className="workflow-card-foot">Build a study set <ArrowRight size={14}/></span></button>
<button className="workflow-card workflow-tutor" onClick={() => navigate("tutor")}><span className="workflow-card-top"><span className="workflow-card-icon"><MessageCircle size={20}/></span><ArrowRight size={17}/></span><span className="workflow-card-title">Ask Bookie</span><span className="workflow-card-description">Ask questions and get answers grounded in passages from your material.</span><span className="workflow-card-foot">Ask a question <ArrowRight size={14}/></span></button>
</div></section>
<section className="home-bottom-grid"><div className="home-recent-panel"><div className="home-section-heading"><div><span className="section-overline">PICK UP AGAIN</span><h2>Recent material</h2></div><button className="text-action" onClick={() => navigate("library")}>View library <ArrowRight size={14}/></button></div>
{latest ? <button className="recent-source-row" onClick={() => openSource(latest)}><span className="recent-file-icon"><FileText size={19}/></span><span><b>{latest.name}</b><small>{latest.words.toLocaleString()} words · Saved {new Date(latest.savedAt).toLocaleDateString()}</small></span><ArrowRight size={17}/></button> : <div className="recent-empty"><span><FolderOpen size={19}/></span><div><b>Your library is ready when you are.</b><small>Sources you import will appear here for quick access.</small></div><button className="text-action" onClick={() => navigate("library")}>Open library <ArrowRight size={14}/></button></div>}</div>
<aside className="home-tip-panel"><span className="tip-mark"><Sparkles size={17}/></span><span className="section-overline">A BETTER WAY TO LEARN</span><h3>Understand. Retrieve. Revisit.</h3><p>Read for meaning, recall an idea without looking, then return to it later. That's how information becomes knowledge.</p><button className="text-action" onClick={() => navigate("study")}>Try active recall <ArrowRight size={14}/></button></aside></section>
</div>}

              {view === "understand" && <div className="workspace-page">
                <div className="workspace-intro"><div><p className="eyebrow">Source workspace</p><h1>Understand your material.</h1><p>Bring in a document or paste text. Inspect its structure, important terms and key passages.</p></div><button className="button-quiet" onClick={saveSource}><Plus size={15}/> Save to library</button></div>
                <div className="workbench">
                  <section className="editor-panel">
                    <div className="panel-heading"><div className="panel-title-icon"><FileText size={17}/></div><div><b>{sourceName || "Untitled source"}</b><small>Working document</small></div><span className="panel-heading-spacer"/><span className="live-indicator">EDITING</span></div>
                    <label className="sr-only" htmlFor="source-editor">Source text</label><textarea id="source-editor" name="source-text" autoComplete="off" spellCheck value={source} onChange={e => {setSource(e.target.value);setAnalysis(null);}} maxLength={50000} placeholder="Paste lecture notes, textbook excerpts, research, or anything you want to understand…"/>
                    <div className="editor-footer"><span>{wordCount.toLocaleString()} words <i/> {source.length.toLocaleString()} / 50,000 characters</span><div>
                      <label className="button-quiet upload-label"><Upload size={14}/>{busy === "import" ? "Importing…" : "Import file"}<input type="file" name="source-file" aria-label="Import a TXT, Markdown, PDF or DOCX file" accept=".txt,.md,.pdf,.docx" disabled={!!busy} onChange={e => {void importDocument(e.target.files?.[0]);e.currentTarget.value="";}}/></label>
                      <button className="button-primary" disabled={busy !== "" || source.trim().length < 20} onClick={analyseSource}>{busy === "analyse" ? <LoaderCircle className="spin" size={15}/> : <WandSparkles size={15}/>}Analyse source</button>
                    </div></div>
                    {error && <p className="inline-error" role="alert"><CircleHelp size={14} aria-hidden="true"/>{error}</p>}
                  </section>
                  <aside className="workbench-aside">
                    <div className="aside-block"><span className="section-overline">Supported formats</span><h3>Bring your own material.</h3><p>Import a document or paste text directly into the editor.</p><div className="format-list"><span>PDF</span><span>DOCX</span><span>TXT</span><span>MD</span></div></div>
                    <div className="aside-block"><span className="section-overline">Your workflow</span><ol className="process-list"><li><i>01</i><span><b>Inspect</b><small>Review key terms and named entities.</small></span></li><li><i>02</i><span><b>Understand</b><small>Read the important source passages.</small></span></li><li><i>03</i><span><b>Remember</b><small>Turn the material into a study session.</small></span></li></ol></div>
                    <div className="privacy-note"><ShieldCheck size={15}/><span>Document extraction is processed by your Bookie API. Saved copies stay in this browser.</span></div>
                  </aside>
                </div>
                {busy === "analyse" && <div className="analysis-loading" role="status" aria-live="polite"><LoaderCircle className="spin" size={17} aria-hidden="true"/> Analysing your source…</div>}
                {analysis && <section className="analysis-results">
                  <div className="results-title"><div><span className="section-overline">Source report</span><h2>What stands out</h2></div><span className="result-ready"><Check size={13}/> Analysis complete</span></div>
                  <div className="metrics-row">{[{label:"Words",value:analysis.statistics.words},{label:"Sentences",value:analysis.statistics.sentences},{label:"Entities",value:analysis.statistics.entities},{label:"Characters",value:analysis.statistics.characters}].map(item=><div key={item.label}><small>{item.label}</small><b>{item.value.toLocaleString()}</b></div>)}</div>
                  <div className="report-panel"><div className="report-tabs">{(["ideas","entities","sentences"] as const).map(item=><button key={item} onClick={()=>setTab(item)} className={tab===item?"selected":""}>{item==="ideas"?"Key ideas":item==="entities"?"Named entities":"Sentences"}</button>)}</div>
                    {tab === "ideas" && <div className="idea-cloud">{analysis.keywords.map(item=><span key={item.word}>{item.word}<small>{item.score.toFixed(2)}</small></span>)}</div>}
                    {tab === "entities" && <div className="entity-table">{analysis.entities.length ? analysis.entities.map((item,index)=><div key={item.text+index}><b>{item.text}</b><span>{item.label.replaceAll("_"," ").toLowerCase()}</span></div>) : <p>No named entities were found in this source.</p>}</div>}
                    {tab === "sentences" && <ol className="passage-list">{analysis.sentences.slice(0,14).map((item,index)=><li key={index}><small>{String(index+1).padStart(2,"0")}</small><p>{item}</p></li>)}</ol>}
                    {analysis.warnings.length>0 && <p className="report-warning">{analysis.warnings.join(" ")}</p>}
                  </div>
                  <div className="report-next"><div><b>Move from understanding to remembering.</b><small>Build a revision session from this source.</small></div><button className="button-primary" onClick={()=>navigate("study")}>Open study room <ArrowRight size={14}/></button></div>
                </section>}
              </div>}

              {view === "study" && <div className="learning-page"><div className="workspace-intro"><div><p className="eyebrow">Active recall</p><h1>Make it stick.</h1><p>Turn your current source into revision notes, flashcards and a knowledge check.</p></div><span className="source-context"><FileText size={14}/>{sourceName || (source ? "Current source loaded" : "No source loaded")}</span></div><StudyWorkspace text={source} onTextChange={setSource} apiUrl={API} view="study"/></div>}
              {view === "tutor" && <div className="learning-page"><div className="workspace-intro"><div><p className="eyebrow">Source-grounded tutor</p><h1>Ask until it makes sense.</h1><p>Ask about the material you're working with. Bookie shows the passages used to support each answer.</p></div><span className="source-context"><FileText size={14}/>{sourceName || (source ? "Current source loaded" : "No source loaded")}</span></div><StudyWorkspace text={source} onTextChange={setSource} apiUrl={API} view="tutor"/></div>}
              {view === "library" && <div className="library-page"><div className="workspace-intro"><div><p className="eyebrow">Your material</p><h1>Everything you've saved.</h1><p>Sources are kept in this browser. Open one to continue working with it.</p></div><button className="button-primary" onClick={()=>navigate("understand")}><Plus size={15}/> Add source</button></div>
                <div className="library-toolbar"><div><b>{filtered.length} {filtered.length===1?"source":"sources"}</b><span> · Stored in this browser</span></div><span className="library-sort"><Clock3 size={14}/> Most recent first</span></div>
                {filtered.length ? <div className="source-grid">{filtered.map(item=><article className="source-tile" key={item.id}><div className="tile-top"><span className="tile-file"><FileText size={18}/></span><button onClick={()=>removeSource(item.id)} aria-label={"Remove "+item.name}><X size={15}/></button></div><h3>{item.name}</h3><p>{item.text.slice(0,150)}{item.text.length>150?"…":""}</p><div className="tile-meta"><span>{item.words.toLocaleString()} words</span><span>{new Date(item.savedAt).toLocaleDateString()}</span></div><button className="tile-open" onClick={()=>openSource(item)}>Open source <ArrowRight size={14}/></button></article>)}</div> : <div className="library-empty"><span><Library size={25}/></span><h3>{query?"No matching material":"Your library is empty"}</h3><p>{query?"Try a different search term.":"Save a document from Understand and it will appear here for your next session."}</p>{!query && <button className="button-primary" onClick={()=>navigate("understand")}><Plus size={15}/> Add your first source</button>}</div>}
              </div>}
            </motion.div>
          </AnimatePresence>
          <footer className="app-footer"><span className="footer-mark">bookie<span>.</span></span><span>Learn with intention.</span><span className="footer-privacy"><ShieldCheck size={13}/> Local-first workspace</span></footer>
        </div>
      </section>
      {toast && <div className="toast-message" role="status" aria-live="polite"><Check size={15}/>{toast}</div>}
    </main>
  );
}
