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
      className="fixed bottom-8 right-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:scale-105 active:scale-95 text-white px-7 py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.6)] transition-all duration-300 z-50 flex items-center gap-3 font-semibold border-2 border-white/20 backdrop-blur-sm"
      aria-label="Share Feedback"
    >
      <span className="text-xl">💬</span>
      <span className="hidden sm:inline tracking-wide">Feedback</span>
    </button>
  );
}
