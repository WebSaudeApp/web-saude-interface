import { useAuthContext } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/Entities";

export function useAuth() {
  return useAuthContext();
}

export function useHasRole(allowed: UserRole[]) {
  const { role } = useAuthContext();
  return allowed.includes(role);
}
