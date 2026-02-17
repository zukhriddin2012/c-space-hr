'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Column {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

interface ExportCSVButtonProps {
  data: Record<string, unknown>[];
  columns: Column[];
  filename: string;
}

export default function ExportCSVButton({ data, columns, filename }: ExportCSVButtonProps) {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    if (data.length === 0) return;
    setExporting(true);

    try {
      // BOM marker for Excel UTF-8 compatibility
      const BOM = '\uFEFF';

      // Header row
      const header = columns.map(c => escapeCSV(c.label)).join(',');

      // Data rows
      const rows = data.map(row =>
        columns.map(col => {
          const value = row[col.key];
          if (col.format) return escapeCSV(col.format(value));
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return String(value); // Plain numbers, no escaping
          return escapeCSV(String(value));
        }).join(',')
      );

      const csvContent = BOM + header + '\n' + rows.join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0 || exporting}
      leftIcon={<Download size={14} />}
      className="border-green-300 text-green-700 hover:bg-green-50"
    >
      Export CSV
    </Button>
  );
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}
