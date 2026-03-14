"use client";

import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import FAQ from "@/components/FAQ";
import HeroSection from "@/components/marketing/HeroSection";
import ProductPreviewSection from "@/components/marketing/ProductPreviewSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import WhyChooseCalnize from "@/components/marketing/WhyChooseCalnize";
import UseCasesSection from "@/components/marketing/UseCasesSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import PricingSection from "@/components/marketing/PricingSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import FinalCTASection from "@/components/marketing/FinalCTASection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 shadow-none hover:opacity-90 transition-opacity">
            <div className="bg-indigo-600 rounded-lg p-1.5 flex shadow-sm">
              <Calendar size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Calnize
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <Link href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</Link>
            <Link href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-indigo-600 transition-colors text-gray-900">Log in</Link>
            <Link 
              href="/signup" 
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
          
          {/* Mobile CTA */}
          <div className="md:hidden">
            <Link 
              href="/signup" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <HeroSection />
        <ProductPreviewSection />
        <HowItWorksSection />
        <WhyChooseCalnize />
        <UseCasesSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FinalCTASection />
        
        {/* FAQ Section - Preserved as is but wrapped for theme consistency */}
        <section className="bg-white py-24 px-6 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <FAQ />
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-50 py-16 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400 text-sm font-medium tracking-tight">
            © 2026 Calnize. All rights reserved.{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors mx-1 underline decoration-gray-200 underline-offset-4 decoration-1 font-semibold">Terms</Link>.{" "}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors mx-1 underline decoration-gray-200 underline-offset-4 decoration-1 font-semibold">Privacy</Link>.
          </p>
        </div>
      </footer>
    </div>
  );
}
