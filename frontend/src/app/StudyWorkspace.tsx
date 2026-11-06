"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, GraduationCap, LoaderCircle, Sparkles, Upload, Target, BookOpenCheck, MessageCircle, Send } from "lucide-react";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  apiUrl: string;
  view?: "study" | "tutor" | "all";
};

type Difficulty = "beginner" | "intermediate" | "advanced";
type Pack = {
  difficulty: Difficulty;
  concepts: { term: string; context: string; study_hint: string }[];
  notes: { number: number; text: string }[];
  flashcards: { front: string; back: string; term: string }[];
  quiz: { question: string; options: string[]; answer: string; explanation: string; source_sentence: string }[];
  method: string;
  warnings: string[];
};
type Evidence = { sentence: string; source_sentence: number; relevance: number };
type ChatMessage = { role: "user" | "assistant"; content: string; evidence?: Evidence[]; confidence?: string; mode?: string; message?: string };
type TutorTurn = { role: "user" | "assistant"; content: string };

const PROGRESS_KEY = "bookie.study.progress.v1";

export default function StudyWorkspace({ text, onTextChange, apiUrl, view = "all" }: Props) {
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [tutorLevel, setTutorLevel] = useState<Difficulty>("beginner");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [pack, setPack] = useState<Pack | null>(null);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || "{}");
      setCompleted(Number(saved.completed) || 0);
      setBestScore(Number(saved.bestScore) || 0);
    } catch {
      setCompleted(0);
      setBestScore(0);
    }
  }, []);

  const score = useMemo(
    () => pack?.quiz.filter((item, index) => answers[index] === item.answer).length || 0,
    [pack, answers],
  );
  const answeredCount = Object.keys(answers).length;

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    setPack(null);
    setChat([]);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${apiUrl}/api/v1/documents/extract`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Document extraction failed.");
      onTextChange(result.text);
      setFilename(result.filename);
      if (result.truncated) setError("The document was shortened to 50,000 characters for this session.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this document.");
    } finally {
      setUploading(false);
    }
  }

  async function generate() {
    if (text.trim().length < 20) {
      setError("Add at least 20 characters in the text lab before generating a study pack.");
      return;
    }
    setGenerating(true);
    setError("");
    setPack(null);
    setFlipped([]);
    setAnswers({});
    try {
      const response = await fetch(`${apiUrl}/api/v1/study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, difficulty }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Study pack generation failed.");
      setPack(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate study material.");
    } finally {
      setGenerating(false);
    }
  }

  async function askTutor() {
    if (text.trim().length < 20) {
      setError("Load at least 20 characters of source material first.");
      return;
    }
    if (question.trim().length < 4) {
      setError("Enter a question with at least 4 characters.");
      return;
    }
    setAsking(true);
    setError("");
    const asked = question.trim();
    const history: TutorTurn[] = chat.slice(-8).map(({ role, content }) => ({ role, content }));
    try {
      const response = await fetch(`${apiUrl}/api/v1/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, question: asked, level: tutorLevel, history }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Tutor request failed.");
      setChat((current) => [
        ...current,
        { role: "user", content: asked },
        { role: "assistant", content: result.answer, evidence: result.evidence, confidence: result.confidence, mode: result.mode, message: result.message },
      ]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not answer that question.");
    } finally {
      setAsking(false);
    }
  }

  function finishQuiz() {
    if (!pack || !pack.quiz.length || answeredCount !== pack.quiz.length) return;
    const nextCompleted = completed + 1;
    const nextBest = Math.max(bestScore, Math.round((score / pack.quiz.length) * 100));
    setCompleted(nextCompleted);
    setBestScore(nextBest);
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ completed: nextCompleted, bestScore: nextBest }));
    } catch {
      setError("Progress could not be saved in this browser.");
    }
  }

  return (
    <section id="study" className="study-workspace mt-11 scroll-mt-24">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#9B98AB]">{view === "tutor" ? "SOURCE-GROUNDED CONVERSATION" : "ACTIVE RECALL"}</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-[-.7px] text-ink">{view === "tutor" ? "Ask Bookie about your source" : "Your study session"}</h2>
        <p className="mt-1 text-xs text-[#858397]">{view === "tutor" ? "Get clear explanations and inspect the source evidence behind each answer." : "Build revision notes, flip through flashcards, and check what you remember."}</p>
      </div>
      <div className="panel rounded-[22px] p-5 sm:p-6">
        {view !== "tutor" && <div className="study-mode-content">        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#F0EDFF] text-[#7668E8]"><GraduationCap size={21} /></span>
            <div>
              <h3 className="text-sm font-extrabold text-ink">Build your study pack</h3>
              <p className="mt-1 text-[10px] text-[#9694A6]">All concepts and answers are traceable to your source.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="bookie-difficulty" className="text-[10px] font-bold text-[#858397]">Level</label>
            <select id="bookie-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="rounded-lg border border-[#E7E2F5] bg-white px-3 py-2 text-xs text-[#625C82]">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button type="button" aria-label={generating ? "Generating study materials" : "Generate study materials"} onClick={generate} disabled={generating || uploading} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#7668E8] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#685BD7] disabled:opacity-60">
              {generating ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? "Building..." : "Generate pack"}
            </button>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#F8F6FF] p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-[#9694A6]">Sessions completed</p><p className="mt-1 text-xl font-extrabold text-ink">{completed}</p></div>
          <div className="rounded-xl bg-[#F8F6FF] p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-[#9694A6]">Best quiz score</p><p className="mt-1 text-xl font-extrabold text-ink">{bestScore}%</p></div>
          <div className="col-span-2 rounded-xl bg-[#F8F6FF] p-3 sm:col-span-1"><p className="text-[9px] font-bold uppercase tracking-wide text-[#9694A6]">Current quiz</p><p className="mt-1 text-xl font-extrabold text-ink">{answeredCount}/{pack?.quiz.length || 0}</p></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#DDD8F0] bg-[#FAF9FF] px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] text-[#77768B]">
            <FileText size={15} className="text-[#7668E8]" />
            <span>{filename || "Import a source document"}</span>
            <span className="text-[#AAA7B8]">· TXT, MD, PDF, DOCX · 10 MB max</span>
          </div>
          <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E7E2F5] bg-white px-3 py-2 text-[10px] font-bold text-[#6B5ED2] hover:bg-[#F7F5FF]">
            {uploading ? <LoaderCircle size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? "Extracting..." : "Choose file"}
            <input type="file" accept=".txt,.md,.pdf,.docx" className="sr-only" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} />
          </label>
        </div>
        </div>}
        {view !== "study" && <div className="tutor-mode-content">        <div className="mt-5 rounded-2xl border border-[#EAE6F5] bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2"><MessageCircle size={16} className="text-[#7668E8]" /><h4 className="text-xs font-extrabold text-ink">Ask your material</h4><span className="rounded-full bg-[#F1EEFF] px-2 py-1 text-[9px] font-bold text-[#7466D5]">AI tutor · evidence-backed</span><label htmlFor="bookie-tutor-level" className="ml-auto text-[10px] font-bold text-[#858397]">Explain for</label><select id="bookie-tutor-level" value={tutorLevel} onChange={(event) => setTutorLevel(event.target.value as Difficulty)} className="rounded-lg border border-[#E7E2F5] bg-white px-2 py-2 text-[10px] text-[#625C82]"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="tutor-question">Ask Bookie a question</label><input id="tutor-question" name="tutor-question" type="text" autoComplete="off" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !asking) void askTutor(); }} placeholder="Ask a question about your notes…" className="min-w-0 flex-1 rounded-xl border border-[#EAE6F5] bg-[#FCFBFF] px-3 py-3 text-xs outline-none focus:border-[#BDB3F0]" />
            <button type="button" onClick={askTutor} disabled={asking || uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7668E8] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{asking ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}Ask Bookie</button>
          </div>
          {chat.length > 0 && <div role="log" aria-label="Conversation with Bookie" aria-live="polite" aria-relevant="additions" className="mt-4 max-h-[520px] space-y-3 overflow-y-auto">{chat.map((item, index) => <div key={index} className={item.role === "user" ? "ml-8 rounded-xl bg-[#7668E8] p-3 text-white" : "mr-4 rounded-xl bg-[#F8F6FF] p-4"}><p className="mb-1 text-[9px] font-bold uppercase tracking-wide opacity-70">{item.role === "user" ? "You" : `Bookie · ${item.mode || "tutor"} · ${item.confidence || ""} evidence`}</p><p className="whitespace-pre-wrap text-xs leading-6">{item.content}</p>{item.role === "assistant" && item.evidence && item.evidence.length > 0 && <div className="mt-3 space-y-2 border-t border-[#EAE6F5] pt-3"><p className="text-[9px] font-bold uppercase tracking-wide text-[#8B80D7]">Source evidence</p>{item.evidence.map((source) => <div key={source.source_sentence} className="rounded-lg border border-[#EAE6F5] bg-white p-3"><p className="text-[9px] font-bold text-[#8B80D7]">Sentence {source.source_sentence} · relevance {source.relevance.toFixed(2)}</p><p className="mt-1 text-[11px] leading-5 text-[#5D5A70]">{source.sentence}</p></div>)}</div>}{item.role === "assistant" && item.message && <p className="mt-2 text-[9px] leading-5 text-[#858397]">{item.message}</p>}</div>)}</div>}
        </div>
        </div>}
        {error && <p role="alert" className="mt-3 rounded-xl bg-[#FFF5F7] px-3 py-2 text-xs text-[#A64F6B]">{error}</p>}
        {pack && (
          <div className="mt-6 space-y-7">
            <div>
              <div className="mb-3 flex items-center gap-2"><BookOpenCheck size={15} className="text-[#7668E8]" /><h4 className="text-xs font-extrabold text-ink">Concept explorer</h4><span className="text-[10px] text-[#9997A8]">{pack.concepts.length} source concepts</span></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {pack.concepts.map((concept) => <article key={concept.term} className="rounded-xl border border-[#EAE6F5] bg-white p-4"><p className="text-xs font-extrabold capitalize text-[#6B5ED2]">{concept.term}</p><p className="mt-2 text-xs leading-6 text-[#55536B]">{concept.context}</p><p className="mt-2 border-t border-[#F0EDF7] pt-2 text-[10px] leading-5 text-[#8A829D]">{concept.study_hint}</p></article>)}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-extrabold text-ink">Revision notes · {pack.notes.length} key points</h4>
              <ol className="space-y-2">{pack.notes.map((note) => <li key={note.number} className="flex gap-3 rounded-xl bg-[#FAF9FF] p-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#EDE9FF] text-[10px] font-extrabold text-[#6C5ED2]">{note.number}</span><p className="text-xs leading-6 text-[#5D5A70]">{note.text}</p></li>)}</ol>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-extrabold text-ink">Flashcards</h4><span className="text-[10px] text-[#9997A8]">Tap to reveal</span></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {pack.flashcards.map((card, index) => { const show = flipped.includes(index); return <button key={card.term + index} type="button" onClick={() => setFlipped((current) => show ? current.filter((item) => item !== index) : [...current, index])} className="focus-ring min-h-[125px] rounded-2xl border border-[#EAE6F5] bg-white p-4 text-left transition hover:border-[#CFC7F5] hover:shadow-card"><span className="text-[9px] font-bold uppercase tracking-[1.3px] text-[#8C80DA]">{show ? "Source answer" : "Question"} · {index + 1}</span><p className="mt-3 text-xs font-semibold leading-6 text-[#55536B]">{show ? card.back : card.front}</p></button>; })}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-extrabold text-ink">Knowledge check · {pack.difficulty}</h4><span className="text-[10px] text-[#9997A8]">{pack.quiz.length} questions</span></div>
              <div className="space-y-3">
                {pack.quiz.map((question, index) => <div key={index} className="rounded-2xl border border-[#EAE6F5] bg-white p-4"><p className="text-xs font-semibold leading-6 text-[#55536B]">{index + 1}. {question.question}</p><div className="mt-3 flex flex-wrap gap-2">{question.options.map((option) => { const chosen = answers[index] === option; const correct = option === question.answer; const graded = answers[index] !== undefined; return <button key={option} type="button" disabled={graded} onClick={() => setAnswers((current) => ({ ...current, [index]: option }))} className={`focus-ring rounded-lg border px-3 py-2 text-[10px] font-semibold transition ${graded && correct ? "border-[#BDE3CF] bg-[#EFF9F3] text-[#397E61]" : chosen ? "border-[#E8C7D2] bg-[#FFF3F6] text-[#A64F6B]" : "border-[#ECEAF3] bg-[#FBFAFD] text-[#77768B] hover:border-[#CFC7F5]"}`}>{option}</button>; })}</div>{answers[index] !== undefined && <p className="mt-3 text-[10px] leading-5 text-[#77768B]">{answers[index] === question.answer ? "Correct. " : `Answer: ${question.answer}. `}{question.explanation}</p>}</div>)}
              </div>
              {pack.quiz.length > 0 && <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] font-bold text-[#6B5ED2]">Score: {score} / {pack.quiz.length}</p><button type="button" disabled={answeredCount !== pack.quiz.length} onClick={finishQuiz} className="rounded-lg bg-[#7668E8] px-4 py-2 text-[10px] font-bold text-white disabled:opacity-40"><Target size={13} className="mr-1 inline" />Save session result</button></div>}
            </div>
            <p className="rounded-xl bg-[#FFF8EA] px-3 py-2 text-[10px] leading-5 text-[#98733B]">{pack.method} {pack.warnings.join(" ")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
