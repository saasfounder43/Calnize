import type { Metadata } from "next";
import Script from "next/script";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { GA_MEASUREMENT_ID, isAnalyticsEnabled } from "@/lib/analytics";
import "./globals.css";

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
        {isAnalyticsEnabled && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
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
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
