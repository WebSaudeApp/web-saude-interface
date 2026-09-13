import { apiClient } from "@/services/ApiClient";
import type { Session } from "@/types/Entities";

type Credentials = {
  email: string;
  password: string;
};

type RegisterPayload = Credentials & {
  name: string;
  phone?: string;
  role: "common" | "functional";
};

export const AuthService = {
  login(payload: Credentials) {
    return apiClient<Session>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  register(payload: RegisterPayload) {
    return apiClient<Session>("/api/auth/register", {
      method: "POST",
      body: payload,
    });
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
