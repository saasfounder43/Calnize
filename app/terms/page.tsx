"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="border-b border-gray-100 py-6 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-medium">
            <ChevronLeft size={20} />
            Back to Home
          </Link>
          <div className="font-bold text-xl tracking-tight text-gray-900">Calnize</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-20 px-6">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-gray-500 text-lg">Last Updated: March 14, 2026</p>
        </header>

        <section className="prose prose-indigo max-w-none space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              By accessing or using Calnize, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Calnize provides a scheduling platform including booking pages, calendar synchronization, and automated reminders. We reserve the right to modify or discontinue any part of the service at any time.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">4. Pro Plan & Payments</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Certain features require a paid subscription ("Pro Plan"). Payments are processed via Lemon Squeezy. Subscriptions automatically renew unless cancelled.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Calnize is provided "as is" without warranty of any kind. In no event shall Calnize be liable for any direct, indirect, incidental, or consequential damages.
            </p>
          </div>

          <div className="pt-12 border-t border-gray-100">
            <p className="text-gray-400 text-sm italic">
              Questions about our Terms? Contact us at support@calnize.com
            </p>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-50 bg-gray-50/50 text-center">
        <p className="text-gray-400 text-sm">© 2026 Calnize. All rights reserved.</p>
      </footer>
    </div>
  );
}
