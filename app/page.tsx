"use client";

import { useEffect, useState } from "react";
import * as gtag from "@/lib/gtag";

const audience = [
  { emoji: "💼", name: "Consultants" },
  { emoji: "🎨", name: "Freelancers" },
  { emoji: "🧠", name: "Coaches" },
  { emoji: "✏️", name: "Designers" },
  { emoji: "🩺", name: "Doctors" },
  { emoji: "📈", name: "Sales Teams" },
];

const benefits = [
  {
    icon: "💰",
    title: "Get paid upfront",
    description:
      "No more free calls. Collect payment at booking so your time is always valued.",
  },
  {
    icon: "⚡",
    title: "No back-and-forth",
    description:
      "One link handles everything — calendar, payment, and confirmation in seconds.",
  },
  {
    icon: "🎯",
    title: "Better clients",
    description:
      "Upfront payment filters out time-wasters. Only serious, committed clients book.",
  },
  {
    icon: "✨",
    title: "Look professional",
    description:
      "A premium booking experience that builds trust before the meeting even starts.",
  },
];

const comparisonRows = [
  ["Primary Goal", "General Meetings", "Monetizing Expertise"],
  ["Paid Bookings", "Complex setup / plugins", "Built-in & Native"],
  ["No-Show Protection", "Basic Reminders", "Financial Commitment"],
  ["Setup Velocity", "15–30 minutes", "Under 2 Minutes"],
  ["Client Experience", "Redirects & pop-ups", "Unified Booking & Pay"],
  ["Admin Effort", "Manual chasing", "100% Automated"],
  ["Branding", "Limited / Generic", "Fully Professional"],
  ["Monthly Pricing", "$15 – $30+ / month", "Just $9 / month"],
  ["Monthly ROI", "A Service Cost", "A Revenue Engine"],
];

const testimonials = [
  {
    initials: "AK",
    name: "Arjun K.",
    role: "Business Consultant",
    text: '"Calnize completely changed how I charge for consultations. I stopped doing free discovery calls the day I signed up."',
  },
  {
    initials: "SL",
    name: "Sara L.",
    role: "Freelance Designer",
    text: '"No-shows dropped to zero almost immediately. Clients who pay upfront always show up prepared and on time."',
  },
  {
    initials: "MR",
    name: "Mike R.",
    role: "Executive Coach",
    text: '"Setup took under 10 minutes and the booking experience looks premium. Finally a tool that treats my time as valuable."',
  },
];

