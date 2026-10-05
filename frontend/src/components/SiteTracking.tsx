"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiBaseUrl } from "@/config/api";

type TrackingConfig = {
  enabled: boolean;
  metaPixelId: string | null;
  googleMeasurementId: string | null;
  googleAdsId: string | null;
};

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: unknown;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const SESSION_KEY = "pd-visit-session";
const DISABLED: TrackingConfig = {
  enabled: false,
  metaPixelId: null,
  googleMeasurementId: null,
  googleAdsId: null,
};

let configPromise: Promise<TrackingConfig> | null = null;
let tagsLoaded = false;
let lastTrackedPath: string | null = null;

function loadConfig(): Promise<TrackingConfig> {
  configPromise ??= fetch(`${apiBaseUrl}/settings`, { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const s = data?.settings;
      if (!s?.trackingEnabled) return DISABLED;
      return {
        enabled: true,
        metaPixelId: s.metaPixelId?.trim() || null,
        googleMeasurementId: s.googleMeasurementId?.trim() || null,
        googleAdsId: s.googleAdsId?.trim() || null,
      };
    })
    .catch(() => DISABLED);
  return configPromise;
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "");
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function addScript(src: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function loadTags(config: TrackingConfig) {
  if (tagsLoaded) return;
  tagsLoaded = true;

  const googleIds = [config.googleMeasurementId, config.googleAdsId].filter(
    (id): id is string => Boolean(id),
  );
  if (googleIds.length > 0) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag.js only understands the `arguments` object, not an array.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    for (const id of googleIds) {
      window.gtag("config", id, { send_page_view: false });
    }
    addScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleIds[0])}`,
    );
  }

  if (config.metaPixelId && !window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", config.metaPixelId);
  }
}

async function trackPage(path: string) {
  const config = await loadConfig();
  if (!config.enabled || lastTrackedPath === path) return;
  lastTrackedPath = path;

  loadTags(config);
  const eventId = crypto.randomUUID();

  window.gtag?.("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
  window.fbq?.("track", "PageView", {}, { eventID: eventId });

  fetch(`${apiBaseUrl}/track/visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      path,
      referrer: document.referrer.slice(0, 512),
      sessionId: sessionId(),
      eventId,
    }),
  }).catch(() => {});
}

/** Records page visits and loads ad/analytics tags when enabled in dashboard settings. */
export default function SiteTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) void trackPage(pathname);
  }, [pathname]);

  return null;
}
