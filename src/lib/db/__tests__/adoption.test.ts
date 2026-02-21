import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================
// Mock Supabase before imports
// ============================================

const mockFrom = vi.fn();

vi.mock('../connection', () => ({
  supabaseAdmin: { from: (...args: unknown[]) => mockFrom(...args) },
  isSupabaseAdminConfigured: vi.fn(() => true),
}));

import { getScoreColor, getOverviewScore, getUserScores, getModuleDetail, getSnapshotTrend } from '../adoption';
import { isSupabaseAdminConfigured } from '../connection';

// ============================================
// Helpers: build chainable Supabase mock
// ============================================

function createChain(resolvedData: unknown, resolvedError: unknown = null) {
  const result = { data: resolvedData, error: resolvedError };
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ['select', 'eq', 'in', 'gte', 'lt', 'not', 'order', 'limit', 'single', 'upsert'];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  // Make the chain thenable (resolves when awaited)
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) => resolve(result);
  return chain;
}

// ============================================
// Test Data Fixtures
// ============================================

const FIXTURES = {
  employees: {
    hrUser: { id: 'user-1', full_name: 'Alice HR', system_role: 'hr', branch_id: 'branch-1' },
    branchMgr: { id: 'user-2', full_name: 'Bob Manager', system_role: 'branch_manager', branch_id: 'branch-1' },
    noRole: { id: 'user-3', full_name: 'Charlie', system_role: null, branch_id: 'branch-1' },
  },
  // HR user: 3 events, 2 modules (employees + attendance), 2 days
  hrEvents: [
    { user_id: 'user-1', module: 'employees', action_type: 'view', created_at: '2026-02-18T10:00:00Z' },
    { user_id: 'user-1', module: 'attendance', action_type: 'view', created_at: '2026-02-19T10:00:00Z' },
    { user_id: 'user-1', module: 'employees', action_type: 'edit', created_at: '2026-02-19T11:00:00Z' },
  ],
  snapshots: [
    { snapshot_date: '2026-02-17', score: 45 },
    { snapshot_date: '2026-02-18', score: 48 },
    { snapshot_date: '2026-02-19', score: 50 },
  ],
};

// ============================================
// getScoreColor — Pure Function
// ============================================

describe('getScoreColor', () => {
  it('returns Excellent/green for score >= 80', () => {
    expect(getScoreColor(80).label).toBe('Excellent');
    expect(getScoreColor(100).label).toBe('Excellent');
    expect(getScoreColor(80).color).toContain('green');
  });

  it('returns Good/blue for score 60-79', () => {
    expect(getScoreColor(60).label).toBe('Good');
    expect(getScoreColor(79).label).toBe('Good');
    expect(getScoreColor(60).color).toContain('blue');
  });

  it('returns Needs Attention/amber for score 40-59', () => {
    expect(getScoreColor(40).label).toBe('Needs Attention');
    expect(getScoreColor(59).label).toBe('Needs Attention');
    expect(getScoreColor(40).color).toContain('amber');
  });

  it('returns Low/red for score < 40', () => {
    expect(getScoreColor(0).label).toBe('Low');
    expect(getScoreColor(39).label).toBe('Low');
    expect(getScoreColor(0).color).toContain('red');
  });

  it('correctly classifies boundary values', () => {
    // The four boundaries: 0, 40, 60, 80
    expect(getScoreColor(39).label).toBe('Low');
    expect(getScoreColor(40).label).toBe('Needs Attention');
    expect(getScoreColor(59).label).toBe('Needs Attention');
    expect(getScoreColor(60).label).toBe('Good');
    expect(getScoreColor(79).label).toBe('Good');
    expect(getScoreColor(80).label).toBe('Excellent');
  });

  it('returns all required properties', () => {
    const result = getScoreColor(50);
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('bg');
    expect(result).toHaveProperty('barColor');
    expect(result).toHaveProperty('label');
  });
});

// ============================================
// getOverviewScore — Score Computation
// ============================================

