"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const buildSlug = (value: string, fallback: string) => {
        const base = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 30);

        return base || fallback;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            // 2. Create user record in our users table
            if (authData.user) {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const slug = buildSlug(
                    fullName || email.split("@")[0] || "user",
                    `user-${authData.user.id.slice(0, 6)}`
                );
                const { error: dbError } = await supabase.from("users").insert({
                    id: authData.user.id,
                    email,
                    full_name: fullName,
                    timezone,
                    slug,
                    plan_type: "free",
                    onboarding_completed: false,
                    calendar_connected: false,
                });

                if (dbError) {
                    console.error("Error creating user profile:", dbError);
                    // Non-blocking — auth user is created, profile can be retried
                }
            }

            if (authData.session) {
                router.push("/onboarding");
                router.refresh();
                return;
            }

            setSuccess(true);
        } catch {
            setError("An unexpected error occurred");
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
                            background: "rgba(0, 206, 201, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <Mail size={28} color="var(--color-success)" />
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
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        Click it to verify your account and continue into onboarding.
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
                    background:
                        "radial-gradient(circle, rgba(0,206,201,0.08) 0%, transparent 70%)",
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
                {/* Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "40px",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Calendar size={22} color="white" />
                    </div>
                    <span
                        style={{
                            fontSize: "22px",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Calnize
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        textAlign: "center",
                        marginBottom: "8px",
                    }}
                >
                    Create your account
                </h1>
                <p
                    style={{
                        textAlign: "center",
                        color: "var(--color-text-secondary)",
                        fontSize: "14px",
                        marginBottom: "32px",
                    }}
                >
                    Free forever. No credit card required.
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

                <button
                    onClick={() => {
                        supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: `${window.location.origin}/auth/callback`,
                            },
                        });
                    }}
                    className="btn-secondary"
                    style={{
                        width: "100%",
                        justifyContent: "center",
                        padding: "12px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "white",
                        color: "#1f2937",
                        border: "1px solid #e5e7eb",
                        marginBottom: "24px"
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M24 12.27c0-.85-.07-1.68-.21-2.48H12v4.69h6.72c-.29 1.56-1.17 2.89-2.5 3.77v3.13h4.05c2.37-2.18 3.73-5.39 3.73-9.11z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.55 1.2-3.88 1.2-2.97 0-5.5-2.01-6.4-4.71H1.49v3.25C3.47 21.65 7.42 24 12 24z"
                        />
                        <path
                            fill="#34A853"
                            d="M5.6 14.45c-.22-.66-.35-1.37-.35-2.11s.13-1.45.35-2.11V6.98H1.49C.54 8.88 0 11.02 0 13c0 2.27.54 4.15 1.49 5.86l4.11-3.41z"
                        />
                        <path
                            fill="#4285F4"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.08 15.24 0 12 0 7.42 0 3.47 2.35 1.49 6.98L5.6 10.23c.9-2.7 3.43-4.71 6.4-4.71z"
                        />
                    </svg>
                    Sign up with Google
                </button>

                <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ height: "1px", background: "var(--color-border-subtle)", flex: 1 }}></div>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 500 }}>OR</span>
                    <div style={{ height: "1px", background: "var(--color-border-subtle)", flex: 1 }}></div>
                </div>

                <form onSubmit={handleSignup}>
                    <div style={{ marginBottom: "20px" }}>
                        <label className="input-label" htmlFor="fullName">
                            Full Name
                        </label>
                        <div style={{ position: "relative" }}>
                            <User
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
                                id="fullName"
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label className="input-label" htmlFor="signupEmail">
                            Email
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
                                id="signupEmail"
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

                    <div style={{ marginBottom: "28px" }}>
                        <label className="input-label" htmlFor="signupPassword">
                            Password
                        </label>
                        <div style={{ position: "relative" }}>
                            <Lock
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
                                id="signupPassword"
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
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
                                <Loader2 size={18} className="animate-spin" /> Creating account...
                            </>
                        ) : (
                            <>
                                Create Account <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p
                    style={{
                        textAlign: "center",
                        color: "var(--color-text-secondary)",
                        fontSize: "14px",
                        marginTop: "24px",
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        style={{
                            color: "var(--color-accent-light)",
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
