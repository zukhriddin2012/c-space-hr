'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SessionExpired from './SessionExpired';

// Silently refresh the token every 50 minutes (well before the 1-hour expiry).
// The refresh token lasts 7 days, so as long as the user opens the app at least
// once a week, they'll never be logged out.
const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutes

// After user activity, wait this long before refreshing (debounce)
const ACTIVITY_DEBOUNCE_MS = 2 * 60 * 1000; // 2 minutes

export default function SessionManager() {
  const router = useRouter();
  const [showExpired, setShowExpired] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastRefreshRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef(false);

  const silentRefresh = useCallback(async () => {
    // Prevent concurrent refresh calls
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        lastRefreshRef.current = Date.now();

        // Notify other tabs
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('c-space-session');
          channel.postMessage({ type: 'session-refreshed' });
          channel.close();
        }
      } else {
        // Refresh failed — token is truly expired (7+ days inactive)
        setShowExpired(true);
      }
    } catch {
      // Network error — don't show expired, will retry on next interval
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Schedule periodic silent refresh
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      silentRefresh();
      scheduleRefresh(); // re-schedule after each refresh
    }, REFRESH_INTERVAL_MS);
  }, [silentRefresh]);

  // On mount: start periodic refresh
  useEffect(() => {
    scheduleRefresh();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
  }, [scheduleRefresh]);

  // On user activity: refresh if it's been a while (debounced)
  useEffect(() => {
    const onActivity = () => {
      const timeSinceRefresh = Date.now() - lastRefreshRef.current;

      // Only refresh if it's been more than half the interval since last refresh
      if (timeSinceRefresh < REFRESH_INTERVAL_MS / 2) return;

      // Debounce: don't refresh on every keystroke
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      activityTimerRef.current = setTimeout(() => {
        silentRefresh();
        scheduleRefresh(); // reset the periodic timer
      }, ACTIVITY_DEBOUNCE_MS);
    };

    // Passive listeners for minimal performance impact
    window.addEventListener('click', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity, { passive: true });
    window.addEventListener('scroll', onActivity, { passive: true });

    return () => {
      window.removeEventListener('click', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('scroll', onActivity);
    };
  }, [silentRefresh, scheduleRefresh]);

  // Listen for session events from other tabs
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel('c-space-session');
    channel.onmessage = (event) => {
      if (event.data.type === 'session-refreshed') {
        // Another tab refreshed — reset our timer too
        lastRefreshRef.current = Date.now();
        scheduleRefresh();
        setShowExpired(false);
      }
      if (event.data.type === 'session-logout') {
        setShowExpired(true);
      }
    };

    return () => channel.close();
  }, [scheduleRefresh]);

  // Also refresh when tab becomes visible again (user comes back after a break)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceRefresh = Date.now() - lastRefreshRef.current;
        // If more than 25 min since last refresh, do one now
        if (timeSinceRefresh > REFRESH_INTERVAL_MS / 2) {
          silentRefresh();
          scheduleRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [silentRefresh, scheduleRefresh]);

  return <SessionExpired isOpen={showExpired} />;
}
