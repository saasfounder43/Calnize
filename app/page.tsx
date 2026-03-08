"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  CreditCard,
  Mail,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Zap,
  ArrowDown,
  PlayCircle,
  Shield,
  Star,
  Users,
  Video,
} from "lucide-react";
import FAQ from "@/components/FAQ";
import { Metadata } from 'next';

// Note: Metadata in client components needs to be handled via layout or a different approach in Next.js
// but I'll add a pseudo-metadata effect or just update the title in the UI for now.

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Gradient Orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "pulse-glow 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,206,201,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "pulse-glow 8s ease-in-out infinite 2s",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px)",
          background: "rgba(10, 10, 26, 0.8)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={20} color="white" />
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Calnize
            </span>
          </div>

          <div style={{ display: "none", gap: "24px", alignItems: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }} className="desktop-menu">
            <Link href="#how-it-works" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>How It Works</Link>
            <Link href="#features" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>Features</Link>
            <Link href="#pricing" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>Pricing</Link>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                transition: "color 0.3s ease",
              }}
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-primary btn-sm" style={{ fontWeight: 600 }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="animate-fade-in"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "900px",
          margin: "0 auto",
          padding: "100px 24px 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "rgba(108, 92, 231, 0.1)",
            border: "1px solid rgba(108, 92, 231, 0.3)",
            marginBottom: "32px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-accent-light)",
          }}
        >
          <Sparkles size={14} /> Simple scheduling for solo professionals
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 8vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: "24px",
            background: "linear-gradient(135deg, #f0f0ff 0%, #a0a0cc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          Simplify Scheduling
          <br />
          with Calnize
        </h1>

        <p
          style={{
            fontSize: "20px",
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
            maxWidth: "640px",
            margin: "0 auto 48px",
          }}
        >
          Share your availability, let others book meetings instantly, and eliminate endless back-and-forth emails.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}
        >
          <Link
            href="/signup"
            className="btn-primary shadow-glow"
            style={{ padding: "16px 40px", fontSize: "18px", fontWeight: 700 }}
          >
            Start Scheduling for Free <ArrowRight size={20} />
          </Link>
          <Link
            href="#how-it-works"
            className="btn-secondary"
            style={{ padding: "16px 40px", fontSize: "18px", fontWeight: 600 }}
          >
            <PlayCircle size={20} style={{ marginRight: "8px" }} /> See How It Works
          </Link>
        </div>

        <div style={{ marginBottom: "64px", fontSize: "14px", color: "var(--color-text-muted)", fontWeight: 500, display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
          <CheckCircle size={14} color="var(--color-success)" /> Free forever plan available
        </div>

        {/* Try Booking Demo Section */}
        <div className="glass-card animate-fade-in" style={{ padding: "0", maxWidth: "800px", margin: "0 auto 64px", textAlign: "left", overflow: "hidden", animationDelay: "0.2s" }}>
          <div style={{ padding: "32px", borderBottom: "1px solid var(--color-border)" }}>
            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Try Booking a Meeting</h3>
            <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Experience how easy it is to schedule with Calnize.</p>
          </div>
          <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>Book a 30-minute demo</h4>
              <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "var(--color-text-muted)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={16} /> 30 min</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Video size={16} /> Web conferencing details provided upon confirmation.</span>
              </div>
            </div>
            <div>
              <Link href="/demo/consultation" className="btn-primary">
                Select a Time <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Brand/Social Proof Section */}
        <div style={{ opacity: 0.6, display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-muted)", width: "100%", marginBottom: "12px" }}>USED FOR SCHEDULING BY</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Globe size={18} /> <span>Consultants</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} /> <span>Freelancers</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Star size={18} /> <span>Sales teams</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Users size={18} /> <span>Recruiters</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle size={18} /> <span>Coaches</span></div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>How Calnize Works</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "18px" }}>Get started in 3 simple steps</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center", justifyItems: "center", margin: "0 auto 24px", color: "var(--color-accent-light)", fontSize: "24px", fontWeight: 800 }}>
              <div style={{ margin: "auto" }}>1</div>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Set Your Availability</h3>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Connect your calendar and define your preferred hours for meetings.</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center", justifyItems: "center", margin: "0 auto 24px", color: "var(--color-accent-light)", fontSize: "24px", fontWeight: 800 }}>
              <div style={{ margin: "auto" }}>2</div>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Share Your Link</h3>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Send your personal Calnize link to clients, teammates, or customers.</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(108, 92, 231, 0.1)", display: "flex", alignItems: "center", justifyItems: "center", margin: "0 auto 24px", color: "var(--color-accent-light)", fontSize: "24px", fontWeight: 800 }}>
              <div style={{ margin: "auto" }}>3</div>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Get Booked Instantly</h3>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Visitors choose a time, and the meeting is automatically added to your calendar.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "36px",
            fontWeight: 800,
            marginBottom: "16px",
          }}
        >
          Everything You Need for Smart Scheduling
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            marginBottom: "64px",
            fontSize: "18px",
            maxWidth: "700px",
            margin: "0 auto 64px"
          }}
        >
          From calendar sync to automated reminders, Calnize gives you the tools to manage your meetings like a pro.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {[
            {
              icon: <Calendar size={24} />,
              title: "Calendar Sync",
              desc: "Connect Google Calendar to automatically check availability and prevent double bookings.",
            },
            {
              icon: <Zap size={24} />,
              title: "Custom Booking Types",
              desc: "Create different meeting types like consultations, demos, or calls with custom durations.",
            },
            {
              icon: <Globe size={24} />,
              title: "Instant Booking Links",
              desc: "Share a simple link that lets anyone schedule a meeting with you without endless emails.",
            },
            {
              icon: <Clock size={24} />,
              title: "Buffers & Notice",
              desc: "Add buffer time between meetings and set minimum notice to prevent last-minute surprises.",
            },
            {
              icon: <CreditCard size={24} />,
              title: "Collect Payments",
              desc: "Charge for your time seamlessly via Stripe integration before meetings are confirmed.",
            },
            {
              icon: <Mail size={24} />,
              title: "Automated Emails",
              desc: "Both participants receive professional confirmation and reminder emails automatically.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-card animate-fade-in"
              style={{
                padding: "32px",
                animationDelay: `${i * 0.1}s`,
                animationFillMode: "both",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--color-accent), #8b7cf7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  color: "white",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        id="use-cases"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>Who Uses Calnize?</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "18px" }}>Designed for independent professionals and growing teams.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          {[
            { title: "Consultants", desc: "Schedule client consultations without email back-and-forth.", icon: <Globe size={28} /> },
            { title: "Sales Teams", desc: "Share your booking link and let prospects schedule demos instantly.", icon: <Zap size={28} /> },
            { title: "Coaches", desc: "Organize coaching sessions and manage appointments easily.", icon: <Star size={28} /> },
            { title: "Recruiters", desc: "Schedule interviews with candidates in seconds.", icon: <CheckCircle size={28} /> },
          ].map((useCase, i) => (
            <div key={i} className="glass-card" style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-light)", background: "rgba(108, 92, 231, 0.1)", borderRadius: "var(--radius-md)" }}>
                {useCase.icon}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>{useCase.title}</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", lineHeight: 1.6 }}>{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section
        id="comparison"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "800px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>Why Choose Calnize?</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "18px" }}>A smarter alternative that doesn&apos;t hold features hostage.</p>
        </div>

        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: "rgba(108, 92, 231, 0.1)", padding: "20px", fontWeight: 700, fontSize: "16px", borderBottom: "1px solid var(--color-border)" }}>
            <div>Feature</div>
            <div style={{ textAlign: "center", color: "var(--color-accent-light)" }}>Calnize</div>
            <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Calendly</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", background: "var(--color-bg-primary)" }}>
            {[
              { feature: "Free plan limits", us: "Generous", them: "Limited" },
              { feature: "Simple setup", us: true, them: true },
              { feature: "Custom booking types", us: true, them: true },
              { feature: "Google Calendar sync", us: true, them: true },
              { feature: "Fast scheduling", us: true, them: true },
            ].map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "20px", borderBottom: "1px solid var(--color-border)", fontSize: "15px", alignItems: "center" }}>
                <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{row.feature}</div>
                <div style={{ textAlign: "center" }}>
                  {typeof row.us === "boolean" ? <CheckCircle size={20} color="var(--color-success)" style={{ display: "inline" }} /> : <span style={{ fontWeight: 600, color: "var(--color-accent-light)" }}>{row.us}</span>}
                </div>
                <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                  {typeof row.them === "boolean" ? <CheckCircle size={20} color="var(--color-text-muted)" style={{ display: "inline", opacity: 0.5 }} /> : <span>{row.them}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "32px", textAlign: "center", background: "var(--color-bg-secondary)" }}>
            <Link href="/signup" className="btn-primary" style={{ display: "inline-flex" }}>Start Scheduling with Calnize</Link>
          </div>
        </div>
      </section>

      {/* Fast Setup Promise Section */}
      <section style={{ padding: "80px 24px", textAlign: "center", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", background: "rgba(108, 92, 231, 0.03)" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>Set up your scheduling page in <span style={{ color: "var(--color-accent-light)" }}>less than 2 minutes.</span></h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap", marginTop: "40px", fontSize: "16px", fontWeight: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--color-bg-primary)", padding: "12px 24px", borderRadius: "100px", border: "1px solid var(--color-border)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent-light)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
            Create account
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--color-bg-primary)", padding: "12px 24px", borderRadius: "100px", border: "1px solid var(--color-border)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent-light)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
            Connect calendar
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--color-bg-primary)", padding: "12px 24px", borderRadius: "100px", border: "1px solid var(--color-border)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent-light)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
            Share booking link
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "900px",
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>Simple, Transparent Pricing</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "18px" }}>Start for free and upgrade as you grow.</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Free Plan */}
          <div className="glass-card" style={{ padding: "36px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--color-text-muted)",
                marginBottom: "8px",
              }}
            >
              Free
            </p>
            <p style={{ fontSize: "40px", fontWeight: 800, marginBottom: "4px" }}>
              $0
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                /month
              </span>
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                marginBottom: "28px",
              }}
            >
              Perfect to get started
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {["1 booking type", "Unlimited bookings", "Email confirmations", "Google Calendar sync"].map(
                (f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                    <CheckCircle size={16} color="var(--color-success)" />
                    {f}
                  </div>
                )
              )}
            </div>
            <Link href="/signup" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div
            className="glass-card animate-pulse-glow"
            style={{
              padding: "36px",
              border: "1px solid rgba(108, 92, 231, 0.4)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "20px",
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                padding: "4px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                color: "white",
              }}
            >
              POPULAR
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--color-accent-light)",
                marginBottom: "8px",
              }}
            >
              Pro
            </p>
            <p style={{ fontSize: "40px", fontWeight: 800, marginBottom: "4px" }}>
              $9
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                /month
              </span>
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                marginBottom: "28px",
              }}
            >
              For growing professionals
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {[
                "Unlimited booking types",
                "Stripe payments",
                "Custom buffer times",
                "Priority support",
                "Custom branding",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                  <CheckCircle size={16} color="var(--color-accent-light)" />
                  {f}
                </div>
              ))}
            </div>
            <Link href="/signup" className="btn-primary" style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}>
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "100px 24px", textAlign: "center", background: "rgba(108, 92, 231, 0.05)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "20px" }}>Start Scheduling Smarter Today</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "18px", maxWidth: "600px", margin: "0 auto 40px" }}>
          Create your free Calnize account and start accepting bookings in minutes.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/signup" className="btn-primary" style={{ padding: "16px 40px", fontSize: "18px", fontWeight: 700 }}>
            Get Started Free
          </Link>
          <Link href="/signup" className="btn-secondary" style={{ padding: "16px 40px", fontSize: "18px", fontWeight: 600 }}>
            Create Your Booking Page
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Ready to simplify section */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>Ready to simplify your scheduling?</h3>
        <Link href="/signup" className="btn-primary" style={{ padding: "14px 32px" }}>
          Start Using Calnize
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid var(--color-border)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
          © {new Date().getFullYear()} Calnize. Built for solo professionals who value simplicity.
        </p>
      </footer>
    </div>
  );
}
