import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Internal Test Booking",
    robots: "noindex, nofollow",
};

export default function InternalTestBookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
