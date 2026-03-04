"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";

export default function BookingCancelledPage() {
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
                        background: "rgba(255, 107, 107, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                    }}
                >
                    <XCircle size={36} color="var(--color-danger)" />
                </div>

                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
                    Booking Cancelled
                </h1>

                <p
                    style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        marginBottom: "24px",
                    }}
                >
                    Payment was not completed and the booking was not confirmed. No charge
                    has been made. You can try booking again if you&apos;d like.
                </p>

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
