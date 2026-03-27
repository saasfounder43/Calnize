"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, CreditCard, Zap, Loader2, ExternalLink, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

function BillingContent() {
    const [plan, setPlan] = useState<string>("free");
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [purchaseEventSent, setPurchaseEventSent] = useState(false);
    const searchParams = useSearchParams();
    const isPaidPlan = plan === "pro" || plan === "early" || plan === "paid";
    const planLabel = plan === "early" ? "Early Adopter" : plan.charAt(0).toUpperCase() + plan.slice(1);

    useEffect(() => {
        loadUserPlan();

        if (searchParams.get("success") === "true") {
            setShowSuccessMessage(true);
            setPurchaseEventSent(false);
            setTimeout(() => loadUserPlan(), 2000);
            window.history.replaceState({}, "", "/dashboard/billing");
        }
    }, [searchParams]);

    useEffect(() => {
        if (!showSuccessMessage || purchaseEventSent || !isPaidPlan) {
            return;
        }

        const value = plan === "early" ? 29 : 9;
        const interval = plan === "early" ? "year" : "month";

        trackEvent("purchase", {
            currency: "USD",
            value,
            transaction_id: `${plan}-${Date.now()}`,
            items: [{
                item_id: plan,
                item_name: `Calnize ${plan === "early" ? "Early Adopter" : "Pro"}`,
                price: value,
                quantity: 1,
            }],
            payment_type: "subscription",
            plan_interval: interval,
        });
        setPurchaseEventSent(true);
    }, [showSuccessMessage, purchaseEventSent, isPaidPlan, plan]);

    const loadUserPlan = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from("users")
                .select("plan_type, subscription_status")
                .eq("id", user.id)
                .single();

            if (profile) {
                setPlan(profile.plan_type || "free");
                setSubscriptionStatus(profile.subscription_status || "");
            }
        } catch (error) {
            console.error("Error loading plan:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setUpgrading(true);
        trackEvent("begin_checkout", {
            currency: "USD",
            value: 9,
            plan: "pro",
        });

        try {
            const response = await fetch("/api/billing/create-checkout", { method: "POST" });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Failed to initiate upgrade. Please try again.");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("An error occurred. Please try again.");
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
            {/* Success Message */}
            {showSuccessMessage && (
                <div style={{ padding: "16px 24px", background: "rgba(0, 206, 124, 0.1)", border: "1px solid rgba(0, 206, 124, 0.3)", borderRadius: "var(--radius-md)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", fontSize: "15px", fontWeight: 600, color: "var(--color-success)" }}>
                    <CheckCircle size={20} />
                    Your Calnize paid plan is active. Welcome aboard! 🎉
                </div>
            )}

            <div style={{ marginBottom: "36px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Billing & Plans</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
                    Manage your subscription and upgrade to unlock premium features.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>

                {/* Current Plan Card */}
                <div className="glass-card" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, padding: "8px 16px", background: isPaidPlan ? "var(--color-accent)" : "var(--color-bg-tertiary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Current Plan
                    </div>

                    <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                        {isPaidPlan ? <Zap size={20} color="var(--color-accent-light)" /> : <CreditCard size={20} />}
                        {planLabel} Plan
                    </h2>

                    <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
                            {plan === "free"
                                ? "You are currently on the free version of Calnize. Upgrade to unlock all features."
                                : "You have full access to all Calnize features. Thank you for supporting us!"}
                        </p>

                        {subscriptionStatus && isPaidPlan && (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: subscriptionStatus === "active" ? "rgba(0, 206, 124, 0.1)" : "rgba(255, 71, 87, 0.1)", color: subscriptionStatus === "active" ? "var(--color-success)" : "#FF4757" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: subscriptionStatus === "active" ? "var(--color-success)" : "#FF4757" }} />
                                {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
                            </div>
                        )}
                    </div>

                    {isPaidPlan && (
                        <div style={{ marginBottom: "24px" }}>
                            <p style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>
                                {plan === "early" ? "$29" : "$9"}
                                <span style={{ fontSize: "14px", fontWeight: 400, color: "var(--color-text-muted)" }}>
                                    {plan === "early" ? "/year" : "/month"}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Upgrade button — available to ALL free users */}
                    {plan === "free" && (
                        <button
                            className="btn-primary"
                            style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                            onClick={handleUpgrade}
                            disabled={upgrading}
                        >
                            {upgrading
                                ? <Loader2 size={18} className="animate-spin" />
                                : <><Zap size={18} style={{ marginRight: "8px" }} /> Upgrade to Pro — $9/month</>
                            }
                        </button>
                    )}

                    {isPaidPlan && (
                        <a
                            href="https://app.lemonsqueezy.com/my-orders"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                            style={{ width: "100%", justifyContent: "center", padding: "14px", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
                        >
                            Manage Subscription <ExternalLink size={16} />
                        </a>
                    )}
                </div>

                {/* Benefits List */}
                <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>Why upgrade to Pro?</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { text: "Unlimited Booking Types", pro: true },
                            { text: "Advanced Availability Settings", pro: true },
                            { text: "Custom Branding", pro: true },
                            { text: "Paid Meetings & Payment Links", pro: true },
                            { text: "Theme Customization", pro: true },
                            { text: "Priority Support", pro: true },
                            { text: "1 Active Booking Type", pro: false },
                            { text: "Google Calendar Sync", pro: false },
                        ].map((item, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: i > 5 ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: i > 5 ? "rgba(255,255,255,0.05)" : "rgba(0, 206, 201, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Check size={12} color={i > 5 ? "#666" : "var(--color-success)"} />
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

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                <Loader2 className="animate-spin" size={32} color="var(--color-accent)" />
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
