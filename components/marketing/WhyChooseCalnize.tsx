import React from "react";
import { Check, X } from "lucide-react";

export default function WhyChooseCalnize() {
  const features = [
    { name: "Simple setup", calnize: true, calendly: true },
    { name: "Public booking page", calnize: true, calendly: true },
    { name: "Smart slot suggestions", calnize: true, calendly: false },
    { name: "Lightweight interface", calnize: true, calendly: false },
    { name: "Transparent pricing", calnize: true, calendly: false },
    { name: "Fast onboarding", calnize: true, calendly: false }
  ];

  return (
    <section className="bg-gray-50 py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
          Why Choose Calnize?
        </h2>
        <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
          Calnize focuses on simplicity and speed so professionals can start accepting bookings faster with fewer steps.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left">
          <div className="grid grid-cols-5 bg-indigo-50/50 p-6 border-b border-gray-100 items-center">
            <div className="col-span-3 font-semibold text-gray-700">Feature</div>
            <div className="text-center font-bold text-indigo-600">Calnize</div>
            <div className="text-center font-semibold text-gray-400">Calendly</div>
          </div>
          <div className="divide-y divide-gray-100">
            {features.map((feature, idx) => (
              <div key={idx} className="grid grid-cols-5 p-6 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-3 font-medium text-gray-900">{feature.name}</div>
                <div className="flex justify-center">
                  {feature.calnize ? (
                    <Check className="text-green-500" strokeWidth={3} />
                  ) : (
                    <X className="text-gray-300" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.calendly ? (
                    <Check className="text-gray-400" strokeWidth={2} />
                  ) : (
                    <X className="text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
