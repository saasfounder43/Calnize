"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Clock,
    CalendarDays,
    Settings,
    LogOut,
    ChevronRight,
    Link as LinkIcon,
    CreditCard,
    Palette,
    Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AICommandBar from "@/components/ai/AICommandBar";
import MobileNav from "@/components/dashboard/MobileNav";
import FeedbackNavItem from "@/components/dashboard/FeedbackNavItem";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/booking-types", label: "Booking Types", icon: CalendarDays },
    { href: "/dashboard/availability", label: "Availability", icon: Clock },
    { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
    { href: "/dashboard/integrations", label: "Integrations", icon: LinkIcon },
    { href: "/dashboard/branding", label: "Branding", icon: Palette },
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
        <>
            <div
                className="mobile-visible"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: "var(--color-bg-secondary)",
                    borderBottom: "1px solid var(--color-border)",
                }}
            >
                <MobileNav />
            </div>

            <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-primary)" }}>
                <aside
                    className="desktop-visible dashboard-sidebar"
                    style={{
                        width: "260px",
                        background: "var(--color-bg-secondary)",
                        borderRight: "1px solid var(--color-border)",
                        padding: "24px 16px",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        zIndex: 40,
                    }}
                >
                    <Link
                        href="/dashboard"
                        style={{
                            display: "block",
                            padding: "0 8px",
                            marginBottom: "36px",
                            textDecoration: "none",
                            flexShrink: 0,
                        }}
                    >
                        <span
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Calnize
                        </span>
                    </Link>

                    <nav className="dashboard-sidebar-nav">
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
                                            ? "rgba(108, 92, 231, 0.12)"
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

                    <div className="dashboard-sidebar-footer">
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
                                color:
                                    pathname === "/dashboard/settings"
                                        ? "var(--color-text-primary)"
                                        : "var(--color-text-secondary)",
                                background:
                                    pathname === "/dashboard/settings"
                                        ? "rgba(108, 92, 231, 0.12)"
                                        : "transparent",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <Settings size={18} /> Settings
                        </Link>
                        <FeedbackNavItem />
                        <button
                            type="button"
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

                <main
                    className="desktop-visible dashboard-main-with-ai-fab"
                    style={{
                        flex: 1,
                        marginLeft: "260px",
                        padding: "var(--main-padding)",
                        minHeight: "100vh",
                    }}
                >
                    {children}
                </main>

                <main
                    className="mobile-visible dashboard-main-with-ai-fab"
                    style={{
                        width: "100%",
                        paddingTop: "80px",
                        padding: "60px var(--main-padding) var(--main-padding) var(--main-padding)",
                        minHeight: "100vh",
                        marginLeft: 0,
                    }}
                >
                    {children}
                </main>
            </div>

            <AICommandBar />
        </>
    );
}
