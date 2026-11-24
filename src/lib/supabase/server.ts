import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export const REMEMBER_COOKIE = "fc_remember";

export async function createClient() {
  const env = getSupabaseEnv();
  if (!env) throw new Error("SUPABASE_NOT_CONFIGURED");
  const store = await cookies();
  const sessionOnly = store.get(REMEMBER_COOKIE)?.value === "0";

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) {
            const opts = { ...options };
            if (sessionOnly && value) {
              delete opts.maxAge;
              delete opts.expires;
            }
            store.set(name, value, opts);
          }
        } catch {
          // Called from a Server Component: middleware refreshes the session instead.
        }
      },
    },
  });
}
