'use client';

import { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Building2,
  Bell,
  Key,
  ChevronRight,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard, PageGuard } from '@/components/RoleGuard';
import { PERMISSIONS } from '@/lib/permissions';
import type { UserRole } from '@/types';
import {
  getAllRoles,
  getRoleLabel,
  getRoleBadgeColor,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
} from '@/lib/permissions';

type SettingsTab = 'users' | 'roles' | 'branches' | 'notifications' | 'security';

// Demo users for display
const DEMO_USERS = [
  {
    id: '1',
    email: 'gm@cspace.uz',
    name: 'Zuhriddin Mahmudov',
    role: 'general_manager' as UserRole,
    department: 'Administration',
    status: 'active',
    lastLogin: '2025-01-17T10:30:00Z',
  },
  {
    id: '2',
    email: 'ceo@cspace.uz',
    name: 'CEO User',
    role: 'ceo' as UserRole,
    department: 'Executive',
    status: 'active',
    lastLogin: '2025-01-16T14:20:00Z',
  },
  {
    id: '3',
    email: 'hr@cspace.uz',
    name: 'HR Manager',
    role: 'hr' as UserRole,
    department: 'Human Resources',
    status: 'active',
    lastLogin: '2025-01-17T09:15:00Z',
  },
  {
    id: '4',
    email: 'recruiter@cspace.uz',
    name: 'Recruiter User',
    role: 'recruiter' as UserRole,
    department: 'Human Resources',
    status: 'active',
    lastLogin: '2025-01-15T11:45:00Z',
  },
  {
    id: '5',
    email: 'employee@cspace.uz',
    name: 'Sample Employee',
    role: 'employee' as UserRole,
    department: 'Operations',
    status: 'inactive',
    lastLogin: '2025-01-10T08:00:00Z',
  },
];

export default function SettingsPage() {
  const { user, can, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof DEMO_USERS[0] | null>(null);

  const tabs = [
    { id: 'users' as const, name: 'Users', icon: Users, permission: PERMISSIONS.USERS_VIEW },
    { id: 'roles' as const, name: 'Roles & Permissions', icon: Shield, permission: PERMISSIONS.USERS_ASSIGN_ROLES },
    { id: 'branches' as const, name: 'Branch Settings', icon: Building2, permission: PERMISSIONS.BRANCHES_EDIT },
    { id: 'notifications' as const, name: 'Notifications', icon: Bell, permission: PERMISSIONS.SETTINGS_VIEW },
    { id: 'security' as const, name: 'Security', icon: Key, permission: PERMISSIONS.SETTINGS_EDIT },
  ];

  const filteredUsers = DEMO_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageGuard permission={PERMISSIONS.SETTINGS_VIEW}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and system configuration</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <RoleGuard key={tab.id} permission={tab.permission}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-purple-600' : 'text-gray-400'} />
                      {tab.name}
                      <ChevronRight
                        size={16}
                        className={`ml-auto ${isActive ? 'text-purple-600' : 'text-gray-300'}`}
                      />
                    </button>
                  </RoleGuard>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-gray-200">
                {/* Users Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                      <p className="text-sm text-gray-500">Manage system users and their access levels</p>
                    </div>
                    <RoleGuard permission={PERMISSIONS.USERS_CREATE}>
                      <button
                        onClick={() => setShowAddUserModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus size={18} />
                        Add User
                      </button>
                    </RoleGuard>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-700 font-medium">
                                  {u.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{u.name}</p>
                                <p className="text-sm text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                                u.role
                              )}`}
                            >
                              {getRoleLabel(u.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.department}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                u.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                              />
                              {u.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(u.lastLogin)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <RoleGuard permission={PERMISSIONS.USERS_EDIT}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(u);
                                    setShowEditUserModal(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Edit user"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <RoleGuard permission={PERMISSIONS.USERS_DELETE}>
                                  <button
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete user"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </RoleGuard>
                              </div>
                            </RoleGuard>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6">
                {/* Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAllRoles().map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                      className={`p-4 bg-white rounded-xl border text-left transition-all ${
                        selectedRole === role
                          ? 'border-purple-500 ring-2 ring-purple-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                            role
                          )}`}
                        >
                          {getRoleLabel(role)}
                        </span>
                        <Shield
                          size={20}
                          className={selectedRole === role ? 'text-purple-600' : 'text-gray-400'}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {ROLE_PERMISSIONS[role].length} permissions
                      </p>
                    </button>
                  ))}
                </div>

                {/* Permission Details */}
                {selectedRole && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getRoleLabel(selectedRole)} Permissions
                        </h3>
                        <p className="text-sm text-gray-500">
                          View permissions assigned to this role
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                          selectedRole
                        )}`}
                      >
                        {ROLE_PERMISSIONS[selectedRole].length} total
                      </span>
                    </div>

                    <div className="space-y-6">
                      {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => {
                        const rolePerms = ROLE_PERMISSIONS[selectedRole];
                        const hasAny = permissions.some((p) => rolePerms.includes(p.key));

                        if (!hasAny) return null;

                        return (
                          <div key={group}>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">{group}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {permissions.map((perm) => {
                                const hasPermission = rolePerms.includes(perm.key);
                                return (
                                  <div
                                    key={perm.key}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                      hasPermission
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-50 text-gray-400'
                                    }`}
                                  >
                                    {hasPermission ? (
                                      <Check size={16} className="text-green-600" />
                                    ) : (
                                      <X size={16} className="text-gray-300" />
                                    )}
                                    {perm.label}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'branches' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Branch Settings</h2>
                <p className="text-gray-500 mb-6">
                  Configure branch-specific settings and geofencing options.
                </p>
                <div className="text-center py-12 text-gray-500">
                  <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Branch settings are managed in the Branches section.</p>
                  <a href="/branches" className="text-purple-600 hover:underline mt-2 inline-block">
                    Go to Branches →
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h2>
                <p className="text-gray-500 mb-6">Configure how and when you receive notifications.</p>

                <div className="space-y-4">
                  {[
                    { label: 'Late arrival alerts', description: 'Get notified when employees arrive late' },
                    { label: 'Leave requests', description: 'Notifications for new leave requests' },
                    { label: 'Payroll reminders', description: 'Monthly payroll processing reminders' },
                    { label: 'Weekly reports', description: 'Automated weekly attendance summary' },
                  ].map((setting, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{setting.label}</p>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Security Settings</h2>
                <p className="text-gray-500 mb-6">Configure security and authentication options.</p>

                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">Session Timeout</h3>
                      <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                        <option>8 hours</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500">
                      Automatically log out after period of inactivity
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Password Requirements</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        Minimum 8 characters
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        At least one uppercase letter
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        At least one number
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="email@cspace.uz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    {getAllRoles().map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Human Resources"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={editingUser.name}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={editingUser.email}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    defaultValue={editingUser.role}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {getAllRoles().map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={editingUser.status}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageGuard>
  );
}
