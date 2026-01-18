'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Shield,
  Building2,
  Bell,
  Key,
  ChevronRight,
  Search,
  Edit2,
  Check,
  X,
  Loader2,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard, PageGuard } from '@/components/RoleGuard';
import { PERMISSIONS } from '@/lib/permissions';
import type { UserRole, Branch } from '@/types';
import {
  getAllRoles,
  getRoleLabel,
  getRoleBadgeColor,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
} from '@/lib/permissions';

type SettingsTab = 'users' | 'roles' | 'branches' | 'notifications' | 'security';

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  position?: string;
  department?: string;
  employeeId?: string;
}

export default function SettingsPage() {
  const { user, can, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('employee');
  const [editBranchId, setEditBranchId] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs = [
    { id: 'users' as const, name: 'User Roles', icon: Users, permission: PERMISSIONS.USERS_VIEW },
    { id: 'roles' as const, name: 'Roles & Permissions', icon: Shield, permission: PERMISSIONS.USERS_ASSIGN_ROLES },
    { id: 'branches' as const, name: 'Branch Settings', icon: Building2, permission: PERMISSIONS.BRANCHES_EDIT },
    { id: 'notifications' as const, name: 'Notifications', icon: Bell, permission: PERMISSIONS.SETTINGS_VIEW },
    { id: 'security' as const, name: 'Security', icon: Key, permission: PERMISSIONS.SETTINGS_EDIT },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (u: UserWithRole) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditBranchId(u.branchId || '');
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;

    // Validate branch manager has a branch
    if (editRole === 'branch_manager' && !editBranchId) {
      setMessage({ type: 'error', text: 'Please select a branch for the Branch Manager' });
      return;
    }

    try {
      setSaving(editingUser.id);
      const res = await fetch(`/api/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          branchId: editRole === 'branch_manager' ? editBranchId : undefined,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Role updated to ${getRoleLabel(editRole)}` });
        // Update local state
        setUsers(users.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                role: editRole,
                branchId: editRole === 'branch_manager' ? editBranchId : u.branchId,
                branchName: editRole === 'branch_manager'
                  ? branches.find(b => b.id === editBranchId)?.name
                  : u.branchName
              }
            : u
        ));
        setEditingUser(null);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.branchName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group users by role for easier management
  const usersByRole = filteredUsers.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {} as Record<UserRole, UserWithRole[]>);

  return (
    <PageGuard permission={PERMISSIONS.SETTINGS_VIEW}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and system configuration</p>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {message.text}
          </div>
        )}

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
                      <h2 className="text-lg font-semibold text-gray-900">User Role Management</h2>
                      <p className="text-sm text-gray-500">Assign roles to employees to control their access levels</p>
                    </div>
                    <button
                      onClick={fetchUsers}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, role, or branch..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Role Summary */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {getAllRoles().map(role => {
                      const count = usersByRole[role]?.length || 0;
                      return (
                        <button
                          key={role}
                          onClick={() => setSearchQuery(role)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            searchQuery === role
                              ? 'bg-purple-100 border-purple-300 text-purple-700'
                              : getRoleBadgeColor(role)
                          }`}
                        >
                          {getRoleLabel(role)}
                          <span className="px-1.5 py-0.5 bg-white/50 rounded-full text-xs font-medium">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} />
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Users Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              {searchQuery ? 'No users match your search' : 'No users found'}
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
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
                              <td className="px-6 py-4">
                                {u.branchName ? (
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <MapPin size={14} className="text-gray-400" />
                                    {u.branchName}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {u.position || '-'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <RoleGuard permission={PERMISSIONS.USERS_ASSIGN_ROLES}>
                                  <button
                                    onClick={() => handleEditRole(u)}
                                    disabled={saving === u.id}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    {saving === u.id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <Edit2 size={14} />
                                    )}
                                    Change Role
                                  </button>
                                </RoleGuard>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
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

        {/* Edit Role Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change User Role</h3>

              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-700 font-medium">
                      {editingUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{editingUser.name}</p>
                    <p className="text-sm text-gray-500">{editingUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                  <div className="space-y-2">
                    {getAllRoles().map(role => (
                      <label
                        key={role}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          editRole === role
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={editRole === role}
                          onChange={(e) => setEditRole(e.target.value as UserRole)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}>
                            {getRoleLabel(role)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Branch Selection for Branch Manager */}
                {editRole === 'branch_manager' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editBranchId}
                      onChange={(e) => setEditBranchId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a branch...</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Branch Manager can only view and manage employees in their assigned branch.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  disabled={saving !== null || (editRole === 'branch_manager' && !editBranchId)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageGuard>
  );
}
