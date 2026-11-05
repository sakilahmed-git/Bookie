"use client";

import { useState } from "react";
import { FileText, GraduationCap, LoaderCircle, Sparkles, Upload } from "lucide-react";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  apiUrl: string;
};

type Pack = {
  notes: { number: number; text: string }[];
  flashcards: { front: string; back: string; term: string }[];
  quiz: { question: string; options: string[]; answer: string; explanation: string }[];
  method: string;
  warnings: string[];
};

export default function StudyWorkspace({ text, onTextChange, apiUrl }: Props) {
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pack, setPack] = useState<Pack | null>(null);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    setPack(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${apiUrl}/api/v1/documents/extract`, {
        method: "POST",
        body: form,
      });
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
        body: JSON.stringify({ text }),
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

  return (
    <section id="study" className="mt-11 scroll-mt-24">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#9B98AB]">Turn reading into recall</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-[-.7px] text-ink">Your study space</h2>
        <p className="mt-1 text-xs text-[#858397]">Import a document, then create revision notes, flashcards, and a quick knowledge check.</p>
      </div>
      <div className="panel rounded-[22px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#F0EDFF] text-[#7668E8]"><GraduationCap size={21} /></span>
            <div>
              <h3 className="text-sm font-extrabold text-ink">Build a study pack</h3>
              <p className="mt-1 text-[10px] text-[#9694A6]">Based on the text currently loaded in your workspace</p>
            </div>
          </div>
          <button type="button" onClick={generate} disabled={generating || uploading} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#7668E8] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#685BD7] disabled:opacity-60">
            {generating ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? "Building..." : "Generate study pack"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#DDD8F0] bg-[#FAF9FF] px-4 py-3">
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
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-ink">Revision notes</h4>
                <span className="text-[10px] text-[#9997A8]">{pack.notes.length} key points</span>
              </div>
              <ol className="space-y-2">
                {pack.notes.map((note) => (
                  <li key={note.number} className="flex gap-3 rounded-xl bg-[#FAF9FF] p-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#EDE9FF] text-[10px] font-extrabold text-[#6C5ED2]">{note.number}</span>
                    <p className="text-xs leading-6 text-[#5D5A70]">{note.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-ink">Flashcards</h4>
                <span className="text-[10px] text-[#9997A8]">Tap a card to reveal its answer</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {pack.flashcards.map((card, index) => {
                  const showAnswer = flipped.includes(index);
                  return (
                    <button key={card.term + index} type="button" onClick={() => setFlipped((current) => showAnswer ? current.filter((item) => item !== index) : [...current, index])} className="focus-ring min-h-[125px] rounded-2xl border border-[#EAE6F5] bg-white p-4 text-left transition hover:border-[#CFC7F5] hover:shadow-card">
                      <span className="text-[9px] font-bold uppercase tracking-[1.3px] text-[#8C80DA]">{showAnswer ? "Source answer" : "Question"} · {index + 1}</span>
                      <p className="mt-3 text-xs font-semibold leading-6 text-[#55536B]">{showAnswer ? card.back : card.front}</p>
                      <span className="mt-3 inline-block text-[9px] font-bold text-[#8A80D5]">{showAnswer ? "Tap to see question" : "Tap to reveal answer"}</span>
                    </button>
                  );
                })}
                {!pack.flashcards.length && <p className="text-xs text-[#9694A6]">Not enough distinct key terms were found to create flashcards.</p>}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-ink">Knowledge check</h4>
                <span className="text-[10px] text-[#9997A8]">{pack.quiz.length} questions</span>
              </div>
              <div className="space-y-3">
                {pack.quiz.map((question, index) => (
                  <div key={index} className="rounded-2xl border border-[#EAE6F5] bg-white p-4">
                    <p className="text-xs font-semibold leading-6 text-[#55536B]">{index + 1}. {question.question}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.options.map((option) => {
                        const chosen = answers[index] === option;
                        const correct = option === question.answer;
                        const graded = answers[index] !== undefined;
                        return (
                          <button key={option} type="button" onClick={() => setAnswers((current) => ({ ...current, [index]: option }))} className={`focus-ring rounded-lg border px-3 py-2 text-[10px] font-semibold transition ${graded && correct ? "border-[#BDE3CF] bg-[#EFF9F3] text-[#397E61]" : chosen ? "border-[#E8C7D2] bg-[#FFF3F6] text-[#A64F6B]" : "border-[#ECEAF3] bg-[#FBFAFD] text-[#77768B] hover:border-[#CFC7F5]"}`}>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {answers[index] !== undefined && <p className="mt-3 text-[10px] leading-5 text-[#77768B]">{answers[index] === question.answer ? "Correct. " : `Not quite — the answer is ${question.answer}. `}{question.explanation}</p>}
                  </div>
                ))}
                {!pack.quiz.length && <p className="text-xs text-[#9694A6]">This source did not contain enough distinct terms to build a quiz.</p>}
              </div>
              {pack.quiz.length > 0 && <p className="mt-3 text-[11px] font-bold text-[#6B5ED2]">Score: {pack.quiz.filter((item, index) => answers[index] === item.answer).length} / {pack.quiz.length}</p>}
            </div>
            <p className="rounded-xl bg-[#FFF8EA] px-3 py-2 text-[10px] leading-5 text-[#98733B]">{pack.method} {pack.warnings.join(" ")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
