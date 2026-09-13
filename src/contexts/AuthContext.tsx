import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, User, UserRole } from "@/types/Entities";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  role: UserRole;
  signIn: (session: Session) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);

  const signIn = useCallback((next: Session) => {
    setSession(next);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      role: (session?.user.role ?? "visitor") as UserRole,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext precisa estar dentro de AuthProvider");
  }
  return context;
}
