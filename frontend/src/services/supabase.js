import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ecqcitnzcentnkdoyzmp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcWNpdG56Y2VudG5rZG95em1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTkzODUsImV4cCI6MjEwODk3NTM4NX0.x01VqoNK1SOR2XtCT1DgqXnMYX7SCy2dQ9gJm0gO9ok';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0egP1qo9GNXy5pMX1u9o9Q_whGw2SnI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export async function pingSupabase() {
  try {
    const { data, error } = await supabase.auth.getSession();
    return {
      connected: !error,
      url: supabaseUrl,
      projectRef: 'ecqcitnzcentnkdoyzmp'
    };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}

export { supabaseUrl, supabaseAnonKey, supabasePublishableKey };
