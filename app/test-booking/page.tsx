"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestBookingPage() {
    const [username, setUsername] = useState<string>("testuser");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from("users").select("username").eq("id", user.id).single();
                if (data?.username) {
                    setUsername(data.username);
                } else {
                    setUsername(user.id);
                }
            }
        };
        fetchUser();
    }, []);

    const bookingUrl = `${window.location.origin}/booking/${username}/consultation`;

    return (
        <div style={{
            minHeight: "100vh",
            padding: "80px 20px",
            background: "#f8f9fa",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#1a1a1a"
        }}>
            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                background: "white",
                padding: "48px",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)"
            }}>
                <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px", color: "#6C63FF" }}>
                    Calnize Booking Test Page
                </h1>

                <p style={{ fontSize: "18px", color: "#4a4a4a", marginBottom: "32px", lineHeight: 1.6 }}>
                    This page simulates a <strong>third-party website</strong> (like a personal portfolio or business site)
                    that has embedded the Calnize booking button. Use this to verify the end-to-end flow.
                </p>

                <div style={{
                    padding: "32px",
                    border: "2px dashed #e1e4e8",
                    borderRadius: "8px",
                    textAlign: "center",
                    marginBottom: "40px"
                }}>
                    <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Example Service Business Website</h2>
                    <p style={{ marginBottom: "32px", color: "#666" }}>Professional Coaching & Strategy Sessions</p>

                    <a
                        href={`/${username}/consultation`}
                        style={{
                            background: "#6C63FF",
                            padding: "16px 28px",
                            color: "white",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "16px",
                            display: "inline-block",
                            transition: "transform 0.2s ease",
                            boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                        Book a Free Consultation
                    </a>
                </div>

                <div style={{ background: "#f0f2f5", padding: "24px", borderRadius: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", color: "#666" }}>
                        Testing Tips:
                    </h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#4a4a4a", lineHeight: 1.6 }}>
                        <li>Ensure you have created a booking type with the slug <strong>"consultation"</strong> in your dashboard.</li>
                        <li>Verify that your <strong>username</strong> is set in Settings; otherwise, it will use your User ID.</li>
                        <li>The current test URL is: <code style={{ color: "#6C63FF" }}>{bookingUrl}</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
