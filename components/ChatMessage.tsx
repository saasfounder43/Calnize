"use client";

import React from 'react';

export default function ChatMessage({ role, content }: { role: string; content: string }) {
  const isAssistant = role === 'assistant' || role === 'system';
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`${isAssistant ? 'bg-gray-100 text-gray-900' : 'bg-indigo-600 text-white'} p-3 rounded-lg max-w-[80%]`}> 
        <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
      </div>
    </div>
  );
}
