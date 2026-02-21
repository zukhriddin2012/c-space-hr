import { describe, it, expect } from 'vitest';
import {
  classifyAction,
  ALL_MODULES,
  MODULE_LABELS,
  MODULE_MAP,
  ROLE_MODULE_ACCESS,
  ROLE_DAILY_TARGETS,
  TOTAL_MODULES,
} from '../usage-tracking';

// ============================================
// classifyAction — Pure Function Tests
// ============================================

describe('classifyAction', () => {
  // ----------------------------------------
  // Excluded paths → null
  // ----------------------------------------
  describe('excluded paths', () => {
    it('returns null for /api/auth paths', () => {
      expect(classifyAction('GET', '/api/auth/login')).toBeNull();
      expect(classifyAction('POST', '/api/auth/logout')).toBeNull();
    });

    it('returns null for /api/adoption paths', () => {
      expect(classifyAction('GET', '/api/adoption/overview')).toBeNull();
      expect(classifyAction('POST', '/api/adoption/track')).toBeNull();
    });

    it('returns null for /api/config paths', () => {
      expect(classifyAction('GET', '/api/config/settings')).toBeNull();
    });

    it('returns null for /api/cron paths', () => {
      expect(classifyAction('GET', '/api/cron/adoption-snapshot')).toBeNull();
    });

    it('returns null for /api/admin paths', () => {
      expect(classifyAction('GET', '/api/admin/users')).toBeNull();
    });
  });

  // ----------------------------------------
  // HTTP method → action type mapping
  // ----------------------------------------
  describe('HTTP method mapping', () => {
    it('maps GET to "view"', () => {
      expect(classifyAction('GET', '/api/employees')).toEqual({
        module: 'employees',
        actionType: 'view',
      });
    });

    it('maps POST to "create"', () => {
      expect(classifyAction('POST', '/api/employees')).toEqual({
        module: 'employees',
        actionType: 'create',
      });
    });

    it('maps PUT to "edit"', () => {
      expect(classifyAction('PUT', '/api/employees/123')).toEqual({
        module: 'employees',
        actionType: 'edit',
      });
    });

    it('maps PATCH to "edit"', () => {
      expect(classifyAction('PATCH', '/api/employees/123')).toEqual({
        module: 'employees',
        actionType: 'edit',
      });
    });

    it('maps DELETE to "delete"', () => {
      expect(classifyAction('DELETE', '/api/employees/123')).toEqual({
        module: 'employees',
        actionType: 'delete',
      });
    });

    it('normalizes lowercase method', () => {
      expect(classifyAction('get', '/api/employees')).toEqual({
        module: 'employees',
        actionType: 'view',
      });
    });

    it('defaults unknown method to "view"', () => {
      expect(classifyAction('OPTIONS', '/api/employees')).toEqual({
        module: 'employees',
        actionType: 'view',
      });
    });
  });

  // ----------------------------------------
  // Module resolution — standalone routes
  // ----------------------------------------
  describe('module resolution - standalone routes', () => {
    it('/api/employees → employees', () => {
      expect(classifyAction('GET', '/api/employees/list')).toEqual({
        module: 'employees',
        actionType: 'view',
      });
    });

    it('/api/attendance → attendance', () => {
      expect(classifyAction('GET', '/api/attendance/check-in')).toEqual({
        module: 'attendance',
        actionType: 'view',
      });
    });

    it('/api/payroll → payroll', () => {
      expect(classifyAction('GET', '/api/payroll/current')).toEqual({
        module: 'payroll',
        actionType: 'view',
      });
    });

    it('/api/wages → payroll (alias)', () => {
      expect(classifyAction('GET', '/api/wages/summary')).toEqual({
        module: 'payroll',
        actionType: 'view',
      });
    });

    it('/api/leaves → leave', () => {
      expect(classifyAction('POST', '/api/leaves/request')).toEqual({
        module: 'leave',
        actionType: 'create',
      });
    });

    it('/api/shifts → shifts', () => {
      expect(classifyAction('GET', '/api/shifts/assignments')).toEqual({
        module: 'shifts',
        actionType: 'view',
      });
    });

    it('/api/candidates → recruitment', () => {
      expect(classifyAction('GET', '/api/candidates/123')).toEqual({
        module: 'recruitment',
        actionType: 'view',
      });
    });

    it('/api/recruitment → recruitment', () => {
      expect(classifyAction('GET', '/api/recruitment/pipeline')).toEqual({
        module: 'recruitment',
        actionType: 'view',
      });
    });

    it('/api/finances → finance', () => {
      expect(classifyAction('POST', '/api/finances/records')).toEqual({
        module: 'finance',
        actionType: 'create',
      });
    });

    it('/api/metronome → metronome', () => {
      expect(classifyAction('GET', '/api/metronome/sync')).toEqual({
        module: 'metronome',
        actionType: 'view',
      });
    });

    it('/api/maintenance → maintenance', () => {
      expect(classifyAction('POST', '/api/maintenance/tickets')).toEqual({
        module: 'maintenance',
        actionType: 'create',
      });
    });
  });

  // ----------------------------------------
  // Module resolution — ServiceHub sub-modules
  // ----------------------------------------
  describe('module resolution - ServiceHub sub-modules', () => {
    it('/api/reception/transactions → servicehub_transactions', () => {
      expect(classifyAction('POST', '/api/reception/transactions/123')).toEqual({
        module: 'servicehub_transactions',
        actionType: 'create',
      });
    });

    it('/api/reception/expenses → servicehub_expenses', () => {
      expect(classifyAction('POST', '/api/reception/expenses/new')).toEqual({
        module: 'servicehub_expenses',
        actionType: 'create',
      });
    });

    it('/api/reception/accounting-requests → accounting_requests', () => {
      expect(classifyAction('GET', '/api/reception/accounting-requests')).toEqual({
        module: 'accounting_requests',
        actionType: 'view',
      });
    });

    it('/api/reception/legal-requests → legal_requests', () => {
      expect(classifyAction('GET', '/api/reception/legal-requests/456')).toEqual({
        module: 'legal_requests',
        actionType: 'view',
      });
    });

    it('/api/reception/cash-management → cash_management', () => {
      expect(classifyAction('POST', '/api/reception/cash-management/transfer')).toEqual({
        module: 'cash_management',
        actionType: 'create',
      });
    });

    it('/api/reception/inkasso → cash_management (alias)', () => {
      expect(classifyAction('GET', '/api/reception/inkasso/list')).toEqual({
        module: 'cash_management',
        actionType: 'view',
      });
    });

    it('/api/reception/maintenance → maintenance', () => {
      expect(classifyAction('POST', '/api/reception/maintenance/create')).toEqual({
        module: 'maintenance',
        actionType: 'create',
      });
    });
  });

  // ----------------------------------------
  // Segment-based overrides (CSN-192 regression tests)
  // ----------------------------------------
  describe('segment-based overrides', () => {
    it('overrides action to "export" for /export segment', () => {
      expect(classifyAction('GET', '/api/employees/export')).toEqual({
        module: 'employees',
        actionType: 'export',
      });
    });

    it('overrides action to "export" for /payroll/export', () => {
      expect(classifyAction('POST', '/api/payroll/export')).toEqual({
        module: 'payroll',
        actionType: 'export',
      });
    });

    it('overrides action to "approve" for /approve segment', () => {
      expect(classifyAction('POST', '/api/attendance/approve')).toEqual({
        module: 'attendance',
        actionType: 'approve',
      });
    });

    it('does NOT match "export" as substring in "exported-list"', () => {
      // Regression test: CSN-192 fixed .includes('/export') → segments.includes('export')
      const result = classifyAction('GET', '/api/employees/exported-list');
      expect(result).toEqual({
        module: 'employees',
        actionType: 'view', // NOT 'export'
      });
    });

    it('does NOT match "export" as substring in "exportable"', () => {
      const result = classifyAction('GET', '/api/employees/exportable');
      expect(result).toEqual({
        module: 'employees',
        actionType: 'view', // NOT 'export'
      });
    });
  });

  // ----------------------------------------
  // Unrecognized paths → null
  // ----------------------------------------
  describe('unrecognized paths', () => {
    it('returns null for unknown API paths', () => {
      expect(classifyAction('GET', '/api/unknown/route')).toBeNull();
      expect(classifyAction('GET', '/api/webhook/stripe')).toBeNull();
    });

    it('returns null for non-API paths', () => {
      expect(classifyAction('GET', '/some/random/path')).toBeNull();
    });
  });
});

// ============================================
// Constants Integrity
// ============================================

describe('usage-tracking constants', () => {
  it('ALL_MODULES has exactly 14 entries', () => {
    expect(ALL_MODULES).toHaveLength(14);
    expect(TOTAL_MODULES).toBe(14);
  });

  it('every MODULE_MAP entry maps to a module with a label', () => {
    for (const entry of MODULE_MAP) {
      expect(MODULE_LABELS[entry.module]).toBeDefined();
    }
  });

  it('every role in ROLE_DAILY_TARGETS has a ROLE_MODULE_ACCESS entry', () => {
    for (const role of Object.keys(ROLE_DAILY_TARGETS)) {
      expect(ROLE_MODULE_ACCESS[role]).toBeDefined();
      expect(Array.isArray(ROLE_MODULE_ACCESS[role])).toBe(true);
    }
  });

  it('all modules in ROLE_MODULE_ACCESS are valid ALL_MODULES entries', () => {
    for (const [, modules] of Object.entries(ROLE_MODULE_ACCESS)) {
      for (const mod of modules) {
        expect(ALL_MODULES).toContain(mod);
      }
    }
  });
});
