"use client";

import { useEffect, useState } from "react";
import { Calendar, User, Clock, XCircle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Booking } from "@/types";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

    useEffect(() => {
        loadBookings();
    }, [filter]);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase
                .from("bookings")
                .select("*")
                .eq("host_user_id", user.id)
                .order("start_time", { ascending: filter === "upcoming" });

            if (filter === "upcoming") {
                query = query
                    .gte("start_time", new Date().toISOString())
                    .eq("status", "confirmed");
            } else if (filter === "past") {
                query = query
                    .lt("start_time", new Date().toISOString())
                    .eq("status", "confirmed");
            }

            const { data } = await query;
            if (data) setBookings(data);
        } catch (err) {
            console.error("Error loading bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        const { error } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", id);

        if (!error) {
            if (filter !== "all") {
                setBookings((prev) => prev.filter((b) => b.id !== id));
            } else {
                setBookings((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
                );
            }
        } else {
            alert("Error cancelling booking: " + error.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
                        Bookings
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        View and manage your scheduled meetings
                    </p>
                </div>

                {/* Filter Tabs */}
                <div
                    style={{
                        display: "flex",
                        gap: "4px",
                        padding: "4px",
                        background: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    {(["upcoming", "past", "all"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "var(--radius-sm)",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: filter === f ? 600 : 400,
                                background:
                                    filter === f ? "var(--color-accent)" : "transparent",
                                color:
                                    filter === f
                                        ? "white"
                                        : "var(--color-text-secondary)",
                                transition: "all 0.2s ease",
                                textTransform: "capitalize",
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="skeleton"
                            style={{
                                height: "90px",
                                marginBottom: "12px",
                                borderRadius: "var(--radius-lg)",
                            }}
                        />
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div
                    className="glass-card"
                    style={{
                        padding: "60px 40px",
                        textAlign: "center",
                        cursor: "default",
                    }}
                >
                    <Calendar
                        size={40}
                        style={{ margin: "0 auto 16px", opacity: 0.5, color: "var(--color-text-muted)" }}
                    />
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
                        No {filter !== "all" ? filter : ""} bookings
                    </h3>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        {filter === "upcoming"
                            ? "Share your booking link to start receiving meetings."
                            : "No bookings found for this filter."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="glass-card"
                            style={{
                                padding: "20px 24px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "default",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <User size={20} color="white" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>
                                        {booking.guest_name}
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            fontSize: "13px",
                                            color: "var(--color-text-muted)",
                                        }}
                                    >
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Mail size={12} /> {booking.guest_email}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Clock size={12} />
                                            {new Date(booking.start_time).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                            {" | "}
                                            {new Date(booking.start_time).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            {" – "}
                                            {new Date(booking.end_time).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    {booking.guest_notes && (
                                        <p
                                            style={{
                                                fontSize: "12px",
                                                color: "var(--color-text-secondary)",
                                                marginTop: "6px",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            &quot;{booking.guest_notes}&quot;
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span
                                    className={
                                        booking.status === "cancelled"
                                            ? "badge badge-danger"
                                            : booking.payment_status === "paid"
                                                ? "badge badge-success"
                                                : booking.payment_status === "pending"
                                                    ? "badge badge-warning"
                                                    : "badge badge-neutral"
                                    }
                                >
                                    {booking.status === "cancelled" ? "Cancelled" : booking.payment_status}
                                </span>
                                {booking.status !== "cancelled" && (
                                    <button
                                        onClick={() => cancelBooking(booking.id)}
                                        className="btn-danger btn-sm"
                                        style={{ padding: "8px 12px" }}
                                        title="Cancel booking"
                                    >
                                        <XCircle size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
