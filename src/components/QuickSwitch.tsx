'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, X, ChevronRight, Search, Loader2, Shield, Building2 } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  position: string;
  branch: string;
}

// Role badge colors
const roleColors: Record<string, { bg: string; text: string }> = {
  'general_manager': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'ceo': { bg: 'bg-red-100', text: 'text-red-700' },
  'hr': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'branch_manager': { bg: 'bg-green-100', text: 'text-green-700' },
  'community_manager': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'recruiter': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'night_shift': { bg: 'bg-slate-100', text: 'text-slate-700' },
  'accountant': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'employee': { bg: 'bg-gray-100', text: 'text-gray-700' },
};

// Role display names
const roleNames: Record<string, string> = {
  'general_manager': 'General Manager',
  'ceo': 'CEO',
  'hr': 'HR',
  'branch_manager': 'Branch Manager',
  'community_manager': 'Community Manager',
  'recruiter': 'Recruiter',
  'night_shift': 'Night Shift',
  'accountant': 'Accountant',
  'employee': 'Employee',
};

export default function QuickSwitch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [initialCheck, setInitialCheck] = useState(false);

  // Check if test mode is enabled on mount
  useEffect(() => {
    fetch('/api/test-accounts')
      .then(res => res.json())
      .then(data => {
        console.log('[QuickSwitch] API response:', data);
        setEnabled(data.enabled === true);
        setAccounts(data.accounts || []);
        setInitialCheck(true);
      })
      .catch((err) => {
        console.error('[QuickSwitch] Failed to fetch:', err);
        setInitialCheck(true);
      });
  }, []);

  useEffect(() => {
    // Fetch accounts when panel opens
    if (isOpen && accounts.length === 0) {
      fetchAccounts();
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test-accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setEnabled(data.enabled);
    } catch (err) {
      console.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const switchTo = async (account: Account) => {
    setSwitching(account.id);
    try {
      // First logout
      await fetch('/api/auth/logout', { method: 'POST' });

      // Then login as new user
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: account.password }),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Switch failed');
    } finally {
      setSwitching(null);
    }
  };

  // Filter accounts by search
  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase()) ||
    a.branch.toLowerCase().includes(search.toLowerCase()) ||
    a.position.toLowerCase().includes(search.toLowerCase())
  );

  // Group by role
  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    const role = account.role || 'employee';
    if (!acc[role]) acc[role] = [];
    acc[role].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  // Don't render until we've checked if test mode is enabled
  if (!initialCheck || !enabled) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
        title="Quick Switch Account"
      >
        <Users size={24} />
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Quick Switch
        </span>
      </button>

      {/* Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <Users size={24} />
                <div>
                  <h2 className="font-semibold text-lg">Quick Switch</h2>
                  <p className="text-purple-200 text-sm">Test different accounts</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, role, branch..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Account List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-purple-600" />
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No accounts found</p>
                </div>
              ) : (
                <div className="p-2">
                  {Object.entries(groupedAccounts).map(([role, roleAccounts]) => (
                    <div key={role} className="mb-4">
                      {/* Role Header */}
                      <div className="flex items-center gap-2 px-3 py-2 sticky top-0 bg-gray-50 rounded-lg mb-1">
                        <Shield size={14} className="text-gray-500" />
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          {roleNames[role] || role}
                        </span>
                        <span className="text-xs text-gray-400">({roleAccounts.length})</span>
                      </div>

                      {/* Accounts in this role */}
                      {roleAccounts.map((account) => {
                        const colors = roleColors[account.role] || roleColors['employee'];
                        return (
                          <button
                            key={account.id}
                            onClick={() => switchTo(account)}
                            disabled={switching !== null}
                            className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors text-left group disabled:opacity-50"
                          >
                            {/* Avatar */}
                            <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <span className={`font-semibold ${colors.text}`}>
                                {account.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{account.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="truncate">{account.position}</span>
                                {account.branch && account.branch !== 'No branch' && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 truncate">
                                      <Building2 size={10} />
                                      {account.branch}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Action */}
                            {switching === account.id ? (
                              <Loader2 size={18} className="animate-spin text-purple-600" />
                            ) : (
                              <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-600 transition-colors" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Development mode only. Click any account to switch instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
