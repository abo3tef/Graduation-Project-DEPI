import type { ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { getSessionUser } from "@/lib/session";

/**
 * Server-side role check for everything under /secretary (second line after proxy.ts).
 * Must render inside <Suspense> because it reads the session cookie.
 */
export async function SecretaryGuard({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const user = await getSessionUser();

  if (!user) redirect({ href: "/login", locale });
  else if (user.role !== "secretary") redirect({ href: "/", locale });

  return <>{children}</>;
}
