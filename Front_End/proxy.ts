import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getAccessDecision, getHomePathForRole, stripLocale } from "./lib/authorization";
import { ACCESS_TOKEN_COOKIE, getSessionUserFromToken } from "./lib/session-token";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { locale, path } = stripLocale(request.nextUrl.pathname);

  // Without a locale prefix, let next-intl redirect first; the guard runs on the localized URL.
  if (locale) {
    const user = getSessionUserFromToken(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
    const decision = getAccessDecision(user?.role ?? null, path);

    if (decision === "allow" && path === "/secretary") {
      return NextResponse.redirect(new URL(`/${locale}/secretary/account`, request.url));
    }

    if (decision !== "allow") {
      const target = decision === "login" ? "/login" : getHomePathForRole(user?.role ?? null);
      const redirectPath = target === path ? "/" : target;
      return NextResponse.redirect(new URL(`/${locale}${redirectPath === "/" ? "" : redirectPath}`, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
