import React from "react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Set Your Availability",
      description: "Choose when you're available so people can book only during your working hours."
    },
    {
      number: "2",
      title: "Share Your Booking Link",
      description: "Send your personal Calnize link to clients, teammates, or customers."
    },
    {
      number: "3",
      title: "Get Booked Instantly",
      description: "Visitors pick a time that works for them and meetings appear directly in your calendar."
    }
  ];

  return (
    <section id="how-it-works" className="bg-white py-24 px-6 sm:px-12 lg:px-24 text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">
          Start Accepting Bookings in Minutes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                <span className="text-2xl font-black text-indigo-600">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
