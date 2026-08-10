import api from './api';

export async function createReport(reportData) {
  return await api.post('/reports', reportData);
}

export async function listReports(params = {}) {
  return await api.get('/reports/admin', { params });
}

export async function updateReport(id, data) {
  return await api.patch(`/reports/admin/${id}`, data);
}
