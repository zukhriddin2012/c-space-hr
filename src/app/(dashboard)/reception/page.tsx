'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Receipt, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/modules/reception/lib/constants';

interface DashboardStats {
  dateRange: { from: string; to: string };
  transactions: {
    total: number;
    count: number;
    byServiceType: { serviceTypeName: string; icon: string; amount: number; count: number }[];
    byPaymentMethod: { paymentMethodName: string; icon: string; amount: number; count: number }[];
  };
  expenses: {
    total: number;
    count: number;
    byCash: number;
    byBank: number;
    byExpenseType: { expenseTypeName: string; icon: string; amount: number; count: number }[];
  };
  netIncome: number;
  recentActivity: {
    type: 'transaction' | 'expense';
    id: string;
    number: string;
    title: string;
    subtitle: string;
    icon: string;
    amount: number;
    date: string;
  }[];
}

export default function ReceptionDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/reception/dashboard?dateFrom=${today}&dateTo=${today}`);

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchStats}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/reception/transactions">
          <Card className="hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4 p-2">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Plus className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Record Transaction</h3>
                <p className="text-sm text-gray-500">Record a new sale or service</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/reception/expenses">
          <Card className="hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4 p-2">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Log Expense</h3>
                <p className="text-sm text-gray-500">Record a business expense</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">Income</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.transactions.total || 0)}
            </p>
            <p className="text-xs text-gray-400">{stats?.transactions.count || 0} transactions</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.expenses.total || 0)}
            </p>
            <p className="text-xs text-gray-400">{stats?.expenses.count || 0} expenses</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Receipt className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">Net</span>
            </div>
            <p className={`text-2xl font-bold ${(stats?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats?.netIncome || 0)}
            </p>
            <p className="text-xs text-gray-400">Today's balance</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500">Cash</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats?.expenses.byCash || 0)}
            </p>
            <p className="text-xs text-gray-400">Cash expenses</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Service Type */}
        <Card title="Income by Service" noPadding>
          <div className="divide-y divide-gray-100">
            {stats?.transactions.byServiceType.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No transactions today</p>
            ) : (
              stats?.transactions.byServiceType.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.serviceTypeName}</p>
                      <p className="text-xs text-gray-500">{item.count} transactions</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">{formatCurrency(item.amount)}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* By Expense Type */}
        <Card title="Expenses by Type" noPadding>
          <div className="divide-y divide-gray-100">
            {stats?.expenses.byExpenseType.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No expenses today</p>
            ) : (
              stats?.expenses.byExpenseType.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.expenseTypeName}</p>
                      <p className="text-xs text-gray-500">{item.count} expenses</p>
                    </div>
                  </div>
                  <p className="font-semibold text-red-600">{formatCurrency(item.amount)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" noPadding>
        <div className="divide-y divide-gray-100">
          {stats?.recentActivity.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No activity today</p>
          ) : (
            stats?.recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'transaction' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.number} • {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold flex items-center gap-1 ${
                    item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.amount >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {formatCurrency(Math.abs(item.amount))}
                  </p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
