import React from "react";
import { Check } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    "Google Calendar sync",
    "Custom booking types",
    "Virtual and in-person meetings",
    "Automated email confirmations",
    "Public booking page",
    "Smart scheduling suggestions",
    "Timezone detection"
  ];

  return (
    <section className="bg-gray-50 py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">
          Everything You Need to Manage Meetings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-left hover:-translate-y-1 transition-transform">
              <div className="bg-green-100 p-2 rounded-full text-green-600 flex-shrink-0">
                <Check size={20} className="stroke-current" />
              </div>
              <span className="text-gray-900 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
