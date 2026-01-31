'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import type { BranchOption } from '@/modules/reception/types';

interface BranchData {
  branches: BranchOption[];
  defaultBranchId: string | null;
  canSeeAllBranches: boolean;
  totalBranchCount: number;
}

interface ReceptionModeContextType {
  // Mode state
  isReceptionMode: boolean;
  toggleReceptionMode: () => void;
  setReceptionMode: (value: boolean) => void;

  // Branch state
  selectedBranchId: string | null;
  selectedBranch: BranchOption | null;
  accessibleBranches: BranchOption[];
  defaultBranchId: string | null;
  canSeeAllBranches: boolean;
  isLoadingBranches: boolean;

  // Branch actions
  setSelectedBranch: (branchId: string) => void;
  showBranchSwitchConfirm: boolean;
  pendingBranchId: string | null;
  confirmBranchSwitch: () => void;
  cancelBranchSwitch: () => void;
  requestBranchSwitch: (branchId: string) => void;

  // Refresh
  refreshBranches: () => Promise<void>;
}

const ReceptionModeContext = createContext<ReceptionModeContextType | undefined>(undefined);

const STORAGE_KEY = 'reception_selected_branch';
const MODE_STORAGE_KEY = 'reception_mode_active';

export function ReceptionModeProvider({ children }: { children: ReactNode }) {
  // Mode state - starts false, then restores from storage after mount
  const [isReceptionMode, setIsReceptionModeState] = useState(false);
  const isInitialMount = useRef(true);

  // Restore mode from sessionStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const stored = sessionStorage.getItem(MODE_STORAGE_KEY);
    console.log('[ReceptionMode] Restoring from storage:', stored);
    if (stored === 'true') {
      setIsReceptionModeState(true);
    }
    // Mark initial mount complete after a tick to ensure state is set
    setTimeout(() => {
      isInitialMount.current = false;
    }, 0);
  }, []);

  // Wrapper to persist mode changes
  const setIsReceptionMode = useCallback((value: boolean) => {
    setIsReceptionModeState(value);
    if (!isInitialMount.current) {
      console.log('[ReceptionMode] Persisting to storage:', value);
      sessionStorage.setItem(MODE_STORAGE_KEY, value ? 'true' : 'false');
    }
  }, []);

  // Branch state
  const [branchData, setBranchData] = useState<BranchData>({
    branches: [],
    defaultBranchId: null,
    canSeeAllBranches: false,
    totalBranchCount: 0,
  });
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Branch switch confirmation
  const [showBranchSwitchConfirm, setShowBranchSwitchConfirm] = useState(false);
  const [pendingBranchId, setPendingBranchId] = useState<string | null>(null);

  // Fetch accessible branches
  const fetchBranches = useCallback(async () => {
    setIsLoadingBranches(true);
    try {
      const response = await fetch('/api/reception/branches');
      console.log('[ReceptionMode] Fetching branches, status:', response.status);

      if (response.ok) {
        const data: BranchData = await response.json();
        console.log('[ReceptionMode] Branches received:', data);
        setBranchData(data);

        // Set initial branch from storage or default
        const storedBranchId = sessionStorage.getItem(STORAGE_KEY);
        const validBranch = data.branches.find(b => b.id === storedBranchId);

        if (validBranch) {
          setSelectedBranchId(storedBranchId);
          console.log('[ReceptionMode] Using stored branch:', storedBranchId);
        } else if (data.defaultBranchId) {
          setSelectedBranchId(data.defaultBranchId);
          console.log('[ReceptionMode] Using default branch:', data.defaultBranchId);
        } else if (data.branches.length > 0) {
          // Fall back to first non-"all" branch
          const firstBranch = data.branches.find(b => !b.isAllBranches) || data.branches[0];
          setSelectedBranchId(firstBranch.id);
          console.log('[ReceptionMode] Using first branch:', firstBranch.id);
        } else {
          console.log('[ReceptionMode] No branches available');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ReceptionMode] Failed to fetch branches:', response.status, errorData);
      }
    } catch (error) {
      console.error('[ReceptionMode] Error fetching branches:', error);
    } finally {
      setIsLoadingBranches(false);
    }
  }, []);


  // Fetch branches when entering reception mode
  useEffect(() => {
    if (isReceptionMode) {
      fetchBranches();
    }
  }, [isReceptionMode, fetchBranches]);

  const toggleReceptionMode = useCallback(() => {
    const newValue = !isReceptionMode;
    setIsReceptionMode(newValue);
  }, [isReceptionMode, setIsReceptionMode]);

  const setReceptionMode = useCallback((value: boolean) => {
    setIsReceptionMode(value);
  }, [setIsReceptionMode]);

  // Get selected branch object
  const selectedBranch = branchData.branches.find(b => b.id === selectedBranchId) || null;

  // Direct branch selection (no confirmation)
  const setSelectedBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    sessionStorage.setItem(STORAGE_KEY, branchId);
  };

  // Request branch switch (with confirmation)
  const requestBranchSwitch = (branchId: string) => {
    if (branchId === selectedBranchId) return;

    // If user only has access to one branch, switch directly
    if (branchData.branches.filter(b => !b.isAllBranches).length <= 1) {
      setSelectedBranch(branchId);
      return;
    }

    // Show confirmation modal
    setPendingBranchId(branchId);
    setShowBranchSwitchConfirm(true);
  };

  const confirmBranchSwitch = () => {
    if (pendingBranchId) {
      setSelectedBranch(pendingBranchId);
    }
    setShowBranchSwitchConfirm(false);
    setPendingBranchId(null);
  };

  const cancelBranchSwitch = () => {
    setShowBranchSwitchConfirm(false);
    setPendingBranchId(null);
  };

  const refreshBranches = async () => {
    await fetchBranches();
  };

  return (
    <ReceptionModeContext.Provider
      value={{
        // Mode
        isReceptionMode,
        toggleReceptionMode,
        setReceptionMode,

        // Branch state
        selectedBranchId,
        selectedBranch,
        accessibleBranches: branchData.branches,
        defaultBranchId: branchData.defaultBranchId,
        canSeeAllBranches: branchData.canSeeAllBranches,
        isLoadingBranches,

        // Branch actions
        setSelectedBranch,
        showBranchSwitchConfirm,
        pendingBranchId,
        confirmBranchSwitch,
        cancelBranchSwitch,
        requestBranchSwitch,

        // Refresh
        refreshBranches,
      }}
    >
      {children}
    </ReceptionModeContext.Provider>
  );
}

export function useReceptionMode() {
  const context = useContext(ReceptionModeContext);
  if (context === undefined) {
    throw new Error('useReceptionMode must be used within a ReceptionModeProvider');
  }
  return context;
}
