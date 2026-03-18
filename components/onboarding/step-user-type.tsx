'use client';

const USER_TYPES = [
  { label: 'Consultant', emoji: '💼' },
  { label: 'Coach', emoji: '🎯' },
  { label: 'Freelancer', emoji: '💻' },
  { label: 'Designer', emoji: '🎨' },
  { label: 'Doctor', emoji: '🩺' },
  { label: 'Sales Team', emoji: '📈' },
  { label: 'Other', emoji: '✨' },
];

interface StepUserTypeProps {
  onNext: (value: string) => void;
}

export default function StepUserType({ onNext }: StepUserTypeProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          What do you do?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          We'll personalise your experience based on this.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {USER_TYPES.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => onNext(label)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-left text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all duration-150 group"
          >
            <span className="text-xl">{emoji}</span>
            <span className="group-hover:text-gray-900">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
