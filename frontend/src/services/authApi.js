import api from './api';
import { supabase } from './supabase';

export async function signUp({ email, password, name, phone, village, city, seller_type }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        village,
        city,
        seller_type: seller_type || 'individual',
      },
    },
  });

  if (error) throw error;

  if (data.session) {
    localStorage.setItem('access_token', data.session.access_token);
  }

  if (data.user) {
    try {
      await api.patch('/auth/profile', { name, phone, village, city, seller_type });
    } catch {
      // Ignore initial profile update error if user needs email verification
    }
  }

  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (data.session) {
    localStorage.setItem('access_token', data.session.access_token);
  }

  return data;
}

export async function signOut() {
  localStorage.removeItem('access_token');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getMe() {
  return await api.get('/auth/me');
}

export async function updateProfile(profileData) {
  return await api.patch('/auth/profile', profileData);
}
