'use client';

import React, { useState, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { ShiftPlanningGrid } from '@/components/shifts';
import { Modal } from '@/components/ui';

interface ShiftsPageClientProps {
  branchFilter?: string;
  canEdit: boolean;
  canPublish: boolean;
}

interface AssignmentModalState {
  open: boolean;
  branchId: string;
  date: string;
  shiftType: 'day' | 'night';
}

export default function ShiftsPageClient({
  branchFilter,
  canEdit,
  canPublish,
}: ShiftsPageClientProps) {
  const [assignmentModal, setAssignmentModal] = useState<AssignmentModalState>({
    open: false,
    branchId: '',
    date: '',
    shiftType: 'day',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAssignmentAdd = useCallback((branchId: string, date: string, shiftType: 'day' | 'night') => {
    setAssignmentModal({
      open: true,
      branchId,
      date,
      shiftType,
    });
  }, []);

  const handleAssignmentRemove = useCallback(async (assignmentId: string) => {
    if (!confirm('Remove this assignment?')) return;

    try {
      const res = await fetch(`/api/shifts/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRefreshKey((k) => k + 1);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove assignment');
      }
    } catch (err) {
      alert('Failed to remove assignment');
    }
  }, []);

  const handlePublish = useCallback((scheduleId: string) => {
    // Refresh grid after publish
    setRefreshKey((k) => k + 1);
  }, []);

  const closeModal = () => {
    setAssignmentModal((s) => ({ ...s, open: false }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Calendar className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Planning</h1>
          <p className="text-sm text-gray-500">
            {branchFilter ? 'Manage your branch schedule' : 'Plan and manage shifts across all branches'}
          </p>
        </div>
      </div>

      {/* Grid */}
      <ShiftPlanningGrid
        key={refreshKey}
        branchFilter={branchFilter}
        readonly={!canEdit}
        onAssignmentAdd={canEdit ? handleAssignmentAdd : undefined}
        onAssignmentRemove={canEdit ? handleAssignmentRemove : undefined}
        onPublish={canPublish ? handlePublish : undefined}
      />

      {/* Assignment Modal (placeholder - will be implemented in T032) */}
      <Modal
        isOpen={assignmentModal.open}
        onClose={closeModal}
        title="Assign Employee"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Assigning to: <strong>{assignmentModal.branchId}</strong> on{' '}
            <strong>{assignmentModal.date}</strong> ({assignmentModal.shiftType} shift)
          </p>
          <p className="text-sm text-gray-500">
            Employee selector will be implemented in T032.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
