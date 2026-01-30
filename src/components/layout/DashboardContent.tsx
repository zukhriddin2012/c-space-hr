'use client';

import { X } from 'lucide-react';
import { useReceptionMode } from '@/contexts/ReceptionModeContext';

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { isReceptionMode, setReceptionMode } = useReceptionMode();

  if (isReceptionMode) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
        {/* Exit Button */}
        <button
          onClick={() => setReceptionMode(false)}
          className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          title="Exit Reception Mode"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Reception Mode</h1>
          <p className="text-gray-400 mb-8">Coming soon...</p>
          <button
            onClick={() => setReceptionMode(false)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Exit Reception Mode
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
