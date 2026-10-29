"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { RolePreviewProvider } from "@/features/shell/role-context";
import { Sidebar } from "@/features/shell/Sidebar";
import { Topbar } from "@/features/shell/Topbar";
import type { UserRole } from "@/constants/roles";

interface AppShellProps {
  children: ReactNode;
  user: { name: string; email: string; role: UserRole };
  demoMode: boolean;
}

export function AppShell({ children, user, demoMode }: AppShellProps) {
  const t = useTranslations("shell.topbar");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <RolePreviewProvider initialRole={user.role} demoMode={demoMode}>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
          name={user.name}
        />

        {drawerOpen ? (
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        ) : null}

        <div
          className={cn(
            "min-h-screen transition-[margin] duration-200",
            collapsed ? "md:ms-20" : "md:ms-64",
            "xl:ms-64",
          )}
        >
          <Topbar onOpenMenu={() => setDrawerOpen(true)} />
          <main className="mx-auto w-full max-w-[1600px] px-4 pb-14 pt-5 md:px-6 md:pt-6 xl:px-8">
            {children}
          </main>
        </div>
      </div>
    </RolePreviewProvider>
  );
}
