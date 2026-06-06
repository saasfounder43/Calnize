"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import {
    Search,
    MoreVertical,
    ArrowUp,
    ArrowDown,
    UserPlus,
    Ban,
    Trash2,
    Shield,
    Mail,
    ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const isPaidPlan = (planType: string) =>
        planType === "pro" || planType === "early" || planType === "paid";

    const getPlanLabel = (planType: string) =>
        planType === "early" ? "Early Adopter" : planType;

    const loadUsers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    const updatePlan = async (userId: string, plan_type: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, updates: { plan_type } })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, plan_type } : u));
            }
        } catch (error) {
            console.error("Error updating plan:", error);
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, updates: { role: newRole } })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>User Management</h1>
                    <p style={{ color: "var(--color-text-secondary)" }}>Manage users and control their access levels.</p>
                </div>
                <div style={{ position: "relative" }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: "10px 16px 10px 40px",
                            borderRadius: "12px",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg-secondary)",
                            width: "300px",
                            fontSize: "14px"
                        }}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--color-text-primary)" }}>
                    <thead>
                        <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--color-border)" }}>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>USER</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>PLAN</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>ROLE</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>JOINED</th>
                            <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s" }} className="hover-row">
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 600,
                                            fontSize: "14px"
                                        }}>
                                            {user.full_name?.[0].toUpperCase() || user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{user.full_name || 'No Name'}</p>
                                            <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        background: isPaidPlan(user.plan_type) ? "rgba(253, 203, 110, 0.15)" : "rgba(255, 255, 255, 0.05)",
                                        color: isPaidPlan(user.plan_type) ? "#fdcb6e" : "var(--color-text-secondary)"
                                    }}>
                                        {getPlanLabel(user.plan_type)}
                                    </span>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        {user.role === 'admin' ? (
                                            <Shield size={14} color="#FF416C" />
                                        ) : (
                                            <UserPlus size={14} color="var(--color-text-muted)" />
                                        )}
                                        <span style={{ fontSize: "13px", color: user.role === 'admin' ? "#FF416C" : "var(--color-text-primary)" }}>
                                            {user.role}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                        <button
                                            onClick={() => updatePlan(user.id, isPaidPlan(user.plan_type) ? 'free' : 'pro')}
                                            title={isPaidPlan(user.plan_type) ? "Downgrade to Free" : "Upgrade to Pro"}
                                            style={{ padding: "6px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
                                        >
                                            {isPaidPlan(user.plan_type) ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                        </button>
                                        <button
                                            onClick={() => toggleRole(user.id, user.role)}
                                            title="Toggle Role"
                                            style={{ padding: "6px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", border: "none", cursor: "pointer", color: user.role === 'admin' ? "#FF416C" : "var(--color-text-secondary)" }}
                                        >
                                            <Shield size={14} />
                                        </button>
                                        <button
                                            title="More Actions"
                                            style={{ padding: "6px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
                                        >
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .hover-row:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
            `}</style>
        </div>
    );
}
