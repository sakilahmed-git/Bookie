"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  Network,
  Plus,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type Token = {
  text: string;
  lemma: string;
  pos: string;
  tag: string;
  is_stop: boolean;
  is_punctuation: boolean;
  is_alpha: boolean;
};

type Analysis = {
  statistics: {
    characters: number;
    words: number;
    sentences: number;
    entities: number;
  };
  sentences: string[];
  tokens: Token[];
  entities: { text: string; label: string; description: string | null }[];
  keywords: { word: string; score: number }[];
  model: { name: string; loaded: boolean };
  warnings: string[];
};

const sampleText =
  "Natural Language Processing helps computers understand and work with human language. It combines linguistics, statistics, and machine learning to analyse text, identify important entities, discover patterns, and transform information into useful knowledge. Students can use NLP tools to turn complex study material into summaries, explanations, and practice questions.";

const navigation = [
  { label: "Overview", icon: BookOpen, active: true, href: "#overview" },
  { label: "NLP Laboratory", icon: FlaskConical, href: "#analysis" },
  { label: "Understand", icon: Lightbulb, href: "#modes" },
  { label: "Study", icon: GraduationCap, href: "#modes" },
  { label: "Play & challenge", icon: Gamepad2, href: "#modes" },
  { label: "Knowledge explorer", icon: Network, href: "#modes" },
];

const modes = [
  {
    title: "Understand",
    description: "Make difficult ideas feel simple, with examples that click.",
    icon: Lightbulb,
    tone: "bg-[#FFF5E9] text-[#D18A39]",
    tag: "Clarity",
  },
  {
    title: "Study",
    description: "Turn your material into notes, flashcards, and revision sets.",
    icon: GraduationCap,
    tone: "bg-[#F0EDFF] text-[#7668E8]",
    tag: "Remember",
  },
  {
    title: "Play",
    description: "Challenge yourself with quick quizzes made from your content.",
    icon: Gamepad2,
    tone: "bg-[#FFF0F4] text-[#D96F98]",
    tag: "Practice",
  },
  {
    title: "Explore",
    description: "See the people, ideas, and topics connected to your text.",
    icon: Network,
    tone: "bg-[#EAF7F3] text-[#39977D]",
    tag: "Discover",
  },
];

