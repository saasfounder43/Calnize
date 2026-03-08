"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Calendar,
    CalendarDays,
    Clock,
    Users,
    TrendingUp,
    Plus,
    ArrowRight,
    ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { BookingType, Booking } from "@/types";
import { Suspense } from "react";

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    const searchParams = useSearchParams();
    const upgradeSuccess = searchParams.get("upgrade") === "success";

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            // Fetch user profile
            const { data: profile } = await supabase
                .from("users")
                .select("full_name")
                .eq("id", user.id)
                .single();

            if (profile) {
                setUserName(profile.full_name || user.email || "");
            }

            // Fetch booking types
            const { data: types } = await supabase
                .from("booking_types")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (types) setBookingTypes(types);

            // Fetch upcoming bookings
            const { data: bookings } = await supabase
                .from("bookings")
                .select("*")
                .eq("host_user_id", user.id)
                .gte("start_time", new Date().toISOString())
                .order("start_time", { ascending: true })
                .limit(5);

            if (bookings) setUpcomingBookings(bookings);
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: "Booking Types",
            value: bookingTypes.length,
            icon: CalendarDays,
            color: "#6c5ce7",
        },
        {
            label: "Active Types",
            value: bookingTypes.filter((t) => t.is_active).length,
            icon: TrendingUp,
            color: "#00cec9",
        },
        {
            label: "Upcoming",
            value: upcomingBookings.length,
            icon: Clock,
            color: "#fdcb6e",
        },
        {
            label: "Total Guests",
            value: upcomingBookings.length,
            icon: Users,
            color: "#a29bfe",
        },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ width: "300px", height: "36px", marginBottom: "32px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
                <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {upgradeSuccess && (
                <div
                    style={{
                        padding: "16px 24px",
                        background: "rgba(0, 206, 201, 0.1)",
                        border: "1px solid rgba(0, 206, 201, 0.3)",
                        borderRadius: "var(--radius-lg)",
                        marginBottom: "32px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        color: "var(--color-success)",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(0, 206, 201, 0.1)"
                    }}
                >
                    <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--color-success)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        ✨
                    </div>
                    Awesome! You&apos;re now on the Pro plan. Enjoy unlimited bookings and premium features.
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: "36px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
                    {getGreeting()},{" "}
                    <span style={{ color: "var(--color-accent-light)" }}>
                        {userName?.split(" ")[0] || "there"}
                    </span>
                    ! 👋
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
                    Here&apos;s an overview of your scheduling activity.
                </p>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px",
                }}
            >
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className="glass-card"
                            style={{ padding: "24px", cursor: "default" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "16px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "var(--radius-md)",
                                        background: `${stat.color}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon size={20} color={stat.color} />
                                </div>
                            </div>
                            <p
                                style={{
                                    fontSize: "32px",
                                    fontWeight: 700,
                                    marginBottom: "4px",
                                }}
                            >
                                {stat.value}
                            </p>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "var(--color-text-secondary)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    fontWeight: 500,
                                }}
                            >
                                {stat.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Booking Types */}
                <div className="glass-card" style={{ padding: "28px", cursor: "default" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px",
                        }}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Booking Types</h2>
                        <Link href="/dashboard/booking-types/new" className="btn-primary btn-sm">
                            <Plus size={16} /> New Type
                        </Link>
                    </div>

                    {bookingTypes.length === 0 ? (
                        <div
                            style={{
                                padding: "40px 20px",
                                textAlign: "center",
                                color: "var(--color-text-muted)",
                            }}
                        >
                            <CalendarDays
                                size={40}
                                style={{ margin: "0 auto 16px", opacity: 0.5 }}
                            />
                            <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                                No booking types yet. Create one to start accepting bookings!
                            </p>
                            <Link
                                href="/dashboard/booking-types/new"
                                className="btn-secondary btn-sm"
                            >
                                Create First Type <ArrowRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {bookingTypes.slice(0, 5).map((type) => (
                                <div
                                    key={type.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "14px 16px",
                                        background: "var(--color-bg-secondary)",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                                            {type.title}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                                            {type.duration_minutes} min
                                            {type.price ? ` · $${type.price}` : " · Free"}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span
                                            className={type.is_active ? "badge badge-success" : "badge badge-neutral"}
                                        >
                                            {type.is_active ? "Active" : "Inactive"}
                                        </span>
                                        <Link
                                            href={`/booking/${type.slug}`}
                                            target="_blank"
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Bookings */}
                <div className="glass-card" style={{ padding: "28px", cursor: "default" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px",
                        }}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Upcoming Bookings</h2>
                        <Link href="/dashboard/bookings" className="btn-secondary btn-sm">
                            View All
                        </Link>
                    </div>

                    {upcomingBookings.length === 0 ? (
                        <div
                            style={{
                                padding: "40px 20px",
                                textAlign: "center",
                                color: "var(--color-text-muted)",
                            }}
                        >
                            <Calendar
                                size={40}
                                style={{ margin: "0 auto 16px", opacity: 0.5 }}
                            />
                            <p style={{ fontSize: "14px" }}>
                                No upcoming bookings. Share your booking link to get started!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {upcomingBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    style={{
                                        padding: "14px 16px",
                                        background: "var(--color-bg-secondary)",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <p
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: "14px",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                {booking.guest_name}
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: "12px",
                                                    color: "var(--color-text-muted)",
                                                }}
                                            >
                                                {new Date(booking.start_time).toLocaleDateString()} at{" "}
                                                {new Date(booking.start_time).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                        <span
                                            className={
                                                booking.payment_status === "paid"
                                                    ? "badge badge-success"
                                                    : booking.payment_status === "pending"
                                                        ? "badge badge-warning"
                                                        : "badge badge-neutral"
                                            }
                                        >
                                            {booking.payment_status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
