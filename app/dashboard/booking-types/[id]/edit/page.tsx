"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditBookingTypePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [planType, setPlanType] = useState<string>("free");

    const [form, setForm] = useState({
        title: "",
        description: "",
        slug: "",
        duration_minutes: 30,
        price: "",
        currency: "USD",
        buffer_minutes: 0,
        minimum_notice_minutes: 60,
        max_bookings_per_day: "",
        participation_mode: "virtual",
        meeting_link: "",
        payment_link: "",
        is_active: true,
    });

    useEffect(() => {
        if (id) {
            loadBookingType();
            loadUserPlan();
        }
    }, [id]);

    const loadUserPlan = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from("users")
            .select("plan_type")
            .eq("id", user.id)
            .single();
        if (data) setPlanType(data.plan_type ?? "free");
    };

    const loadBookingType = async () => {
        try {
            const { data, error } = await supabase
                .from("booking_types")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            if (data) {
                setForm({
                    title: data.title,
                    description: data.description || "",
                    slug: data.slug,
                    duration_minutes: data.duration_minutes,
                    price: data.price ? data.price.toString() : "",
                    currency: data.currency,
                    buffer_minutes: data.buffer_minutes || 0,
                    minimum_notice_minutes: data.minimum_notice_minutes || 60,
                    max_bookings_per_day: data.max_bookings_per_day ? data.max_bookings_per_day.toString() : "",
                    participation_mode: data.participation_mode || "virtual",
                    meeting_link: data.meeting_link || "",
                    payment_link: data.payment_link || "",
                    is_active: data.is_active,
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const isPro = planType === "pro" || planType === "paid";
            const priceVal = parseFloat(form.price);

            if (isPro && priceVal > 0 && !form.payment_link) {
                setError("You must add a payment link to accept paid bookings.");
                setSaving(false);
                return;
            }

            const { error: dbError } = await supabase
                .from("booking_types")
                .update({
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
                    payment_link: isPro ? (form.payment_link || null) : null,
                    is_active: form.is_active,
                })
                .eq("id", id);

            if (dbError) throw dbError;
            router.push("/dashboard/booking-types");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const isPro = planType === "pro" || planType === "paid";

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                <Loader2 size={32} className="animate-spin" color="var(--color-accent)" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: "640px" }}>
            <div style={{ marginBottom: "32px" }}>
                <Link href="/dashboard/booking-types" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "13px", marginBottom: "16px" }}>
                    <ArrowLeft size={14} /> Back to Booking Types
                </Link>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>Edit Booking Type</h1>
            </div>

            {error && <div className="alert alert-danger" style={{ marginBottom: "24px" }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ padding: "32px", cursor: "default" }}>

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Title *</label>
                        <input type="text" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Description</label>
                        <textarea className="input-field" style={{ minHeight: "100px" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Duration (minutes) *</label>
                        <select className="input-field" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "16px", marginBottom: "24px" }}>
                        <div>
                            <label className="input-label">Price (empty for free)</label>
                            <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" step="0.01" />
                        </div>
                        <div>
                            <label className="input-label">Currency</label>
                            <select className="input-field" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                                <option value="AUD">AUD</option>
                                <option value="CAD">CAD</option>
                            </select>
                        </div>
                    </div>

                    {/* Payment Link — Pro only */}
                    <div style={{ marginBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <label className="input-label" style={{ margin: 0 }}>
                                Payment Link {isPro && parseFloat(form.price) > 0 && <span style={{ color: "var(--color-danger)" }}>*</span>}
                            </label>
                            {!isPro && (
                                <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: "rgba(108, 92, 231, 0.15)", color: "var(--color-accent)", letterSpacing: "0.05em" }}>
                                    PRO
                                </span>
                            )}
                        </div>
                        {isPro ? (
                            <>
                                <input
                                    type="url"
                                    className="input-field"
                                    style={{
                                        borderColor: (parseFloat(form.price) > 0 && !form.payment_link) ? "var(--color-danger)" : ""
                                    }}
                                    placeholder="https://paypal.me/yourname or https://razorpay.me/..."
                                    value={form.payment_link}
                                    onChange={(e) => setForm({ ...form, payment_link: e.target.value })}
                                />
                                {parseFloat(form.price) > 0 && !form.payment_link && (
                                    <p style={{ fontSize: "12px", color: "var(--color-danger)", marginTop: "6px" }}>
                                        You must add a payment link to accept paid bookings.
                                    </p>
                                )}
                                <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "6px" }}>
                                    Clients will be redirected here to complete payment after booking. Works with PayPal, Razorpay, UPI, or any payment URL.
                                </p>
                            </>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border)", background: "rgba(108, 92, 231, 0.04)" }}>
                                <Lock size={16} color="var(--color-text-muted)" />
                                <div>
                                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
                                        Add a payment link to collect money from clients
                                    </p>
                                    <Link href={process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || "#"} style={{ fontSize: "12px", color: "var(--color-accent)", textDecoration: "none", fontWeight: 500 }}>
                                        Upgrade to Pro →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Participation Mode *</label>
                        <select className="input-field" value={form.participation_mode} onChange={(e) => setForm({ ...form, participation_mode: e.target.value })}>
                            <option value="virtual">Virtual</option>
                            <option value="in_person">In-person</option>
                        </select>
                    </div>

                    {form.participation_mode === "virtual" && (
                        <div style={{ marginBottom: "24px" }}>
                            <label className="input-label">Meeting Link</label>
                            <input type="url" className="input-field" placeholder="https://meet.google.com/..." value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} />
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                        <div>
                            <label className="input-label">Buffer Time (minutes)</label>
                            <select className="input-field" value={form.buffer_minutes} onChange={(e) => setForm({ ...form, buffer_minutes: parseInt(e.target.value) })}>
                                <option value={0}>No buffer</option>
                                <option value={5}>5m</option>
                                <option value={10}>10m</option>
                                <option value={15}>15m</option>
                                <option value={30}>30m</option>
                                <option value={45}>45m</option>
                                <option value={60}>60m</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Minimum Notice</label>
                            <select className="input-field" value={form.minimum_notice_minutes} onChange={(e) => setForm({ ...form, minimum_notice_minutes: parseInt(e.target.value) })}>
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

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Max Bookings Per Day (optional)</label>
                        <input type="number" className="input-field" placeholder="Unlimited" min="1" value={form.max_bookings_per_day} onChange={(e) => setForm({ ...form, max_bookings_per_day: e.target.value })} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Active</span>
                        <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })} className={`btn-sm ${form.is_active ? "btn-primary" : "btn-secondary"}`}>
                            {form.is_active ? "Active" : "Inactive"}
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
