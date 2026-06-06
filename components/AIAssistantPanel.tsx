"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ChatMessage from './ChatMessage';

type Message = { id: string; role: string; content: string; created_at?: string };

type OnboardingSession = {
  id: string;
  current_step: string;
  is_completed: boolean;
};

const STEPS = [
  'STEP_1_BOOKING_TYPE',
  'STEP_2_PRICING',
  'STEP_3_DURATION',
  'STEP_4_AVAILABILITY',
  'STEP_5_CALENDAR',
  'STEP_6_COMPLETE',
];

const STEP_LABELS: Record<string, string> = {
  STEP_1_BOOKING_TYPE: 'Booking Type',
  STEP_2_PRICING: 'Pricing',
  STEP_3_DURATION: 'Duration',
  STEP_4_AVAILABILITY: 'Availability',
  STEP_5_CALENDAR: 'Calendar',
  STEP_6_COMPLETE: 'Complete',
};

export default function AIAssistantPanel() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [bookingLink, setBookingLink] = useState<string | null>(null);
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/onboarding/resume');
        const body = await res.json();
        const convoId = body?.session?.conversation_id || body?.conversation?.id;
        if (convoId) setConversationId(convoId);
        if (body?.messages) setMessages(body.messages || []);
        if (body?.session) setSession(body.session);
        if (body?.bookingLink) setBookingLink(body.bookingLink);
      } catch (err) {
        console.error('resume error', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const activeStepIndex = session ? STEPS.indexOf(session.current_step) : 0;

  const handleSend = async (text: string) => {
    if (!text || !conversationId) return;
    setSending(true);
    setTyping(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text }),
      });
      const body = await res.json();

      if (body?.userMessage) setMessages((m) => [...m, body.userMessage]);
      if (body?.assistantMessage) setMessages((m) => [...m, body.assistantMessage]);
      if (body?.session) setSession(body.session);
      if (body?.bookingLink) setBookingLink(body.bookingLink);
      if (body?.nextStep) setSession((prev) => prev ? { ...prev, current_step: body.nextStep, is_completed: body.isCompleted ?? prev.is_completed } : prev);
    } catch (err) {
      console.error('send error', err);
    } finally {
      setSending(false);
      setTyping(false);
      setInput('');
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice input not supported in this browser');
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.onresult = (ev: any) => {
      const transcript = ev.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    recog.onend = () => {
      setListening(false);
    };
    recog.start();
    recognitionRef.current = recog;
    setListening(true);
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col overflow-hidden" style={{ height: '85vh' }}>
        <header className="flex flex-col gap-2 px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-400" />
            <div>
              <div className="text-lg font-semibold text-slate-900">Calnize Onboarding Assistant</div>
              <div className="text-sm text-slate-500">Your progress is shown here while we configure your booking page.</div>
            </div>
          </div>

          <div className="overflow-x-auto py-2">
            <div className="inline-flex gap-2 min-w-full">
              {STEPS.map((step, index) => {
                const active = index === activeStepIndex;
                const completed = index < activeStepIndex;
                return (
                  <div
                    key={step}
                    className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${completed ? 'bg-slate-900 text-white border-slate-900' : active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                  >
                    {STEP_LABELS[step]}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <div>Step {Math.min(activeStepIndex + 1, STEPS.length)} of {STEPS.length}</div>
            <div>{STEP_LABELS[session?.current_step || STEPS[0]]}</div>
          </div>
        </header>

        <div ref={listRef} className="flex-1 overflow-auto p-5 space-y-4 bg-white">
          {messages.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
              Hello! I&apos;m ready to guide you through the onboarding flow. Start by typing your first answer.
            </div>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} content={m.content} />
          ))}
          {typing && <div className="text-slate-400">Assistant is typing…</div>}
        </div>

        <div className="p-5 border-t border-slate-200 bg-slate-50">
          {session?.is_completed || bookingLink ? (
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-slate-900">
              <div className="text-sm font-semibold text-indigo-900">Onboarding complete</div>
              <p className="mt-2 text-sm text-slate-700">
                Your booking page is ready. Share the link below or head to the dashboard to manage availability.
              </p>
              {bookingLink ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={bookingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-100"
                  >
                    Open booking page
                  </a>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    Go to dashboard
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
              <button
                type="button"
                onClick={() => (listening ? stopListening() : startListening())}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {listening ? 'Stop' : 'Voice'}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input); }}
                placeholder="Type your answer here"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => handleSend(input)}
                disabled={sending || !input.trim()}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
