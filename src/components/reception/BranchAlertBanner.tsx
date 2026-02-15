'use client';

import React from 'react';
import { AlertTriangle, Building2, Calendar } from 'lucide-react';
import { useServiceHub } from '@/contexts/ServiceHubContext';
import { useTranslation } from '@/contexts/LanguageContext';
import type { BranchOption } from '@/modules/reception/types';

export function BranchAlertBanner() {
  const { selectedBranch, accessibleBranches } = useServiceHub();
  const { t } = useTranslation();

  if (!selectedBranch || selectedBranch.isAllBranches) return null;

  // Find the selected branch from accessible branches with full metadata
  const branchMeta = accessibleBranches.find((b: BranchOption) => b.id === selectedBranch.id);
  if (!branchMeta) return null;

  // Only show banner if this is NOT the user's assigned (home) branch
  if (branchMeta.isAssigned) return null;

  const isFromAssignment = branchMeta.isFromAssignment;
  const assignmentEndsAt = branchMeta.assignmentEndsAt;

  let expiryText = '';
  if (assignmentEndsAt) {
    const diff = Math.ceil((new Date(assignmentEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) expiryText = t.reception.assignmentExpired;
    else if (diff === 1) expiryText = t.reception.assignmentEndsTomorrow;
    else if (diff <= 7) expiryText = t.reception.assignmentEndsInDays.replace('{days}', String(diff));
    else expiryText = t.reception.endsOn.replace('{date}', new Date(assignmentEndsAt).toLocaleDateString());
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <div className="flex-1 flex items-center gap-2 text-sm">
        <Building2 className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-amber-800 font-medium">
          {t.reception.operatingAtBranch} {selectedBranch.name}
        </span>
        {isFromAssignment && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-200 text-amber-800">
            {t.reception.assignedTag}
          </span>
        )}
        {!isFromAssignment && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
            {t.reception.grantedTag}
          </span>
        )}
      </div>
      {expiryText && (
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <Calendar className="w-3 h-3" />
          {expiryText}
        </span>
      )}
    </div>
  );
}
