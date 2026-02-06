import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/db/connection';

/**
 * POST /api/reception/operator-pin/bulk-assign
 *
 * Assigns random 6-digit PINs to employees.
 * By default, only assigns to employees without a PIN.
 * Pass { overwrite: true } to reassign PINs for ALL employees.
 *
 * PINs are unique within each branch.
 * Returns the generated PINs (plaintext) so the admin can distribute them.
 */
async function handler(
  request: Request,
  context: { user: { id: string; role: string; email: string } }
) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { error: 'method_not_allowed' },
      { status: 405 }
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'database_not_configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const overwrite = body.overwrite === true;
    const branchId = body.branchId; // optional: limit to one branch

    // Fetch employees
    let query = supabaseAdmin!
      .from('employees')
      .select('id, full_name, branch_id, operator_pin_hash')
      .eq('status', 'active');

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    if (!overwrite) {
      query = query.is('operator_pin_hash', null);
    }

    const { data: employees, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching employees for bulk PIN:', fetchError);
      return NextResponse.json(
        { error: 'fetch_failed', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No employees need PIN assignment',
        assigned: [],
        count: 0,
      });
    }

    // Group employees by branch to ensure per-branch uniqueness
    const employeesByBranch = new Map<string, typeof employees>();
    for (const emp of employees) {
      const bId = emp.branch_id;
      if (!employeesByBranch.has(bId)) {
        employeesByBranch.set(bId, []);
      }
      employeesByBranch.get(bId)!.push(emp);
    }

    // For each branch, get existing PINs to avoid duplicates
    const results: Array<{
      employeeId: string;
      employeeName: string;
      branchId: string;
      pin: string;
    }> = [];

    for (const [bId, branchEmployees] of employeesByBranch) {
      // Get all existing PIN hashes in this branch
      const { data: existingEmployees } = await supabaseAdmin!
        .from('employees')
        .select('id, operator_pin_hash')
        .eq('branch_id', bId)
        .not('operator_pin_hash', 'is', null);

      // Collect existing plaintext PINs is not possible (they're hashed),
      // so we track the new PINs we generate to avoid duplicates among new ones.
      // For existing PINs, we do a bcrypt compare check.
      const newPinsInBranch = new Set<string>();

      for (const emp of branchEmployees) {
        let pin: string;
        let isUnique = false;
        let attempts = 0;

        // Generate a unique 6-digit PIN for this branch
        do {
          pin = String(Math.floor(100000 + Math.random() * 900000));
          attempts++;

          // Check against other new PINs in this batch
          if (newPinsInBranch.has(pin)) {
            continue;
          }

          // Check against existing PINs in the branch (skip the employee's own)
          isUnique = true;
          if (existingEmployees) {
            for (const existing of existingEmployees) {
              // Skip the employee we're assigning to (if overwriting)
              if (existing.id === emp.id) continue;
              if (!existing.operator_pin_hash) continue;

              const match = await bcrypt.compare(pin, existing.operator_pin_hash);
              if (match) {
                isUnique = false;
                break;
              }
            }
          }
        } while (!isUnique && attempts < 50);

        if (!isUnique) {
          console.warn(`Could not generate unique PIN for employee ${emp.id} after 50 attempts`);
          continue;
        }

        // Hash and save
        const pinHash = await bcrypt.hash(pin, 10);
        const { error: updateError } = await supabaseAdmin!
          .from('employees')
          .update({ operator_pin_hash: pinHash })
          .eq('id', emp.id);

        if (updateError) {
          console.error(`Error setting PIN for employee ${emp.id}:`, updateError);
          continue;
        }

        newPinsInBranch.add(pin);
        results.push({
          employeeId: emp.id,
          employeeName: emp.full_name,
          branchId: bId,
          pin,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Assigned PINs to ${results.length} employees`,
      assigned: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Bulk PIN assignment error:', error);
    return NextResponse.json(
      { error: 'internal_server_error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler, { permission: PERMISSIONS.OPERATOR_PIN_MANAGE });
