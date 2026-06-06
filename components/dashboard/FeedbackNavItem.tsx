"use client";

import { useEffect } from "react";
import { MessageSquare } from "lucide-react";

const TALLY_SCRIPT = "https://tally.so/widgets/embed.js";

export default function FeedbackNavItem() {
    useEffect(() => {
        if (document.querySelector(`script[src="${TALLY_SCRIPT}"]`)) return;
        const script = document.createElement("script");
        script.src = TALLY_SCRIPT;
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return (
        <button
            type="button"
            data-tally-open="EkbP1q"
            data-tally-emoji-text="👋"
            data-tally-emoji-animation="wave"
            aria-label="Share feedback"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(108, 92, 231, 0.1)";
                e.currentTarget.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
        >
            <MessageSquare size={18} />
            Feedback
        </button>
    );
}
