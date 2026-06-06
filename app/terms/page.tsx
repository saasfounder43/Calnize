"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="border-b border-gray-50 py-6 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
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
          <p className="text-gray-500 text-lg font-medium">Last Updated: March 14, 2026</p>
        </header>

        <section className="prose prose-indigo max-w-none space-y-12">
          <p className="text-gray-600 leading-relaxed text-lg">
            These Terms of Service ("Terms") govern your access to and use of the Calnize website and scheduling platform. By using Calnize, you agree to these Terms.
          </p>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Calnize provides a scheduling platform that allows users to share availability, accept bookings, and manage meetings online. The platform may integrate with third-party services including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg ml-4">
              <li>Calendar providers</li>
              <li>Email services</li>
              <li>Payment processors</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. Account Registration</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg ml-4">
              <li>Provide accurate information</li>
              <li>Maintain the security of your account</li>
              <li>Be responsible for all activity under your account</li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-lg italic">
              Calnize is not responsible for losses caused by unauthorized access.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">3. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              You agree not to use Calnize to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg ml-4">
              <li>Violate laws or regulations</li>
              <li>Send spam or abusive communications</li>
              <li>Distribute malicious software</li>
              <li>Attempt unauthorized access to the system</li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-lg">
              We reserve the right to suspend accounts that violate these terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">4. Subscriptions and Payments</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Certain features may require a paid subscription. Payments are processed via third-party providers such as Lemon Squeezy. By subscribing:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg ml-4">
              <li>You authorize recurring billing</li>
              <li>Pricing and billing terms will be displayed at checkout</li>
              <li>You may cancel your subscription at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-lg">
              Refund policies may vary depending on the payment provider.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">5. Third-Party Integrations</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Calnize may integrate with services such as Google Calendar. We are not responsible for the performance, availability, or policies of these third-party services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              All software, design, and content associated with Calnize are owned by Calnize or its licensors. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg ml-4">
              <li>Copy</li>
              <li>Reverse engineer</li>
              <li>Modify</li>
              <li>Redistribute</li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-lg">
              any part of the platform without permission.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">7. Service Availability</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              We strive to maintain high availability but do not guarantee uninterrupted service. Calnize may occasionally experience downtime for maintenance, updates, or technical issues.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              To the maximum extent permitted by law, Calnize shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg ml-4">
              <li>Indirect damages</li>
              <li>Loss of business</li>
              <li>Loss of data</li>
              <li>Service interruptions</li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-lg">
              Use of the platform is at your own risk.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              We may suspend or terminate accounts that violate these Terms or misuse the platform. Users may also close their accounts at any time.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">10. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              We may update these Terms periodically. Continued use of the platform after changes indicates acceptance of the revised Terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">11. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              These Terms shall be governed by and interpreted in accordance with applicable laws.
            </p>
          </div>

          <div className="pt-12 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">
              support@calnize.com
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
