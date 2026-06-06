import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingSection() {
  const freeFeatures = [
    "1 booking type",
    "Public booking page",
    "Google Calendar integration",
    "Basic availability settings",
    "Email confirmations",
    "Calnize branding"
  ];

  const proFeatures = [
    "Unlimited booking types",
    "Custom booking questions",
    "Meeting reminders",
    "Paid meetings",
    "Priority support",
    "Remove Calnize branding",
    "Advanced availability rules"
  ];

  return (
    <section id="pricing" className="bg-white py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16">
          Simple, Transparent Pricing
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-10 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500 font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex flex-start gap-3 text-gray-700">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="w-full py-4 px-6 bg-white border border-gray-300 hover:border-gray-400 text-gray-900 font-semibold rounded-xl text-center transition-colors"
            >
              Get Started for Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-indigo-600 rounded-3xl p-10 flex flex-col relative shadow-xl transform md:-translate-y-4">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm uppercase tracking-wider">
              Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold text-white">$9</span>
              <span className="text-indigo-200 font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex flex-start gap-3 text-indigo-50">
                  <Check className="text-indigo-300 flex-shrink-0 mt-0.5" size={20} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="w-full py-4 px-6 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl text-center transition-colors shadow-sm"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