describe('getOverviewScore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------
  // Empty/null states
  // ----------------------------------------
  describe('empty/null states', () => {
    it('returns null when Supabase is not configured', async () => {
      vi.mocked(isSupabaseAdminConfigured).mockReturnValueOnce(false);
      const result = await getOverviewScore('7d');
      expect(result).toBeNull();
    });

    it('returns empty overview when no employees exist', async () => {
      mockFrom.mockReturnValue(createChain([])); // employees query returns empty

      const result = await getOverviewScore('7d');
      expect(result).not.toBeNull();
      expect(result!.score).toBe(0);
      expect(result!.activeUsers).toBe(0);
      expect(result!.totalUsers).toBe(0);
    });

    it('returns empty overview with totalUsers when employees exist but no events', async () => {
      const employees = [FIXTURES.employees.hrUser];

      // Call 1: employees query
      // Call 2: usage_events query (empty)
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        return createChain([]); // events query
      });

      const result = await getOverviewScore('7d');
      expect(result).not.toBeNull();
      expect(result!.score).toBe(0);
      expect(result!.activeUsers).toBe(0);
      expect(result!.totalUsers).toBe(1);
    });
  });

  // ----------------------------------------
  // Single user score computation
  // ----------------------------------------
  describe('single user score computation', () => {
    /**
     * Hand-computed expected values for 1 HR user with 3 events:
     *
     * Employee: HR role (8 available modules, 12 daily target)
     * Events: 3 events across 2 modules (employees + attendance), 2 days
     * Period: 7d → workdays = ceil(7*5/7) = 5
     *
     * PLATFORM SCORE:
     *   breadth  = (1 active / 1 total) × 100 = 100
     *   depth    = (2 modules used / 8 available) × 100 = 25
     *   frequency = min(3 events / 5 workdays / 12 daily target, 1.0) × 100
     *             = min(0.6/12, 1.0) × 100 = min(0.05, 1.0) × 100 = 5
     *   platform = 100×0.4 + 25×0.35 + 5×0.25 = 40 + 8.75 + 1.25 = 50
     *
     * USER SCORE:
     *   login    = min(2 days / 5, 1.0) × 100 = 40
     *   coverage = (2/8) × 100 = 25
     *   volume   = min(3 / (12×5), 1.0) × 100 = min(0.05, 1.0) × 100 = 5
     *   user     = 40×0.3 + 25×0.4 + 5×0.3 = 12 + 10 + 1.5 = 23.5 → rounded to 24
     */
    it('computes correct platform score for 1 HR user', async () => {
      const employees = [FIXTURES.employees.hrUser];
      const events = FIXTURES.hrEvents;

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);    // employees
        if (callCount === 2) return createChain(events);        // events in period
        if (callCount === 3) return createChain([]);            // prev period events
        return createChain(null, null);                          // snapshot lookup
      });

      const result = await getOverviewScore('7d');
      expect(result).not.toBeNull();

      // Platform score components
      expect(result!.breadth).toBe(100);  // 1/1 users active
      expect(result!.depth).toBe(25);     // 2/8 modules
      expect(result!.frequency).toBe(5);  // min(0.05, 1) × 100
      expect(result!.score).toBe(50);     // 100×0.4 + 25×0.35 + 5×0.25
    });

    it('computes correct user score in topUsers', async () => {
      const employees = [FIXTURES.employees.hrUser];
      const events = FIXTURES.hrEvents;

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        if (callCount === 2) return createChain(events);
        if (callCount === 3) return createChain([]);
        return createChain(null, null);
      });

      const result = await getOverviewScore('7d');
      expect(result!.topUsers).toHaveLength(1);
      expect(result!.topUsers[0].userId).toBe('user-1');
      expect(result!.topUsers[0].score).toBe(24); // login(40)×0.3 + coverage(25)×0.4 + volume(5)×0.3
    });

    it('returns correct activeUsers and totalUsers counts', async () => {
      const employees = [FIXTURES.employees.hrUser];
      const events = FIXTURES.hrEvents;

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        if (callCount === 2) return createChain(events);
        if (callCount === 3) return createChain([]);
        return createChain(null, null);
      });

      const result = await getOverviewScore('7d');
      expect(result!.activeUsers).toBe(1);
      expect(result!.totalUsers).toBe(1);
    });

    it('computes module-level scores', async () => {
      const employees = [FIXTURES.employees.hrUser];
      const events = FIXTURES.hrEvents;

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        if (callCount === 2) return createChain(events);
        if (callCount === 3) return createChain([]);
        return createChain(null, null);
      });

      const result = await getOverviewScore('7d');
      // 14 modules reported, sorted by score descending
      expect(result!.modules).toHaveLength(14);
      // employees and attendance should have scores > 0
      const employeesMod = result!.modules.find(m => m.module === 'employees');
      expect(employeesMod!.userCount).toBe(1);
      expect(employeesMod!.actionCount).toBe(2); // 2 employee events
    });
  });

  // ----------------------------------------
  // Edge cases
  // ----------------------------------------
  describe('edge cases', () => {
    it('does not produce NaN when activeUsers is 0 (defensive guard)', async () => {
      // Events exist but from a user not in employee list
      const employees = [FIXTURES.employees.hrUser];
      const events = [
        { user_id: 'deleted-user', module: 'employees', action_type: 'view', created_at: '2026-02-19T10:00:00Z' },
      ];

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        if (callCount === 2) return createChain(events);
        if (callCount === 3) return createChain([]);
        return createChain(null, null);
      });

      const result = await getOverviewScore('7d');
      expect(result).not.toBeNull();
      // Score should be a valid number, not NaN
      expect(Number.isNaN(result!.score)).toBe(false);
      expect(Number.isNaN(result!.depth)).toBe(false);
      expect(Number.isNaN(result!.frequency)).toBe(false);
    });

    it('caps frequency at 100 when user exceeds daily target', async () => {
      // Employee role: daily target = 5, workdays for 7d = 5
      // Need > 25 events (5 × 5) to exceed cap
      const employees = [{ id: 'user-emp', full_name: 'Test', system_role: 'employee', branch_id: 'b1' }];
      const events = Array.from({ length: 30 }, (_, i) => ({
        user_id: 'user-emp',
        module: 'employees',
        action_type: 'view',
        created_at: `2026-02-${String(15 + (i % 5)).padStart(2, '0')}T${String(10 + (i % 8)).padStart(2, '0')}:00:00Z`,
      }));

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        if (callCount === 2) return createChain(events);
        if (callCount === 3) return createChain([]);
        return createChain(null, null);
      });

      const result = await getOverviewScore('7d');
      expect(result!.frequency).toBeLessThanOrEqual(100);
    });

    it('falls back to employee role defaults for null system_role', async () => {
      const employees = [FIXTURES.employees.noRole]; // system_role: null
      const events = [
        { user_id: 'user-3', module: 'employees', action_type: 'view', created_at: '2026-02-19T10:00:00Z' },
      ];

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        if (callCount === 2) return createChain(events);
        if (callCount === 3) return createChain([]);
        return createChain(null, null);
      });

      const result = await getOverviewScore('7d');
      expect(result).not.toBeNull();
      // Should use employee defaults: 6 available modules, 5 daily target
      // depth = (1/6)*100 ≈ 16.67 → rounded to 17
      expect(result!.depth).toBe(17);
    });

    it('limits topUsers to 5 entries', async () => {
      // Create 7 employees with events
      const employees = Array.from({ length: 7 }, (_, i) => ({
        id: `user-${i}`, full_name: `User ${i}`, system_role: 'employee', branch_id: 'b1',
      }));
      const events = employees.flatMap(emp => [
        { user_id: emp.id, module: 'employees', action_type: 'view', created_at: '2026-02-19T10:00:00Z' },
      ]);

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChain(employees);
        if (callCount === 2) return createChain(events);
        if (callCount === 3) return createChain([]);
        return createChain(null, null);
      });

      const result = await getOverviewScore('7d');
      expect(result!.topUsers).toHaveLength(5);
    });
  });
});

