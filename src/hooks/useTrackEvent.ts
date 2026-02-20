'use client';

import { useCallback, useRef } from 'react';

/**
 * Fire-and-forget hook for tracking frontend user actions in the adoption system.
 *
 * Calls POST /api/adoption/track with a 5-second client-side throttle per event key
 * (matching the server-side deduplication window in trackUsage()).
 *
 * Usage:
 *   const trackEvent = useTrackEvent();
 *   trackEvent('attendance', 'create', { shiftId: '...' });
 */
type TrackEventFn = (module: string, actionType: string, metadata?: Record<string, unknown>) => void;

export function useTrackEvent(): TrackEventFn {
  // Track last-fired timestamps per "module:actionType" key — avoids re-renders
  const lastFiredRef = useRef<Map<string, number>>(new Map());

  const trackEvent = useCallback<TrackEventFn>((module, actionType, metadata) => {
    const key = `${module}:${actionType}`;
    const now = Date.now();
    const lastFired = lastFiredRef.current.get(key) || 0;

    // Throttle: same event at most once per 5 seconds
    if (now - lastFired < 5000) return;

    lastFiredRef.current.set(key, now);

    // Fire-and-forget — no await, catch silently
    fetch('/api/adoption/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, actionType, metadata }),
    }).catch(() => {});
  }, []);

  return trackEvent;
}
