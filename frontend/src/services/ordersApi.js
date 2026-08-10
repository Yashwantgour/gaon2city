import api from './api';

export async function createOrder(orderData) {
  return await api.post('/orders', orderData);
}

export async function listOrders(params = {}) {
  return await api.get('/orders', { params });
}

export async function getOrderById(id) {
  return await api.get(`/orders/${id}`);
}

export async function updateOrderStatus(id, status) {
  return await api.patch(`/orders/${id}/status`, { status });
}

export async function cancelOrder(id) {
  return await api.post(`/orders/${id}/cancel`);
}
