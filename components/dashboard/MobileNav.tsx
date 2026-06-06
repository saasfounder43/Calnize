"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import FeedbackNavItem from "@/components/dashboard/FeedbackNavItem";
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
    Palette,
    X,
    Menu,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/booking-types", label: "Booking Types", icon: CalendarDays },
    { href: "/dashboard/availability", label: "Availability", icon: Clock },
    { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
    { href: "/dashboard/integrations", label: "Integrations", icon: LinkIcon },
    { href: "/dashboard/branding", label: "Branding", icon: Palette },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            <div
                className="mobile-visible"
                style={{
                    display: "flex",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background: "var(--color-bg-secondary)",
                    borderBottom: "1px solid var(--color-border)",
                    zIndex: 50,
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                }}
            >
                <Link
                    href="/dashboard"
                    style={{
                        textDecoration: "none",
                    }}
                >
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
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px",
                    }}
                    aria-label="Toggle mobile navigation"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isOpen && (
                <>
                    <div
                        className="mobile-visible dashboard-sidebar"
                        style={{
                            position: "fixed",
                            top: "60px",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: "calc(100vh - 60px)",
                            background: "var(--color-bg-secondary)",
                            borderRight: "1px solid var(--color-border)",
                            zIndex: 40,
                            padding: "16px 12px",
                        }}
                    >
                        <nav className="dashboard-sidebar-nav" style={{ padding: 0 }}>
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
                                            color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                                            background: isActive ? "rgba(108, 92, 231, 0.15)" : "transparent",
                                            borderLeft: isActive ? "3px solid var(--color-accent)" : "3px solid transparent",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <Icon size={18} />
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {isActive && <ChevronRight size={14} color="var(--color-accent-light)" />}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="dashboard-sidebar-footer" style={{ paddingTop: "16px" }}>
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
                    </div>
                    <div
                        className="mobile-visible"
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 30,
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                </>
            )}
        </>
    );
}
