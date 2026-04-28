import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import FeedbackButton from "@/components/FeedbackButton";

export const metadata: Metadata = {
  title: {
    default: "Calnize – Simple Scheduling for Professionals",
    template: "%s | Calnize"
  },
  description:
    "Let clients book meetings instantly with Calnize scheduling software. Share your availability and manage meetings effortlessly.",
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
        <GoogleAnalytics />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2350824738301174"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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
      <body>
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <FeedbackButton />
      </body>
    </html>
  );
}
