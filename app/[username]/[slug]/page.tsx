"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Calendar,
    Clock,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    FileText,
    Loader2,
    CheckCircle,
    ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { BookingType, TimeSlot } from "@/types";

export default function PublicBookingPage() {
    const params = useParams();
    const username = params.username as string;
    const slug = params.slug as string;

    const [bookingType, setBookingType] = useState<BookingType | null>(null);
    const [hostName, setHostName] = useState("");
    const [hostUserId, setHostUserId] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");

    // Booking form state
    const [step, setStep] = useState<"calendar" | "form" | "confirmation">("calendar");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestNotes, setGuestNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadBookingType();
    }, []);

    useEffect(() => {
        if (hostUserId && slug) {
            loadSlots();
        }
    }, [selectedDate, hostUserId, slug]);

    const loadBookingType = async () => {
        try {
            // 1. Find the host user by username or ID
            // We first try by username, then by ID (only if it looks like a UUID)
            let hostUser = null;
            let userError = null;

            // Try by username
            const { data: byUsername, error: errorByUsername } = await supabase
                .from("users")
                .select("id, full_name, email, timezone")
                .eq("username", username)
                .maybeSingle();

            if (byUsername) {
                hostUser = byUsername;
            } else {
                // If not found by username, try by ID if it's a UUID
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
                if (isUuid) {
                    const { data: byId, error: errorById } = await supabase
                        .from("users")
                        .select("id, full_name, email, timezone")
                        .eq("id", username)
                        .maybeSingle();
                    hostUser = byId;
                    userError = errorById;
                }
            }

            if (!hostUser) {
                setError("Host not found.");
                setPageLoading(false);
                return;
            }

            // 2. Find the booking type by slug for this specific host
            const { data: type, error: typeError } = await supabase
                .from("booking_types")
                .select("*")
                .eq("user_id", hostUser.id)
                .eq("slug", slug)
                .eq("is_active", true)
                .single();

            if (typeError || !type) {
                setError("Booking type not found or is no longer active.");
                setPageLoading(false);
                return;
            }

            setBookingType(type);
            setHostName(hostUser?.full_name || hostUser?.email || "Host");
            setHostUserId(hostUser.id);
        } catch (err) {
            console.error("Error loading booking type:", err);
            setError("Failed to load booking page.");
        } finally {
            setPageLoading(false);
        }
    };

    const loadSlots = async () => {
        setSlotsLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split("T")[0];
            const res = await fetch(
                `/api/slots?userId=${hostUserId}&slug=${slug}&date=${dateStr}`
            );
            const data = await res.json();

            if (data.slots) {
                setSlots(data.slots);
            } else {
                setSlots([]);
            }
        } catch (err) {
            console.error("Error loading slots:", err);
            setSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !bookingType) return;

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking_type_id: bookingType.id,
                    guest_name: guestName,
                    guest_email: guestEmail,
                    guest_notes: guestNotes,
                    start_time: selectedSlot.start,
                    end_time: selectedSlot.end,
                }),
            });

            const data = await res.json();

            if (data.checkout_url) {
                // Paid booking — redirect to Stripe
                window.location.href = data.checkout_url;
                return;
            }

            if (data.confirmed) {
                setStep("confirmation");
            } else if (data.error) {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to create booking. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
    };

    const navigateMonth = (direction: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    const selectDate = (day: number) => {
        const newDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        setSelectedDate(newDate);
        setSelectedSlot(null);
    };

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const today = new Date();

    if (pageLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "var(--color-bg-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Loader2
                    size={40}
                    color="var(--color-accent)"
                    className="animate-spin"
                />
            </div>
        );
    }

    if (error && !bookingType) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "var(--color-bg-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                }}
            >
                <div className="glass-card" style={{ padding: "48px", textAlign: "center", maxWidth: "440px" }}>
                    <Calendar size={48} style={{ margin: "0 auto 20px", color: "var(--color-text-muted)" }} />
                    <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                        Booking Unavailable
                    </h2>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (step === "confirmation") {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "var(--color-bg-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                }}
            >
                <div
                    className="glass-card animate-fade-in"
                    style={{ padding: "48px", textAlign: "center", maxWidth: "480px" }}
                >
                    <div
                        style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "50%",
                            background: "rgba(0, 206, 201, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}
                    >
                        <CheckCircle size={36} color="var(--color-success)" />
                    </div>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
                        Booking Confirmed! 🎉
                    </h2>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "15px",
                            lineHeight: 1.6,
                            marginBottom: "24px",
                        }}
                    >
                        Your meeting with <strong>{hostName}</strong> has been scheduled.
                        A confirmation email has been sent to <strong>{guestEmail}</strong>.
                    </p>
                    <div
                        style={{
                            background: "var(--color-bg-secondary)",
                            borderRadius: "var(--radius-md)",
                            padding: "20px",
                            marginBottom: "20px",
                            textAlign: "left",
                        }}
                    >
                        <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                            <strong>{bookingType?.title}</strong>
                        </p>
                        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                            📅{" "}
                            {selectedSlot &&
                                new Date(selectedSlot.start).toLocaleDateString(undefined, {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                        </p>
                        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                            ⏰{" "}
                            {selectedSlot &&
                                new Date(selectedSlot.start).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}{" "}
                            –{" "}
                            {selectedSlot &&
                                new Date(selectedSlot.end).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--color-bg-primary)",
                padding: "40px 24px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background Orbs */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "-15%",
                        right: "-5%",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />
            </div>

            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                        }}
                    >
                        <Calendar size={28} color="white" />
                    </div>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "var(--color-accent-light)",
                            marginBottom: "8px",
                            fontWeight: 500,
                        }}
                    >
                        {hostName}
                    </p>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
                        {bookingType?.title}
                    </h1>
                    {bookingType?.description && (
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                fontSize: "14px",
                                maxWidth: "500px",
                                margin: "0 auto 16px",
                            }}
                        >
                            {bookingType.description}
                        </p>
                    )}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "20px",
                            fontSize: "14px",
                            color: "var(--color-text-muted)",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Clock size={16} /> {bookingType?.duration_minutes} min
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <DollarSign size={16} />
                            {bookingType?.price ? `${bookingType.price} ${bookingType.currency}` : "Free"}
                        </span>
                    </div>
                </div>

                {step === "calendar" ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 300px",
                            gap: "24px",
                            alignItems: "start",
                        }}
                    >
                        {/* Calendar */}
                        <div className="glass-card" style={{ padding: "28px", cursor: "default" }}>
                            {/* Month Navigation */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "24px",
                                }}
                            >
                                <button
                                    onClick={() => navigateMonth(-1)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "var(--color-text-secondary)",
                                        padding: "8px",
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>
                                    {currentMonth.toLocaleDateString(undefined, {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </h3>
                                <button
                                    onClick={() => navigateMonth(1)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "var(--color-text-secondary)",
                                        padding: "8px",
                                    }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    gap: "4px",
                                    marginBottom: "8px",
                                }}
                            >
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                    <div
                                        key={d}
                                        style={{
                                            textAlign: "center",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            color: "var(--color-text-muted)",
                                            padding: "8px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    gap: "4px",
                                }}
                            >
                                {/* Empty cells for offset */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {/* Day cells */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const date = new Date(
                                        currentMonth.getFullYear(),
                                        currentMonth.getMonth(),
                                        day
                                    );
                                    const isToday =
                                        date.toDateString() === today.toDateString();
                                    const isSelected =
                                        date.toDateString() ===
                                        selectedDate.toDateString();
                                    const isPast = date < new Date(today.toDateString());

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => !isPast && selectDate(day)}
                                            disabled={isPast}
                                            style={{
                                                padding: "12px 8px",
                                                borderRadius: "var(--radius-sm)",
                                                border: isSelected
                                                    ? "2px solid var(--color-accent)"
                                                    : isToday
                                                        ? "1px solid var(--color-border-hover)"
                                                        : "1px solid transparent",
                                                background: isSelected
                                                    ? "rgba(108, 92, 231, 0.2)"
                                                    : "transparent",
                                                color: isPast
                                                    ? "var(--color-text-muted)"
                                                    : isSelected
                                                        ? "var(--color-accent-light)"
                                                        : "var(--color-text-primary)",
                                                cursor: isPast ? "default" : "pointer",
                                                fontSize: "14px",
                                                fontWeight: isSelected || isToday ? 600 : 400,
                                                transition: "all 0.2s ease",
                                                opacity: isPast ? 0.4 : 1,
                                            }}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div className="glass-card" style={{ padding: "24px", cursor: "default" }}>
                            <h3
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    marginBottom: "16px",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {selectedDate.toLocaleDateString(undefined, {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </h3>

                            {slotsLoading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="skeleton"
                                            style={{ height: "44px", borderRadius: "var(--radius-sm)" }}
                                        />
                                    ))}
                                </div>
                            ) : slots.length === 0 ? (
                                <p
                                    style={{
                                        fontSize: "13px",
                                        color: "var(--color-text-muted)",
                                        textAlign: "center",
                                        padding: "24px 0",
                                    }}
                                >
                                    No available slots for this date
                                </p>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        maxHeight: "400px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {slots.map((slot, i) => {
                                        const isSelected =
                                            selectedSlot?.start === slot.start;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedSlot(slot)}
                                                style={{
                                                    padding: "12px 16px",
                                                    borderRadius: "var(--radius-sm)",
                                                    border: isSelected
                                                        ? "2px solid var(--color-accent)"
                                                        : "1px solid var(--color-border)",
                                                    background: isSelected
                                                        ? "rgba(108, 92, 231, 0.2)"
                                                        : "var(--color-bg-secondary)",
                                                    color: isSelected
                                                        ? "var(--color-accent-light)"
                                                        : "var(--color-text-primary)",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    fontWeight: isSelected ? 600 : 400,
                                                    textAlign: "center",
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                {new Date(slot.start).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedSlot && (
                                <button
                                    onClick={() => setStep("form")}
                                    className="btn-primary"
                                    style={{
                                        width: "100%",
                                        justifyContent: "center",
                                        marginTop: "16px",
                                    }}
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Booking Form */
                    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
                        <button
                            onClick={() => setStep("calendar")}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--color-text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                                marginBottom: "20px",
                                padding: 0,
                            }}
                        >
                            <ChevronLeft size={14} /> Back to calendar
                        </button>

                        <div className="glass-card" style={{ padding: "32px", cursor: "default" }}>
                            {/* Selected slot summary */}
                            <div
                                style={{
                                    padding: "16px",
                                    background: "rgba(108, 92, 231, 0.1)",
                                    borderRadius: "var(--radius-md)",
                                    marginBottom: "24px",
                                    border: "1px solid rgba(108, 92, 231, 0.2)",
                                }}
                            >
                                <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                                    📅{" "}
                                    {selectedSlot &&
                                        new Date(selectedSlot.start).toLocaleDateString(undefined, {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                </p>
                                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                                    ⏰{" "}
                                    {selectedSlot &&
                                        new Date(selectedSlot.start).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}{" "}
                                    –{" "}
                                    {selectedSlot &&
                                        new Date(selectedSlot.end).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}{" "}
                                    · {bookingType?.duration_minutes} min
                                </p>
                            </div>

                            {error && (
                                <div
                                    style={{
                                        padding: "12px 16px",
                                        background: "rgba(255, 107, 107, 0.1)",
                                        border: "1px solid rgba(255, 107, 107, 0.3)",
                                        borderRadius: "var(--radius-md)",
                                        color: "var(--color-danger)",
                                        fontSize: "13px",
                                        marginBottom: "20px",
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleBooking}>
                                <div style={{ marginBottom: "20px" }}>
                                    <label className="input-label" htmlFor="guestName">
                                        Your Name *
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <User
                                            size={16}
                                            style={{
                                                position: "absolute",
                                                left: "14px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                color: "var(--color-text-muted)",
                                            }}
                                        />
                                        <input
                                            id="guestName"
                                            type="text"
                                            className="input-field"
                                            style={{ paddingLeft: "40px" }}
                                            placeholder="John Doe"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label className="input-label" htmlFor="guestEmail">
                                        Email *
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <Mail
                                            size={16}
                                            style={{
                                                position: "absolute",
                                                left: "14px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                color: "var(--color-text-muted)",
                                            }}
                                        />
                                        <input
                                            id="guestEmail"
                                            type="email"
                                            className="input-field"
                                            style={{ paddingLeft: "40px" }}
                                            placeholder="you@example.com"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: "28px" }}>
                                    <label className="input-label" htmlFor="guestNotes">
                                        Notes (optional)
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <FileText
                                            size={16}
                                            style={{
                                                position: "absolute",
                                                left: "14px",
                                                top: "14px",
                                                color: "var(--color-text-muted)",
                                            }}
                                        />
                                        <textarea
                                            id="guestNotes"
                                            className="input-field"
                                            style={{ paddingLeft: "40px", minHeight: "80px", resize: "vertical" }}
                                            placeholder="Anything you'd like the host to know..."
                                            value={guestNotes}
                                            onChange={(e) => setGuestNotes(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                    style={{
                                        width: "100%",
                                        justifyContent: "center",
                                        padding: "14px",
                                        fontSize: "15px",
                                        opacity: submitting ? 0.7 : 1,
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Confirming...
                                        </>
                                    ) : bookingType?.price ? (
                                        <>
                                            Continue to Payment · {bookingType.price}{" "}
                                            {bookingType.currency}
                                        </>
                                    ) : (
                                        <>Confirm Booking</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
