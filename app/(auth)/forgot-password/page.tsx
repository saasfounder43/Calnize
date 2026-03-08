"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, ChevronLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "var(--color-bg-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                }}
            >
                <div
                    className="glass-card animate-fade-in"
                    style={{
                        maxWidth: "440px",
                        width: "100%",
                        padding: "48px 40px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "rgba(16, 185, 129, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <CheckCircle2 size={28} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>
                        Check your email
                    </h2>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "14px",
                            lineHeight: 1.6,
                            marginBottom: "24px",
                        }}
                    >
                        If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link to it.
                        Please check your inbox (and spam folder).
                    </p>
                    <Link href="/login" className="btn-secondary" style={{ justifyContent: "center" }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--color-bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background Orb */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "600px",
                    height: "600px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div
                className="glass-card animate-fade-in"
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    padding: "48px 40px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Link
                    href="/login"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--color-text-secondary)",
                        textDecoration: "none",
                        fontSize: "14px",
                        marginBottom: "32px",
                        transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                    <ChevronLeft size={16} /> Back to Login
                </Link>

                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
                    Reset your password
                </h1>
                <p
                    style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "14px",
                        marginBottom: "32px",
                    }}
                >
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                {error && (
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "rgba(255, 107, 107, 0.1)",
                            border: "1px solid rgba(255, 107, 107, 0.3)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-danger)",
                            fontSize: "13px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "28px" }}>
                        <label className="input-label" htmlFor="email">
                            Email address
                        </label>
                        <div style={{ position: "relative" }}>
                            <Mail
                                size={16}
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--color-text-muted)",
                                }}
                            />
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            width: "100%",
                            justifyContent: "center",
                            padding: "14px",
                            fontSize: "15px",
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Sending link...
                            </>
                        ) : (
                            <>
                                Send reset link <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
