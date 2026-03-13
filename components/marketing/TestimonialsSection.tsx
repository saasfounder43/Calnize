import React from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rahul Mehta",
      role: "Business Consultant",
      text: "Scheduling meetings used to take multiple emails back and forth with my clients. With Calnize, I just share my booking link and they pick a time that works for them. It has made managing consultation calls much simpler.",
      initials: "RM"
    },
    {
      name: "Emily Carter",
      role: "Freelance Product Designer",
      text: "I work with clients across different time zones, and coordinating meeting times was always messy. Calnize makes it effortless for clients to book a slot directly on my calendar. The setup was surprisingly quick.",
      initials: "EC"
    },
    {
      name: "Daniel Kim",
      role: "Founder, GrowthStack",
      text: "We use Calnize for product demos and investor meetings. It saves our team a lot of time because prospects can book meetings instantly without waiting for someone to respond.",
      initials: "DK"
    }
  ];

  return (
    <section className="bg-gray-50 py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex-1">
                <p className="text-gray-600 italic leading-relaxed mb-8">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
