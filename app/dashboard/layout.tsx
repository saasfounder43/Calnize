"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Calendar,
    LayoutDashboard,
    Clock,
    CalendarDays,
    Settings,
    LogOut,
    ChevronRight,
    Link as LinkIcon,
    CreditCard,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/booking-types", label: "Booking Types", icon: CalendarDays },
    { href: "/dashboard/availability", label: "Availability", icon: Clock },
    { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
    { href: "/dashboard/integrations", label: "Integrations", icon: LinkIcon },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

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
                    href="/dashboard"
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
                            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Calendar size={20} color="white" />
                    </div>
                    <span
                        style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Calnize
                    </span>
                </Link>

                {/* Navigation */}
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
                                        ? "rgba(108, 92, 231, 0.15)"
                                        : "transparent",
                                    borderLeft: isActive
                                        ? "3px solid var(--color-accent)"
                                        : "3px solid transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Icon size={18} />
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {isActive && (
                                    <ChevronRight size={14} color="var(--color-accent-light)" />
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
                        href="/dashboard/settings"
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
                        <Settings size={18} /> Settings
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
