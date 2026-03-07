"use client";

import Link from "next/link";
import { CheckCircle2, Calendar, Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
    const searchParams = useSearchParams();
    const guestName = searchParams.get("guestName");
    const startTime = searchParams.get("startTime");

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg-primary)",
            padding: "20px"
        }}>
            <div className="glass-card animate-scale-in" style={{
                maxWidth: "480px",
                width: "100%",
                padding: "48px 32px",
                textAlign: "center"
            }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(0, 206, 201, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 32px"
                }}>
                    <CheckCircle2 size={48} color="var(--color-success)" />
                </div>

                <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>Booking Confirmed!</h1>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "40px", fontSize: "16px" }}>
                    Hi {guestName || "there"}, your meeting has been successfully scheduled and added to the calendar.
                </p>

                {startTime && (
                    <div style={{
                        background: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        padding: "24px",
                        marginBottom: "40px",
                        textAlign: "left"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <Calendar size={20} color="var(--color-accent)" />
                            <div>
                                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Date & Time</p>
                                <p style={{ fontWeight: 600 }}>{new Date(startTime).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Clock size={20} color="var(--color-accent)" />
                            <div>
                                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Time</p>
                                <p style={{ fontWeight: 600 }}>{new Date(startTime).toLocaleTimeString(undefined, { timeStyle: 'short' })}</p>
                            </div>
                        </div>
                    </div>
                )}

                <Link href="/" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
