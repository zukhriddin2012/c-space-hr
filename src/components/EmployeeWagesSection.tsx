'use client';

import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface LegalEntity {
  id: string;
  name: string;
  short_name: string | null;
  inn: string | null;
  branch_id: string | null;
}

interface EmployeeWage {
  id: string;
  employee_id: string;
  legal_entity_id: string;
  wage_amount: number;
  wage_type: 'official' | 'bonus' | 'additional';
  notes: string | null;
  is_active: boolean;
  legal_entities?: LegalEntity;
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
  const [wages, setWages] = useState<EmployeeWage[]>([]);
  const [total, setTotal] = useState(0);
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Wage Distribution</h3>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Legal Entity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {wages.map((wage) => (
                <tr key={wage.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {wage.legal_entities?.short_name || wage.legal_entities?.name || wage.legal_entity_id}
                    </p>
                    {wage.legal_entities?.inn && (
                      <p className="text-xs text-gray-500">INN: {wage.legal_entities.inn}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      wage.wage_type === 'official'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {wage.wage_type === 'official' ? 'Official' : 'Additional'}
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
