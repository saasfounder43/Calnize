import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Calnize – Smart Scheduling for Meetings and Appointments",
    template: "%s | Calnize"
  },
  description:
    "Calnize helps you share your availability and let others book meetings instantly. Connect your calendar, share booking links, and simplify scheduling.",
  keywords: ["meeting scheduling", "appointment scheduling", "calendar booking tool", "online booking system", "calendly alternative"],
  authors: [{ name: "Calnize Team" }],
  creator: "Calnize",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://calnize.com",
    siteName: "Calnize",
    title: "Calnize — Minimal Global Scheduling",
    description: "Simple scheduling for solo professionals. Accept bookings and payments effortlessly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Calnize Scheduling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calnize — Minimal Global Scheduling",
    description: "Simple scheduling for solo professionals.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
