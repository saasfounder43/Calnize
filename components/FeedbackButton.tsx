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
      className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center gap-2 font-medium"
      aria-label="Share Feedback"
    >
      <span>💬</span>
      <span className="hidden sm:inline">Feedback</span>
    </button>
  );
}
