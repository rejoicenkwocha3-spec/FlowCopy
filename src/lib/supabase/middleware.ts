import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const PROTECTED = ["/dashboard"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const env = getSupabaseEnv();
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  if (!env) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?error=not_configured";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const sessionOnly = request.cookies.get("fc_remember")?.value === "0";
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => {
          const opts = { ...options };
          if (sessionOnly && value) {
            delete opts.maxAge;
            delete opts.expires;
          }
          response.cookies.set(name, value, opts);
        });
      },
    },
  });

  // getUser() validates the JWT with Supabase; never trust getSession() on the server.
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const redirectTo = (pathname: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!user && isProtected) {
    return redirectTo("/login", `?next=${encodeURIComponent(path + request.nextUrl.search)}`);
  }
  if (user && AUTH_PAGES.includes(path)) {
    return redirectTo("/dashboard");
  }
  return response;
}
