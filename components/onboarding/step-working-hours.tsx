'use client';

import { useState } from 'react';
import { DEFAULT_AVAILABILITY, DayAvailability } from '@/lib/onboarding/setupAvailability';

interface StepWorkingHoursProps {
  onNext: (availability: DayAvailability[]) => void;
  onBack: () => void;
}

export default function StepWorkingHours({ onNext, onBack }: StepWorkingHoursProps) {
  const [availability, setAvailability] = useState<DayAvailability[]>(DEFAULT_AVAILABILITY);

  const toggleDay = (index: number) => {
    setAvailability((prev) =>
      prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          When are you available?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Set your weekly working hours.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {availability.map((day, index) => (
          <div
            key={day.day}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
              day.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <button
              onClick={() => toggleDay(index)}
              className={`w-10 text-xs font-semibold tracking-wide transition ${
                day.enabled ? 'text-gray-900' : 'text-gray-300'
              }`}
            >
              {day.day.slice(0, 3).toUpperCase()}
            </button>

            {day.enabled ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => updateTime(index, 'startTime', e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-gray-900"
                />
                <span className="text-gray-300 text-xs">→</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => updateTime(index, 'endTime', e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-gray-900"
                />
              </div>
            ) : (
              <span className="text-xs text-gray-300 flex-1">Unavailable</span>
            )}

            <button
              onClick={() => toggleDay(index)}
              className={`w-8 h-5 rounded-full transition-colors ${
                day.enabled ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block w-3 h-3 rounded-full bg-white mx-auto transition-transform ${
                  day.enabled ? 'translate-x-1.5' : '-translate-x-1.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext(availability)}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
