'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mic, MicOff, Send, Sparkles } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import ChatMessage from '@/components/onboarding/ChatMessage';
import type { OnboardingStepKey } from '@/lib/onboarding/types';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatApiResponse {
  step: OnboardingStepKey;
  assistant_message: string;
  awaiting_action: boolean;
  requires_upgrade?: boolean;
  completed: boolean;
  booking_type_slug?: string;
  error?: string;
}

const RETURN_PATH = '/onboarding-ai';

export default function AgenticOnboardingPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [step, setStep] = useState<OnboardingStepKey>('profession');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [awaitingCalendarAction, setAwaitingCalendarAction] = useState(false);
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<'pro' | 'early' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [bookingTypeSlug, setBookingTypeSlug] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const authedFetch = async (url: string, init?: RequestInit) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('You must be logged in.');

    return fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...(init?.headers || {}),
      },
    });
  };

  const applyResponse = (data: ChatApiResponse) => {
    setStep(data.step);
    setAwaitingCalendarAction(Boolean(data.awaiting_action && data.step === 'calendar'));
    setRequiresUpgrade(Boolean(data.requires_upgrade));
    setCompleted(Boolean(data.completed));
    if (data.booking_type_slug) setBookingTypeSlug(data.booking_type_slug);
    setMessages((prev) => [...prev, { role: 'assistant', content: data.assistant_message }]);
  };

  const sendToChat = async (payload: { message?: string; action?: string }) => {
    setSending(true);
    setError('');
    try {
      const res = await authedFetch('/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data: ChatApiResponse = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      applyResponse(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  // Initial load: either resume normally, or handle a redirect return
  // (calendar connected, or plan upgraded) before showing anything.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const run = async () => {
      const stepParam = searchParams.get('step');
      const upgraded = searchParams.get('upgraded');

      // Google Sign-Up creates the user row server-side (app/auth/callback),
      // which has no way to know the browser's timezone. Correct it here —
      // harmless no-op if it's already right, whichever signup path was used.
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (user && detectedTz) {
          await supabase.from('users').update({ timezone: detectedTz }).eq('id', user.id);
        }
      } catch {
        // Non-critical — never block onboarding on this.
      }

      try {
        const res = await authedFetch('/api/onboarding/resume');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to resume.');

        setMessages(
          (data.messages || []).map((m: { role: 'user' | 'assistant'; content: string }) => ({
            role: m.role,
            content: m.content,
          }))
        );
        setStep(data.step);
        setCompleted(Boolean(data.completed));

        if (data.messages.length === 0) {
          // Brand new session — kick things off with the first prompt.
          await sendToChat({ action: 'start' });
        } else if (stepParam === 'calendar_done') {
          await sendToChat({ action: 'calendar_connected' });
        } else if (upgraded === 'true') {
          await sendToChat({ action: 'plan_upgraded' });
        } else {
          setAwaitingCalendarAction(data.step === 'calendar' && !data.completed);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load onboarding.');
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading && !sending && !awaitingCalendarAction && !requiresUpgrade && !completed) {
      inputRef.current?.focus();
    }
  }, [loading, sending, awaitingCalendarAction, requiresUpgrade, completed]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    await sendToChat({ message: text });
  };

  const handleConnectCalendar = () => {
    sessionStorage.setItem('onboarding_ai_calendar_connect', 'true');
    window.location.href = `/api/google/connect?return=${encodeURIComponent(`${RETURN_PATH}?step=calendar_done`)}`;
  };

  const handleSkipCalendar = () => {
    sendToChat({ action: 'skip_calendar' });
  };

  const handleUpgrade = async (plan: 'pro' | 'early') => {
    setUpgradingPlan(plan);
    try {
      const res = await authedFetch('/api/billing/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ plan, returnPath: `${RETURN_PATH}?upgraded=true` }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || 'Upgrade link is not configured yet. Please contact support.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Unable to start checkout right now. Please try again.');
    } finally {
      setUpgradingPlan(null);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? (window as Window & {
            SpeechRecognition?: typeof SpeechRecognition;
            webkitSpeechRecognition?: typeof SpeechRecognition;
          }).SpeechRecognition ||
          (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
            .webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
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
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      setError('Could not capture voice. Check microphone permissions.');
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Loader2 size={28} className="animate-spin" color="var(--color-accent)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 4px 18px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #6c5ce7 0%, #00cec9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            Ask Cal
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
            Your AI Assistant
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 4px 20px' }}>
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            color: 'var(--color-danger)',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {completed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
          <button type="button" className="btn-primary" onClick={() => router.push('/dashboard')}>
            Go to dashboard
          </button>
          {bookingTypeSlug && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
              Your booking page: /{bookingTypeSlug}
            </p>
          )}
        </div>
      ) : requiresUpgrade ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
          <button
            type="button"
            className="btn-primary"
            disabled={upgradingPlan !== null}
            onClick={() => handleUpgrade('early')}
          >
            {upgradingPlan === 'early' ? 'Redirecting...' : 'Get Lifetime Access — $21'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={upgradingPlan !== null}
            onClick={() => handleUpgrade('pro')}
          >
            {upgradingPlan === 'pro' ? 'Redirecting...' : 'Try for a Month — $9/month'}
          </button>
        </div>
      ) : awaitingCalendarAction ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
          <button type="button" className="btn-primary" onClick={handleConnectCalendar}>
            Connect Google Calendar
          </button>
          <button type="button" className="btn-secondary" onClick={handleSkipCalendar} disabled={sending}>
            Skip for now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '20px' }}>
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !sending) handleSend();
            }}
            placeholder="Type your answer..."
            disabled={sending}
          />
          <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
            {listening && (
              <>
                <span className="mic-pulse-ring" style={{ animationDelay: '0s' }} />
                <span className="mic-pulse-ring" style={{ animationDelay: '0.5s' }} />
              </>
            )}
            <button
              type="button"
              onClick={toggleVoice}
              className="btn-secondary"
              title="Voice input"
              aria-label={listening ? 'Stop listening' : 'Voice input'}
              disabled={sending}
              style={{
                position: 'relative',
                zIndex: 1,
                width: 44,
                height: 44,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: listening ? 'rgba(255, 107, 107, 0.12)' : undefined,
                borderColor: listening ? 'var(--color-danger)' : undefined,
              }}
            >
              {listening ? <MicOff size={18} color="var(--color-danger)" /> : <Mic size={18} />}
            </button>
          </div>
          <style>{`
            @keyframes mic-pulse {
              0% { transform: scale(1); opacity: 0.6; }
              100% { transform: scale(1.9); opacity: 0; }
            }
            .mic-pulse-ring {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              border: 2px solid var(--color-danger);
              animation: mic-pulse 1.4s ease-out infinite;
              pointer-events: none;
            }
          `}</style>
          <button
            type="button"
            onClick={handleSend}
            className="btn-primary"
            disabled={!input.trim() || sending}
            style={{ width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}