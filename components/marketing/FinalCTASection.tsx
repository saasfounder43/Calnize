import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section className="bg-indigo-600 py-24 px-6 sm:px-12 lg:px-24 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          Start Scheduling Smarter Today
        </h2>
        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
          Create your free Calnize account and start accepting bookings in minutes.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          Start for Free <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
