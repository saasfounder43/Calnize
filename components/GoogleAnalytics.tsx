"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import Script from "next/script";
import * as gtag from "@/lib/gtag";

function AnalyticsImplementation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!pathname) return;

    // Skip the first load — gtag 'config' already fires the initial pageview.
    // This prevents the same user session from being double-counted on mount.
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    // Subsequent SPA navigations: send a manual pageview
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    gtag.pageview(url);
  }, [pathname, searchParams]);

  if (!gtag.GA_TRACKING_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

// Separate component for Suspense to avoid de-optimizing the entire layout
export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsImplementation />
    </Suspense>
  );
}
