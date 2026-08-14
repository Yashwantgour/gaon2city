import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://eztvgwvsijpuwsnrbktu.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_k1HCEduzEKQQRznmgsXyfg_Eh18Ly5o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
