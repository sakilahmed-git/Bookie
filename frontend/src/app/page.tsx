"use client";
import { useMemo, useState } from "react";
import StudyWorkspace from "./StudyWorkspace";
import { ArrowRight, BookOpen, BrainCircuit, Check, ChevronRight, Clock3, FileText, GraduationCap, LayoutDashboard, LoaderCircle, MessageCircle, ShieldCheck, Sparkles, UploadCloud, WandSparkles, X } from "lucide-react";

type Token = { text:string; lemma:string; pos:string; tag:string; is_stop:boolean; is_punctuation:boolean; is_alpha:boolean };
type Analysis = { statistics:{characters:number;words:number;sentences:number;entities:number}; sentences:string[]; tokens:Token[]; entities:{text:string;label:string;description:string|null}[]; keywords:{word:string;score:number}[]; model:{name:string;loaded:boolean}; warnings:string[] };
const sampleText = "Learning becomes more effective when new information is connected to what we already know. Active recall asks the learner to retrieve an idea from memory instead of simply rereading it. Spaced repetition strengthens that memory by revisiting important ideas over increasing intervals. Together, these techniques make study sessions more focused and help knowledge last longer.";
const navItems = [{label:"Overview",href:"#overview",icon:LayoutDashboard},{label:"Understand",href:"#understand",icon:BrainCircuit},{label:"Study",href:"#study",icon:GraduationCap},{label:"Ask Bookie",href:"#study",icon:MessageCircle}];