export default function Home() {
  const [text, setText] = useState(sampleText);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tokens" | "entities" | "keywords">("tokens");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text],
  );

  async function analyseText() {
    if (text.trim().length < 20) {
      setError("Add at least 20 characters so Bookie has enough text to analyse.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(`${apiUrl}/api/v1/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || "The analysis could not be completed.");
      }

      setAnalysis(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Check that the Bookie API is running at ${apiUrl}.`
          : "Something went wrong while connecting to the Bookie API.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="overview" className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[248px] shrink-0 border-r border-[#eeedf4] bg-white/75 px-5 py-7 lg:flex lg:flex-col">
          <a href="#overview" className="mb-12 flex items-center gap-3 px-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#7668E8] text-white shadow-[0_8px_18px_rgba(118,104,232,.24)]">
              <BookOpen size={21} strokeWidth={2.2} />
            </span>
            <span className="text-[25px] font-extrabold tracking-[-1.5px] text-ink">
              bookie<span className="text-[#8B7CEB]">.</span>
            </span>
          </a>

          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.7px] text-[#aaa8ba]">
            Workspace
          </div>
          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon, active, href }) => (
              <a
                key={label}
                href={href}
                className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-[#F0EDFF] text-[#6558D3]"
                    : "text-[#77768B] hover:bg-[#F8F7FC] hover:text-ink"
                }`}
              >
                <Icon size={17} strokeWidth={1.9} />
                {label}
                {label === "NLP Laboratory" && (
                  <span className="ml-auto rounded-full bg-[#E7E2FF] px-2 py-0.5 text-[9px] font-bold text-[#6558D3]">
                    LAB
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#F2EFFF] via-[#F7F3FF] to-[#FFF0F5] p-4">
            <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-[#7869DF] shadow-sm">
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-bold text-ink">A little more clarity?</p>
            <p className="mt-1 text-[11px] leading-5 text-[#77768B]">
              Start with a paragraph. Leave with a better understanding.
            </p>
            <a
              href="#analysis"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#695BD6]"
            >
              Try the lab <ArrowRight size={13} />
            </a>
          </div>
          <div className="mt-5 flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E8F3FF] text-xs font-extrabold text-[#5488B8]">
              B
            </div>
            <div>
              <p className="text-xs font-bold text-ink">Your workspace</p>
              <p className="text-[10px] text-[#9A98A9]">Personal learning space</p>
            </div>
            <ChevronDown className="ml-auto text-[#aaa8ba]" size={15} />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#eeedf4] bg-[#fbfaff]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#7668E8] text-white">
                <BookOpen size={19} />
              </span>
              <span className="text-xl font-extrabold tracking-tight">bookie.</span>
            </div>
            <div className="hidden text-xs font-medium text-[#9694A6] lg:block">
              Your space <span className="mx-2 text-[#D2CFDF]">/</span>{" "}
              <span className="font-bold text-[#55536B]">Overview</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden rounded-full border border-[#E9E6F3] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#858397] sm:inline-flex">
                CSE472 · NLP project
              </span>
              <button
                type="button"
                aria-label="Help"
                className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-[#ECEAF3] bg-white text-[#858397] transition hover:text-[#7668E8]"
              >
                <CircleHelp size={17} />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#FCEAF1] text-xs font-extrabold text-[#C66E91]">
                B
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-9 sm:px-8 lg:px-10 lg:pt-12">
            <section className="relative overflow-hidden rounded-[28px] border border-[#EAE6F8] bg-white px-6 py-8 shadow-soft sm:px-9 sm:py-10">
              <div className="soft-grid absolute inset-y-0 right-0 hidden w-[42%] opacity-50 md:block" />
              <div className="absolute -right-14 -top-24 h-64 w-64 rounded-full bg-[#F1EDFF] blur-3xl" />
              <div className="absolute -right-4 bottom-[-100px] h-52 w-52 rounded-full bg-[#FFEFF4] blur-3xl" />
              <div className="relative max-w-[650px]">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#EAE5FF] bg-[#F7F5FF] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.3px] text-[#7568D9]">
                  <Sparkles size={12} /> Your ideas, in a new light
                </div>
                <h1 className="text-[34px] font-extrabold leading-[1.12] tracking-[-1.8px] text-ink sm:text-[43px]">
                  Make knowledge
                  <br />
                  <span className="gradient-text">click into place.</span>
                </h1>
                <p className="mt-4 max-w-[490px] text-[13px] leading-6 text-[#77768B] sm:text-sm">
                  Bring your notes, articles, and study material. Bookie helps
                  you understand the important bits and turn them into
                  something you can actually use.
                </p>
                <a
                  href="#analysis"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7668E8] px-5 py-3 text-xs font-bold text-white shadow-[0_8px_18px_rgba(118,104,232,.2)] transition hover:-translate-y-0.5 hover:bg-[#685BD7]"
                >
                  Start with a text <ArrowRight size={15} />
                </a>
              </div>
              <div className="relative mt-8 hidden justify-end md:flex">
                <div className="absolute bottom-1 right-[215px] rotate-[-7deg] rounded-2xl border border-[#EEEAFB] bg-white/90 p-3 shadow-card">
                  <div className="mb-2 h-1.5 w-20 rounded-full bg-[#E8E3FF]" />
                  <div className="h-1.5 w-14 rounded-full bg-[#F7DCE8]" />
                </div>
                <div className="flex w-[190px] rotate-[3deg] items-center gap-3 rounded-2xl border border-white bg-white/95 p-4 shadow-soft">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F0EDFF] text-[#7668E8]">
                    <BrainCircuit size={21} />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold text-ink">Big ideas</p>
                    <p className="mt-0.5 text-[9px] text-[#9694A6]">Made understandable</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="modes" className="mt-10">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#9B98AB]">
                    Pick your path
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-[-.7px] text-ink">
                    What would you like to do?
                  </h2>
                </div>
                <span className="hidden text-[11px] text-[#9B98AB] sm:block">
                  One source. More possibilities.
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {modes.map(({ title, description, icon: Icon, tone, tag }) => (
                  <a
                    key={title}
                    href="#analysis"
                    className="panel group rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className={`grid h-11 w-11 place-items-center rounded-[14px] ${tone}`}>
                        <Icon size={21} strokeWidth={1.9} />
                      </span>
                      <span className="rounded-full bg-[#F8F7FB] px-2.5 py-1 text-[9px] font-bold text-[#9694A6]">
                        {tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-ink">{title}</h3>
                    <p className="mt-1.5 min-h-[40px] text-[11px] leading-5 text-[#858397]">
                      {description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#7568D9]">
                      Start here <ArrowRight size={12} className="transition group-hover:translate-x-1" />
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section id="analysis" className="mt-11 scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#9B98AB]">
                    A first look inside
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-[-.7px] text-ink">
                    Text intelligence lab
                  </h2>
                  <p className="mt-1 text-xs text-[#858397]">
                    Explore the language patterns behind your content.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE6F4] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#858397]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#72B99B]" />
                  NLP analysis
                </span>
              </div>

              <div className="panel overflow-hidden rounded-[22px]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0EEF5] px-5 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink">
                    <FileText size={16} className="text-[#7668E8]" />
                    Your source text
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setText(sampleText);
                      setAnalysis(null);
                      setError("");
                    }}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-[#827DA0] transition hover:bg-[#F7F5FF] hover:text-[#6558D3]"
                  >
                    <Plus size={13} /> Load example
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Paste a paragraph, an article excerpt, or your study notes..."
                    aria-label="Text to analyse"
                    className="focus-ring min-h-[180px] w-full resize-y rounded-xl border border-[#ECEAF3] bg-[#FDFCFF] p-4 text-[13px] leading-6 text-[#4E4C64] outline-none transition placeholder:text-[#B1AFBD] focus:border-[#BDB4F4] focus:bg-white"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] text-[#A09EAE]">
                      {wordCount} words · {text.length.toLocaleString()} characters
                    </span>
                    <button
                      type="button"
                      onClick={analyseText}
                      disabled={loading}
                      className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#7668E8] px-5 py-3 text-xs font-bold text-white shadow-[0_7px_16px_rgba(118,104,232,.2)] transition hover:-translate-y-0.5 hover:bg-[#685BD7] disabled:cursor-not-allowed disabled:opacity-65"
                    >
                      {loading ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <WandSparkles size={15} />
                      )}
                      {loading ? "Analysing..." : "Analyse text"}
                    </button>
                  </div>
                  {error && (
                    <div role="alert" className="mt-4 rounded-xl border border-[#F4D5DE] bg-[#FFF5F7] px-4 py-3 text-xs leading-5 text-[#A64F6B]">
                      {error}
                    </div>
                  )}
                </div>

                {analysis && (
                  <div className="border-t border-[#F0EEF5] bg-[#FDFCFF] p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">Analysis results</h3>
                        <p className="mt-1 text-[10px] text-[#9694A6]">
                          Processed with {analysis.model.name}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7F0] px-2.5 py-1 text-[10px] font-bold text-[#398565]">
                        <Check size={12} /> Complete
                      </span>
                    </div>
                    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        ["Words", analysis.statistics.words],
                        ["Sentences", analysis.statistics.sentences],
                        ["Entities", analysis.statistics.entities],
                        ["Characters", analysis.statistics.characters],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-[#EEEAF5] bg-white p-3">
                          <p className="text-[10px] font-semibold text-[#9997A8]">{label}</p>
                          <p className="mt-1 text-xl font-extrabold tracking-tight text-ink">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mb-3 flex gap-1 border-b border-[#ECEAF3]">
                      {(["tokens", "entities", "keywords"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`focus-ring border-b-2 px-3 py-2 text-[11px] font-bold capitalize transition ${
                            activeTab === tab
                              ? "border-[#7668E8] text-[#6558D3]"
                              : "border-transparent text-[#9997A8] hover:text-ink"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    {activeTab === "tokens" && (
                      <div className="flex max-h-[230px] flex-wrap content-start gap-2 overflow-auto py-2">
                        {analysis.tokens.map((token, index) => (
                          <span key={`${token.text}-${index}`} title={`Lemma: ${token.lemma} · POS: ${token.pos || "Unavailable"} · Tag: ${token.tag || "Unavailable"}`} className={`rounded-lg border px-2.5 py-1.5 text-[10px] ${token.is_stop ? "border-[#EEEAF5] bg-[#F8F7FB] text-[#A09EAE]" : "border-[#E5E0FF] bg-[#F3F0FF] font-semibold text-[#6658C9]"}`}>
                            {token.text}
                          </span>
                        ))}
                      </div>
                    )}
                    {activeTab === "entities" && (
                      <div className="flex flex-wrap gap-2 py-2">
                        {analysis.entities.length ? analysis.entities.map((entity, index) => (
                          <span key={`${entity.text}-${index}`} className="rounded-lg border border-[#DDEFE8] bg-[#F0FAF5] px-3 py-2 text-[10px] text-[#397E67]">
                            <strong>{entity.text}</strong> · {entity.label}
                          </span>
                        )) : <p className="py-3 text-xs text-[#9694A6]">No named entities were detected in this text.</p>}
                      </div>
                    )}
                    {activeTab === "keywords" && (
                      <div className="space-y-2 py-2">
                        {analysis.keywords.map((keyword) => (
                          <div key={keyword.word} className="flex items-center gap-3">
                            <span className="w-36 truncate text-[11px] font-semibold text-[#5E5B72]">{keyword.word}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0EEF6]">
                              <div className="h-full rounded-full bg-gradient-to-r from-[#8275E9] to-[#B59BEA]" style={{ width: `${Math.max(4, keyword.score * 100)}%` }} />
                            </div>
                            <span className="w-12 text-right text-[10px] tabular-nums text-[#9997A8]">{keyword.score.toFixed(3)}</span>
                          </div>
                        ))}
                        {!analysis.keywords.length && <p className="text-xs text-[#9694A6]">Not enough content to extract keywords.</p>}
                      </div>
                    )}
                    {analysis.warnings.length > 0 && (
                      <div className="mt-4 rounded-xl bg-[#FFF8EA] px-3 py-2 text-[10px] leading-5 text-[#98733B]">
                        {analysis.warnings.join(" ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-[#ECEAF3] pt-6 text-[10px] text-[#A09EAE] sm:flex-row">
              <span>bookie. · Knowledge, transformed beautifully.</span>
              <span>Built for CSE472 · Natural Language Processing</span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
