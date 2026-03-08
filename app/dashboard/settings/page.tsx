"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, User, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        username: "",
        timezone: "",
        email: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setForm({
                    full_name: data.full_name || "",
                    username: data.username || "",
                    timezone: data.timezone || "UTC",
                    email: data.email || user.email || "",
                });
            }
        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            let cleanUsername = form.username.toLowerCase().trim();
            // If they pasted a URL, strip common prefixes
            cleanUsername = cleanUsername
                .replace(/^https?:\/\//, "")
                .replace(/^localhost:\d+\//, "")
                .replace(/^calnize\.com\//, "")
                .replace(/\//g, "") // Remove all slashes
                .replace(/[^a-z0-9_-]/g, "");

            const { error } = await supabase
                .from("users")
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: form.full_name,
                    username: cleanUsername,
                    timezone: form.timezone,
                    updated_at: new Date().toISOString(),
                });

            if (!error) {
                setSuccess(true);
                setForm({ ...form, username: cleanUsername }); // Update UI with cleaned username
                setTimeout(() => setSuccess(false), 3000);
            } else {
                console.error("Supabase update error:", error);
                alert("Error saving: " + (error.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error saving profile:", err);
        } finally {
            setSaving(false);
        }
    };

    const commonTimezones = [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "America/Toronto",
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Asia/Kolkata",
        "Asia/Dubai",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Asia/Singapore",
        "Australia/Sydney",
        "Pacific/Auckland",
    ];

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ width: "200px", height: "36px", marginBottom: "32px" }} />
                <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: "600px" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
                    Settings
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                    Manage your profile and preferences
                </p>
            </div>

            {success && (
                <div
                    style={{
                        padding: "12px 16px",
                        background: "rgba(0, 206, 201, 0.1)",
                        border: "1px solid rgba(0, 206, 201, 0.3)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--color-success)",
                        fontSize: "13px",
                        marginBottom: "24px",
                        fontWeight: 500,
                    }}
                >
                    ✅ Profile updated successfully!
                </div>
            )}

            <form onSubmit={handleSave}>
                <div className="glass-card" style={{ padding: "32px", cursor: "default" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "24px" }}>
                        Profile Information
                    </h3>

                    {/* Email (read-only) */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={form.email}
                            disabled
                            style={{ opacity: 0.6, cursor: "not-allowed" }}
                        />
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                            Email cannot be changed
                        </p>
                    </div>

                    {/* Full Name */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="settingsName">
                            Full Name
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
                                id="settingsName"
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                                placeholder="Your name"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="settingsUsername">
                            Username
                        </label>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--color-text-muted)",
                                fontSize: "14px",
                                pointerEvents: "none"
                            }}>
                                calnize.com/
                            </span>
                            <input
                                id="settingsUsername"
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: "100px" }}
                                placeholder="username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                            Your public booking link will be: {window.location.origin}/{form.username || "username"}
                        </p>
                    </div>

                    {/* Timezone */}
                    <div style={{ marginBottom: "24px" }}>
                        <label className="input-label" htmlFor="settingsTimezone">
                            Timezone
                        </label>
                        <div style={{ position: "relative" }}>
                            <Globe
                                size={16}
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--color-text-muted)",
                                }}
                            />
                            <select
                                id="settingsTimezone"
                                className="input-field"
                                style={{ paddingLeft: "40px" }}
                                value={form.timezone}
                                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                            >
                                {commonTimezones.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{ opacity: saving ? 0.7 : 1 }}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
