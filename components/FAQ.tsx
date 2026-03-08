"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItemProps {
    question: string;
    answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="glass-card"
            style={{
                marginBottom: "12px",
                overflow: "hidden",
                cursor: "pointer",
                border: isOpen ? "1px solid rgba(108, 92, 231, 0.4)" : "1px solid var(--color-border)"
            }}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div
                style={{
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: isOpen ? "var(--color-accent-light)" : "var(--color-text-primary)"
                }}
            >
                <span>{question}</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {isOpen && (
                <div
                    style={{
                        padding: "0 24px 20px",
                        fontSize: "15px",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.6,
                        whiteSpace: "pre-line"
                    }}
                >
                    {answer}
                </div>
            )}
        </div>
    );
}

export default function FAQ() {
    const faqs = [
        {
            question: "What is Calnize?",
            answer: "Calnize is a smart scheduling tool that helps professionals share their availability and let others book meetings instantly. It eliminates the back-and-forth of emails by syncing directly with your calendar."
        },
        {
            question: "How does Calnize work?",
            answer: "1. Connect your Google Calendar.\n2. Set your available hours and create booking types (e.g., 30-min Consultation).\n3. Share your personal booking link.\n4. People choose a time, and the meeting is automatically added to both your calendars."
        },
        {
            question: "Is my calendar data safe?",
            answer: "Yes. Calnize only checks for 'busy' slots to prevent double bookings. We never store your personal event details, and our integration is secured via Google's official API."
        },
        {
            question: "Can I accept payments for bookings?",
            answer: "Calnize Pro allows you to set a price for your booking types. Guests will be prompted to pay via Stripe Checkout before the meeting is confirmed."
        },
        {
            question: "Does Calnize sync with Google Calendar?",
            answer: "Yes! Calnize has a deep integration with Google Calendar. It automatically reads your busy slots and creates new events when someone books a meeting."
        },
        {
            question: "Can I create multiple booking types?",
            answer: "On the Free plan, you can have 1 active booking type. Pro users can create unlimited booking types with different durations and settings."
        },
        {
            question: "Does Calnize support virtual and in-person meetings?",
            answer: "Yes. You can choose the meeting type when creating a booking type:\n- Virtual meetings: include a meeting link (Zoom, Google Meet, Teams, etc.).\n- In-person meetings: meet at a physical location."
        },
        {
            question: "Will I receive notifications when someone books a meeting?",
            answer: "Yes. Both you and the person booking the meeting will receive confirmation emails with the meeting details. Virtual meeting links are included if applicable."
        },
        {
            question: "Can I cancel or reschedule meetings?",
            answer: "Yes. Meetings can be cancelled through the booking confirmation link or from your dashboard. Both participants will receive email updates if a meeting is cancelled."
        },
        {
            question: "Is Calnize free to use?",
            answer: "Yes! Calnize offers a generous Free plan that covers basic scheduling needs. You can upgrade to the Pro plan for advanced features like unlimited booking types and payments."
        }
    ];

    return (
        <section id="faq" style={{ padding: "80px 24px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "16px" }}>
                    Frequently Asked Questions
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "16px" }}>
                    Have questions? Here are answers to the most common ones about scheduling with Calnize.
                </p>
            </div>

            <div>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} {...faq} />
                ))}
            </div>
        </section>
    );
}
