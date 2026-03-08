"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Calendar,
    LayoutDashboard,
    Users,
    CreditCard,
    ShieldCheck,
    LogOut,
    ChevronRight,
    Settings,
    Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/system", label: "System Status", icon: Activity },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                router.push("/dashboard");
                return;
            }

            setAuthorized(true);
        } catch (err) {
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg-primary)" }}>
                <Loader2 size={40} className="animate-spin" color="var(--color-accent)" />
            </div>
        );
    }

    if (!authorized) return null;

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "var(--color-bg-primary)",
            }}
        >
            {/* Sidebar */}
            <aside
                style={{
                    width: "260px",
                    background: "var(--color-bg-secondary)",
                    borderRight: "1px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "24px 16px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 40,
                }}
            >
                {/* Logo */}
                <Link
                    href="/admin/dashboard"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "0 8px",
                        marginBottom: "36px",
                        textDecoration: "none",
                    }}
                >
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #FF4B2B, #FF416C)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <ShieldCheck size={20} color="white" />
                    </div>
                    <span
                        style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #f0f0ff, #FF416C)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Calnize Admin
                    </span>
                </Link>

                {/* Navigation */}
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    {adminNavItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "10px 12px",
                                    borderRadius: "var(--radius-md)",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive
                                        ? "var(--color-text-primary)"
                                        : "var(--color-text-secondary)",
                                    background: isActive
                                        ? "rgba(255, 65, 108, 0.1)"
                                        : "transparent",
                                    borderLeft: isActive
                                        ? "3px solid #FF416C"
                                        : "3px solid transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Icon size={18} />
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {isActive && (
                                    <ChevronRight size={14} color="#FF4B2B" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div
                    style={{
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                    }}
                >
                    <Link
                        href="/dashboard"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 12px",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                            fontSize: "14px",
                            color: "var(--color-text-secondary)",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <LayoutDashboard size={18} /> Back to User Side
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 12px",
                            borderRadius: "var(--radius-md)",
                            fontSize: "14px",
                            color: "var(--color-danger)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            width: "100%",
                            textAlign: "left",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <LogOut size={18} /> Log out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    marginLeft: "260px",
                    padding: "32px 40px",
                    minHeight: "100vh",
                }}
            >
                {children}
            </main>
        </div>
    );
}
