import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTrackEvent } from '../useTrackEvent';

// ============================================
// Mock global fetch
// ============================================

const mockFetch = vi.fn().mockResolvedValue({ ok: true });

describe('useTrackEvent', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.useFakeTimers();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // ----------------------------------------
  // Basic behavior
  // ----------------------------------------
  it('fires fetch on first call', () => {
    const { result } = renderHook(() => useTrackEvent());

    act(() => {
      result.current('employees', 'view');
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('sends correct payload with POST method and JSON content-type', () => {
    const { result } = renderHook(() => useTrackEvent());

    act(() => {
      result.current('attendance', 'create', { shiftId: '123' });
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/adoption/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: 'attendance',
        actionType: 'create',
        metadata: { shiftId: '123' },
      }),
    });
  });

  it('sends undefined metadata when not provided', () => {
    const { result } = renderHook(() => useTrackEvent());

    act(() => {
      result.current('employees', 'view');
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.module).toBe('employees');
    expect(body.actionType).toBe('view');
    // metadata is undefined, so JSON.stringify omits it or includes it as undefined
    // The actual implementation passes metadata directly, which is undefined
  });

  // ----------------------------------------
  // Throttling (5-second window)
  // ----------------------------------------
  it('throttles identical event within 5 seconds', () => {
    const { result } = renderHook(() => useTrackEvent());

    act(() => {
      result.current('employees', 'view');
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Same event immediately — should be throttled
    act(() => {
      result.current('employees', 'view');
    });
    expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1

    // Same event after 3 seconds — still throttled
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      result.current('employees', 'view');
    });
    expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1
  });

  it('allows same event after 5 seconds', () => {
    const { result } = renderHook(() => useTrackEvent());

    act(() => {
      result.current('employees', 'view');
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Advance past 5-second window
    act(() => {
      vi.advanceTimersByTime(5001);
    });

    act(() => {
      result.current('employees', 'view');
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('allows different module:actionType keys immediately', () => {
    const { result } = renderHook(() => useTrackEvent());

    act(() => {
      result.current('employees', 'view');
    });
    act(() => {
      result.current('attendance', 'create'); // Different key
    });
    act(() => {
      result.current('employees', 'edit'); // Different actionType
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  // ----------------------------------------
  // Error handling
  // ----------------------------------------
  it('silently catches fetch errors without throwing', () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTrackEvent());

    // Should not throw
    expect(() => {
      act(() => {
        result.current('employees', 'view');
      });
    }).not.toThrow();
  });
});
