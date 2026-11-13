import { apiClient } from "@/services/ApiClient";
import type { ApiAuthTokens, ApiPapelUsuario } from "@/types/Api";
import type { Session, UserRole } from "@/types/Entities";

export type LoginCredentials = {
  email: string;
  senha: string;
};

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  papel: "PACIENTE" | "GESTOR";
};

export type GoogleLoginPayload = {
  idToken: string;
  papel?: "PACIENTE" | "GESTOR";
};

function toSession(tokens: ApiAuthTokens): Session {
  const roleMap: Record<ApiPapelUsuario, Exclude<UserRole, "visitor">> = {
    PACIENTE: "common",
    GESTOR: "functional",
    ADMIN: "admin",
  };

  return {
    user: {
      id: tokens.usuario.id,
      name: tokens.usuario.nome,
      email: tokens.usuario.email,
      phone: tokens.usuario.telefone ?? undefined,
      role: roleMap[tokens.usuario.papel] ?? "common",
      avatarUrl: tokens.usuario.avatarUrl ?? undefined,
    },
    token: tokens.accessToken,
  };
}

export const AuthService = {
  async login(payload: LoginCredentials): Promise<Session> {
    const data = await apiClient<ApiAuthTokens>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
    return toSession(data);
  },

  async register(payload: RegisterPayload): Promise<Session> {
    const data = await apiClient<ApiAuthTokens>("/api/auth/register", {
      method: "POST",
      body: payload,
    });
    return toSession(data);
  },

  async googleLogin(payload: GoogleLoginPayload): Promise<Session> {
    const data = await apiClient<ApiAuthTokens>("/api/auth/google", {
      method: "POST",
      body: payload,
    });
    return toSession(data);
  },

  verifyEmail(code: string) {
    return apiClient<void>("/api/auth/verify-email", {
      method: "POST",
      body: { code },
    });
  },

  recoverPassword(email: string) {
    return apiClient<void>("/api/auth/recover-password", {
      method: "POST",
      body: { email },
    });
  },
};
