"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelledPage() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg-primary)",
            padding: "20px"
        }}>
            <div className="glass-card" style={{
                maxWidth: "480px",
                width: "100%",
                padding: "48px 32px",
                textAlign: "center"
            }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(255, 107, 107, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 32px"
                }}>
                    <XCircle size={48} color="var(--color-danger)" />
                </div>

                <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>Booking Cancelled</h1>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "40px", fontSize: "16px" }}>
                    The booking has been successfully cancelled. No meeting will take place.
                </p>

                <Link href="/" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
