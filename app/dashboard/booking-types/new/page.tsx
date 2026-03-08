"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NewBookingTypePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        duration_minutes: 30,
        price: "",
        currency: "USD",
        buffer_minutes: 0,
        minimum_notice_minutes: 60,
        max_bookings_per_day: "",
        participation_mode: "virtual",
        meeting_link: "",
        is_active: true,
    });

    const generateSlug = (title: string) =>
        title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setError("You must be logged in");
                return;
            }

            // --- Feature Gating ---
            const { data: profile } = await supabase
                .from("users")
                .select("plan")
                .eq("id", user.id)
                .single();

            const { count } = await supabase
                .from("booking_types")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            if (profile?.plan === "free" && (count || 0) >= 1) {
                setError("Free users are limited to 1 booking type. Please upgrade to Pro for unlimited types.");
                return;
            }

            if (form.price && profile?.plan === "free") {
                setError("Paid booking types are currently only available on the Pro plan. Please upgrade to continue.");
                return;
            }
            // ----------------------

            const slug = generateSlug(form.title);

            const { error: dbError } = await supabase.from("booking_types").insert({
                user_id: user.id,
                slug,
                title: form.title,
                description: form.description || null,
                duration_minutes: form.duration_minutes,
                price: form.price ? parseFloat(form.price) : null,
                currency: form.currency,
                buffer_minutes: form.buffer_minutes,
                minimum_notice_minutes: form.minimum_notice_minutes,
                max_bookings_per_day: form.max_bookings_per_day ? parseInt(form.max_bookings_per_day) : null,
                participation_mode: form.participation_mode,
                meeting_link: form.participation_mode === "virtual" ? form.meeting_link : null,
                is_active: form.is_active,
            });

            if (dbError) {
                if (dbError.code === "23505") {
                    setError(
                        "A booking type with this name already exists. Choose a different title."
                    );
                } else {
                    setError(dbError.message);
                }
                return;
            }

            router.push("/dashboard/booking-types");
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: "640px" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <Link
                    href="/dashboard/booking-types"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--color-text-secondary)",
                        textDecoration: "none",
                        fontSize: "13px",
                        marginBottom: "16px",
                    }}
                >
                    <ArrowLeft size={14} /> Back to Booking Types
                </Link>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
                    Create Booking Type
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                    Set up a new type of meeting that guests can book with you.
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
                        marginBottom: "24px",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ padding: "32px", cursor: "default" }}>
                    {/* Title */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="title">
                            Title *
                        </label>
                        <input
                            id="title"
                            type="text"
                            className="input-field"
                            placeholder="e.g., 30-min Consultation"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        {form.title && (
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "var(--color-text-muted)",
                                    marginTop: "6px",
                                }}
                            >
                                URL slug: <code>{generateSlug(form.title)}</code>
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            className="input-field"
                            style={{ minHeight: "100px", resize: "vertical" }}
                            placeholder="Describe what this meeting is about..."
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                    </div>

                    {/* Duration */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="duration">
                            Duration (minutes) *
                        </label>
                        <select
                            id="duration"
                            className="input-field"
                            value={form.duration_minutes}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    duration_minutes: parseInt(e.target.value),
                                })
                            }
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                            <option value={90}>90 minutes</option>
                            <option value={120}>120 minutes</option>
                        </select>
                    </div>

                    {/* Price & Currency */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 120px",
                            gap: "16px",
                            marginBottom: "24px",
                        }}
                    >
                        <div>
                            <label className="input-label" htmlFor="price">
                                Price (leave empty for free)
                            </label>
                            <input
                                id="price"
                                type="number"
                                className="input-field"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label" htmlFor="currency">
                                Currency
                            </label>
                            <select
                                id="currency"
                                className="input-field"
                                value={form.currency}
                                onChange={(e) =>
                                    setForm({ ...form, currency: e.target.value })
                                }
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                                <option value="CAD">CAD</option>
                                <option value="AUD">AUD</option>
                            </select>
                        </div>
                    </div>

                    {/* Participation Mode */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="participation_mode">
                            Participation Mode *
                        </label>
                        <select
                            id="participation_mode"
                            className="input-field"
                            value={form.participation_mode}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    participation_mode: e.target.value,
                                })
                            }
                        >
                            <option value="virtual">Virtual (Zoom, Google Meet, etc.)</option>
                            <option value="in_person">In-person</option>
                        </select>
                    </div>

                    {/* Meeting Link (Conditional) */}
                    {form.participation_mode === "virtual" && (
                        <div style={{ marginBottom: "24px" }}>
                            <label className="input-label" htmlFor="meeting_link">
                                Meeting Link
                            </label>
                            <input
                                id="meeting_link"
                                type="url"
                                className="input-field"
                                placeholder="https://meet.google.com/abc-defg-hij"
                                value={form.meeting_link}
                                onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                            />
                            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                                Paste meeting link (Zoom, Google Meet, Teams, etc.)
                            </p>
                        </div>
                    )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px",
                            marginBottom: "24px",
                        }}
                    >
                        {/* Buffer Time */}
                        <div>
                            <label className="input-label" htmlFor="buffer">
                                Buffer Time (minutes)
                            </label>
                            <select
                                id="buffer"
                                className="input-field"
                                value={form.buffer_minutes}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        buffer_minutes: parseInt(e.target.value),
                                    })
                                }
                            >
                                <option value={0}>No buffer</option>
                                <option value={5}>5m</option>
                                <option value={10}>10m</option>
                                <option value={15}>15m</option>
                                <option value={30}>30m</option>
                                <option value={45}>45m</option>
                                <option value={60}>60m</option>
                            </select>
                        </div>

                        {/* Minimum Notice */}
                        <div>
                            <label className="input-label" htmlFor="notice">
                                Minimum Notice
                            </label>
                            <select
                                id="notice"
                                className="input-field"
                                value={form.minimum_notice_minutes}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        minimum_notice_minutes: parseInt(e.target.value),
                                    })
                                }
                            >
                                <option value={0}>None</option>
                                <option value={15}>15m</option>
                                <option value={30}>30m</option>
                                <option value={60}>1h</option>
                                <option value={120}>2h</option>
                                <option value={240}>4h</option>
                                <option value={1440}>1 day</option>
                            </select>
                        </div>
                    </div>

                    {/* Max Bookings */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="max_bookings">
                            Max Bookings Per Day (optional)
                        </label>
                        <input
                            id="max_bookings"
                            type="number"
                            className="input-field"
                            placeholder="Unlimited"
                            min="1"
                            value={form.max_bookings_per_day}
                            onChange={(e) => setForm({ ...form, max_bookings_per_day: e.target.value })}
                        />
                    </div>

                    {/* Active Toggle */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px",
                            background: "var(--color-bg-secondary)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <div>
                            <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>
                                Active
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                                When active, this booking type is visible to guests
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, is_active: !form.is_active })}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            {form.is_active ? (
                                <div
                                    style={{
                                        width: "48px",
                                        height: "28px",
                                        borderRadius: "14px",
                                        background: "var(--color-accent)",
                                        position: "relative",
                                        transition: "background 0.3s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "22px",
                                            height: "22px",
                                            borderRadius: "50%",
                                            background: "white",
                                            position: "absolute",
                                            top: "3px",
                                            right: "3px",
                                            transition: "all 0.3s ease",
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        width: "48px",
                                        height: "28px",
                                        borderRadius: "14px",
                                        background: "var(--color-bg-hover)",
                                        position: "relative",
                                        transition: "background 0.3s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "22px",
                                            height: "22px",
                                            borderRadius: "50%",
                                            background: "var(--color-text-muted)",
                                            position: "absolute",
                                            top: "3px",
                                            left: "3px",
                                            transition: "all 0.3s ease",
                                        }}
                                    />
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "24px",
                    }}
                >
                    <Link href="/dashboard/booking-types" className="btn-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Create Booking Type
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
