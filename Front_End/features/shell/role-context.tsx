"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { USER_ROLES, type UserRole } from "@/constants/roles";

const STORAGE_KEY = "medilog.preview-role";

interface RolePreviewValue {
  role: UserRole;
  serverRole: UserRole;
  demoMode: boolean;
  canManage: boolean;
  setRole: (role: UserRole) => void;
}

const RolePreviewContext = createContext<RolePreviewValue | null>(null);

function isUserRole(value: string | null): value is UserRole {
  return value !== null && (USER_ROLES as readonly string[]).includes(value);
}

export function RolePreviewProvider({
  initialRole,
  demoMode,
  children,
}: {
  initialRole: UserRole;
  demoMode: boolean;
  children: ReactNode;
}) {
  const [role, setRoleState] = useState<UserRole>(initialRole);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isUserRole(saved)) {
      setRoleState(saved);
    }
  }, []);

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<RolePreviewValue>(
    () => ({
      role,
      serverRole: initialRole,
      demoMode,
      canManage: role === "secretary" || role === "admin",
      setRole,
    }),
    [role, initialRole, demoMode, setRole],
  );

  return (
    <RolePreviewContext.Provider value={value}>
      {children}
    </RolePreviewContext.Provider>
  );
}

export function useRolePreview(): RolePreviewValue {
  const context = useContext(RolePreviewContext);
  if (!context) {
    throw new Error("useRolePreview must be used inside RolePreviewProvider.");
  }
  return context;
}
