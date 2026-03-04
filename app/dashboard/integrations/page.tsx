"use client";

import { useState, useEffect } from "react";
import { Calendar, Link as LinkIcon, CheckCircle, ExternalLink, Unlink } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function IntegrationsPage() {
    const [googleConnected, setGoogleConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkConnections();
    }, []);

    const checkConnections = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("oauth_tokens")
                .select("user_id")
                .eq("user_id", user.id)
                .single();

            setGoogleConnected(!!data);
        } catch {
            setGoogleConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const connectGoogle = () => {
        window.location.href = "/api/google/connect";
    };

    const disconnectGoogle = async () => {
        if (!confirm("Disconnect Google Calendar?")) return;
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from("oauth_tokens").delete().eq("user_id", user.id);
            setGoogleConnected(false);
        } catch (err) {
            console.error("Error disconnecting:", err);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
                    Integrations
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                    Connect external services to enhance your scheduling
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" }}>
                {/* Google Calendar */}
                <div
                    className="glass-card"
                    style={{ padding: "28px", cursor: "default" }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "var(--radius-md)",
                                    background: "rgba(66, 133, 244, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Calendar size={24} color="#4285F4" />
                            </div>
                            <div>
                                <h3
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        marginBottom: "4px",
                                    }}
                                >
                                    Google Calendar
                                </h3>
                                <p
                                    style={{
                                        fontSize: "13px",
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Prevent double bookings and auto-create events
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div
                                className="skeleton"
                                style={{ width: "120px", height: "40px" }}
                            />
                        ) : googleConnected ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span className="badge badge-success">
                                    <CheckCircle size={12} /> Connected
                                </span>
                                <button
                                    onClick={disconnectGoogle}
                                    className="btn-danger btn-sm"
                                >
                                    <Unlink size={14} /> Disconnect
                                </button>
                            </div>
                        ) : (
                            <button onClick={connectGoogle} className="btn-primary">
                                <LinkIcon size={16} /> Connect
                            </button>
                        )}
                    </div>
                </div>

                {/* Stripe */}
                <div
                    className="glass-card"
                    style={{ padding: "28px", cursor: "default" }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "var(--radius-md)",
                                    background: "rgba(99, 91, 255, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span style={{ fontSize: "20px", fontWeight: 700, color: "#635BFF" }}>S</span>
                            </div>
                            <div>
                                <h3
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        marginBottom: "4px",
                                    }}
                                >
                                    Stripe Payments
                                </h3>
                                <p
                                    style={{
                                        fontSize: "13px",
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Collect payments for paid booking types
                                </p>
                            </div>
                        </div>
                        <span className="badge badge-neutral">Configured via ENV</span>
                    </div>
                </div>

                {/* Resend */}
                <div
                    className="glass-card"
                    style={{ padding: "28px", cursor: "default" }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "var(--radius-md)",
                                    background: "rgba(0, 206, 201, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span style={{ fontSize: "20px", fontWeight: 700, color: "#00cec9" }}>R</span>
                            </div>
                            <div>
                                <h3
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        marginBottom: "4px",
                                    }}
                                >
                                    Resend Email
                                </h3>
                                <p
                                    style={{
                                        fontSize: "13px",
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Transactional emails for confirmations and reminders
                                </p>
                            </div>
                        </div>
                        <span className="badge badge-neutral">Configured via ENV</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
