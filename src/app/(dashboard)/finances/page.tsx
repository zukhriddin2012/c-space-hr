'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Upload,
  RefreshCw,
  Building2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
}

interface BranchStats {
  branchId: string;
  branchName: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  pendingApprovals: number;
}

interface UserInfo {
  role: string;
  branchId?: string;
}

// Format currency in UZS
function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toLocaleString();
}

export default function FinancesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // Fetch user info and branches
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);

          // If branch manager, redirect to their branch's finance page
          if (userData.user.role === 'branch_manager' && userData.user.branchId) {
            router.replace(`/branches/${userData.user.branchId}/finances`);
            return;
          }
        }

        // Fetch all branches for CEO/GM/reports_manager
        const branchesRes = await fetch('/api/branches');
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData.branches || []);

          // Fetch stats for each branch
          const statsPromises = (branchesData.branches || []).map(async (branch: Branch) => {
            const statsRes = await fetch(`/api/finances/dashboard?branchId=${branch.id}`);
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              return {
                branchId: branch.id,
                branchName: branch.name,
                totalRevenue: statsData.stats?.totalRevenue || 0,
                totalExpenses: statsData.stats?.totalExpenses || 0,
                netProfit: statsData.stats?.netProfit || 0,
                transactionCount: statsData.stats?.transactionCount || 0,
                pendingApprovals: statsData.stats?.pendingApprovals || 0,
              };
            }
            return {
              branchId: branch.id,
              branchName: branch.name,
              totalRevenue: 0,
              totalExpenses: 0,
              netProfit: 0,
              transactionCount: 0,
              pendingApprovals: 0,
            };
          });

          const stats = await Promise.all(statsPromises);
          setBranchStats(stats);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Calculate totals
  const totalRevenue = branchStats.reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalExpenses = branchStats.reduce((sum, b) => sum + b.totalExpenses, 0);
  const totalNetProfit = branchStats.reduce((sum, b) => sum + b.netProfit, 0);
  const totalTransactions = branchStats.reduce((sum, b) => sum + b.transactionCount, 0);
  const totalPendingApprovals = branchStats.reduce((sum, b) => sum + b.pendingApprovals, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
          <p className="text-sm text-gray-500">
            Overview of all branch finances • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Company-wide KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Revenue</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-gray-400 mt-1">All branches</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Expenses</span>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-xs text-gray-400 mt-1">All branches</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Net Profit</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${totalNetProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(totalNetProfit)}
          </div>
          <div className="text-xs text-gray-400 mt-1">This month</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Transactions</span>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {totalTransactions.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">This month</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending</span>
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {totalPendingApprovals}
          </div>
          <div className="text-xs text-gray-400 mt-1">Awaiting approval</div>
        </div>
      </div>

      {/* Branch Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Branch Finances</h2>
          <Link
            href="/finances/transactions"
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            View All Transactions
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchStats
            .filter(b => b.transactionCount > 0 || b.totalRevenue > 0)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .map((branch) => (
              <Link
                key={branch.branchId}
                href={`/branches/${branch.branchId}/finances`}
                className="bg-white rounded-xl p-5 shadow-sm border hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {branch.branchName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {branch.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {formatCurrency(branch.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expenses</p>
                    <p className="text-sm font-semibold text-red-600 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" />
                      {formatCurrency(branch.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Net</p>
                    <p className={`text-sm font-semibold ${branch.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(branch.netProfit)}
                    </p>
                  </div>
                </div>

                {branch.pendingApprovals > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      {branch.pendingApprovals} pending approval{branch.pendingApprovals > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </Link>
            ))}

          {/* Empty branches */}
          {branchStats.filter(b => b.transactionCount === 0 && b.totalRevenue === 0).length > 0 && (
            <div className="col-span-full">
              <p className="text-sm text-gray-500 mb-3">Branches without data:</p>
              <div className="flex flex-wrap gap-2">
                {branchStats
                  .filter(b => b.transactionCount === 0 && b.totalRevenue === 0)
                  .map((branch) => (
                    <Link
                      key={branch.branchId}
                      href={`/branches/${branch.branchId}/finances`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                    >
                      {branch.branchName}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
