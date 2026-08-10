import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Create a report.
 */
export async function createReport(reporterId, { reported_user_id, product_id, reason, description }) {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .insert({
      reporter_id: reporterId,
      reported_user_id: reported_user_id || null,
      product_id: product_id || null,
      reason,
      description,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to create report');
  }

  return data;
}

/**
 * List all reports (admin only).
 */
export async function listReports({ status, page = 1, limit = 20 }) {
  let query = supabaseAdmin
    .from('reports')
    .select(`
      *,
      reporter:profiles!reporter_id(id, name, email),
      reported_user:profiles!reported_user_id(id, name, email),
      product:products(id, title, slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw ApiError.internal('Failed to fetch reports');
  }

  return {
    reports: data || [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
    },
  };
}

/**
 * Update report status (admin only).
 */
export async function updateReport(reportId, { status }) {
  const updates = {
    status,
    ...(status === 'resolved' || status === 'dismissed'
      ? { resolved_at: new Date().toISOString() }
      : {}),
  };

  const { data, error } = await supabaseAdmin
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to update report');
  }

  if (!data) {
    throw ApiError.notFound('Report not found');
  }

  return data;
}
