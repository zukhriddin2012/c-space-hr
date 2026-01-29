import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';

interface SalaryRecord {
  employee_name: string;
  employee_id?: string;
  year: number;
  month: number;
  advance_bank: number;
  advance_naqd: number;
  salary_bank: number;
  salary_naqd: number;
  total: number;
  legal_entity_id?: string;
  branch?: string;
  notes?: string;
}

// POST /api/admin/import-salary-history - Import historical salary data
export const POST = withAuth(async (request: NextRequest) => {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { records } = body as { records: SalaryRecord[] };

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    // Get employee IDs from employee_id codes
    const employeeCodes = records
      .map(r => r.employee_id)
      .filter((id): id is string => !!id);

    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, employee_id, full_name')
      .in('employee_id', employeeCodes);

    if (empError) {
      console.error('Error fetching employees:', empError);
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }

    const employeeMap = new Map(employees?.map(e => [e.employee_id, e.id]) || []);

    // Prepare payslip records
    const payslipRecords = records
      .filter(r => r.employee_id && employeeMap.has(r.employee_id))
      .map(record => {
        const employeeUuid = employeeMap.get(record.employee_id!);
        return {
          employee_id: employeeUuid,
          legal_entity_id: record.legal_entity_id || 'cspace-hq',
          year: record.year,
          month: record.month,
          gross_salary: record.total,
          net_salary: record.total, // Assuming no deductions for historical data
          deductions: 0,
          bonuses: 0,
          advance_bank: record.advance_bank || 0,
          advance_naqd: record.advance_naqd || 0,
          salary_bank: record.salary_bank || 0,
          salary_naqd: record.salary_naqd || 0,
          working_days: 0, // Not tracked in historical data
          worked_days: 0,
          status: 'paid',
          notes: record.notes || `Historical import: ${record.branch || ''}`,
        };
      });

    if (payslipRecords.length === 0) {
      return NextResponse.json({ error: 'No valid records to import' }, { status: 400 });
    }

    // Deduplicate records within the import (keep last occurrence for each employee+year+month)
    const deduplicatedMap = new Map<string, typeof payslipRecords[0]>();
    for (const record of payslipRecords) {
      const key = `${record.employee_id}-${record.year}-${record.month}`;
      deduplicatedMap.set(key, record);
    }
    const uniqueRecords = Array.from(deduplicatedMap.values());

    // Use upsert to handle duplicates (update on conflict)
    const { data: upserted, error: upsertError } = await supabase
      .from('payslips')
      .upsert(uniqueRecords, {
        onConflict: 'employee_id,year,month',
        ignoreDuplicates: false, // Update existing records
      })
      .select();

    if (upsertError) {
      console.error('Error upserting payslips:', upsertError);
      return NextResponse.json({ error: 'Failed to import payslips: ' + upsertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Salary history imported successfully',
      imported: upserted?.length || 0,
      duplicatesInFile: payslipRecords.length - uniqueRecords.length,
    });
  } catch (error) {
    console.error('Error importing salary history:', error);
    return NextResponse.json({ error: 'Failed to import salary history' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT_SALARY });
