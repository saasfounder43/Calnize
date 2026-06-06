'use client';

import { useState } from 'react';

const VIRTUAL_PLATFORMS = [
  { label: 'Google Meet', value: 'google-meet' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Microsoft Teams', value: 'teams' },
  { label: 'Custom link', value: 'custom' },
];

interface StepMeetingTypeProps {
  onNext: (value: { meetingMode: string; meetingLink: string | null; location: string | null }) => void;
  onBack: () => void;
}

export default function StepMeetingType({ onNext, onBack }: StepMeetingTypeProps) {
  const [mode, setMode] = useState<'virtual' | 'in-person' | null>(null);
  const [platform, setPlatform] = useState('google-meet');
  const [customLink, setCustomLink] = useState('');
  const [locationText, setLocationText] = useState('');

  const handleNext = () => {
    if (mode === 'virtual') {
      onNext({
        meetingMode: 'virtual',
        meetingLink: platform === 'custom' ? customLink : platform,
        location: null,
      });
    } else {
      onNext({
        meetingMode: 'in-person',
        meetingLink: null,
        location: locationText,
      });
    }
  };

  const canProceed =
    mode === 'virtual'
      ? platform !== 'custom' || customLink.length > 0
      : locationText.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Preferred meeting type?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          How do you meet your clients?
        </p>
      </div>

      {!mode ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setMode('virtual')}
            className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-left text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition"
          >
            🌐 Virtual — online meeting
          </button>
          <button
            onClick={() => setMode('in-person')}
            className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-left text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition"
          >
            📍 In-person — physical location
          </button>
        </div>
      ) : mode === 'virtual' ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {VIRTUAL_PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                  platform === p.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {platform === 'custom' && (
            <input
              type="url"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              placeholder="https://meet.example.com/your-link"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
            />
          )}
        </div>
      ) : (
        <input
          type="text"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          placeholder="e.g. 123 Main St, New York"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
        />
      )}

      {mode && (
        <div className="flex gap-3">
          <button
            onClick={() => setMode(null)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition"
          >
            Continue →
          </button>
        </div>
      )}

      {!mode && (
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 transition text-left"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
