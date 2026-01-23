'use client';

import { useTranslation } from '@/contexts/LanguageContext';

interface EmployeesHeaderProps {
  totalEmployees: number;
  totalBudget: string;
  canViewSalary: boolean;
}

export default function EmployeesHeader({
  totalEmployees,
  totalBudget,
  canViewSalary,
}: EmployeesHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-4 lg:mb-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">{t.nav.employees}</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1">
          {totalEmployees} {t.employees.active}
          {canViewSalary && <span className="hidden sm:inline"> • {totalBudget}</span>}
        </p>
      </div>
    </div>
  );
}
