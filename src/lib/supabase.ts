
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Minimal cookie interface compatible with Next cookies helper
type CookieStore = {
  get(name: string): { name: string; value: string } | undefined;
  set(name: string, value: string, options?: Record<string, unknown>): void;
};

export const createClient = (cookieStore: CookieStore) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      get(name: string) {
        const value = cookieStore.get(name)?.value;
        return value ?? null;
      },
      set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Ignore if called from a Server Component
        }
      },
      remove(name: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, "", { ...(options || {}), maxAge: 0 });
        } catch {
          // Ignore if called from a Server Component
        }
      },
    },
  });
};
