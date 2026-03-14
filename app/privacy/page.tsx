"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 leading-relaxed tracking-tight">
      <nav className="border-b border-gray-50 py-6 px-6 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-all font-semibold">
            <ChevronLeft size={20} strokeWidth={2.5} />
            Back to Home
          </Link>
          <div className="font-black text-2xl tracking-tighter text-gray-900">Calnize</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-24 px-8">
        <header className="mb-20">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-none">Privacy Policy</h1>
          <p className="text-gray-400 text-xl font-medium">Last Updated: March 14, 2026</p>
        </header>

        <article className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">1. Our Commitment</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              At Calnize, we take your privacy seriously. This policy explains how we collect and use information when you use our scheduling platform.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">2. Information Collection</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We collect information you provide directly to us (name, email, profile details) and information from integrated calendars (Google Calendar) to enable scheduling features.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">3. Use of Information</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We use collected data solely to provide and improve our service, communicate with you, and process payments securely. We do not sell your personal data.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">4. Data Sharing</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We share limited information with trusted third-party providers (Supabase, Lemon Squeezy, Resend) only as necessary to provide core platform functions.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">5. Security</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We implement industry-standard measures to protect your data but cannot guarantee absolute security for data transmitted over the internet.
            </p>
          </div>

          <div className="pt-20 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest underline decoration-indigo-200 underline-offset-4">
              privacy@calnize.com
            </p>
          </div>
        </article>
      </main>

      <footer className="py-20 border-t border-gray-50 bg-gray-50/20 text-center">
        <p className="text-gray-400 text-sm font-bold opacity-60">© 2026 Calnize. All rights reserved.</p>
      </footer>
    </div>
  );
}
