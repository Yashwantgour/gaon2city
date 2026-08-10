import api from './api';

export async function listProducts(params = {}) {
  return await api.get('/products', { params });
}

export async function getProductById(id) {
  return await api.get(`/products/${id}`);
}

export async function getNearbyProducts({ lat, lng, radius = 10 }) {
  return await api.get('/products/nearby', { params: { lat, lng, radius } });
}

export async function createProduct(productData) {
  return await api.post('/products', productData);
}

export async function updateProduct(id, updates) {
  return await api.patch(`/products/${id}`, updates);
}

export async function deleteProduct(id) {
  return await api.delete(`/products/${id}`);
}
