import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/app';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Public Supabase client for browser and unprivileged operations.
 * Operates with Anon key and respects Row Level Security (RLS) policies.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * Helper to instantiate a public browser Supabase client.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;

  return createClient<Database>(url, anonKey);
}

/**
 * Factory for server-side admin client using the SUPABASE_SERVICE_ROLE_KEY.
 * Bypasses Row Level Security (RLS).
 *
 * NOTE: Strictly for use within Server Actions, Route Handlers, or trusted
 * server-side environments. NEVER import or call this on the client side.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Server-side admin operations require this key.'
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Server-side admin client instance for direct server action usage.
 * Bypasses Row Level Security (RLS).
 */
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
