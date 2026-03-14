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
          <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed italic">
            Calnize ("Calnize", "we", "our", or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and scheduling platform.
          </p>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">1. Information We Collect</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We collect information that you provide directly to us as well as information collected automatically when you use the platform.
            </p>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50 space-y-4">
              <h3 className="font-bold text-gray-900">Personal Information:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-500 font-medium ml-4">
                <li>Name and Email address</li>
                <li>Account credentials</li>
                <li>Calendar availability information</li>
                <li>Booking details created within the platform</li>
                <li>Payment information for subscriptions</li>
              </ul>
              <p className="text-sm text-gray-400 italic">
                Payment information is processed securely through third-party providers such as Lemon Squeezy and is not stored directly on our servers.
              </p>
            </div>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50 space-y-4">
              <h3 className="font-bold text-gray-900">Automatically Collected Information:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-500 font-medium ml-4">
                <li>IP address and Browser type</li>
                <li>Device information and Usage analytics</li>
                <li>Pages visited and Session duration</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-lg font-medium ml-4">
              <li>Provide and operate the Calnize scheduling platform</li>
              <li>Create and manage user accounts</li>
              <li>Process subscriptions and billing</li>
              <li>Send transactional email (booking confirmations, reminders)</li>
              <li>Improve product functionality and performance</li>
              <li>Provide customer support</li>
              <li>Detect fraud or abuse of the platform</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">3. Calendar Integrations</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              Calnize allows users to connect external calendar services such as Google Calendar. When you connect your calendar:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-lg font-medium ml-4 font-bold">
              <li>We only access the information necessary to display availability</li>
              <li>We do not read or share your calendar data</li>
            </ul>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              Integration permissions are controlled through the respective provider's authorization system.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">4. Sharing of Information</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed font-bold">
              We do not sell personal information.
              </p>
              <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We may share information with trusted service providers necessary to operate the platform, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-lg font-medium ml-4">
              <li>Payment processors and Email delivery services</li>
              <li>Hosting providers and Analytics tools</li>
            </ul>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed italic text-sm">
              These providers only receive the minimum information required to perform their services.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">5. Data Security</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We implement reasonable technical and organizational safeguards to protect user information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-lg font-medium ml-4">
              <li>Secure HTTPS encryption</li>
              <li>Authentication systems</li>
              <li>Restricted internal access</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">6. Data Retention</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We retain personal data only for as long as necessary to provide the service, comply with legal obligations, or enforce agreements. Users may request deletion of their accounts at any time.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">7. Your Rights</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              Depending on your location, you may have rights including access to your personal data, requesting correction of inaccurate data, or requesting deletion of your data.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">8. Third-Party Services</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              Calnize may link to third-party services such as payment providers and calendar integrations. We are not responsible for the privacy practices of these external services.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">9. Children's Privacy</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              Calnize is not intended for individuals under the age of 13. We do not knowingly collect personal information from children.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-sm">10. Updates to This Policy</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
              We may update this Privacy Policy from time to time. Updated versions will be posted on this page with a revised effective date.
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
