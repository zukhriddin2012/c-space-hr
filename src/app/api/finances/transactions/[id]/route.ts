import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/db/connection';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single transaction
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: transaction, error } = await supabaseAdmin!
      .from('finance_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check branch access for branch managers
    if (user.role === 'branch_manager' && user.branchId !== transaction.branch_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

// PATCH - Update transaction
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // First fetch the existing transaction
    const { data: existingTxn, error: fetchError } = await supabaseAdmin!
      .from('finance_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTxn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check branch access for branch managers
    if (user.role === 'branch_manager' && user.branchId !== existingTxn.branch_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only certain roles can approve transactions
    if (body.approval_status === 'approved' && existingTxn.approval_status !== 'approved') {
      const canApprove = ['ceo', 'general_manager', 'chief_accountant', 'accountant'].includes(user.role);
      if (!canApprove) {
        return NextResponse.json({ error: 'Not authorized to approve transactions' }, { status: 403 });
      }
      body.approved_by = user.id;
    }

    // Build update object - only include provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'transaction_type',
      'transaction_date',
      'amount',
      'service_type',
      'customer_name',
      'expense_category',
      'vendor_name',
      'payment_method',
      'notes',
      'approval_status',
      'approved_by',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: transaction, error } = await supabaseAdmin!
      .from('finance_transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE - Delete transaction
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // First fetch the existing transaction
    const { data: existingTxn, error: fetchError } = await supabaseAdmin!
      .from('finance_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTxn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check branch access for branch managers
    if (user.role === 'branch_manager' && user.branchId !== existingTxn.branch_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only certain roles can delete approved transactions
    if (existingTxn.approval_status === 'approved') {
      const canDeleteApproved = ['ceo', 'general_manager', 'chief_accountant'].includes(user.role);
      if (!canDeleteApproved) {
        return NextResponse.json({ error: 'Not authorized to delete approved transactions' }, { status: 403 });
      }
    }

    const { error } = await supabaseAdmin!
      .from('finance_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
