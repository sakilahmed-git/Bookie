"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, GraduationCap, LoaderCircle, Sparkles, Upload, Target, BookOpenCheck } from "lucide-react";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  apiUrl: string;
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

const PROGRESS_KEY = "bookie.study.progress.v1";

export default function StudyWorkspace({ text, onTextChange, apiUrl }: Props) {
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
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
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${apiUrl}/api/v1/documents/extract`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Document extraction failed.");
      onTextChange(result.text);
      setFilename(result.filename);
      if (result.truncated) setError("The document was shortened to 50,000 characters for this MVP.");
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
    <section id="study" className="mt-11 scroll-mt-24">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#9B98AB]">Turn reading into recall</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-[-.7px] text-ink">Your study space</h2>
        <p className="mt-1 text-xs text-[#858397]">Understand key terms, practise retrieval, and track your study sessions.</p>
      </div>
      <div className="panel rounded-[22px] p-5 sm:p-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#F0EDFF] text-[#7668E8]"><GraduationCap size={21} /></span>
            <div>
              <h3 className="text-sm font-extrabold text-ink">Build a smarter study pack</h3>
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
            <button type="button" onClick={generate} disabled={generating || uploading} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#7668E8] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#685BD7] disabled:opacity-60">
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
