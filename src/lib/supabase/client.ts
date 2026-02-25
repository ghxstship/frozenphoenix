import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn(
            "Supabase credentials not configured. Running in mock data mode.\n" +
            "To enable Supabase, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
        );
        return null;
    }
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
