'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SuccessScreenProps {
  slug: string;
  meetingType: string;
}

export default function SuccessScreen({ slug, meetingType }: SuccessScreenProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const router = useRouter();

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.calnize.com';
  const bookingLink = `${origin}/${slug}/${meetingType}`.replace(/([^:]\/)\/+/g, "$1");
  const whatsappText = encodeURIComponent(`Hi, book a meeting with me here: ${bookingLink}`);
  const embedHtml = `<a href="${bookingLink}" style="background-color: #6c5ce7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Book a Meeting</a>`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(bookingLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(embedHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl">🎉</div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Your booking page is ready!</h2>
        <p className="mt-1 text-sm text-gray-500">Share it with anyone to let them book time with you.</p>
      </div>

      <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
        <p className="flex-1 text-sm font-medium text-gray-700 break-all text-left">{bookingLink}</p>
        <button onClick={handleCopyLink} title="Copy link" className="shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-400 hover:text-gray-700">
          {copiedLink ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-3 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition text-center block">
          Open booking page
        </a>
        <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100 transition text-center block">
          Share on WhatsApp
        </a>
        <button onClick={handleCopyHtml} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
          {copiedHtml ? '✓ HTML Copied!' : 'Copy button HTML for your website'}
        </button>
        <button onClick={() => router.push('/dashboard')} className="w-full px-4 py-3 rounded-xl border border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition mt-1">
          Go to Dashboard →
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center pb-1">
        📋 You'll find your booking link, availability settings, and all details on your dashboard too.
      </p>
    </div>
  );
}
