import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Environment Validation
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Supabase environment variables are missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
  );
}

/**
 * App Environment
 */
const isProd = import.meta.env.PROD;
const isDev = import.meta.env.DEV;

/**
 * Custom Fetch with Logging (great for debugging & monitoring)
 */
const customFetch: typeof fetch = async (input, init) => {
  const start = performance.now();

  const response = await fetch(input, init);

  if (isDev) {
    const time = (performance.now() - start).toFixed(0);
    console.debug(
      `%c[Supabase ${response.status}]`,
      "color:#22c55e;font-weight:bold;",
      `${init?.method || "GET"} ${typeof input === "string" ? input : input.toString()} • ${time}ms`
    );
  }

  return response;
};

/**
 * Supabase Client Singleton
 */
let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: {
        fetch: customFetch,
        headers: {
          "X-Client-Info": "thenos-web-app",
        },
      },
      auth: {
        storage: window.localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    if (isDev) {
      console.info("%cSupabase client initialized", "color:#3b82f6;font-weight:bold;");
    }
  }

  return supabaseInstance;
};

/**
 * Default Export (most common usage)
 */
export const supabase = getSupabase();
