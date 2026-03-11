"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function LoginContent() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const searchParams = useSearchParams();
    const resetSuccess = searchParams.get("reset") === "success";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

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
                        "radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)",
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
                    Welcome back
                </h1>
                <p
                    style={{
                        textAlign: "center",
                        color: "var(--color-text-secondary)",
                        fontSize: "14px",
                        marginBottom: "32px",
                    }}
                >
                    Sign in to manage your bookings
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

                {resetSuccess && (
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            borderRadius: "var(--radius-md)",
                            color: "#10b981",
                            fontSize: "13px",
                            marginBottom: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <CheckCircle2 size={16} />
                        Password updated successfully!
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "20px" }}>
                        <label className="input-label" htmlFor="email">
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

                    <div style={{ marginBottom: "28px" }}>
                        <label className="input-label" htmlFor="password">
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
                                id="password"
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                            <Link
                                href="/forgot-password"
                                style={{
                                    fontSize: "12px",
                                    color: "var(--color-accent-light)",
                                    textDecoration: "none",
                                    fontWeight: 500
                                }}
                            >
                                Forgot your password?
                            </Link>
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
                                <Loader2 size={18} className="animate-spin" /> Signing in...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
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
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        style={{
                            color: "var(--color-accent-light)",
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader2 className="animate-spin" size={32} color="var(--color-accent)" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
