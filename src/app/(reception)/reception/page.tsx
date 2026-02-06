'use client';

import { useState, useEffect } from 'react';
import { KioskPasswordGate } from '@/components/reception/KioskPasswordGate';
import { StandaloneReceptionUI } from '@/components/reception/StandaloneReceptionUI';

interface KioskSession {
  branchId: string;
  branchName: string;
  expiresAt: string;
}

export default function ReceptionKioskPage() {
  const [session, setSession] = useState<KioskSession | null>(null);
  const [checking, setChecking] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/reception/kiosk/session');
      const data = await response.json();

      if (data.valid) {
        setSession({
          branchId: data.branchId,
          branchName: data.branchName,
          expiresAt: data.expiresAt,
        });
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleAuthenticated = (branchId: string, branchName: string, expiresAt: string) => {
    setSession({ branchId, branchName, expiresAt });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/reception/kiosk/logout', { method: 'POST' });
    } catch {
      // Ignore errors
    }
    setSession(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <KioskPasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <StandaloneReceptionUI
      branchId={session.branchId}
      branchName={session.branchName}
      expiresAt={session.expiresAt}
      onLogout={handleLogout}
    />
  );
}
