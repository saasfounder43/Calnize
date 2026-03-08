"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Shield, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BillingPage() {
    const [plan, setPlan] = useState<string>("free");
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        loadUserPlan();
    }, []);

    const loadUserPlan = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from("users")
                .select("plan")
                .eq("id", user.id)
                .single();

            if (profile) {
                setPlan(profile.plan || "free");
            }
        } catch (error) {
            console.error("Error loading plan:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const response = await fetch("/api/stripe/create-pro-checkout", {
                method: "POST",
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.warn("Stripe failed, attempting debug upgrade...");
                // FALLBACK for local development testing
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const debugRes = await fetch("/api/debug/set-pro", {
                        method: "POST",
                        body: JSON.stringify({ userId: user.id }),
                        headers: { "Content-Type": "application/json" }
                    });
                    const debugData = await debugRes.json();
                    if (debugData.success) {
                        alert("✨ (Test Mode) Account upgraded to Pro successfully! Refreshing...");
                        window.location.reload();
                        return;
                    }
                }
                alert("Failed to initiate upgrade. Please check your Stripe keys in .env.local");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("An error occurred during upgrade. See console for details.");
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                <Loader2 className="animate-spin" size={32} color="var(--color-accent)" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "36px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Billing & Plans</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
                    Manage your subscription and upgrade to unlock premium features.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
                {/* Current Plan Card */}
                <div className="glass-card" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
                    <div style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        padding: "8px 16px",
                        background: plan === "pro" ? "var(--color-accent)" : "var(--color-bg-tertiary)",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}>
                        Current Plan
                    </div>

                    <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                        {plan === "pro" ? <Zap size={20} color="var(--color-accent-light)" /> : <CreditCard size={20} />}
                        {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                    </h2>

                    <div style={{ marginBottom: "32px" }}>
                        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
                            {plan === "free"
                                ? "You are currently on the free version of Calnize. Ideal for getting started."
                                : "You have full access to all Calnize features. Thank you for supporting us!"}
                        </p>
                    </div>

                    {plan === "free" && (
                        <button
                            className="btn-primary"
                            style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                            onClick={handleUpgrade}
                            disabled={upgrading}
                        >
                            {upgrading ? <Loader2 size={18} className="animate-spin" /> : <>Upgrade to Pro <Shield size={18} style={{ marginLeft: "8px" }} /></>}
                        </button>
                    )}

                    {plan === "pro" && (
                        <button
                            className="btn-secondary"
                            style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                            onClick={async () => {
                                setUpgrading(true);
                                try {
                                    const res = await fetch("/api/stripe/create-portal", { method: "POST" });
                                    const data = await res.json();
                                    if (data.url) window.location.href = data.url;
                                } catch (e) {
                                    alert("Failed to load billing portal.");
                                } finally {
                                    setUpgrading(false);
                                }
                            }}
                            disabled={upgrading}
                        >
                            {upgrading ? <Loader2 size={18} className="animate-spin" /> : "Manage Subscription"}
                        </button>
                    )}
                </div>

                {/* Benefits List */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>Why upgrade to Pro?</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { text: "Unlimited Booking Types", pro: true },
                            { text: "Accept Paid Bookings (Stripe)", pro: true },
                            { text: "Advanced Slot Generation", pro: true },
                            { text: "Custom Branding (Coming Soon)", pro: true },
                            { text: "Priority Support", pro: true },
                            { text: "1 Active Booking Type", pro: false },
                            { text: "Google Calendar Sync", pro: false },
                        ].map((item, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: i > 4 ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    background: i > 4 ? "rgba(255,255,255,0.05)" : "rgba(0, 206, 201, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Check size={12} color={i > 4 ? "#666" : "var(--color-success)"} />
                                </div>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
