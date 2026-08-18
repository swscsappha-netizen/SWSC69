import { supabase, isSupabaseConfigured } from './supabase';

export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    const { count, error } = await supabase.from('shops').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return { success: true, message: `Connected to Supabase successfully (${count ?? 0} shops)` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase' };
  }
}
