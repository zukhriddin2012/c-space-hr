'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  DollarSign,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  X,
  Crown,
} from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
  level: string;
  email: string | null;
  phone: string | null;
  status: string;
  salary: number | null;
  branches?: { name: string };
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string;
  manager_id: string | null;
  manager?: { id: string; full_name: string; position: string };
  employee_count: number;
  total_budget: number;
}

function formatSalary(amount: number): string {
  if (!amount || amount === 0) return '-';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function formatBudget(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M UZS`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K UZS`;
  }
  return `${amount.toLocaleString()} UZS`;
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    params.then(p => setDepartmentId(p.id));
  }, [params]);

  useEffect(() => {
    if (!departmentId) return;

    async function fetchData() {
      try {
        const [deptRes, empRes] = await Promise.all([
          fetch(`/api/departments/${departmentId}`),
          fetch(`/api/departments/${departmentId}?include=employees`),
        ]);

        if (!deptRes.ok) {
          throw new Error('Department not found');
        }

        const deptData = await deptRes.json();
        setDepartment(deptData);

        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load department');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [departmentId]);

  const handleDelete = async () => {
    if (!departmentId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/departments/${departmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete department');
      }

      router.push('/departments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{error || 'Department not found'}</p>
          <Link href="/departments" className="text-purple-600 hover:underline">
            Back to Departments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/departments"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${department.color} rounded-xl flex items-center justify-center`}>
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
              <p className="text-gray-500">{department.description || 'No description'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/departments?edit=${department.id}`}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit size={16} />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-sm text-gray-500">Employees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatBudget(department.total_budget)}</p>
              <p className="text-sm text-gray-500">Monthly Budget</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Crown size={20} className="text-purple-600" />
            </div>
            <div>
              {department.manager ? (
                <>
                  <p className="text-lg font-semibold text-gray-900">{department.manager.full_name}</p>
                  <p className="text-sm text-gray-500">Department Manager</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-400">Not assigned</p>
                  <p className="text-sm text-gray-500">Department Manager</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Department Employees ({employees.length})
          </h2>
          <Link
            href="/employees?department=new"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <UserPlus size={16} />
            Add Employee
          </Link>
        </div>

        {employees.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No employees in this department</p>
            <p className="text-sm text-gray-400 mt-1">
              Assign employees from the employee edit page
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {employees.map((emp) => (
              <Link
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {emp.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{emp.full_name}</p>
                      {department.manager?.id === emp.id && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          Manager
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{emp.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {emp.email && (
                    <span className="hidden sm:flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" />
                      {emp.email}
                    </span>
                  )}
                  {emp.phone && (
                    <span className="hidden md:flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" />
                      {emp.phone}
                    </span>
                  )}
                  {emp.branches?.name && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      {emp.branches.name}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    emp.status === 'active' ? 'bg-green-100 text-green-700' :
                    emp.status === 'probation' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {emp.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Department</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{department.name}</strong>?
              {employees.length > 0 && (
                <span className="block mt-2 text-amber-600">
                  {employees.length} employee(s) will be unassigned from this department.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