// ============================================
// getUserScores
// ============================================

describe('getUserScores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated results sorted by score desc by default', async () => {
    const employees = [
      FIXTURES.employees.hrUser,
      FIXTURES.employees.branchMgr,
    ];
    const events = [
      // User-1 has more events → higher score
      ...FIXTURES.hrEvents,
      { user_id: 'user-2', module: 'finance', action_type: 'view', created_at: '2026-02-19T10:00:00Z' },
    ];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return createChain(employees);
      return createChain(events);
    });

    const result = await getUserScores('7d', { limit: 10, offset: 0 });
    expect(result).not.toBeNull();
    expect(result!.users).toHaveLength(2);
    expect(result!.total).toBe(2);
    // Verify descending score order
    expect(result!.users[0].score).toBeGreaterThanOrEqual(result!.users[1].score);
  });

  it('returns empty array when no events exist', async () => {
    const employees = [FIXTURES.employees.hrUser];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return createChain(employees);
      return createChain([]);
    });

    const result = await getUserScores('7d');
    expect(result).not.toBeNull();
    expect(result!.users).toEqual([]);
    expect(result!.total).toBe(0);
  });

  it('returns null when Supabase is not configured', async () => {
    vi.mocked(isSupabaseAdminConfigured).mockReturnValueOnce(false);
    const result = await getUserScores('7d');
    expect(result).toBeNull();
  });
});

// ============================================
// getModuleDetail
// ============================================

describe('getModuleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for invalid module name', async () => {
    const result = await getModuleDetail('nonexistent_module', '7d');
    expect(result).toBeNull();
  });

  it('returns module data for valid module', async () => {
    const employees = [FIXTURES.employees.hrUser];
    const events = [
      { user_id: 'user-1', action_type: 'view', created_at: '2026-02-19T10:00:00Z' },
      { user_id: 'user-1', action_type: 'edit', created_at: '2026-02-19T11:00:00Z' },
    ];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return createChain(employees);
      return createChain(events);
    });

    const result = await getModuleDetail('employees', '7d');
    expect(result).not.toBeNull();
    expect(result!.module).toBe('employees');
    expect(result!.label).toBe('Employees');
    expect(result!.userCount).toBe(1);
    expect(result!.actionCount).toBe(2);
  });
});

// ============================================
// getSnapshotTrend
// ============================================

describe('getSnapshotTrend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns snapshot points in ascending date order', async () => {
    // DB returns descending, function reverses to ascending
    const dbData = [...FIXTURES.snapshots].reverse(); // descending from DB
    mockFrom.mockReturnValue(createChain(dbData));

    const result = await getSnapshotTrend('7d');
    expect(result).toHaveLength(3);
    expect(result[0].date).toBe('2026-02-17');
    expect(result[2].date).toBe('2026-02-19');
    expect(result[0].score).toBe(45);
  });

  it('returns empty array when no snapshots exist', async () => {
    mockFrom.mockReturnValue(createChain([]));

    const result = await getSnapshotTrend('7d');
    expect(result).toEqual([]);
  });

  it('returns empty array when Supabase is not configured', async () => {
    vi.mocked(isSupabaseAdminConfigured).mockReturnValueOnce(false);
    const result = await getSnapshotTrend('7d');
    expect(result).toEqual([]);
  });
});
