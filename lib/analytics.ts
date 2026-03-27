export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventParams = Record<string, unknown>;

export const isAnalyticsEnabled = Boolean(GA_MEASUREMENT_ID);

export function pageview(url: string) {
  if (!isAnalyticsEnabled || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function trackEvent(action: string, params: AnalyticsEventParams = {}) {
  if (!isAnalyticsEnabled || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", action, params);
}
