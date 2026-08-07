let _initialized = false;

export interface AnalyticsOptions {
  host?: string;
}

/**
 * Initialize PostHog once. Safe to call anywhere:
 * - no-ops during SSR (window undefined)
 * - no-ops without an apiKey (local/dev)
 * - idempotent after first successful init
 */
export async function initAnalytics(
  apiKey?: string,
  options: AnalyticsOptions = {}
): Promise<boolean> {
  if (typeof window === "undefined" || _initialized || !apiKey) {
    return false;
  }
  const { posthog } = await import("posthog-js");
  posthog.init(apiKey, {
    api_host: options.host ?? "https://us.i.posthog.com",
    capture_pageview: true,
  });
  _initialized = true;
  return true;
}

/**
 * Track an event with an optional payload. Safe to call anywhere:
 * - no-ops on the server
 * - no-ops before initAnalytics() succeeds
 */
export async function trackEvent(
  name: string,
  payload?: Record<string, unknown>
): Promise<void> {
  if (typeof window === "undefined" || !_initialized) {
    return;
  }
  const { posthog } = await import("posthog-js");
  posthog.capture(name, payload);
}