import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getTransactionsWithCount, createTransaction, FinanceTransaction, TransactionQueryOptions } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) {
      return NextResponse.json(
        { error: 'branchId is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this branch
    if (user.role === 'branch_manager' && user.branchId !== branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const options: TransactionQueryOptions = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      transactionType: searchParams.get('type') as 'revenue' | 'expense' | undefined,
      serviceType: searchParams.get('serviceType') || undefined,
      expenseCategory: searchParams.get('expenseCategory') || undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      approvalStatus: searchParams.get('approvalStatus') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = await getTransactionsWithCount(branchId, options);

    return NextResponse.json({
      transactions: result.transactions,
      total: result.total,
      totalRevenue: result.totalRevenue,
      totalExpenses: result.totalExpenses,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      branch_id,
      transaction_type,
      transaction_date,
      amount,
      service_type,
      customer_name,
      expense_category,
      vendor_name,
      payment_method,
      notes,
    } = body;

    // Validate required fields
    if (!branch_id || !transaction_type || !transaction_date || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: branch_id, transaction_type, transaction_date, amount' },
        { status: 400 }
      );
    }

    // Check branch access
    if (user.role === 'branch_manager' && user.branchId !== branch_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Determine approval status based on amount and role
    let approval_status: 'pending' | 'approved' = 'approved';

    if (transaction_type === 'expense') {
      // Get branch expense limit
      const { getBranchFinanceSettings } = await import('@/lib/db');
      const settings = await getBranchFinanceSettings(branch_id);
      const limit = settings?.expense_auto_approval_limit || 500000;

      // If expense exceeds limit and user is not CEO/super_admin, needs approval
      if (amount > limit && !['ceo', 'super_admin', 'chief_accountant'].includes(user.role)) {
        approval_status = 'pending';
      }
    }

    const transaction: Omit<FinanceTransaction, 'id' | 'created_at'> = {
      branch_id,
      transaction_type,
      transaction_date,
      amount,
      service_type: transaction_type === 'revenue' ? service_type : undefined,
      customer_name: transaction_type === 'revenue' ? customer_name : undefined,
      expense_category: transaction_type === 'expense' ? expense_category : undefined,
      vendor_name: transaction_type === 'expense' ? vendor_name : undefined,
      payment_method,
      processed_by: user.id,
      approval_status,
      notes,
    };

    const result = await createTransaction(transaction);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      requiresApproval: approval_status === 'pending',
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
