import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getSessionId(): string {
  let sid = sessionStorage.getItem("niyaifree_sid");
  if (!sid) {
    sid = "s_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem("niyaifree_sid", sid);
  }
  return sid;
}

export function usePageTracker() {
  const [location] = useLocation();
  const lastTracked = useRef("");

  useEffect(() => {
    // Avoid duplicate tracking for same page
    if (location === lastTracked.current) return;
    lastTracked.current = location;

    const sessionId = getSessionId();

    // Extract novelId from URL if on novel detail page
    let novelId: number | null = null;
    const novelMatch = location.match(/^\/novel\/(\d+)/);
    if (novelMatch) novelId = parseInt(novelMatch[1]);

    // Fire and forget — don't block UI
    const apiBase = import.meta.env.VITE_API_URL || "/api";
    fetch(`${apiBase}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: location,
        referrer: document.referrer || "",
        sessionId,
        novelId,
      }),
    }).catch(() => {
      // silently ignore tracking errors
    });
  }, [location]);
}