const faqs = [
  {
    question: "How do I receive payments?",
    answer:
      "Calnize integrates with Stripe to collect payments at the point of booking. Once a client pays, funds are deposited directly to your connected Stripe account — no manual chasing required.",
  },
  {
    question: "Can I still offer free meetings?",
    answer:
      "Yes. You can set any booking type to $0 if you want to offer free sessions. Calnize gives you full control over pricing per meeting type.",
  },
  {
    question: "Does this work with my current calendar?",
    answer:
      "Calnize syncs with Google Calendar and Outlook. Your existing availability is pulled in automatically so clients always see your real-time free slots.",
  },
  {
    question: "What if I need to book a meeting manually?",
    answer:
      "You can create manual bookings directly from your Calnize dashboard — useful for repeat clients or situations where you want to bypass the booking link.",
  },
  {
    question: "Can I set buffer times between meetings?",
    answer:
      "Yes. You can configure buffer time before and after each meeting type so you always have breathing room between sessions.",
  },
  {
    question: "How do I handle cancellations?",
    answer:
      "You set your own cancellation policy per booking type — full refund, partial refund, or no refund. Calnize handles the refund processing automatically via Stripe.",
  },
  {
    question: "Is there a limit to how many bookings I can take?",
    answer:
      "No limits. Whether you take 5 bookings a month or 500, Calnize handles it all — no caps, no extra fees per booking.",
  },
  {
    question: "Can I use Calnize on my own website?",
    answer:
      "Yes. You can embed your Calnize booking page directly onto your existing website using a simple embed snippet, or share your unique Calnize link anywhere.",
  },
];

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0b0b14;
    --surface: #0f0f1c;
    --border: #1a1a2e;
    --border2: #232340;
    --accent: #7c6af7;
    --accent2: #5b4de0;
    --accent-glow: rgba(124,106,247,0.14);
    --teal: #00e5c0;
    --text: #eeeeff;
    --muted: #6868a0;
    --card: #0c0c1a;
    --radius: 12px;
    --max: 1100px;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(11,11,20,0.90);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--border);
  }

  .nav-inner {
    max-width: var(--max);
    margin: 0 auto;
    height: 62px;
    padding: 0 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .nav-logo span { color: var(--accent); }

  .nav-cta {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 9px 22px;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s, box-shadow 0.2s;
  }

  .nav-cta:hover { background: var(--accent2); box-shadow: 0 4px 20px rgba(124,106,247,0.3); }

  section { padding: 90px 28px; }

  .container { max-width: var(--max); margin: 0 auto; }

  .section-label {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-glow);
    border: 1px solid rgba(124,106,247,0.2);
    border-radius: 100px;
    padding: 4px 14px;
    margin-bottom: 18px;
  }

  h1, h2 {
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .divider { width: 100%; height: 1px; background: var(--border); }

  #hero {
    padding: 130px 28px 110px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  #hero::before {
    content: '';
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 600px;
    background: radial-gradient(ellipse at center, rgba(124,106,247,0.11) 0%, transparent 66%);
    pointer-events: none;
  }

  .hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-glow);
    border: 1px solid rgba(124,106,247,0.22);
    border-radius: 100px;
    padding: 6px 18px;
    margin-bottom: 30px;
  }

  .hero-pill .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }

  h1 {
    font-size: clamp(2.4rem, 5.5vw, 4rem);
    font-weight: 800;
    max-width: 720px;
    margin: 0 auto 22px;
  }

  h1 em { font-style: normal; color: var(--accent); }

  .hero-sub {
    font-size: 1.1rem;
    color: var(--muted);
    max-width: 420px;
    margin: 0 auto 38px;
    font-weight: 400;
    line-height: 1.65;
  }

  .btn-primary {
    display: inline-block;
    text-decoration: none;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 9px;
    padding: 14px 34px;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }

  .btn-primary:hover {
    background: var(--accent2);
    transform: translateY(-1px);
    box-shadow: 0 10px 36px rgba(124,106,247,0.32);
  }

  .hero-micro { margin-top: 14px; font-size: 0.78rem; color: var(--muted); }

  .badges-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
    margin-top: 36px;
  }

  .badges-container a {
    display: flex;
    align-items: center;
    transition: transform 0.2s;
  }

  .badges-container a:hover {
    transform: translateY(-2px);
  }

  .badges-container img {
    border-radius: 8px;
  }

  #problem { background: var(--surface); padding: 80px 28px; }
  #problem .container { text-align: center; }
  #problem h2 { font-size: clamp(1.9rem, 3.8vw, 2.8rem); font-weight: 800; margin-bottom: 40px; }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }

  .pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 100px;
    padding: 12px 24px;
    font-size: 0.93rem;
    font-weight: 500;
  }

  .pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e05555;
    flex-shrink: 0;
  }

  #solution { text-align: center; }
  #solution h2 { font-size: clamp(1.9rem, 3.8vw, 2.8rem); font-weight: 800; margin-bottom: 52px; }

  .flow {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0;
  }

  .flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .flow-icon {
    width: 66px;
    height: 66px;
    border-radius: 18px;
    background: var(--accent-glow);
    border: 1px solid rgba(124,106,247,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.55rem;
    transition: border-color 0.2s, background 0.2s;
  }

  .flow-icon:hover { background: rgba(124,106,247,0.2); border-color: rgba(124,106,247,0.5); }
  .flow-label { font-size: 0.82rem; font-weight: 600; color: var(--text); letter-spacing: 0.01em; }
  .flow-arrow { font-size: 1rem; color: var(--muted); padding: 0 20px; margin-bottom: 30px; }

  #audience { background: var(--surface); }
  #audience h2 { font-size: clamp(1.7rem, 3.2vw, 2.4rem); font-weight: 800; margin-bottom: 44px; text-align: center; }

  .audience-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .audience-card {
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }

  .audience-card:hover { border-color: rgba(124,106,247,0.38); transform: translateY(-2px); }
  .a-emoji { font-size: 1.6rem; flex-shrink: 0; }
  .a-name { font-size: 0.95rem; font-weight: 600; }

  #benefits h2 { font-size: clamp(1.7rem, 3.2vw, 2.4rem); font-weight: 800; margin-bottom: 44px; text-align: center; }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .benefit-card {
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 28px;
    transition: border-color 0.2s;
  }

  .benefit-card:hover { border-color: rgba(124,106,247,0.3); }
  .b-icon { font-size: 1.6rem; margin-bottom: 14px; }
  .b-title { font-size: 1rem; font-weight: 700; margin-bottom: 7px; }
  .b-desc { font-size: 0.87rem; color: var(--muted); line-height: 1.65; }

  #preview { background: var(--surface); text-align: center; }
  #preview h2 { font-size: clamp(1.7rem, 3.2vw, 2.4rem); font-weight: 800; margin-bottom: 40px; }

  .gif-wrapper {
    max-width: 960px;
    margin: 0 auto;
    border-radius: 18px;
    border: 1px solid var(--border2);
    overflow: hidden;
    background: var(--card);
    box-shadow: 0 32px 96px rgba(0,0,0,0.6);
  }

  .gif-wrapper img {
    width: 100%;
    height: auto;
    display: block;
  }

  .gif-caption { margin-top: 16px; font-size: 0.82rem; color: var(--muted); }

  #pricing { text-align: center; }
  #pricing h2 { font-size: clamp(1.7rem, 3.2vw, 2.4rem); font-weight: 800; margin-bottom: 10px; }
  .pricing-sub { color: var(--muted); font-size: 0.93rem; margin-bottom: 44px; }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
    max-width: 960px;
    margin: 0 auto;
    align-items: stretch;
  }

  .pricing-card {
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 16px;
    padding: 32px 26px;
    text-align: left;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .pricing-card:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,0,0,0.45); }

  .pricing-card.featured {
    border-color: rgba(124,106,247,0.42);
    background: linear-gradient(150deg, rgba(124,106,247,0.07) 0%, var(--card) 60%);
    transform: scale(1.04);
    z-index: 2;
  }
  .pricing-card.featured:hover { transform: scale(1.04) translateY(-3px); }

  .p-recommended {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fff;
    background: #22c55e;
    border-radius: 20px;
    padding: 5px 14px;
    white-space: nowrap;
  }

  .p-badge {
    display: inline-block;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fff;
    background: var(--accent);
    border-radius: 6px;
    padding: 3px 10px;
    margin-bottom: 18px;
  }

  .p-title { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
  .p-price { font-size: 2.6rem; font-weight: 800; line-height: 1; color: var(--text); letter-spacing: -0.04em; display: flex; align-items: baseline; gap: 8px; }
  .p-price-strike { font-size: 1.2rem; color: var(--muted); text-decoration: line-through; font-weight: 400; }
  .p-period { font-size: 0.78rem; color: var(--muted); margin-top: 4px; margin-bottom: 26px; }

  .p-features {
    list-style: none;
    margin-bottom: 26px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-grow: 1;
  }

  .p-features li {
    font-size: 0.87rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .p-features li .feat-icon { flex-shrink: 0; font-weight: 700; font-size: 0.8rem; }
  .p-features li .feat-icon.check { color: var(--teal); }
  .p-features li .feat-icon.cross { color: #ef4444; }
  .p-features li.excluded { opacity: 0.55; }

  .btn-p {
    display: block;
    text-align: center;
    text-decoration: none;
    border-radius: 9px;
    padding: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .btn-p:hover { transform: scale(1.03); }

  .btn-p.solid { background: var(--accent); color: #fff; box-shadow: 0 4px 20px rgba(124,106,247,0.35); }
  .btn-p.solid:hover { background: var(--accent2); box-shadow: 0 6px 28px rgba(124,106,247,0.5); }
  .btn-p.secondary { background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border2); }
  .btn-p.secondary:hover { border-color: var(--accent); background: var(--accent-glow); }
  .btn-p.outline { border: 1px solid var(--border2); color: var(--text); background: transparent; }
  .btn-p.outline:hover { border-color: var(--accent); background: var(--accent-glow); }
  .pricing-save { margin-top: 20px; font-size: 0.82rem; color: var(--muted); }
  .pricing-save strong { color: #5cd97a; }

  #comparison { background: var(--surface); }
  #comparison h2 { font-size: clamp(1.7rem, 3.2vw, 2.4rem); font-weight: 800; margin-bottom: 44px; text-align: center; }

  .compare-outer {
    max-width: 900px;
    margin: 0 auto;
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 16px;
    overflow: hidden;
  }

  .cr {
    display: grid;
    grid-template-columns: 1.8fr 1fr 1fr;
    border-bottom: 1px solid var(--border);
  }

  .cr:last-child { border-bottom: none; }

  .cc {
    padding: 16px 22px;
    font-size: 0.88rem;
    display: flex;
    align-items: center;
  }

  .cc:not(:first-child) { justify-content: center; text-align: center; }
  .cr.head .cc { padding: 18px 22px; }
  .cr.head .cc:first-child,
  .cr.head .cc:nth-child(2) {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .cr.head .cc.cal-header {
    background: var(--accent);
    border-radius: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    gap: 6px;
  }

  .cr.head .cc.cal-header::before { content: '✦'; font-size: 0.8rem; }
  .cr:nth-child(even) .cc { background: rgba(255,255,255,0.012); }
  .cr:not(.head) .cc:nth-child(3) { color: var(--teal); font-weight: 600; font-size: 0.87rem; }
  .cr:not(.head) .cc:nth-child(2) { color: var(--muted); font-size: 0.85rem; }
  .cross-icon { color: var(--muted); margin-right: 6px; font-size: 0.85rem; }
  .check-icon { color: var(--teal); margin-right: 6px; font-size: 0.9rem; }
  .cc-feature { color: var(--text); font-size: 0.88rem; font-weight: 400; }

  #testimonials { text-align: center; }
  #testimonials h2 { font-size: clamp(1.7rem, 3.2vw, 2.4rem); font-weight: 800; margin-bottom: 44px; }

  .test-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .test-card {
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 28px;
    text-align: left;
  }

  .t-stars { color: #f7c948; font-size: 0.82rem; margin-bottom: 14px; letter-spacing: 2px; }
  .t-text { font-size: 0.88rem; color: var(--text); line-height: 1.72; margin-bottom: 20px; }
  .t-author { display: flex; align-items: center; gap: 10px; }

  .t-av {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--accent-glow);
    border: 1px solid rgba(124,106,247,0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--accent);
    flex-shrink: 0;
  }

  .t-name { font-size: 0.85rem; font-weight: 600; }
  .t-role { font-size: 0.75rem; color: var(--muted); }

  #faq { background: var(--surface); }
  #faq h2 { font-size: clamp(1.7rem, 3.2vw, 2.4rem); font-weight: 800; margin-bottom: 44px; text-align: center; }
  .faq-list { max-width: 740px; margin: 0 auto; }
  .faq-item { border-bottom: 1px solid var(--border2); }
  .faq-item:first-child { border-top: 1px solid var(--border2); }

  .faq-q {
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    padding: 22px 0;
    font-family: 'Inter', sans-serif;
    font-size: 0.97rem;
    font-weight: 600;
    color: var(--text);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .faq-icon {
    font-size: 1.3rem;
    color: var(--muted);
    flex-shrink: 0;
    transition: transform 0.25s;
    line-height: 1;
    font-weight: 300;
  }

  .faq-item.open .faq-icon { transform: rotate(45deg); }

  .faq-a {
    font-size: 0.88rem;
    color: var(--muted);
    line-height: 1.74;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding-bottom 0.3s;
  }

  .faq-item.open .faq-a { max-height: 300px; padding-bottom: 20px; }

  #cta {
    text-align: center;
    padding: 110px 28px;
    position: relative;
    overflow: hidden;
  }

  #cta::before {
    content: '';
    position: absolute;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 420px;
    background: radial-gradient(ellipse, rgba(124,106,247,0.1) 0%, transparent 68%);
    pointer-events: none;
  }

  #cta h2 { font-size: clamp(2rem, 4.2vw, 3.2rem); font-weight: 800; max-width: 540px; margin: 0 auto 28px; }
  .cta-micro { margin-top: 14px; font-size: 0.78rem; color: var(--muted); }

  #ph-bottom {
    padding: 52px 28px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .ph-label { font-size: 0.78rem; color: var(--muted); margin-bottom: 14px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }

  footer {
    background: var(--bg);
    border-top: 1px solid var(--border);
    padding: 32px 28px;
  }

  .footer-inner {
    max-width: var(--max);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
  }

  .footer-logo { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }
  .footer-logo span { color: var(--accent); }

  .footer-links {
    display: flex;
    gap: 22px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .footer-links a:hover { color: var(--text); }
  .footer-copy { font-size: 0.75rem; color: var(--muted); }

  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .fade-up.in { opacity: 1; transform: none; }

  @media (max-width: 680px) {
    .test-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .audience-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 580px) {
    .benefits-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 820px) {
    .pricing-grid { grid-template-columns: 1fr; }
    .pricing-card.featured { transform: none; }
    .pricing-card.featured:hover { transform: translateY(-3px); }
  }

  .activity-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    z-index: 1000;
    transform: translateY(20px);
    opacity: 0;
    transition: transform 0.4s ease, opacity 0.4s ease;
    max-width: 320px;
    pointer-events: none;
  }

  .activity-toast.visible {
    transform: translateY(0);
    opacity: 1;
  }

  .toast-icon {
    background: rgba(124,106,247,0.15);
    color: var(--accent);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1rem;
  }
  
  .toast-content {
    font-size: 0.82rem;
    line-height: 1.4;
  }
  
  .toast-content strong {
    color: var(--text);
    font-weight: 600;
  }
  
  .toast-time {
    display: block;
    font-size: 0.7rem;
    color: var(--muted);
    margin-top: 2px;
  }

  #stats {
    padding: 60px 28px;
    background: var(--bg);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  
  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 60px;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.04em;
    margin-bottom: 4px;
    background: linear-gradient(135deg, #fff 0%, #a5a5d1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .stat-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  @media (max-width: 768px) {
    .activity-toast {
      bottom: 16px;
      left: 16px;
      right: 16px;
      max-width: none;
    }
  }

  @media (max-width: 460px) {
    section { padding: 64px 18px; }
    #hero { padding: 80px 18px 72px; }
    .flow-arrow { padding: 0 10px; }
    .cr { grid-template-columns: 1.4fr 1fr 1fr; }
    .cc { padding: 12px 12px; font-size: 0.78rem; }
  }
`;

const toastMessages = [
  "Someone just bought the $21 lifetime plan 🎉",
  "Someone just started charging for meetings 💸",
  "A consultant just earned their first booking on Calnize",
  "New user activated paid scheduling ⚡",
  "Someone just created a paid meeting link",
  "A coach just received a payment via Calnize"
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const signupUrl = "https://app.calnize.com/signup";

  const trackClick = (label: string) => {
    gtag.event({
      action: "cta_click",
      category: "engagement",
      label,
    });
  };
  const loginUrl = "https://app.calnize.com/login";


  useEffect(() => {
    const timeout = window.setTimeout(() => setRevealed(true), 80);
    
    let isSubscribed = true;
    
    try {
      let toastCount = parseInt(sessionStorage.getItem("calnize_toast_count") || "0", 10);
      
      if (toastCount < 2) {
        const showNextToast = () => {
          if (!isSubscribed || toastCount >= 2) return;
          
          const delay = Math.floor(Math.random() * 4000) + 2000; // 2 to 6 seconds delay
          
          setTimeout(() => {
            if (!isSubscribed) return;
            
            const isPriority = Math.random() < 0.5;
            const message = isPriority 
              ? toastMessages[0] 
              : toastMessages[Math.floor(Math.random() * (toastMessages.length - 1)) + 1];
            
            setToastMessage(message);
            setShowToast(true);
            
            toastCount++;
            sessionStorage.setItem("calnize_toast_count", toastCount.toString());
            
            setTimeout(() => {
              if (!isSubscribed) return;
              setShowToast(false);
              
              if (toastCount < 2) {
                showNextToast();
              }
            }, 2500); // Visible for ~2.5 seconds
          }, delay);
        };
        
        showNextToast();
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }
    
    return () => {
      isSubscribed = false;
      window.clearTimeout(timeout);
    };
  }, []);

  // Section visibility tracking — fires once per section per session
  useEffect(() => {
    const tracked = new Set<string>();
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          if (entry.isIntersecting && id && !tracked.has(id)) {
            tracked.add(id);
            gtag.event({
              action: "section_view",
              category: "scroll_depth",
              label: id,
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{styles}</style>

      <nav>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            Cal<span>nize</span>
          </a>
          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <a href="https://www.producthunt.com/products/calnize?utm_source=badge-follow&utm_medium=badge&utm_source=badge-calnize" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <img src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=1188123&theme=neutral" alt="Calnize - Turn meetings into revenue with built-in payments | Product Hunt" style={{ width: "250px", height: "54px" }} width="250" height="54" />
            </a>
            <a href={signupUrl} className="nav-cta" onClick={() => trackClick("nav_start_free")}>
              Start Free
            </a>
          </div>
        </div>
      </nav>

      <section id="hero">
        <div className="container">

          <h1>
            Get Paid for Your Time
            <br />
            <em>Not Just Meetings</em>
          </h1>
          <p className="hero-sub">
            Scheduling + payments in one simple flow for professionals
          </p>
          <a href={signupUrl} className="btn-primary" onClick={() => trackClick("hero_start_free")}>
            Start Free
          </a>
          <p className="hero-micro">
            Early adopter plan available · No credit card required
          </p>

        </div>
      </section>

      <div className="divider" />

      <section id="stats">
        <div className="container">
          <div className={`stats-grid fade-up ${revealed ? "in" : ""}`}>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">users trust Calnize</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2,100+</div>
              <div className="stat-label">meetings booked</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">$7,500+</div>
              <div className="stat-label">paid to providers</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="problem">
        <div className="container">
          <div className="section-label">The Problem</div>
          <h2>Still doing free calls?</h2>
          <div className={`pills fade-up ${revealed ? "in" : ""}`}>
            <div className="pill">
              <span className="pill-dot" />
              Free calls that go nowhere
            </div>
            <div className="pill">
              <span className="pill-dot" />
              Last-minute no-shows
            </div>
            <div className="pill">
              <span className="pill-dot" />
              Endless back-and-forth scheduling
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="solution">
        <div className="container">
          <div className="section-label">The Solution</div>
          <h2>Turn meetings into revenue</h2>
          <div className={`flow fade-up ${revealed ? "in" : ""}`}>
            <div className="flow-step">
              <div className="flow-icon">🔗</div>
              <span className="flow-label">Share link</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon">📅</div>
              <span className="flow-label">Book</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon">💳</div>
              <span className="flow-label">Pay</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon">✅</div>
              <span className="flow-label">Confirm</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="audience">
        <div className="container">
          <div className="section-label">Built For</div>
          <h2>Built for people who make money from meetings</h2>
          <div className={`audience-grid fade-up ${revealed ? "in" : ""}`}>
            {audience.map((item) => (
              <div key={item.name} className="audience-card">
                <span className="a-emoji">{item.emoji}</span>
                <span className="a-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="benefits">
        <div className="container">
          <div className="section-label">Why Calnize</div>
          <h2>Everything you need to get paid</h2>
          <div className={`benefits-grid fade-up ${revealed ? "in" : ""}`}>
            {benefits.map((benefit) => (
              <div key={benefit.title} className="benefit-card">
                <div className="b-icon">{benefit.icon}</div>
                <div className="b-title">{benefit.title}</div>
                <div className="b-desc">{benefit.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="preview">
        <div className="container">
          <div className="section-label">Product Preview</div>
          <h2>Your booking experience, simplified</h2>
          <div className={`gif-wrapper fade-up ${revealed ? "in" : ""}`}>
            <img
              src="/demo.gif"
              alt="Calnize booking flow demo"
              loading="lazy"
            />
          </div>
          <p className="gif-caption">From booking to payment in seconds</p>
        </div>
      </section>

      <div className="divider" />

      <section id="pricing">
        <div className="container">
          <div className="section-label">Pricing</div>
          <h2>Simple, honest pricing</h2>
          <p className="pricing-sub">Lock in the early rate before it&apos;s gone.</p>
          <div className={`pricing-grid fade-up ${revealed ? "in" : ""}`}>
            {/* LIFETIME DEAL — Recommended */}
            <div className="pricing-card featured">
              <div className="p-recommended">⭐ RECOMMENDED</div>
              <div className="p-badge">LIFETIME DEAL</div>
              <div className="p-price">$21 <span className="p-price-strike">$99</span></div>
              <div className="p-period">one-time payment</div>
              <ul className="p-features">
                <li><span className="feat-icon check">✓</span> Unlimited booking types</li>
                <li><span className="feat-icon check">✓</span> Unlimited bookings</li>
                <li><span className="feat-icon check">✓</span> Advanced calendar integration</li>
                <li><span className="feat-icon check">✓</span> Email notifications</li>
                <li><span className="feat-icon check">✓</span> Custom branding</li>
                <li><span className="feat-icon check">✓</span> Payment integrations</li>
                <li><span className="feat-icon check">✓</span> Full access to all features</li>
                <li><span className="feat-icon check">✓</span> All future updates included</li>
                <li><span className="feat-icon check">✓</span> Pay once, use forever</li>
              </ul>
              <a href={signupUrl} className="btn-p solid" onClick={() => trackClick("pricing_lifetime_access")}>
                Get Lifetime Access
              </a>
            </div>
            {/* MONTHLY PLAN */}
            <div className="pricing-card">
              <div className="p-title">Try Calnize for a month</div>
              <div className="p-price">$9</div>
              <div className="p-period">per month</div>
              <ul className="p-features">
                <li><span className="feat-icon check">✓</span> Unlimited booking types</li>
                <li><span className="feat-icon check">✓</span> Unlimited bookings</li>
                <li><span className="feat-icon check">✓</span> Advanced calendar integration</li>
                <li><span className="feat-icon check">✓</span> Email notifications</li>
                <li><span className="feat-icon check">✓</span> Custom branding</li>
                <li><span className="feat-icon check">✓</span> Payment integrations</li>
                <li><span className="feat-icon check">✓</span> Full access to all features</li>
                <li><span className="feat-icon check">✓</span> All future updates included</li>
                <li><span className="feat-icon check">✓</span> Standard pricing</li>
              </ul>
              <a href={signupUrl} className="btn-p secondary" onClick={() => trackClick("pricing_try_monthly")}>
                Try for a Month
              </a>
            </div>
            {/* FREE PLAN */}
            <div className="pricing-card">
              <div className="p-title">Try for free</div>
              <div className="p-price">$0</div>
              <div className="p-period">forever</div>
              <ul className="p-features">
                <li><span className="feat-icon check">✓</span> One booking type allowed</li>
                <li><span className="feat-icon check">✓</span> Limited bookings</li>
                <li><span className="feat-icon check">✓</span> Basic calendar integration</li>
                <li><span className="feat-icon check">✓</span> Email notifications</li>
                <li className="excluded"><span className="feat-icon cross">✕</span> No custom branding</li>
                <li className="excluded"><span className="feat-icon cross">✕</span> No payment integrations</li>
              </ul>
              <a href={signupUrl} className="btn-p outline" onClick={() => trackClick("pricing_start_free")}>
                Start Free
              </a>
            </div>
          </div>
          <p className="pricing-save">
            💚 <strong>Pay once. Use forever.</strong> No subscriptions.
          </p>
        </div>
      </section>

      <div className="divider" />

      <section id="comparison">
        <div className="container">
          <div className="section-label">Comparison</div>
          <h2>Why not just use generic tools?</h2>
          <div className={`compare-outer fade-up ${revealed ? "in" : ""}`}>
            <div className="cr head">
              <div className="cc">Feature</div>
              <div className="cc">Generic Tools</div>
              <div className="cc cal-header">Calnize</div>
            </div>
            {comparisonRows.map(([feature, generic, calnize]) => (
              <div key={feature} className="cr">
                <div className="cc cc-feature">{feature}</div>
                <div className="cc">
                  <span className="cross-icon">✗</span>
                  {generic}
                </div>
                <div className="cc">
                  <span className="check-icon">✓</span>
                  {calnize}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="testimonials">
        <div className="container">
          <div className="section-label">Testimonials</div>
          <h2>What early users say</h2>
          <div className={`test-grid fade-up ${revealed ? "in" : ""}`}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="test-card">
                <div className="t-stars">★★★★★</div>
                <p className="t-text">{testimonial.text}</p>
                <div className="t-author">
                  <div className="t-av">{testimonial.initials}</div>
                  <div>
                    <div className="t-name">{testimonial.name}</div>
                    <div className="t-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="faq">
        <div className="container">
          <div className="section-label">FAQ</div>
          <h2>Common questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={`faq-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="faq-q"
                    onClick={() => {
                      setOpenFaq(isOpen ? null : index);
                      if (!isOpen) trackClick(`faq_open_${index}_${faq.question.slice(0, 30)}`);
                    }}
                  >
                    {faq.question}
                    <span className="faq-icon">+</span>
                  </button>
                  <div className="faq-a">{faq.answer}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="cta">
        <div className="container">
          <div className="section-label">Get Started</div>
          <h2>
            Start getting paid
            <br />
            for your time
          </h2>
          <a
            href={signupUrl}
            className="btn-primary"
            style={{ fontSize: "1.05rem", padding: "15px 38px" }}
            onClick={() => trackClick("bottom_cta_start_free")}
          >
            Start Free
          </a>
          <p className="cta-micro">Lifetime deal available · Price locked forever</p>
        </div>
      </section>



      <footer>
        <div className="footer-inner">
          <div className="footer-logo">
            Cal<span>nize</span>
          </div>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="mailto:support@calnize.com?subject=Hello%20Calnize">
              Contact
            </a>
            <a href={loginUrl}>
              Login
            </a>
          </div>
          <p className="footer-copy">© 2026 Calnize. All rights reserved.</p>
        </div>
      </footer>

      <div className={`activity-toast ${showToast ? "visible" : ""}`}>
        <div className="toast-icon">✨</div>
        <div className="toast-content">
          <strong>{toastMessage}</strong>
        </div>
      </div>
    </>
  );
}
