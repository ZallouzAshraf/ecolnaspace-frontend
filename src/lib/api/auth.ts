import { apiClient, refreshAccessToken } from "./client";
import { clearSession, getAccessToken, setAccessToken } from "./token";
import type {
  LoginResponse,
  MeResponse,
  RegisterResponse,
} from "./types";

export type LoginInput = {
  email: string;
  password: string;
  organizationId?: string;
};

export type RegisterInput = {
  organizationName: string;
  organizationSlug: string;
  organizationType: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
};

export const authApi = {
  login(input: LoginInput) {
    return apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: input,
      public: true,
    }).then((data) => {
      setAccessToken(data.accessToken);
      return data;
    });
  },

  register(input: RegisterInput) {
    return apiClient<RegisterResponse>("/auth/register", {
      method: "POST",
      body: input,
      public: true,
    }).then((data) => {
      setAccessToken(data.accessToken);
      return data;
    });
  },

  async logout() {
    try {
      await apiClient<{ message: string }>("/auth/logout", {
        method: "POST",
        body: {},
        public: true,
        skipRefresh: true,
      });
    } finally {
      clearSession();
    }
  },

  me() {
    return apiClient<MeResponse>("/auth/me");
  },

  /** Bootstrap: refresh if needed, then load profile. */
  async bootstrap(): Promise<MeResponse> {
    if (!getAccessToken()) {
      const token = await refreshAccessToken();
      if (!token) {
        clearSession();
        throw new Error("UNAUTHENTICATED");
      }
    }
    return authApi.me();
  },

  forgotPassword(email: string) {
    return apiClient<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      public: true,
    });
  },

  resetPassword(token: string, newPassword: string) {
    return apiClient<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
      public: true,
    });
  },

  verifyEmail(token: string) {
    return apiClient<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: { token },
      public: true,
    });
  },
};
