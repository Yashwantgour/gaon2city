import * as reportsService from '../services/reportsService.js';

/**
 * POST /api/reports
 */
export async function createReport(req, res, next) {
  try {
    const report = await reportsService.createReport(req.user.id, req.body);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports
 */
export async function listReports(req, res, next) {
  try {
    const result = await reportsService.listReports({
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id
 */
export async function updateReport(req, res, next) {
  try {
    const report = await reportsService.updateReport(req.params.id, req.body);
    res.json(report);
  } catch (err) {
    next(err);
  }
}
