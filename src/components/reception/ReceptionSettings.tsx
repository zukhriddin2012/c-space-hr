'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Package, Wallet, CreditCard, Plus, Pencil, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import type { ServiceType, ExpenseType, PaymentMethodConfig } from '@/modules/reception/types';

type Tab = 'services' | 'expenses' | 'payments';

export default function ReceptionSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ServiceType | ExpenseType | PaymentMethodConfig | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', icon: '📦', requiresCode: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [servicesRes, expensesRes, paymentsRes] = await Promise.all([
          fetch('/api/reception/admin/service-types'),
          fetch('/api/reception/admin/expense-types'),
          fetch('/api/reception/admin/payment-methods'),
        ]);
        if (servicesRes.ok) setServiceTypes(await servicesRes.json());
        if (expensesRes.ok) setExpenseTypes(await expensesRes.json());
        if (paymentsRes.ok) setPaymentMethods(await paymentsRes.json());
      } catch {
        console.error('Failed to fetch settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEndpoint = () => {
    switch (activeTab) {
      case 'services': return '/api/reception/admin/service-types';
      case 'expenses': return '/api/reception/admin/expense-types';
      case 'payments': return '/api/reception/admin/payment-methods';
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'services': return serviceTypes;
      case 'expenses': return expenseTypes;
      case 'payments': return paymentMethods;
    }
  };

  const refreshData = async () => {
    const response = await fetch(getEndpoint());
    if (response.ok) {
      const data = await response.json();
      switch (activeTab) {
        case 'services': setServiceTypes(data); break;
        case 'expenses': setExpenseTypes(data); break;
        case 'payments': setPaymentMethods(data); break;
      }
    }
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({ name: '', code: '', icon: '📦', requiresCode: false });
    setShowModal(true);
  };

  const handleEdit = (item: ServiceType | ExpenseType | PaymentMethodConfig) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      icon: item.icon || '📦',
      requiresCode: 'requiresCode' in item ? item.requiresCode : false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = editItem ? `${getEndpoint()}/${editItem.id}` : getEndpoint();
      const method = editItem ? 'PATCH' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save');
      setShowModal(false);
      refreshData();
    } catch {
      console.error('Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: ServiceType | ExpenseType | PaymentMethodConfig) => {
    try {
      await fetch(`${getEndpoint()}/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      refreshData();
    } catch {
      console.error('Failed to toggle');
    }
  };

  const tabs = [
    { id: 'services' as const, label: 'Service Types', icon: Package },
    { id: 'expenses' as const, label: 'Expense Types', icon: Wallet },
    { id: 'payments' as const, label: 'Payment Methods', icon: CreditCard },
  ];

  const emojiList = ['📦', '👥', '🪑', '🗓️', '🎤', '🏢', '🖥️', '🔄', '📅', '📆', '🎓', '🛒', '⚡', '👷', '🧾', '🔧', '📢', '🏗️', '❤️', '💵', '📱', '🖱️', '🍇', '💳', '🏦'];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600" />
          Settings
        </h1>
        <p className="text-gray-500">Configure service types, expense categories, and payment methods</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">
            {activeTab === 'services' && 'Service Types'}
            {activeTab === 'expenses' && 'Expense Types'}
            {activeTab === 'payments' && 'Payment Methods'}
          </h3>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add New
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {getCurrentItems().map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.isActive ? 'success' : 'default'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {getCurrentItems().length === 0 && (
              <p className="text-center text-gray-500 py-8">No items yet</p>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Item' : 'Add New Item'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
            required
          />
          <Input
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
            placeholder="unique_code"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${
                    formData.icon === emoji
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 'payments' && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresCode}
                onChange={(e) => setFormData({ ...formData, requiresCode: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Requires transaction code</span>
            </label>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
