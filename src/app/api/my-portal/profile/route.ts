import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// PUT /api/my-portal/profile - Update own profile (self-service)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { employeeId, phone, email } = body;

    // First, verify this employee belongs to the logged-in user
    const { data: employee, error: fetchError } = await supabaseAdmin!
      .from('employees')
      .select('id, email')
      .eq('id', employeeId)
      .single();

    if (fetchError || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Security check: ensure user can only edit their own profile
    if (employee.email !== user.email) {
      return NextResponse.json({ error: 'You can only edit your own profile' }, { status: 403 });
    }

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      // Check if email is already taken by another employee
      const { data: existingEmail } = await supabaseAdmin!
        .from('employees')
        .select('id')
        .eq('email', email)
        .neq('id', employeeId)
        .single();

      if (existingEmail) {
        return NextResponse.json({ error: 'Email is already in use by another employee' }, { status: 400 });
      }
    }

    // Only allow updating specific fields (phone, email)
    // Other fields like name, position, salary, branch require HR access
    const updates: Record<string, string | null> = {};

    if (phone !== undefined) {
      updates.phone = phone?.trim() || null;
    }

    if (email !== undefined) {
      updates.email = email?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update the employee record
    const { data: updatedEmployee, error: updateError } = await supabaseAdmin!
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
