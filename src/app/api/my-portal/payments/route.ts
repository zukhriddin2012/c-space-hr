import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getEmployeePaymentHistory, getEmployeeByEmail } from '@/lib/db';

// GET /api/my-portal/payments - Get employee's payment history
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up the employee by email since employeeId may not be in the session
    const employee = await getEmployeeByEmail(user.email);
    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    const { payments, pending } = await getEmployeePaymentHistory(employee.id);

    return NextResponse.json({
      payments,
      pending,
    });
  } catch (error) {
    console.error('Error fetching employee payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
