import React from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-white text-gray-900 pt-32 pb-20 px-6 sm:px-12 lg:px-24 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50 to-white -z-10" />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900">
          Simplify Scheduling and Turn Meetings Into Bookings
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Share your availability, let clients book instantly, and manage meetings in one simple dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            Start Scheduling for Free <ArrowRight size={20} />
          </Link>
          <Link
            href="#how-it-works"
            className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-semibold py-4 px-8 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <PlayCircle size={20} /> See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
