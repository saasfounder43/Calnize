import React from "react";
import { Briefcase, MessageSquare, Code, Users } from "lucide-react";

export default function UseCasesSection() {
  const useCases = [
    {
      title: "Consultants",
      desc: "Let clients book consultation sessions instantly.",
      icon: <Briefcase size={28} className="text-indigo-600" />
    },
    {
      title: "Coaches",
      desc: "Organize coaching sessions without email back-and-forth.",
      icon: <MessageSquare size={28} className="text-indigo-600" />
    },
    {
      title: "Freelancers",
      desc: "Schedule discovery calls and project discussions easily.",
      icon: <Code size={28} className="text-indigo-600" />
    },
    {
      title: "Sales Teams",
      desc: "Allow prospects to book product demos directly from your website.",
      icon: <Users size={28} className="text-indigo-600" />
    }
  ];

  return (
    <section className="bg-white py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16">
          Perfect for Professionals and Teams
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((uc, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex justify-center items-center mb-6">
                {uc.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{uc.title}</h3>
              <p className="text-gray-600 leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
