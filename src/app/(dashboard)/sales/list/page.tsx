'use client';

import { Table } from 'lucide-react';

export default function SalesListPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Table size={48} className="mb-4" />
      <h2 className="text-lg font-medium text-gray-600">Lead List</h2>
      <p className="text-sm mt-1">Table view coming in CSC-009</p>
    </div>
  );
}
