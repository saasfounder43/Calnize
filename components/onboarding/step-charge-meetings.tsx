'use client';

import { useState } from 'react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'];

interface StepChargeMeetingsProps {
  planType: string;
  onNext: (value: { charge: boolean; price: number; currency: string }) => void;
  onBack: () => void;
}

export default function StepChargeMeetings({
  planType,
  onNext,
  onBack,
}: StepChargeMeetingsProps) {
  const [showModal, setShowModal] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const isFree = planType === 'free';

  const handleYes = () => {
    if (isFree) {
      setShowModal(true);
    } else {
      setShowPricing(true);
    }
  };

  const handleNo = () => {
    onNext({ charge: false, price: 0, currency: 'USD' });
  };

  const handleContinueWithoutCharging = () => {
    setShowModal(false);
    onNext({ charge: false, price: 0, currency: 'USD' });
  };

  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST"
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handlePricingNext = () => {
    onNext({ charge: true, price: parseFloat(price) || 0, currency });
  };

  if (showPricing) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            How much do you charge?
          </h2>
          <p className="mt-1 text-sm text-gray-500">Set your meeting price.</p>
        </div>

        <div className="flex gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-gray-900"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-900"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <button
            onClick={handlePricingNext}
            disabled={!price}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Do you charge for meetings?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          You can always change this later.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleYes}
          className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-left text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition"
        >
          💰 Yes, I charge for my time
        </button>
        <button
          onClick={handleNo}
          className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-left text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition"
        >
          🤝 No, my meetings are free
        </button>
      </div>

      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 transition text-left"
      >
        ← Back
      </button>

      {/* Upgrade Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Pro feature
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Charging for meetings requires a Pro plan. Upgrade to unlock payments, longer sessions, and more.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleUpgrade}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={handleContinueWithoutCharging}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Continue without charging
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
