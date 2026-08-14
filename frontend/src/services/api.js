import axios from 'axios';
import { supabase } from './supabase';

// Production Safeguard:
// In production builds (on Vercel), never allow localhost:5000 fallback under any circumstances.
const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const isProd = import.meta.env.PROD;

const API_BASE_URL = isProd
  ? (envUrl && !envUrl.includes('localhost') ? envUrl : 'https://gaon2city.onrender.com/api')
  : (envUrl || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      let token = localStorage.getItem('access_token');

      if (!token) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        token = session?.access_token || null;

        if (token) {
          localStorage.setItem('access_token', token);
        }
      }

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Auth token error:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
