import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { validateBranchAccess, parsePagination, escapeIlike, MAX_LENGTH } from '@/lib/security';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/db/connection';
import type { User } from '@/types';

// ============================================
// GET /api/reception/accounting-requests
// List accounting requests for a branch (reception view)
// ============================================
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const searchParams = request.nextUrl.searchParams;

    // H-02: Validate branch access
    const branchAccess = validateBranchAccess(
      user as User,
      searchParams.get('branchId'),
      PERMISSIONS.ACCOUNTING_REQUESTS_VIEW_ALL
    );
    if (branchAccess.error) {
      return NextResponse.json({ error: branchAccess.error }, { status: branchAccess.status });
    }

    // M-02: Safe pagination
    const { page, pageSize } = parsePagination(
      searchParams.get('page'),
      searchParams.get('pageSize') || searchParams.get('limit')
    );

    // Parse filters
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    const rawSearch = searchParams.get('search');
    const search = rawSearch ? escapeIlike(rawSearch.slice(0, MAX_LENGTH.SEARCH_QUERY)) : undefined;

    // Build query
    let query = supabaseAdmin!
      .from('accounting_requests')
      .select(`
        *,
        requester:employees!accounting_requests_requester_id_fkey(id, full_name),
        branch:branches!accounting_requests_branch_id_fkey(id, name)
      `, { count: 'exact' });

    // Apply filters
    if (branchAccess.branchId) {
      query = query.eq('branch_id', branchAccess.branchId);
    }
    if (statusParam) {
      const statuses = statusParam.split(',').filter(Boolean);
      if (statuses.length === 1) {
        query = query.eq('status', statuses[0]);
      } else if (statuses.length > 1) {
        query = query.in('status', statuses);
      }
    }
    if (typeParam) {
      const types = typeParam.split(',').filter(Boolean);
      if (types.length === 1) {
        query = query.eq('request_type', types[0]);
      } else if (types.length > 1) {
        query = query.in('request_type', types);
      }
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,request_number.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching accounting requests:', error);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    // Map to camelCase response
    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      requestNumber: r.request_number,
      requestType: r.request_type,
      status: r.status,
      priority: r.priority,
      title: r.title,
      description: r.description,
      notes: r.notes,
      requesterId: r.requester_id,
      requesterName: r.requester?.full_name || null,
      branchId: r.branch_id,
      branchName: r.branch?.name || null,
      fromEntityId: r.from_entity_id,
      amount: r.amount ? parseFloat(r.amount) : null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    const total = count || 0;

    return NextResponse.json({
      data: mapped,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_ACCOUNTING_VIEW, allowKiosk: true });
