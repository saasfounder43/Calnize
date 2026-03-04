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
} from "lucide-react";

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

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                transition: "color 0.3s ease",
              }}
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-primary btn-sm">
              Get Started Free <ArrowRight size={16} />
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
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "24px",
            background: "linear-gradient(135deg, #f0f0ff 0%, #a0a0cc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Schedule meetings
          <br />
          without the chaos
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.7,
            color: "var(--color-text-secondary)",
            maxWidth: "600px",
            margin: "0 auto 40px",
          }}
        >
          Share your availability, accept bookings, sync with Google Calendar,
          and collect payments — all in one minimal, beautiful tool.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/signup"
            className="btn-primary"
            style={{ padding: "14px 32px", fontSize: "16px" }}
          >
            Start Free <ArrowRight size={18} />
          </Link>
          <Link
            href="#features"
            className="btn-secondary"
            style={{ padding: "14px 32px", fontSize: "16px" }}
          >
            See Features
          </Link>
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
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Everything you need.{" "}
          <span style={{ color: "var(--color-accent-light)" }}>
            Nothing you don't.
          </span>
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            marginBottom: "60px",
            fontSize: "16px",
          }}
        >
          No enterprise bloat. No complexity. Just scheduling that works.
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
              title: "Booking Types",
              desc: "Create different meeting types with custom durations, descriptions, and optional pricing.",
            },
            {
              icon: <Clock size={24} />,
              title: "Smart Availability",
              desc: "Define your weekly schedule. Our engine generates available slots automatically.",
            },
            {
              icon: <Globe size={24} />,
              title: "Google Calendar Sync",
              desc: "Connect your calendar to prevent double bookings and auto-create events.",
            },
            {
              icon: <CreditCard size={24} />,
              title: "Stripe Payments",
              desc: "Charge for consultations with secure Stripe Checkout integration.",
            },
            {
              icon: <Mail size={24} />,
              title: "Email Notifications",
              desc: "Automatic confirmation and 24-hour reminder emails to both host and guest.",
            },
            {
              icon: <Zap size={24} />,
              title: "Instant Public Pages",
              desc: "Each booking type gets a clean, shareable public link for guests to book.",
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

      {/* Pricing Section */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "800px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Simple pricing
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            marginBottom: "48px",
          }}
        >
          Start free. Upgrade when you need more.
        </p>

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
            <Link href="/signup" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Upgrade to Pro
            </Link>
          </div>
        </div>
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
