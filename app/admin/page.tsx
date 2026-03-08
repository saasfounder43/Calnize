"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/admin/dashboard");
    }, [router]);

    return (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
            Redirecting to admin dashboard...
        </div>
    );
}
