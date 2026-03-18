'use client';

import { useState } from 'react';

interface SuccessScreenProps {
  slug: string;
  meetingType: string;
}

export default function SuccessScreen({ slug, meetingType }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const bookingLink = `https://calnize.com/${slug}/${meetingType}`;
  const whatsappText = encodeURIComponent(`Hi, book a meeting with me here: ${bookingLink}`);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl">🎉</div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Your booking page is ready!
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Share it with anyone to let them book time with you.
        </p>
      </div>

      <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
        <p className="text-sm font-medium text-gray-700 break-all">{bookingLink}</p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={handleCopy}
          className="w-full px-4 py-3 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          {copied ? '✓ Copied!' : 'Copy link'}
        </button>

        <a
          href={bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center block"
        >
          Open booking page
        </a>

        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100 transition text-center block"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
