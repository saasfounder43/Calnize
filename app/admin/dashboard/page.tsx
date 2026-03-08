"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Calendar,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminStats {
    totalUsers: number;
    totalBookings: number;
    activeBookingTypes: number;
    revenue: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Error loading admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading admin stats...</div>;

    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "#4f46e5" },
        { label: "Total Bookings", value: stats?.totalBookings || 0, icon: Calendar, color: "#06b6d4" },
        { label: "Active Types", value: stats?.activeBookingTypes || 0, icon: Activity, color: "#8b5cf6" },
        { label: "Total Revenue", value: `$${stats?.revenue || 0}`, icon: CreditCard, color: "#10b981" },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Admin Command Center</h1>
                <p style={{ color: "var(--color-text-secondary)" }}>Real-time overview of the Calnize platform.</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                marginBottom: "40px"
            }}>
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="glass-card" style={{ padding: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <div style={{
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "12px",
                                    background: `${card.color}15`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Icon size={22} color={card.color} />
                                </div>
                                <span style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "20px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontWeight: 600 }}>
                                    Live
                                </span>
                            </div>
                            <h3 style={{ fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: 500, marginBottom: "4px" }}>{card.label}</h3>
                            <p style={{ fontSize: "28px", fontWeight: 700 }}>{card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Platform Status */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                <div className="glass-card" style={{ padding: "28px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>System Announcements</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.1)" }}>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <Info size={20} color="#4f46e5" />
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>Alpha Release v0.1.0</p>
                                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Admin panel is now live. Monitor users and managing bookings from this dashboard.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: "28px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>Service Status</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { name: "Database (Supabase)", status: "Operational", active: true },
                            { name: "Auth Service", status: "Operational", active: true },
                            { name: "Payments (LemonSqueezy)", status: "Operational", active: true },
                            { name: "Email (Resend)", status: "Operational", active: true },
                        ].map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "14px" }}>{s.name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                                    <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 500 }}>{s.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
