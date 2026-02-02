'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface CoverageStatus {
  total_shifts: number;
  filled_shifts: number;
  empty_shifts: number;
  understaffed_shifts: number;
  coverage_percentage: number;
}

interface CoverageIndicatorProps {
  coverage: CoverageStatus;
  compact?: boolean;
}

export default function CoverageIndicator({
  coverage,
  compact = false,
}: CoverageIndicatorProps) {
  const { total_shifts, filled_shifts, empty_shifts, understaffed_shifts, coverage_percentage } = coverage;
  const needsAttention = empty_shifts + understaffed_shifts;

  if (compact) {
    if (needsAttention === 0) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {coverage_percentage}%
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {needsAttention}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {empty_shifts > 0 && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{empty_shifts} empty</span>
        </div>
      )}
      {understaffed_shifts > 0 && (
        <div className="flex items-center gap-1 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span>{understaffed_shifts} understaffed</span>
        </div>
      )}
      {needsAttention === 0 && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All covered</span>
        </div>
      )}
      <div className="text-gray-500">
        {filled_shifts}/{total_shifts} shifts ({coverage_percentage}%)
      </div>
    </div>
  );
}

export type { CoverageStatus };
