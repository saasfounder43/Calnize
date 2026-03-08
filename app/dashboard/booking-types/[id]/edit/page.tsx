"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditBookingTypePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        slug: "",
        duration_minutes: 30,
        price: "",
        currency: "USD",
        buffer_time_minutes: 0,
        participation_mode: "virtual",
        meeting_link: "",
        is_active: true,
    });

    useEffect(() => {
        if (id) {
            loadBookingType();
        }
    }, [id]);

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
                    buffer_time_minutes: data.buffer_time_minutes,
                    participation_mode: data.participation_mode || "virtual",
                    meeting_link: data.meeting_link || "",
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
            const { error: dbError } = await supabase
                .from("booking_types")
                .update({
                    title: form.title,
                    description: form.description || null,
                    duration_minutes: form.duration_minutes,
                    price: form.price ? parseFloat(form.price) : null,
                    currency: form.currency,
                    buffer_time_minutes: form.buffer_time_minutes,
                    participation_mode: form.participation_mode,
                    meeting_link: form.participation_mode === "virtual" ? form.meeting_link : null,
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
                    Edit Booking Type
                </h1>
            </div>

            {error && (
                <div className="alert alert-danger" style={{ marginBottom: "24px" }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ padding: "32px", cursor: "default" }}>
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Title *</label>
                        <input
                            type="text"
                            className="input-field"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Description</label>
                        <textarea
                            className="input-field"
                            style={{ minHeight: "100px" }}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Duration (minutes) *</label>
                        <select
                            className="input-field"
                            value={form.duration_minutes}
                            onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                    </div>

                    {/* Price & Currency */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "16px", marginBottom: "24px" }}>
                        <div>
                            <label className="input-label">Price (empty for free)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="input-label">Currency</label>
                            <select
                                className="input-field"
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="INR">INR</option>
                            </select>
                        </div>
                    </div>

                    {/* Participation Mode */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Participation Mode *</label>
                        <select
                            className="input-field"
                            value={form.participation_mode}
                            onChange={(e) => setForm({ ...form, participation_mode: e.target.value })}
                        >
                            <option value="virtual">Virtual</option>
                            <option value="in_person">In-person</option>
                        </select>
                    </div>

                    {form.participation_mode === "virtual" && (
                        <div style={{ marginBottom: "24px" }}>
                            <label className="input-label">Meeting Link</label>
                            <input
                                type="url"
                                className="input-field"
                                placeholder="https://meet.google.com/..."
                                value={form.meeting_link}
                                onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Buffer Time (min)</label>
                        <select
                            className="input-field"
                            value={form.buffer_time_minutes}
                            onChange={(e) => setForm({ ...form, buffer_time_minutes: parseInt(e.target.value) })}
                        >
                            <option value={0}>No buffer</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Active</span>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, is_active: !form.is_active })}
                            className={`btn-sm ${form.is_active ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {form.is_active ? "Active" : "Inactive"}
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
