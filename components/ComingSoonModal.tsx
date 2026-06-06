import React from "react";

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)"
        }}>
            <div className="glass-card animate-scale-in" style={{
                maxWidth: "400px",
                width: "90%",
                padding: "32px",
                textAlign: "center"
            }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
                    Pro Features Coming Soon 🚀
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", lineHeight: 1.6, marginBottom: "24px" }}>
                    We're working hard to bring powerful Pro features to Calnize. 
                    <br /><br />
                    Our team is currently finalizing advanced scheduling tools, enhanced integrations, and premium capabilities to make your experience even better.
                    <br /><br />
                    Stay tuned — Pro features will be available very soon!
                </p>
                <button
                    className="btn-primary"
                    onClick={onClose}
                    style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
