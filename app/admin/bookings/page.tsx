"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Calendar,
    MoreVertical,
    ExternalLink,
    XCircle,
    Trash2,
    CheckCircle2,
    User,
    Mail,
    Filter
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // all, confirmed, cancelled

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/bookings', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error("Error loading bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/bookings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookingId, action: 'cancel' })
            });

            if (res.ok) {
                setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
        }
    };

    const deleteBooking = async (bookingId: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this booking? This cannot be undone.")) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/admin/bookings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookingId, action: 'delete' })
            });

            if (res.ok) {
                setBookings(bookings.filter(b => b.id !== bookingId));
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.host?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.booking_type?.title?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filter === "all" || b.status === filter;

        return matchesSearch && matchesFilter;
    });

    if (loading) return <div>Loading bookings...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Platform Bookings</h1>
                    <p style={{ color: "var(--color-text-secondary)" }}>Manage all scheduled meetings across the platform.</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Host, guest, or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: "10px 16px 10px 40px",
                                borderRadius: "12px",
                                border: "1px solid var(--color-border)",
                                background: "var(--color-bg-secondary)",
                                width: "260px",
                                fontSize: "14px"
                            }}
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--color-border)",
                            background: "var(--color-bg-secondary)",
                            color: "var(--color-text-primary)",
                            fontSize: "14px",
                            cursor: "pointer"
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--color-text-primary)" }}>
                    <thead>
                        <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--color-border)" }}>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>GUEST</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>HOST</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>TYPE & DATE</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>STATUS</th>
                            <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking) => (
                            <tr key={booking.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s" }} className="hover-row">
                                <td style={{ padding: "16px 24px" }}>
                                    <div>
                                        <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{booking.guest_name}</p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{booking.guest_email}</p>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <div>
                                        <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "2px" }}>{booking.host?.full_name || 'System'}</p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{booking.host?.email}</p>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-accent-light)", marginBottom: "4px" }}>
                                            {booking.booking_type?.title}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                                            {new Date(booking.start_time).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        {booking.status === "confirmed" ? (
                                            <>
                                                <CheckCircle2 size={14} color="#10b981" />
                                                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>Confirmed</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={14} color="var(--color-danger)" />
                                                <span style={{ fontSize: "12px", color: "var(--color-danger)", fontWeight: 600 }}>Cancelled</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                        {booking.status === "confirmed" && (
                                            <button
                                                onClick={() => cancelBooking(booking.id)}
                                                title="Cancel Booking"
                                                style={{ padding: "6px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.05)", border: "none", cursor: "pointer", color: "var(--color-danger)" }}
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteBooking(booking.id)}
                                            title="Permanently Delete"
                                            style={{ padding: "6px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            title="Booking Details"
                                            style={{ padding: "6px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
                                        >
                                            <ExternalLink size={14} />
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
