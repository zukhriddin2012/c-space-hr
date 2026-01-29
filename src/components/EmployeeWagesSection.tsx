'use client';

import { useState, useEffect } from 'react';
import { Building2, Banknote, Wallet } from 'lucide-react';

interface CombinedWage {
  id: string;
  employee_id: string;
  source_type: 'primary' | 'additional';
  source_id: string;
  source_name: string;
  source_inn?: string | null;
  wage_amount: number;
  wage_type: string;
  notes: string | null;
  is_active: boolean;
}

interface EmployeeWagesSectionProps {
  employeeId: string;
  canEdit: boolean;
}

function formatSalary(amount: number): string {
  if (!amount || amount === 0) return '-';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

export default function EmployeeWagesSection({ employeeId }: EmployeeWagesSectionProps) {
  const [wages, setWages] = useState<CombinedWage[]>([]);
  const [total, setTotal] = useState(0);
  const [primaryTotal, setPrimaryTotal] = useState(0);
  const [additionalTotal, setAdditionalTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch wages
  useEffect(() => {
    async function fetchWages() {
      try {
        const response = await fetch(`/api/employees/${employeeId}/wages`);
        if (response.ok) {
          const data = await response.json();
          setWages(data.wages || []);
          setTotal(data.total || 0);
          setPrimaryTotal(data.primaryTotal || 0);
          setAdditionalTotal(data.additionalTotal || 0);
        }
      } catch (err) {
        console.error('Error fetching wages:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWages();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Separate wages by type
  const primaryWages = wages.filter(w => w.source_type === 'primary');
  const additionalWages = wages.filter(w => w.source_type === 'additional');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Wage Distribution</h3>
        </div>
        {/* Summary badges */}
        {wages.length > 0 && (
          <div className="flex items-center gap-3">
            {primaryTotal > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Banknote size={14} className="text-blue-500" />
                <span className="text-gray-500">Primary:</span>
                <span className="font-semibold text-blue-600">{formatSalary(primaryTotal)}</span>
              </div>
            )}
            {additionalTotal > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Wallet size={14} className="text-green-500" />
                <span className="text-gray-500">Additional:</span>
                <span className="font-semibold text-green-600">{formatSalary(additionalTotal)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wages Table */}
      {wages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Building2 size={40} className="mx-auto mb-2 text-gray-300" />
          <p>No wage entries configured</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Primary wages first */}
              {primaryWages.map((wage) => (
                <tr key={wage.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Banknote size={16} className="text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{wage.source_name}</p>
                        {wage.source_inn && (
                          <p className="text-xs text-gray-500">INN: {wage.source_inn}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      <Banknote size={12} />
                      Primary (Bank)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatSalary(wage.wage_amount)}
                  </td>
                </tr>
              ))}
              {/* Additional wages */}
              {additionalWages.map((wage) => (
                <tr key={wage.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">{wage.source_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                      <Wallet size={12} />
                      Additional (Cash)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatSalary(wage.wage_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-purple-50 border-t border-purple-100">
                <td colSpan={2} className="px-4 py-3 font-semibold text-purple-700">Total Monthly</td>
                <td className="px-4 py-3 text-right font-bold text-purple-700 text-lg">
                  {formatSalary(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Hint for editing */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        To modify wages, use the &quot;Edit Employee&quot; button above
      </p>
    </div>
  );
}
