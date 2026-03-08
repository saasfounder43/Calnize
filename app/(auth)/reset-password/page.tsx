"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            // When user clicks reset link, Supabase redirects them with a token in hash
            // The client library handles this and creates a session if valid
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setAuthorized(false);
            } else {
                setAuthorized(true);
            }
        } catch (err) {
            setAuthorized(false);
        } finally {
            setVerifying(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess(true);
                // Force logout to invalidate the temporary reset session
                await supabase.auth.signOut();

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push("/login?reset=success");
                }, 3000);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg-primary)" }}>
                <Loader2 size={40} className="animate-spin" color="var(--color-accent)" />
            </div>
        );
    }

    if (!authorized && !success) {
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
                            background: "rgba(239, 68, 68, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <XCircle size={28} color="var(--color-danger)" />
                    </div>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>
                        Invalid reset link
                    </h2>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "14px",
                            lineHeight: 1.6,
                            marginBottom: "24px",
                        }}
                    >
                        This link is invalid or has expired. Please request a new password reset link.
                    </p>
                    <Link href="/forgot-password" className="btn-primary" style={{ justifyContent: "center" }}>
                        Get new link
                    </Link>
                </div>
            </div>
        );
    }

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
                        Password updated!
                    </h2>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "14px",
                            lineHeight: 1.6,
                            marginBottom: "24px",
                        }}
                    >
                        Your password has been changed successfully. You will be redirected to the login page shortly.
                    </p>
                    <div style={{ padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", fontSize: "12px" }}>
                        Redirecting in a few seconds...
                    </div>
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
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
                    Set new password
                </h1>
                <p
                    style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "14px",
                        marginBottom: "32px",
                    }}
                >
                    Please choose a new, secure password for your account.
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

                <form onSubmit={handleReset}>
                    <div style={{ marginBottom: "20px" }}>
                        <label className="input-label" htmlFor="new-password">
                            New password
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
                                id="new-password"
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

                    <div style={{ marginBottom: "28px" }}>
                        <label className="input-label" htmlFor="confirm-password">
                            Confirm new password
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
                                id="confirm-password"
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                <Loader2 size={18} className="animate-spin" /> Updating...
                            </>
                        ) : (
                            <>
                                Reset Password <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
