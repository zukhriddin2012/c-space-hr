import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// POST /api/payroll/process - Process payroll for a month
export const POST = withAuth(async (request: NextRequest) => {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { year, month } = await request.json();

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get all employee wages to create/update payslips
    const { data: wages, error: wagesError } = await supabaseAdmin!
      .from('employee_wages')
      .select('employee_id, wage_amount, legal_entity_id')
      .eq('is_active', true);

    if (wagesError) {
      console.error('Error fetching wages:', wagesError);
      return NextResponse.json({ error: 'Failed to fetch wage data' }, { status: 500 });
    }

    if (!wages || wages.length === 0) {
      return NextResponse.json({ error: 'No wage data found' }, { status: 400 });
    }

    // Get existing payslips for this month
    const { data: existingPayslips, error: payslipsError } = await supabaseAdmin!
      .from('payslips')
      .select('id, employee_id, status')
      .eq('year', year)
      .eq('month', month);

    if (payslipsError) {
      console.error('Error fetching payslips:', payslipsError);
    }

    const existingMap = new Map((existingPayslips || []).map(p => [p.employee_id, p]));

    let created = 0;
    let approved = 0;
    let paid = 0;

    for (const wage of wages) {
      const existing = existingMap.get(wage.employee_id);
      const netSalary = wage.wage_amount;
      const grossSalary = Math.round(netSalary * 1.12);
      const deductions = Math.round(netSalary * 0.12);

      if (existing) {
        // Update existing payslip
        if (existing.status === 'draft') {
          // Draft -> Approved
          await supabaseAdmin!
            .from('payslips')
            .update({ status: 'approved' })
            .eq('id', existing.id);
          approved++;
        } else if (existing.status === 'approved') {
          // Approved -> Paid
          await supabaseAdmin!
            .from('payslips')
            .update({
              status: 'paid',
              payment_date: today,
            })
            .eq('id', existing.id);
          paid++;
        }
        // Already paid - skip
      } else {
        // Create new payslip as approved
        const { error: insertError } = await supabaseAdmin!
          .from('payslips')
          .insert({
            employee_id: wage.employee_id,
            year,
            month,
            base_salary: grossSalary,
            bonuses: 0,
            deductions: deductions,
            net_salary: netSalary,
            status: 'approved',
          });

        if (!insertError) {
          created++;
        } else {
          console.error('Error creating payslip:', insertError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payroll processed: ${created} created, ${approved} approved, ${paid} marked as paid`,
      stats: { created, approved, paid },
    });
  } catch (error) {
    console.error('Error processing payroll:', error);
    return NextResponse.json({ error: 'Failed to process payroll' }, { status: 500 });
  }
}, { permission: PERMISSIONS.PAYROLL_PROCESS });
