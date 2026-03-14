
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Minimal cookie interface compatible with Next cookies helper
type CookieStore = {
  get(name: string): Promise<{ name: string; value: string } | undefined> | { name: string; value: string } | undefined;
  set(name: string, value: string, options?: Record<string, unknown>): void | Promise<void>;
};

export const createClient = (cookieStore: CookieStore) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore.get(name);
        return cookie?.value ?? null;
      },
      async set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          await cookieStore.set(name, value, options);
        } catch {
          // Ignore if called from a Server Component
        }
      },
      async remove(name: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          await cookieStore.set(name, "", { ...(options || {}), maxAge: 0 });
        } catch {
          // Ignore if called from a Server Component
        }
      },
    },
  });
};