export default function Home() {
 const [text,setText]=useState(""); const [analysis,setAnalysis]=useState<Analysis|null>(null); const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const [activeTab,setActiveTab]=useState<"keywords"|"entities"|"sentences">("keywords");
 const apiUrl=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000";
 const wordCount=useMemo(()=>text.trim().split(/\s+/).filter(Boolean).length,[text]);
 async function analyseText(){
  if(text.trim().length<20){setError("Add at least 20 characters to get a useful breakdown.");return;}
  setLoading(true);setError("");setAnalysis(null);
  try { const response=await fetch(apiUrl+"/api/v1/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})}); const payload=await response.json(); if(!response.ok)throw new Error(payload.detail||"We couldn't analyse this source."); setAnalysis(payload); }
  catch(err){setError(err instanceof Error?err.message+" Make sure the Bookie API is running.":"Something went wrong. Please try again.");}
  finally{setLoading(false);}
 }
 return <main id="overview" className="bookie-app min-h-screen">
  <aside className="bookie-sidebar">
   <a href="#overview" className="brand-lockup" aria-label="Bookie home"><span className="brand-mark"><BookOpen size={21}/></span><span className="brand-word">bookie<span>.</span></span></a>
   <div className="sidebar-label">WORKSPACE</div>
   <nav className="sidebar-nav" aria-label="Main navigation">{navItems.map(({label,href,icon:Icon},i)=><a key={label} href={href} className={i===0?"sidebar-link active":"sidebar-link"}><Icon size={17}/><span>{label}</span>{i===0&&<span className="nav-dot"/>}</a>)}</nav>
   <div className="sidebar-bottom"><div className="sidebar-promo"><span className="promo-icon"><Sparkles size={17}/></span><p className="promo-title">Make every minute count.</p><p className="promo-copy">Turn a source into something you can understand, remember, and use.</p><a href="#understand" className="promo-link">Start learning <ArrowRight size={14}/></a></div><div className="sidebar-profile"><span className="profile-avatar">B</span><span><strong>Your workspace</strong><small>Personal knowledge studio</small></span><span className="profile-status"/></div></div>
  </aside>
  <div className="bookie-main">
   <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><BookOpen size={18}/></span><span className="brand-word">bookie<span>.</span></span></div><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>Overview</strong></div><div className="topbar-actions"><span className="secure-label"><ShieldCheck size={14}/> Your source stays yours</span><span className="top-avatar">B</span></div></header>
   <div className="page-content">
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-spark"><Sparkles size={13}/></span> YOUR PERSONAL KNOWLEDGE STUDIO</div><h1>Make knowledge <span>stick.</span></h1><p className="welcome-copy">Bring your ideas, notes, and documents. Bookie helps you make sense of them — then turn understanding into lasting knowledge.</p></div><div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-core"><BookOpen size={34}/></div><span className="art-chip chip-one"><BrainCircuit size={15}/> Understand</span><span className="art-chip chip-two"><GraduationCap size={15}/> Remember</span><span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✦</span></div></section>
    <section className="workflow-strip" aria-label="How Bookie works"><div className="workflow-step"><span className="step-number">01</span><span className="step-icon violet"><UploadCloud size={17}/></span><span><strong>Bring it in</strong><small>Paste or import your source</small></span></div><span className="workflow-connector"/><div className="workflow-step"><span className="step-number">02</span><span className="step-icon blue"><BrainCircuit size={17}/></span><span><strong>Make sense of it</strong><small>Find the ideas that matter</small></span></div><span className="workflow-connector"/><div className="workflow-step"><span className="step-number">03</span><span className="step-icon coral"><GraduationCap size={17}/></span><span><strong>Make it yours</strong><small>Practise and remember</small></span></div></section>
    <section id="understand" className="source-section scroll-mt-24"><div className="section-heading"><div><div className="section-kicker">YOUR STARTING POINT</div><h2>What are we learning today?</h2><p>Start with a passage, an idea, or a set of notes.</p></div><span className="source-limit"><Clock3 size={14}/> Up to 50,000 characters</span></div>
     <div className="source-card"><div className="source-card-top"><div className="source-title"><span className="source-title-icon"><FileText size={17}/></span><span><strong>Your source</strong><small>Only the material you provide is used</small></span></div><button type="button" className="text-button" onClick={()=>{setText(sampleText);setAnalysis(null);setError("");}}><Sparkles size={14}/> Try an example</button></div>
      <textarea value={text} onChange={e=>{setText(e.target.value);setAnalysis(null);}} placeholder="Paste your notes, an article, a chapter excerpt, or anything you want to understand..." aria-label="Your source material" className="source-editor" maxLength={50000}/>
      <div className="source-card-bottom"><div className="source-meta"><span>{wordCount.toLocaleString()} words</span><i/><span>{text.length.toLocaleString()} / 50,000 characters</span></div><button type="button" onClick={analyseText} disabled={loading||text.trim().length<20} className="primary-button">{loading?<LoaderCircle size={16} className="animate-spin"/>:<WandSparkles size={16}/ >}{loading?"Understanding...":"Understand this source"}{!loading&&<ArrowRight size={15}/>}</button></div>
      {error&&<div role="alert" className="inline-error"><X size={15}/>{error}</div>}
     </div><div className="source-footnote"><ShieldCheck size={14}/><span>Documents are processed in memory. Uploaded files are not saved by the extraction service.</span></div>
    </section>
    {analysis&&<section className="results-section"><div className="results-heading"><div><div className="section-kicker">SOURCE BREAKDOWN</div><h2>Here’s what stands out.</h2></div><span className="success-pill"><Check size={13}/> Analysis complete</span></div>
     <div className="metric-grid"><div className="metric-card"><span>Words</span><strong>{analysis.statistics.words.toLocaleString()}</strong><small>In your source</small></div><div className="metric-card"><span>Sentences</span><strong>{analysis.statistics.sentences.toLocaleString()}</strong><small>Ideas and statements</small></div><div className="metric-card"><span>Key entities</span><strong>{analysis.statistics.entities.toLocaleString()}</strong><small>People, places, concepts</small></div><div className="metric-card"><span>Characters</span><strong>{analysis.statistics.characters.toLocaleString()}</strong><small>Including spaces</small></div></div>
     <div className="insights-card"><div className="insights-tabs">{(["keywords","entities","sentences"] as const).map(tab=><button key={tab} type="button" onClick={()=>setActiveTab(tab)} className={activeTab===tab?"insight-tab active":"insight-tab"}>{tab==="keywords"?"Key ideas":tab==="entities"?"Named entities":"Sentences"}</button>)}</div>
      {activeTab==="keywords"&&<div className="keyword-cloud">{analysis.keywords.length?analysis.keywords.map(item=><span key={item.word} className="keyword-chip">{item.word}<small>{item.score.toFixed(2)}</small></span>):<p className="empty-state">No key ideas could be extracted from this source.</p>}</div>}
      {activeTab==="entities"&&<div className="entity-list">{analysis.entities.length?analysis.entities.map((item,i)=><div key={item.text+i} className="entity-row"><span className="entity-dot"/><strong>{item.text}</strong><span>{item.label.replaceAll("_"," ").toLowerCase()}</span></div>):<p className="empty-state">No named entities were found. Try a longer source with people, places, or organisations.</p>}</div>}
      {activeTab==="sentences"&&<ol className="sentence-list">{analysis.sentences.slice(0,12).map((sentence,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><p>{sentence}</p></li>)}</ol>}
      {analysis.warnings.length>0&&<p className="analysis-warning">{analysis.warnings.join(" ")}</p>}
     </div>
    </section>}
    <section className="capabilities-section"><div className="section-heading compact"><div><div className="section-kicker">ONE SOURCE, THREE WAYS FORWARD</div><h2>Choose how you want to work.</h2></div></div><div className="capability-grid">
     <a href="#understand" className="capability-card"><span className="capability-icon violet"><BrainCircuit size={20}/></span><span className="capability-arrow"><ArrowRight size={16}/></span><strong>Understand</strong><p>Break down a source, surface important terms, and see how the ideas fit together.</p><small>Explore your source <ChevronRight size={13}/></small></a>
     <a href="#study" className="capability-card"><span className="capability-icon blue"><GraduationCap size={20}/></span><span className="capability-arrow"><ArrowRight size={16}/></span><strong>Study</strong><p>Build revision notes, flip through flashcards, and check what you remember.</p><small>Build a study pack <ChevronRight size={13}/></small></a>
     <a href="#study" className="capability-card"><span className="capability-icon coral"><MessageCircle size={20}/></span><span className="capability-arrow"><ArrowRight size={16}/></span><strong>Ask Bookie</strong><p>Ask questions about your material and see the source passages behind answers.</p><small>Ask a question <ChevronRight size={13}/></small></a>
    </div></section>
    <StudyWorkspace text={text} onTextChange={setText} apiUrl={apiUrl}/>
    <footer className="app-footer"><a href="#overview" className="footer-brand">bookie<span>.</span></a><span>Make knowledge useful.</span><span>Built for focused learning.</span></footer>
   </div>
  </div>
 </main>;
}
