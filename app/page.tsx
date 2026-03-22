"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [
    {
      q: "How do I receive payments?",
      a: "Calnize lets you add your own payment link — PayPal, Razorpay, UPI, or any payment URL. When a client books a paid meeting, they're redirected to your payment link to complete the transaction directly with you. Simple, flexible, no middleman.",
    },
    {
      q: "Can I still offer free meetings?",
      a: "Yes. You can create as many meeting types as you like. Keep discovery calls free while gating your Strategy Sessions behind a paywall. Mix and match freely.",
    },
    {
      q: "Does this work with my current calendar?",
      a: "Yes, we offer full 2-way sync with Google Calendar. If you add a personal event to your Google Calendar, Calnize instantly blocks that time on your booking page.",
    },
    {
      q: "What if I need to book a meeting manually?",
      a: "You can still add meetings manually to your Google Calendar. Calnize will respect those busy blocks just like any other appointment.",
    },
    {
      q: "Can I set buffer times between meetings?",
      a: "Yes. You can specify a cushion (e.g., 15 minutes) between appointments to ensure you never have back-to-back calls without a break.",
    },
    {
      q: "How do I handle cancellations?",
      a: "Calnize includes cancel links in every confirmation email. Clients can cancel directly from their inbox — no login required.",
    },
    {
      q: "Is there a limit to how many bookings I can take?",
      a: "No. Whether you have one meeting a month or ten a day, Calnize scales with your business.",
    },
    {
      q: "Can I use Calnize on my own website?",
      a: "Yes. You can share your unique Calnize link directly or copy the embed code to place a booking button on your website for a seamless client experience.",
    },
  ];

  const testimonials = [
    {
      quote: "Scheduling meetings used to take multiple emails back and forth with my clients. With Calnize, I just share my booking link and they pick a time that works for them.",
      name: "Rahul Mehta",
      title: "Business Consultant",
      initials: "RM",
    },
    {
      quote: "I work with clients across different time zones, and coordinating meeting times was always messy. Calnize makes it effortless. The setup was surprisingly quick.",
      name: "Emily Carter",
      title: "Freelance Product Designer",
      initials: "EC",
    },
    {
      quote: "We use Calnize for product demos and investor meetings. It saves our team a lot of time because prospects can book meetings instantly without waiting for someone to respond.",
      name: "Daniel Kim",
      title: "Founder, GrowthStack",
      initials: "DK",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --black: #0a0a1a;
          --surface: #111128;
          --surface2: #16163a;
          --border: rgba(255,255,255,0.08);
          --border-hover: rgba(255,255,255,0.16);
          --text: #f0f0ff;
          --text-muted: #a0a0cc;
          --text-dim: #6b6b99;
          --accent: #6c5ce7;
          --accent-light: #a29bfe;
          --accent-dim: rgba(108, 92, 231, 0.12);
          --teal: #00cec9;
          --teal-dim: rgba(0, 206, 201, 0.12);
          --red: #ff6b6b;
          --radius: 12px;
          --radius-lg: 20px;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--black);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .serif { font-family: 'Instrument Serif', Georgia, serif; }

        /* NAV */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.3s ease;
          padding: 20px 0;
        }
        nav.scrolled {
          background: rgba(10,10,26,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 14px 0;
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 26px; color: var(--text);
          text-decoration: none; letter-spacing: -0.5px;
        }
        .nav-logo span { color: var(--accent); }
        .nav-links {
          display: flex; align-items: center; gap: 36px;
          list-style: none;
        }
        .nav-links a {
          color: var(--text-muted); text-decoration: none;
          font-size: 14px; font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-ctas { display: flex; align-items: center; gap: 12px; }
        .btn-ghost {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          padding: 8px 16px; border-radius: 8px;
          text-decoration: none; transition: color 0.2s;
          display: inline-flex; align-items: center;
        }
        .btn-ghost:hover { color: var(--text); }
        .btn-accent {
          background: var(--accent); color: #fff;
          border: none; cursor: pointer;
          font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          padding: 10px 20px; border-radius: 8px;
          text-decoration: none; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
          letter-spacing: -0.2px;
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.2);
        }
        .btn-accent:hover { background: var(--accent-light); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(108, 92, 231, 0.4); }
        .btn-accent-lg {
          padding: 16px 36px; font-size: 16px;
          border-radius: 10px; gap: 8px;
        }
        .btn-outline {
          background: none; border: 1px solid var(--border-hover);
          color: var(--text); cursor: pointer;
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          padding: 10px 20px; border-radius: 8px;
          text-decoration: none; transition: all 0.2s;
          display: inline-flex; align-items: center;
        }
        .btn-outline:hover { border-color: var(--accent); color: var(--accent); }
        .hamburger {
          display: none; background: none; border: none;
          cursor: pointer; padding: 4px;
          flex-direction: column; gap: 5px;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--text); border-radius: 2px;
          transition: all 0.3s;
        }
        .mobile-menu {
          display: none; position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: var(--black); z-index: 99;
          flex-direction: column; align-items: center; justify-content: center;
          gap: 32px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          font-size: 28px; color: var(--text);
          text-decoration: none; font-weight: 600;
          font-family: 'Instrument Serif', serif;
          transition: color 0.2s;
        }
        .mobile-menu a:hover { color: var(--accent); }
        .mobile-close {
          position: absolute; top: 24px; right: 32px;
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 28px;
        }

        /* SECTIONS */
        section { padding: 120px 32px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .container-narrow { max-width: 800px; margin: 0 auto; }
        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: var(--teal);
          margin-bottom: 20px;
        }
        .section-label::before {
          content: ''; display: block;
          width: 20px; height: 1px; background: var(--teal);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center;
          padding: 140px 32px 100px;
          position: relative; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108, 92, 231, 0.08) 0%, transparent 70%);
        }
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(108, 92, 231, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108, 92, 231, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
        }
        .hero-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; width: 100%; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--accent-dim); border: 1px solid rgba(108, 92, 231, 0.2);
          color: var(--accent-light); padding: 6px 14px; border-radius: 999px;
          font-size: 13px; font-weight: 600; margin-bottom: 32px;
          letter-spacing: 0.3px;
        }
        .hero-badge span { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-light); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .hero h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(48px, 7vw, 88px);
          line-height: 1.04; letter-spacing: -2px;
          color: var(--text); margin-bottom: 28px;
          max-width: 900px;
        }
        .hero h1 em { color: var(--accent-light); font-style: italic; }
        .hero-sub {
          font-size: clamp(16px, 2vw, 20px);
          color: var(--text-muted); max-width: 560px;
          margin-bottom: 44px; font-weight: 400;
          line-height: 1.7;
        }
        .hero-cta-group { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 56px; }
        .hero-trust {
          display: flex; align-items: center; gap: 24px;
          font-size: 13px; color: var(--text-muted); flex-wrap: wrap;
        }
        .hero-trust span { display: flex; align-items: center; gap: 6px; }
        .hero-trust span::before {
          content: '✓'; color: var(--teal);
          font-size: 11px; font-weight: 700;
        }
        .hero-social {
          margin-top: 80px; padding-top: 48px;
          border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .hero-social p { font-size: 13px; color: var(--text-muted); }
        .hero-avatars { display: flex; }
        .hero-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid var(--black);
          background: var(--surface2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: var(--text-muted);
          margin-left: -8px;
        }
        .hero-avatar:first-child { margin-left: 0; }

        /* PROBLEM */
        .problem { background: var(--surface); }
        .agitator-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 48px; }
        .agitator-card {
          background: var(--black); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 32px;
          transition: border-color 0.2s;
        }
        .agitator-card:hover { border-color: rgba(255,107,107,0.3); }
        .agitator-icon {
          font-size: 28px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .agitator-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
        .agitator-card p { font-size: 15px; color: var(--text-muted); line-height: 1.6; }
        .problem-close {
          margin-top: 48px; padding: 28px 32px;
          background: var(--teal-dim); border: 1px solid rgba(0, 206, 201, 0.2);
          border-radius: var(--radius-lg);
          font-size: 18px; font-style: italic; color: var(--teal);
          font-family: 'Instrument Serif', serif;
        }

        /* HOW IT WORKS */
        .steps { display: flex; flex-direction: column; gap: 0; margin-top: 64px; }
        .step {
          display: grid; grid-template-columns: 80px 1fr;
          gap: 32px; padding: 40px 0;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .step:last-child { border-bottom: none; }
        .step-num {
          font-family: 'Instrument Serif', serif;
          font-size: 56px; color: var(--text-dim);
          line-height: 1; font-style: italic;
        }
        .step-content h3 { font-size: 22px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
        .step-content p { font-size: 16px; color: var(--text-muted); line-height: 1.7; }

        /* WHO IT'S FOR */
        .for-section { background: var(--surface); }
        .for-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 48px; }
        .for-card {
          background: var(--black); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 28px;
          transition: all 0.2s;
          position: relative; overflow: hidden;
        }
        .for-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: var(--accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
        }
        .for-card:hover::before { transform: scaleX(1); }
        .for-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
        .for-icon { font-size: 32px; margin-bottom: 16px; }
        .for-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .for-card p { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

        /* BENEFITS */
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-top: 56px; }
        .benefit-card {
          padding: 32px; border-radius: var(--radius-lg);
          background: var(--surface); border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .benefit-card:hover { border-color: var(--border-hover); }
        .benefit-icon { font-size: 28px; margin-bottom: 16px; }
        .benefit-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
        .benefit-card p { font-size: 14px; color: var(--text-muted); line-height: 1.65; }

        /* FEATURES */
        .features-section { background: var(--surface); }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2px; margin-top: 56px; background: var(--border); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); }
        .feature-item {
          background: var(--black); padding: 36px;
          transition: background 0.2s;
        }
        .feature-item:hover { background: var(--surface2); }
        .feature-badge {
          display: inline-flex; align-items: center;
          background: var(--accent-dim); border: 1px solid rgba(108, 92, 231, 0.2);
          color: var(--accent-light); padding: 3px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
          margin-bottom: 16px; text-transform: uppercase;
        }
        .feature-item h3 { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
        .feature-item p { font-size: 14px; color: var(--text-muted); line-height: 1.65; }

        /* COMPARISON */
        .comparison-table {
          width: 100%; border-collapse: collapse;
          margin-top: 56px; border-radius: var(--radius-lg);
          overflow: hidden; border: 1px solid var(--border);
        }
        .comparison-table th {
          padding: 20px 24px; text-align: left;
          font-size: 13px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .comparison-table th:first-child { background: var(--surface); color: var(--text-muted); width: 35%; }
        .comparison-table th:nth-child(2) { background: var(--surface); color: var(--text-muted); text-align: center; }
        .comparison-table th:last-child { background: var(--accent); color: #fff; text-align: center; }
        .comparison-table td {
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          font-size: 14px;
        }
        .comparison-table td:first-child { color: var(--text-muted); font-weight: 500; background: var(--surface); }
        .comparison-table td:nth-child(2) { text-align: center; color: var(--text-muted); background: var(--black); }
        .comparison-table td:last-child { text-align: center; background: var(--surface2); font-weight: 600; }
        .comparison-table tr:hover td { filter: brightness(1.1); }
        .check { color: var(--teal); font-size: 18px; }
        .cross { color: var(--text-dim); font-size: 16px; }

        /* PRICING */
        .pricing-section {
          background: var(--surface);
          text-align: center; padding: 100px 32px;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          margin: 0 32px;
        }
        .pricing-section .section-label { color: var(--teal); }
        .pricing-section h2 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 5vw, 60px);
          color: var(--text); margin-bottom: 12px; letter-spacing: -1.5px;
        }
        .pricing-section p { color: var(--text-muted); font-size: 18px; margin-bottom: 36px; }

        /* TESTIMONIALS */
        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 56px; }
        .testimonial-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 36px;
          position: relative;
        }
        .testimonial-card::before {
          content: '"'; position: absolute; top: 20px; right: 28px;
          font-family: 'Instrument Serif', serif;
          font-size: 80px; color: var(--text-dim); line-height: 1;
        }
        .testimonial-quote {
          font-size: 15px; color: var(--text-muted); line-height: 1.75;
          margin-bottom: 24px; font-style: italic;
        }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .testimonial-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--accent-dim); border: 1px solid rgba(108, 92, 231, 0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: var(--accent-light);
        }
        .testimonial-name { font-size: 15px; font-weight: 700; }
        .testimonial-title { font-size: 13px; color: var(--text-muted); }

        /* REVERSAL */
        .reversal-section { background: var(--surface); text-align: center; }
        .reversal-stat {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(60px, 10vw, 120px); color: var(--accent-light);
          line-height: 1; letter-spacing: -3px; margin: 32px 0;
          font-style: italic;
        }

        /* FAQ */
        .faq-list { margin-top: 56px; display: flex; flex-direction: column; gap: 0; }
        .faq-item {
          border-bottom: 1px solid var(--border);
          overflow: hidden;
        }
        .faq-q {
          width: 100%; background: none; border: none; cursor: pointer;
          text-align: left; padding: 24px 0;
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; font-family: 'DM Sans', sans-serif;
          font-size: 17px; font-weight: 600; color: var(--text);
          transition: color 0.2s;
        }
        .faq-q:hover { color: var(--accent-light); }
        .faq-chevron {
          font-size: 20px; color: var(--text-muted);
          transition: transform 0.3s; flex-shrink: 0;
          font-style: normal;
        }
        .faq-chevron.open { transform: rotate(45deg); color: var(--accent-light); }
        .faq-a {
          max-height: 0; overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }
        .faq-a.open { max-height: 200px; padding-bottom: 24px; }
        .faq-a p { font-size: 15px; color: var(--text-muted); line-height: 1.75; }

        /* FINAL CTA */
        .final-cta {
          text-align: center; padding: 160px 32px;
          position: relative; overflow: hidden;
        }
        .final-cta-bg {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(108, 92, 231, 0.07) 0%, transparent 70%);
        }
        .final-cta h2 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(40px, 6vw, 80px);
          letter-spacing: -2px; margin-bottom: 20px;
        }
        .final-cta h2 em { color: var(--accent-light); font-style: italic; }
        .final-cta p { font-size: 18px; color: var(--text-muted); margin-bottom: 44px; }
        .final-trust { display: flex; justify-content: center; align-items: center; gap: 24px; margin-top: 24px; font-size: 13px; color: var(--text-muted); flex-wrap: wrap; }
        .final-trust span { display: flex; align-items: center; gap: 6px; }
        .final-trust span::before { content: '✓'; color: var(--teal); font-weight: 700; font-size: 11px; }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--border);
          padding: 40px 32px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 20px;
          max-width: 1200px; margin: 0 auto;
        }
        .footer-logo {
          font-family: 'Instrument Serif', serif;
          font-size: 22px; color: var(--text);
          text-decoration: none;
        }
        .footer-logo span { color: var(--accent-light); }
        .footer-links { display: flex; align-items: center; gap: 28px; }
        .footer-links a { font-size: 13px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--text); }
        .footer-copy { font-size: 13px; color: var(--text-dim); }
        .footer-wrapper { border-top: 1px solid var(--border); }

        /* SECTION HEADINGS */
        .section-h2 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 5vw, 60px);
          letter-spacing: -1.5px; line-height: 1.1;
          color: var(--text);
        }
        .section-sub {
          font-size: 18px; color: var(--text-muted);
          margin-top: 16px; max-width: 560px;
          line-height: 1.65;
        }

        /* ── TABLET (max 1024px) ── */
        @media (max-width: 1024px) {
          .nav-links { gap: 24px; }
          .agitator-grid { grid-template-columns: 1fr 1fr; }
          .for-grid { grid-template-columns: 1fr 1fr; }
          .benefits-grid { grid-template-columns: 1fr 1fr; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .testimonials-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── MOBILE (max 768px) ── */
        @media (max-width: 768px) {
          section { padding: 72px 20px; }
          .nav-inner { padding: 0 20px; }
          .nav-links, .nav-ctas { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 110px 20px 72px; }
          .hero-badge { font-size: 12px; padding: 5px 12px; }
          .hero h1 { font-size: clamp(36px, 9vw, 52px); letter-spacing: -1.5px; }
          .hero-sub { font-size: 16px; }
          .hero-cta-group { flex-direction: column; align-items: flex-start; gap: 12px; }
          .btn-accent-lg { width: 100%; justify-content: center; padding: 15px 28px; font-size: 15px; }
          .btn-outline { width: 100%; justify-content: center; }
          .hero-trust { flex-direction: column; align-items: flex-start; gap: 10px; }
          .hero-social { flex-direction: column; align-items: flex-start; gap: 10px; }
          .agitator-grid { grid-template-columns: 1fr; }
          .agitator-card { padding: 24px; }
          .step { grid-template-columns: 44px 1fr; gap: 16px; padding: 28px 0; }
          .step-num { font-size: 36px; }
          .step-content h3 { font-size: 18px; }
          .step-content p { font-size: 15px; }
          .for-grid { grid-template-columns: 1fr; }
          .for-card { padding: 24px; }
          .benefits-grid { grid-template-columns: 1fr; gap: 16px; }
          .benefit-card { padding: 24px; }
          .features-grid { grid-template-columns: 1fr; gap: 1px; }
          .feature-item { padding: 28px 24px; }
          .comparison-table { font-size: 13px; }
          .comparison-table th, .comparison-table td { padding: 12px 14px; }
          .comparison-table th:nth-child(2), .comparison-table td:nth-child(2) { display: none; }
          .comparison-table th:first-child { width: 50%; }
          .pricing-section { padding: 72px 20px; margin: 0 20px; }
          .pricing-section h2 { font-size: clamp(28px, 7vw, 44px); letter-spacing: -1px; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .testimonial-card { padding: 28px 24px; }
          .testimonial-card::before { font-size: 60px; }
          .reversal-stat { font-size: clamp(72px, 18vw, 100px); }
          .faq-q { font-size: 15px; padding: 20px 0; }
          .final-cta { padding: 100px 20px; }
          .final-cta h2 { font-size: clamp(32px, 8vw, 52px); letter-spacing: -1px; }
          .final-cta p { font-size: 16px; }
          .final-trust { flex-direction: column; gap: 12px; }
          footer { flex-direction: column; align-items: center; text-align: center; padding: 32px 20px; gap: 16px; }
          .footer-links { flex-wrap: wrap; justify-content: center; gap: 20px; }
          .section-h2 { letter-spacing: -1px; }
          .section-sub { font-size: 16px; }
          .hero-avatar { width: 30px; height: 30px; font-size: 10px; }
        }

        /* ── SMALL MOBILE (max 390px) ── */
        @media (max-width: 390px) {
          .hero h1 { font-size: 34px; }
          .hero-badge { font-size: 11px; }
          .nav-inner { padding: 0 16px; }
          section { padding: 60px 16px; }
          .hero { padding: 100px 16px 60px; }
          .agitator-card, .for-card, .benefit-card, .feature-item, .testimonial-card { padding: 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Caln<span>i</span>ze</Link>
          <ul className="nav-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="nav-ctas">
            <Link href="/login" className="btn-ghost">Log in</Link>
            <Link href="/signup" className="btn-accent">Get Started Free</Link>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        <Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
        <Link href="/signup" className="btn-accent btn-accent-lg" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span /> Professional Scheduling for Experts
          </div>
          <h1 className="serif">
            Stop Managing Meetings.<br />
            Start Getting <em>Paid</em><br />
            for Your Time.
          </h1>
          <p className="hero-sub">
            The professional scheduling tool designed for experts. Let clients book your time, confirm with a payment, and sync everything to your calendar in one seamless flow.
          </p>
          <div className="hero-cta-group">
            <Link href="/signup" className="btn-accent btn-accent-lg">
              Create Your Paid Booking Page →
            </Link>
            <a href="#how-it-works" className="btn-outline">See How It Works</a>
          </div>
          <div className="hero-trust">
            <span>No credit card required</span>
            <span>Setup in under 2 minutes</span>
            <span>Works with Google Calendar</span>
          </div>
          <div className="hero-social">
            <div className="hero-avatars">
              {["RM", "EC", "DK", "AK"].map((i) => (
                <div key={i} className="hero-avatar">{i}</div>
              ))}
            </div>
            <p>Trusted by early users across consulting, coaching, and freelancing.</p>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem">
        <div className="container">
          <div className="section-label">The Problem</div>
          <h2 className="section-h2">Are "Free Discovery Calls"<br />Crowding Your Calendar?</h2>
          <div className="agitator-grid">
            {[
              { icon: "❌", title: "The No-Show", desc: "They booked 30 minutes but didn't value the slot enough to show up. Your time gone, no compensation." },
              { icon: "❌", title: "The Brain-Picker", desc: '"Quick questions" that turn into an hour of unpaid consulting. Your expertise drained for free.' },
              { icon: "❌", title: "The Admin Leak", desc: "Spending your evening manual-invoicing instead of doing the work. Hours lost to busywork every week." },
            ].map((a) => (
              <div key={a.title} className="agitator-card">
                <div className="agitator-icon">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
          <div className="problem-close">
            "Your expertise is your product. It's time to protect your schedule."
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="container">
          <div className="section-label">How It Works</div>
          <h2 className="section-h2">Three steps to a fully<br />automated booking business.</h2>
          <p className="section-sub">We remove the friction between a client's interest and a confirmed, paid booking.</p>
          <div className="steps">
            {[
              { n: "01", title: "Build Your Booking Page", desc: "Connect your Google Calendar and set up your booking page in minutes. Customize your meeting types, durations, and availability rules." },
              { n: "02", title: "Set Your Terms", desc: "Define your meeting types and set your rates. You decide which meetings are free and which require a paid commitment upfront." },
              { n: "03", title: "Get Booked & Paid", desc: "Share your link and get booked. Clients pick a time, complete payment, and the meeting appears on your calendar with all details confirmed — automatically." },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-num serif">{s.n}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="for-section">
        <div className="container">
          <div className="section-label">Who It's For</div>
          <h2 className="section-h2">Built for Professionals<br />Who Value Their Time.</h2>
          <div className="for-grid">
            {[
              { icon: "💼", title: "Consultants", desc: "Ensure every strategy session is qualified and paid. Stop giving away your expertise for free." },
              { icon: "🎯", title: "Coaches", desc: "Focus on the session, not the billing. Automate payments and confirmation in one step." },
              { icon: "💻", title: "Freelancers", desc: "Charge for project scoping to filter for serious clients. Eliminate tire-kickers instantly." },
              { icon: "🩺", title: "Specialists", desc: "Offer paid Office Hours or technical audits effortlessly. Your knowledge has a price." },
            ].map((f) => (
              <div key={f.title} className="for-card">
                <div className="for-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section>
        <div className="container">
          <div className="section-label">Key Benefits</div>
          <h2 className="section-h2">Why professionals<br />choose Calnize.</h2>
          <div className="benefits-grid">
            {[
              { icon: "💰", title: "Upfront Commitment", desc: "Eliminate no-shows by requiring payment at the point of booking. Clients who pay show up." },
              { icon: "⚡", title: "Zero Back-and-Forth", desc: 'No more "What time works for you?" — just one link that handles everything end to end.' },
              { icon: "🎯", title: "Qualified Leads Only", desc: "Automatically filter for clients who are serious about your services. Paid intent is the best filter." },
              { icon: "🌍", title: "Timezone Intelligence", desc: "Never worry about the math. Calnize detects your client's timezone and handles global scheduling perfectly." },
            ].map((b) => (
              <div key={b.title} className="benefit-card">
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-label">Features</div>
          <h2 className="section-h2">Everything you need for<br />a seamless workflow.</h2>
          <div className="features-grid">
            {[
              { title: "Smart Calendar Sync", desc: "2-way sync with Google Calendar. We only show slots when you are actually free — no double bookings ever.", pro: false },
              { title: "Custom Availability", desc: "Work on your terms. Define exactly when and how long you are available for each type of meeting.", pro: false },
              { title: "Professional Branding", desc: "Present a high-end image by using your own logo and booking page identity.", pro: true },
              { title: "Automated Confirmations", desc: "Professional email confirmations sent to both you and your client automatically on every booking.", pro: false },
              { title: "Unlimited Meeting Types", desc: "Create different links for different services, durations, and prices. Free and paid, side by side.", pro: true },
              { title: "Payment Link Integration", desc: "Connect your PayPal, Razorpay, UPI, or any payment URL. Clients pay you directly — no middleman.", pro: false },
            ].map((f) => (
              <div key={f.title} className="feature-item">
                {f.pro && <div className="feature-badge">Pro</div>}
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section>
        <div className="container">
          <div className="section-label">Why Calnize</div>
          <h2 className="section-h2">Stop Using a Calendar.<br />Start Using a Revenue Engine.</h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Generic Tools</th>
                <th>✦ Calnize</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Primary Goal", "General Meetings", "Monetizing Expertise"],
                ["Paid Bookings", "Complex setup / plugins", "Built-in & Native"],
                ["No-Show Protection", "Basic Reminders", "Financial Commitment"],
                ["Setup Velocity", "15–30 minutes", "Under 2 Minutes"],
                ["Client Experience", "Redirects & pop-ups", "Unified Booking & Pay"],
                ["Admin Effort", "Manual chasing", "100% Automated"],
                ["Branding", "Limited / Generic", "Fully Professional"],
                ["Monthly Pricing", "$15 – $30+ / month", "Just $9 / month"],
                ["Monthly ROI", "A Service Cost", "A Revenue Engine"],
              ].map(([feature, generic, calnize]) => (
                <tr key={feature}>
                  <td>{feature}</td>
                  <td><span className="cross">✕</span> {generic}</td>
                  <td><span className="check">✓</span> {calnize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section">
        <div className="container-narrow">
          <div className="section-label">Pricing</div>
          <h2>Start Monetizing Your Time<br />for Just $9/Month.</h2>
          <p>Less than the cost of one missed opportunity.</p>
          <Link href="/signup" className="btn-accent btn-accent-lg">
            Upgrade to Pro →
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div className="container">
          <div className="section-label">Social Proof</div>
          <h2 className="section-h2">Trusted by Professionals<br />Who Value Their Time.</h2>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-title">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVERSAL */}
      <section className="reversal-section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <div className="section-label" style={{ justifyContent: "center" }}>Stop the Admin Leak</div>
          <h2 className="section-h2">If you spend just 2 hours a week on manual scheduling...</h2>
          <div className="reversal-stat">100+</div>
          <p style={{ fontSize: "20px", color: "var(--text-muted)", marginBottom: "16px" }}>
            hours lost every year to "free" calls and admin work.
          </p>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 40px" }}>
            Take back your time and start getting paid for your expertise today.
          </p>
          <Link href="/signup" className="btn-accent btn-accent-lg">
            Reclaim Your Time →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="container-narrow">
          <div className="section-label">FAQ</div>
          <h2 className="section-h2">Frequently asked<br />questions.</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <em className={`faq-chevron ${openFaq === i ? "open" : ""}`}>+</em>
                </button>
                <div className={`faq-a ${openFaq === i ? "open" : ""}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta-bg" />
        <div className="container-narrow" style={{ position: "relative" }}>
          <div className="section-label" style={{ justifyContent: "center" }}>Get Started</div>
          <h2>Start getting paid for<br />your <em>expertise.</em></h2>
          <p>Join professionals who've stopped giving away their time for free.</p>
          <Link href="/signup" className="btn-accent btn-accent-lg">
            Get Started for Free →
          </Link>
          <div className="final-trust">
            <span>No credit card required</span>
            <span>Setup in under 2 minutes</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="footer-wrapper">
        <footer>
          <Link href="/" className="footer-logo">Caln<span>i</span>ze</Link>
          <div className="footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/login">Log in</Link>
          </div>
          <p className="footer-copy">© 2026 Calnize. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
