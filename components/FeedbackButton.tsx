'use client';

import { useEffect } from 'react';

export default function FeedbackButton() {
  useEffect(() => {
    // Load Tally script only once
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <button
      data-tally-open="EkbP1q"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      className="fixed top-1/2 right-0 -translate-y-1/2 translate-x-[1.6rem] -rotate-90 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 text-white px-6 py-3 rounded-t-2xl shadow-2xl transition-all duration-300 z-50 flex items-center gap-3 font-semibold border-x-2 border-t-2 border-white/20"
      aria-label="Share Feedback"
    >
      <span className="text-lg">💬</span>
      <span className="tracking-wide">Feedback</span>
    </button>
  );
}
