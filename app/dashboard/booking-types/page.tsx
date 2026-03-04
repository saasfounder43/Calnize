"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Clock,
    DollarSign,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Edit,
    ExternalLink,
    Copy,
    Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { BookingType } from "@/types";

export default function BookingTypesPage() {
    const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    useEffect(() => {
        loadBookingTypes();
    }, []);

    const loadBookingTypes = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("booking_types")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (data) setBookingTypes(data);
        } catch (err) {
            console.error("Error loading booking types:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id: string, currentState: boolean) => {
        const { error } = await supabase
            .from("booking_types")
            .update({ is_active: !currentState })
            .eq("id", id);

        if (!error) {
            setBookingTypes((prev) =>
                prev.map((bt) =>
                    bt.id === id ? { ...bt, is_active: !currentState } : bt
                )
            );
        }
    };

    const deleteBookingType = async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking type?")) return;

        const { error } = await supabase
            .from("booking_types")
            .delete()
            .eq("id", id);

        if (!error) {
            setBookingTypes((prev) => prev.filter((bt) => bt.id !== id));
        }
    };

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/booking/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
    };

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ width: "250px", height: "36px", marginBottom: "32px" }} />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "100px", marginBottom: "16px", borderRadius: "var(--radius-lg)" }} />
                ))}
            </div>
        );
    }

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
                        Booking Types
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        Create and manage your meeting types
                    </p>
                </div>
                <Link href="/dashboard/booking-types/new" className="btn-primary">
                    <Plus size={18} /> New Booking Type
                </Link>
            </div>

            {bookingTypes.length === 0 ? (
                <div
                    className="glass-card"
                    style={{
                        padding: "60px 40px",
                        textAlign: "center",
                        cursor: "default",
                    }}
                >
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "rgba(108, 92, 231, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                        }}
                    >
                        <Clock size={28} color="var(--color-accent)" />
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
                        No booking types yet
                    </h3>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "14px",
                            marginBottom: "24px",
                            maxWidth: "400px",
                            margin: "0 auto 24px",
                        }}
                    >
                        Create your first booking type to start accepting meetings from
                        clients and colleagues.
                    </p>
                    <Link href="/dashboard/booking-types/new" className="btn-primary">
                        <Plus size={18} /> Create Your First Booking Type
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {bookingTypes.map((type) => (
                        <div
                            key={type.id}
                            className="glass-card"
                            style={{
                                padding: "24px 28px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "default",
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <h3 style={{ fontSize: "16px", fontWeight: 600 }}>
                                        {type.title}
                                    </h3>
                                    <span
                                        className={
                                            type.is_active
                                                ? "badge badge-success"
                                                : "badge badge-neutral"
                                        }
                                    >
                                        {type.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                {type.description && (
                                    <p
                                        style={{
                                            color: "var(--color-text-secondary)",
                                            fontSize: "13px",
                                            marginBottom: "10px",
                                            maxWidth: "500px",
                                        }}
                                    >
                                        {type.description}
                                    </p>
                                )}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        fontSize: "13px",
                                        color: "var(--color-text-muted)",
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Clock size={14} /> {type.duration_minutes} min
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <DollarSign size={14} />
                                        {type.price ? `${type.price} ${type.currency}` : "Free"}
                                    </span>
                                    {type.buffer_time_minutes > 0 && (
                                        <span>+{type.buffer_time_minutes}min buffer</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                    onClick={() => copyLink(type.slug)}
                                    className="btn-secondary btn-sm"
                                    style={{ padding: "8px 12px" }}
                                    title="Copy booking link"
                                >
                                    {copiedSlug === type.slug ? (
                                        <Check size={14} color="var(--color-success)" />
                                    ) : (
                                        <Copy size={14} />
                                    )}
                                </button>
                                <Link
                                    href={`/booking/${type.slug}`}
                                    target="_blank"
                                    className="btn-secondary btn-sm"
                                    style={{ padding: "8px 12px" }}
                                    title="Preview"
                                >
                                    <ExternalLink size={14} />
                                </Link>
                                <Link
                                    href={`/dashboard/booking-types/${type.id}/edit`}
                                    className="btn-secondary btn-sm"
                                    style={{ padding: "8px 12px" }}
                                    title="Edit"
                                >
                                    <Edit size={14} />
                                </Link>
                                <button
                                    onClick={() => toggleActive(type.id, type.is_active)}
                                    className="btn-secondary btn-sm"
                                    style={{ padding: "8px 12px" }}
                                    title="Toggle active"
                                >
                                    {type.is_active ? (
                                        <ToggleRight size={14} color="var(--color-success)" />
                                    ) : (
                                        <ToggleLeft size={14} />
                                    )}
                                </button>
                                <button
                                    onClick={() => deleteBookingType(type.id)}
                                    className="btn-danger btn-sm"
                                    style={{ padding: "8px 12px" }}
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
