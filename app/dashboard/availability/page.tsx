"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Trash2, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AvailabilityRule } from "@/types";

const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        TIME_OPTIONS.push(
            `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
        );
    }
}

export default function AvailabilityPage() {
    const [rules, setRules] = useState<AvailabilityRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newRule, setNewRule] = useState({
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
    });

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("availability_rules")
                .select("*")
                .eq("user_id", user.id)
                .order("weekday", { ascending: true });

            if (data) setRules(data);
        } catch (err) {
            console.error("Error loading availability:", err);
        } finally {
            setLoading(false);
        }
    };

    const addRule = async () => {
        setSaving(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("availability_rules")
                .insert({
                    user_id: user.id,
                    weekday: newRule.weekday,
                    start_time: newRule.start_time,
                    end_time: newRule.end_time,
                })
                .select()
                .single();

            if (error) {
                console.error("Error adding rule:", error);
                return;
            }

            if (data) {
                setRules((prev) =>
                    [...prev, data].sort((a, b) => a.weekday - b.weekday)
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteRule = async (id: string) => {
        const { error } = await supabase
            .from("availability_rules")
            .delete()
            .eq("id", id);

        if (!error) {
            setRules((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const addWorkweekDefaults = async () => {
        setSaving(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Delete existing
            await supabase
                .from("availability_rules")
                .delete()
                .eq("user_id", user.id);

            // Insert Mon-Fri 9-5
            const defaults = [1, 2, 3, 4, 5].map((weekday) => ({
                user_id: user.id,
                weekday,
                start_time: "09:00",
                end_time: "17:00",
            }));

            const { data, error } = await supabase
                .from("availability_rules")
                .insert(defaults)
                .select();

            if (!error && data) setRules(data);
        } finally {
            setSaving(false);
        }
    };

    // Group rules by weekday
    const rulesByDay = WEEKDAYS.map((day, index) => ({
        day,
        index,
        rules: rules.filter((r) => r.weekday === index),
    }));

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ width: "250px", height: "36px", marginBottom: "32px" }} />
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "60px", marginBottom: "8px", borderRadius: "var(--radius-md)" }} />
                ))}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
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
                        Availability
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        Define your weekly schedule for accepting bookings
                    </p>
                </div>
                <button onClick={addWorkweekDefaults} className="btn-secondary" disabled={saving}>
                    Set Mon–Fri 9–5 Defaults
                </button>
            </div>

            {/* Weekly View */}
            <div className="glass-card" style={{ padding: "28px", cursor: "default", marginBottom: "28px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {rulesByDay.map(({ day, index, rules: dayRules }) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "14px 16px",
                                borderRadius: "var(--radius-md)",
                                background:
                                    dayRules.length > 0
                                        ? "rgba(108, 92, 231, 0.05)"
                                        : "transparent",
                                border: `1px solid ${dayRules.length > 0
                                        ? "rgba(108, 92, 231, 0.15)"
                                        : "var(--color-border)"
                                    }`,
                            }}
                        >
                            <span
                                style={{
                                    width: "120px",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    color:
                                        dayRules.length > 0
                                            ? "var(--color-text-primary)"
                                            : "var(--color-text-muted)",
                                }}
                            >
                                {day}
                            </span>

                            <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {dayRules.length === 0 ? (
                                    <span
                                        style={{
                                            fontSize: "13px",
                                            color: "var(--color-text-muted)",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        Unavailable
                                    </span>
                                ) : (
                                    dayRules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "4px 12px",
                                                borderRadius: "20px",
                                                background: "rgba(108, 92, 231, 0.15)",
                                                fontSize: "13px",
                                                fontWeight: 500,
                                            }}
                                        >
                                            <Clock size={12} color="var(--color-accent-light)" />
                                            {rule.start_time} – {rule.end_time}
                                            <button
                                                onClick={() => deleteRule(rule.id)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: "2px",
                                                    display: "flex",
                                                    color: "var(--color-text-muted)",
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Rule Card */}
            <div className="glass-card" style={{ padding: "24px", cursor: "default" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>
                    Add Availability Rule
                </h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr auto",
                        gap: "16px",
                        alignItems: "end",
                    }}
                >
                    <div>
                        <label className="input-label">Day</label>
                        <select
                            className="input-field"
                            value={newRule.weekday}
                            onChange={(e) =>
                                setNewRule({ ...newRule, weekday: parseInt(e.target.value) })
                            }
                        >
                            {WEEKDAYS.map((day, i) => (
                                <option key={i} value={i}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Start Time</label>
                        <select
                            className="input-field"
                            value={newRule.start_time}
                            onChange={(e) =>
                                setNewRule({ ...newRule, start_time: e.target.value })
                            }
                        >
                            {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">End Time</label>
                        <select
                            className="input-field"
                            value={newRule.end_time}
                            onChange={(e) =>
                                setNewRule({ ...newRule, end_time: e.target.value })
                            }
                        >
                            {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={addRule}
                        className="btn-primary"
                        disabled={saving}
                        style={{ height: "46px" }}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
