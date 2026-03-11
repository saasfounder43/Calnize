"use client";

import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { supabase } from "@/lib/supabase";

export default function ProductTour() {
    const [run, setRun] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Check if user has completed onboarding
        const checkOnboarding = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("users")
                    .select("onboarding_completed")
                    .eq("id", user.id)
                    .single();

                if (data && data.onboarding_completed === false) {
                    setRun(true);
                }
            }
        };

        checkOnboarding();

        // Listen for manual trigger (e.g. from a Help menu button)
        const handleStartTour = () => setRun(true);
        window.addEventListener("start-product-tour", handleStartTour);

        return () => window.removeEventListener("start-product-tour", handleStartTour);
    }, []);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            // Mark as completed in DB
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from("users")
                    .update({ onboarding_completed: true })
                    .eq("id", user.id);
            }
        }
    };

    const steps = [
        {
            target: ".connect-calendar-tour",
            content: "Connect your Google Calendar so Calnize can check your busy times and prevent double bookings.",
            disableBeacon: true,
        },
        {
            target: ".availability-menu-tour",
            content: "Set your weekly working hours so people can only book when you're free.",
        },
        {
            target: ".create-booking-tour",
            content: "Create your first meeting type like 'Consultation' or 'Demo'. You can customize duration and price.",
        },
        {
            target: ".copy-booking-link-tour",
            content: "Share this booking link directly on your website, email signature, or LinkedIn.",
        },
        {
            target: ".bookings-menu-tour",
            content: "View and manage all your scheduled meetings right here.",
        },
    ];

    if (!isMounted) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: "#6c5ce7",
                    backgroundColor: "#1e1e4a",
                    textColor: "#fff",
                    arrowColor: "#1e1e4a",
                    overlayColor: "rgba(0, 0, 0, 0.6)",
                },
                tooltip: {
                    borderRadius: "12px",
                    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.5)",
                },
                buttonNext: {
                    borderRadius: "8px",
                    fontWeight: 600,
                },
                buttonBack: {
                    marginRight: 10,
                },
                buttonSkip: {
                    color: "#a0a0cc",
                }
            }}
        />
    );
}
