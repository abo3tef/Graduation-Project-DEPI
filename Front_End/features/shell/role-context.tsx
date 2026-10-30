"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { USER_ROLES, type UserRole } from "@/constants/roles";



interface RolePreviewValue {
  role: UserRole;
  serverRole: UserRole;
  demoMode: boolean;
  canManage: boolean;
  setRole: (role: UserRole) => void;
}

const RolePreviewContext = createContext<RolePreviewValue | null>(null);



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



  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
  }, []);

  const value = useMemo<RolePreviewValue>(
    () => ({
      role,
      serverRole: initialRole,
      demoMode,
      canManage: role === "doctor" || role === "secretary",
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
