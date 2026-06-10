import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) console.warn("VITE_SUPABASE_URL is not set in environment");
if (!supabaseKey) console.warn("VITE_SUPABASE_PUBLISHABLE_KEY is not set in environment");

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseKey ?? ""
);

export async function testConnection() {
  try {
    const { data, error } = await supabase.from("hospitals").select("id").limit(1);
    return { ok: !error, error };
  } catch (err) {
    return { ok: false, error: err };
  }
}

// FIXED: Use import.meta.env instead of process.env
supabase.realtime.setAuth(import.meta.env.VITE_SUPABASE_ANON_KEY || "");

// Optional: Remove this fetch interceptor or fix it too
// If you want to keep it for debugging:
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log("Fetch request:", args[0]);
  return originalFetch.apply(this, args);
};