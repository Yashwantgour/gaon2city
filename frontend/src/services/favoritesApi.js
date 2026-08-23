import api from './api';

export async function getFavorites() {
  return await api.get('/favorites');
}

export async function getFavoriteIds() {
  return await api.get('/favorites/ids');
}

export async function addFavorite(productId) {
  return await api.post('/favorites', { product_id: productId });
}

export async function removeFavorite(productId) {
  return await api.delete(`/favorites/${productId}`);
}

export async function checkFavorite(productId) {
  return await api.get(`/favorites/check/${productId}`);
}
