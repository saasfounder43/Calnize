"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

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
                    maxWidth: "480px",
                    width: "100%",
                    padding: "48px 40px",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: "rgba(0, 206, 201, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                    }}
                >
                    <CheckCircle size={36} color="var(--color-success)" />
                </div>

                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
                    Payment Successful! 🎉
                </h1>

                <p
                    style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        marginBottom: "24px",
                    }}
                >
                    Your booking has been confirmed and payment received. A confirmation
                    email has been sent to your inbox with all the meeting details.
                </p>

                {sessionId && (
                    <p
                        style={{
                            fontSize: "12px",
                            color: "var(--color-text-muted)",
                            marginBottom: "24px",
                        }}
                    >
                        Reference: {sessionId}
                    </p>
                )}

                <Link
                    href="/"
                    className="btn-secondary"
                    style={{ justifyContent: "center" }}
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function BookingConfirmationPage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        minHeight: "100vh",
                        background: "var(--color-bg-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="skeleton" style={{ width: "480px", height: "400px", borderRadius: "var(--radius-lg)" }} />
                </div>
            }
        >
            <ConfirmationContent />
        </Suspense>
    );
}
