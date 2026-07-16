"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
Loader2,
Mic,
MicOff,
Sparkles,
ChevronDown,
ChevronUp,
CheckCircle2,
AlertCircle,
History,
X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { ParsedAiCommand } from "@/lib/ai/types";

const EXAMPLE_PROMPTS = [
"Block Fridays after 6 PM",
"Create a paid consultation for ₹999",
"Set my availability from 10 AM to 6 PM weekdays",
"Add 15 minute buffer between meetings",
];

type Phase = "idle" | "parsing" | "ready" | "executing" | "done" | "error";

interface HistoryItem {
id: string;
raw_prompt: string;
parsed_intent: string | null;
execution_status: string;
response_message: string | null;
created_at: string;
}

export default function AICommandBar() {
const [open, setOpen] = useState(false);
const [prompt, setPrompt] = useState("");
const [phase, setPhase] = useState<Phase>("idle");
const [parsed, setParsed] = useState<ParsedAiCommand | null>(null);
const [commandLogId, setCommandLogId] = useState<string | null>(null);
const [resultMessage, setResultMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");
const [showExamples, setShowExamples] = useState(false);
const [showHistory, setShowHistory] = useState(false);
const [history, setHistory] = useState<HistoryItem[]>([]);
const [listening, setListening] = useState(false);
const recognitionRef = useRef<SpeechRecognition | null>(null);
const inputRef = useRef<HTMLInputElement>(null);
const panelRef = useRef<HTMLDivElement>(null);

const loadHistory = useCallback(async () => {
const {
data: { session },
} = await supabase.auth.getSession();
if (!session) return;

const res = await fetch("/api/ai/history?limit=15", {
headers: { Authorization: `Bearer ${session.access_token}` },
});
if (!res.ok) return;
const data = await res.json();
if (data.commands) setHistory(data.commands);
}, []);

useEffect(() => {
if (showHistory && open) loadHistory();
}, [showHistory, open, loadHistory]);

useEffect(() => {
if (!open) return;
const onKey = (e: KeyboardEvent) => {
if (e.key === "Escape") setOpen(false);
};
document.addEventListener("keydown", onKey);
return () => document.removeEventListener("keydown", onKey);
}, [open]);

useEffect(() => {
if (!open) return;
const t = window.setTimeout(() => inputRef.current?.focus(), 120);
return () => window.clearTimeout(t);
}, [open]);

// The panel is now a full-page overlay, so lock background scroll while
// it's open — otherwise the dashboard page behind it can still scroll
// (e.g. via elastic overscroll on iOS), which looks broken for a
// full-screen surface.
useEffect(() => {
if (!open) return;
const previousOverflow = document.body.style.overflow;
document.body.style.overflow = "hidden";
return () => {
document.body.style.overflow = previousOverflow;
};
}, [open]);

const authFetch = async (url: string, body: Record<string, unknown>) => {
const {
data: { session },
} = await supabase.auth.getSession();
if (!session) throw new Error("You must be logged in to use the AI assistant.");

return fetch(url, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${session.access_token}`,
},
credentials: "include",
body: JSON.stringify(body),
});
};

const handleParse = async () => {
const text = prompt.trim();
if (!text) return;

setPhase("parsing");
setErrorMessage("");
setResultMessage("");
setParsed(null);

try {
const res = await authFetch("/api/ai/parse", { prompt: text });
const data = await res.json();

if (!res.ok) {
throw new Error(data.error || "Failed to parse command");
}

const p = data.parsed as ParsedAiCommand;
setCommandLogId(data.command_log_id ?? null);
setParsed(p);

if (p.status === "success") {
setPhase("ready");
} else {
setPhase("error");
setErrorMessage(
p.clarification_needed || "Could not understand that command."
);
}
} catch (e) {
setPhase("error");
setErrorMessage(e instanceof Error ? e.message : "Something went wrong.");
}
};

const handleExecute = async (confirmed = false) => {
if (!parsed || parsed.status !== "success") return;

setPhase("executing");
setErrorMessage("");

try {
const res = await authFetch("/api/ai/execute", {
parsed,
command_log_id: commandLogId,
confirmed,
});
const data = await res.json();

if (res.status === 409 && data.error === "confirmation_required") {
setPhase("ready");
setErrorMessage("");
return;
}

if (!res.ok && res.status !== 422) {
throw new Error(data.error || "Execution failed");
}

const result = data.result;
if (result?.success) {
setPhase("done");
setResultMessage(result.message);
setPrompt("");
setParsed(null);
loadHistory();
} else {
setPhase("error");
setErrorMessage(result?.message || data.error || "Action failed");
}
} catch (e) {
setPhase("error");
setErrorMessage(e instanceof Error ? e.message : "Execution failed.");
}
};

const toggleVoice = () => {
const SpeechRecognitionCtor =
typeof window !== "undefined"
? (window as Window & {
SpeechRecognition?: typeof SpeechRecognition;
webkitSpeechRecognition?: typeof SpeechRecognition;
}).SpeechRecognition ||
(window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
.webkitSpeechRecognition
: undefined;

if (!SpeechRecognitionCtor) {
setErrorMessage("Voice input is not supported in this browser. Try Chrome or Edge.");
return;
}

if (listening && recognitionRef.current) {
recognitionRef.current.stop();
setListening(false);
return;
}

const recognition = new SpeechRecognitionCtor();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-US";

recognition.onresult = (event: SpeechRecognitionEvent) => {
const transcript = event.results[0]?.[0]?.transcript;
if (transcript) setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
setListening(false);
};

recognition.onerror = () => {
setListening(false);
setErrorMessage("Could not capture voice. Check microphone permissions.");
};

recognition.onend = () => setListening(false);

recognitionRef.current = recognition;
recognition.start();
setListening(true);
};

const needsConfirmation = parsed?.requires_confirmation && phase === "ready";
const busy = phase === "parsing" || phase === "executing";

const toggleOpen = () => setOpen((v) => !v);

return (
<div className="ai-assistant-root" aria-live="polite">
{open && (
<button
type="button"
className="ai-assistant-backdrop"
aria-label="Close AI assistant"
onClick={() => setOpen(false)}
/>
)}

{open && (
<div
ref={panelRef}
id="ai-assistant-panel"
className="ai-assistant-panel"
role="dialog"
aria-modal="true"
aria-labelledby="ai-assistant-title"
onClick={(e) => e.stopPropagation()}
>
<div className="ai-assistant-panel-header">
<Sparkles size={18} color="var(--color-accent-light)" aria-hidden />
<div style={{ flex: 1, minWidth: 0 }}>
<h2
id="ai-assistant-title"
style={{
fontSize: "15px",
fontWeight: 600,
margin: 0,
lineHeight: 1.3,
}}
>
AI Scheduling Assistant
</h2>
<span
className="badge badge-neutral"
style={{ fontSize: "10px", marginTop: "4px", display: "inline-block" }}
>
Beta
</span>
</div>
<button
type="button"
onClick={() => setShowHistory((v) => !v)}
className="btn-secondary btn-sm"
style={{
display: "flex",
alignItems: "center",
gap: "4px",
padding: "6px 10px",
fontSize: "12px",
}}
aria-expanded={showHistory}
>
<History size={14} />
<span className="ai-assistant-history-label">History</span>
{showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
</button>
<button
type="button"
onClick={() => setOpen(false)}
className="btn-secondary btn-icon"
aria-label="Close"
style={{
width: 36,
height: 36,
padding: 0,
display: "flex",
alignItems: "center",
justifyContent: "center",
}}
>
<X size={18} />
</button>
</div>

<div className="ai-assistant-panel-body">
<div className="ai-assistant-input-row">
<input
ref={inputRef}
type="text"
enterKeyHint="send"
value={prompt}
onChange={(e) => setPrompt(e.target.value)}
onKeyDown={(e) => {
if (e.key === "Enter" && !busy) {
if (phase === "ready") handleExecute(needsConfirmation);
else handleParse();
}
}}
placeholder="Tell Calnize what to do..."
disabled={busy}
/>
<button
type="button"
onClick={toggleVoice}
className="btn-secondary btn-icon"
title="Voice input"
aria-label={listening ? "Stop listening" : "Voice input"}
disabled={busy}
>
{listening ? (
<MicOff size={18} color="var(--color-danger)" />
) : (
<Mic size={18} />
)}
</button>
{phase === "ready" ? (
<button
type="button"
onClick={() => handleExecute(needsConfirmation)}
className="btn-primary btn-send"
disabled={busy}
>
{needsConfirmation ? "Confirm" : "Run"}
</button>
) : (
<button
type="button"
onClick={handleParse}
className="btn-primary btn-send"
disabled={!prompt.trim() || busy}
>
{phase === "parsing" ? (
<Loader2 size={18} className="animate-spin" />
) : (
"Send"
)}
</button>
)}
</div>

<button
type="button"
onClick={() => setShowExamples((v) => !v)}
style={{
marginTop: "12px",
fontSize: "13px",
color: "var(--color-accent-light)",
background: "none",
border: "none",
cursor: "pointer",
padding: "4px 0",
fontWeight: 500,
}}
>
{showExamples ? "Hide examples" : "Show examples"}
</button>

{showExamples && (
<div
style={{
display: "flex",
flexDirection: "column",
gap: "8px",
marginTop: "10px",
}}
>
{EXAMPLE_PROMPTS.map((ex) => (
<button
key={ex}
type="button"
onClick={() => setPrompt(ex)}
className="btn-secondary btn-sm"
style={{
fontSize: "13px",
textAlign: "left",
justifyContent: "flex-start",
whiteSpace: "normal",
lineHeight: 1.4,
padding: "10px 12px",
}}
>
{ex}
</button>
))}
</div>
)}

{parsed?.status === "success" && phase === "ready" && (
<div
style={{
marginTop: "14px",
padding: "12px 14px",
borderRadius: "var(--radius-md)",
background: "var(--color-bg-secondary)",
border: "1px solid var(--color-border)",
fontSize: "13px",
}}
>
<p style={{ margin: "0 0 8px", fontWeight: 600 }}>
{parsed.summary || `Ready to run: ${parsed.intent}`}
</p>
{needsConfirmation && (
<p style={{ margin: 0, color: "var(--color-warning)", fontSize: "12px" }}>
This may change your schedule — tap Confirm to proceed.
</p>
)}
<button
type="button"
onClick={() => {
setParsed(null);
setPhase("idle");
}}
style={{
marginTop: "10px",
fontSize: "12px",
color: "var(--color-text-muted)",
background: "none",
border: "none",
cursor: "pointer",
padding: 0,
}}
>
Cancel
</button>
</div>
)}

{phase === "done" && resultMessage && (
<div
style={{
marginTop: "14px",
display: "flex",
alignItems: "flex-start",
gap: "8px",
color: "var(--color-success)",
fontSize: "14px",
}}
>
<CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
<span>{resultMessage}</span>
</div>
)}

{errorMessage && (
<div
style={{
marginTop: "14px",
display: "flex",
alignItems: "flex-start",
gap: "8px",
color: "var(--color-danger)",
fontSize: "14px",
}}
>
<AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
<span>{errorMessage}</span>
</div>
)}

{showHistory && (
<div
style={{
marginTop: "16px",
borderTop: "1px solid var(--color-border)",
paddingTop: "14px",
}}
>
{history.length === 0 ? (
<p
style={{
fontSize: "13px",
color: "var(--color-text-muted)",
margin: 0,
}}
>
No commands yet.
</p>
) : (
<ul
style={{
listStyle: "none",
padding: 0,
margin: 0,
display: "flex",
flexDirection: "column",
gap: "8px",
}}
>
{history.map((item) => (
<li
key={item.id}
style={{
fontSize: "12px",
padding: "10px 12px",
background: "var(--color-bg-secondary)",
borderRadius: "var(--radius-sm)",
}}
>
<span style={{ color: "var(--color-text-muted)" }}>
{new Date(item.created_at).toLocaleString()} ·{" "}
{item.parsed_intent || "—"} · {item.execution_status}
</span>
<p style={{ margin: "4px 0 0", fontWeight: 500 }}>
{item.raw_prompt}
</p>
</li>
))}
</ul>
)}
</div>
)}
</div>
</div>
)}

<button
type="button"
className={`ai-assistant-fab${open ? " is-open" : ""}`}
onClick={toggleOpen}
aria-expanded={open}
aria-controls="ai-assistant-panel"
aria-label={open ? "Close AI scheduling assistant" : "Open AI scheduling assistant"}
>
{!open && <span className="ai-assistant-fab-badge">AI</span>}
{open ? <X size={22} /> : <Sparkles size={24} />}
</button>
</div>
);
}