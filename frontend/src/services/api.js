import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('access_token');
    if (!token) {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token || null;
      if (token) {
        localStorage.setItem('access_token', token);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
