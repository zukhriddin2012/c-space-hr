'use client';

import { AlertTriangle } from 'lucide-react';

interface TestBannerProps {
  isTestEnv: boolean;
}

export default function TestBanner({ isTestEnv }: TestBannerProps) {
  if (!isTestEnv) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertTriangle size={16} />
      <span>TEST ENVIRONMENT - Data may be reset at any time</span>
    </div>
  );
}
