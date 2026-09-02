import { apiFetch, setAccessToken } from "@/lib/api/client";
import { RefreshTokenResponse, TokenResponse, User } from "@/types/auth";

export interface RegisterResult {
  id: number;
  email: string;
  full_name: string;
  is_verified: boolean;
  requires_verification: boolean;
}

export const authApi = {
  register: async (data: { email: string; password: string; full_name: string }): Promise<RegisterResult> => {
    return apiFetch<RegisterResult>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (token: string): Promise<{ verified: boolean; email: string }> => {
    return apiFetch<{ verified: boolean; email: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  resendVerification: async (email: string): Promise<{ sent: boolean }> => {
    return apiFetch<{ sent: boolean }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  login: async (data: { email: string; password: string }): Promise<TokenResponse> => {
    const res = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAccessToken(res.access_token);
    return res;
  },

  googleAuth: async (idToken: string): Promise<TokenResponse> => {
    const res = await apiFetch<TokenResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    });
    setAccessToken(res.access_token);
    return res;
  },

  refresh: async (): Promise<RefreshTokenResponse> => {
    const res = await apiFetch<RefreshTokenResponse>("/auth/refresh", {
      method: "POST",
    });
    setAccessToken(res.access_token);
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await apiFetch<{ logged_out: boolean }>("/auth/logout", {
        method: "POST",
      });
    } finally {
      setAccessToken(null);
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await apiFetch<{ logged_out_all: boolean }>("/auth/logout-all", {
        method: "POST",
      });
    } finally {
      setAccessToken(null);
    }
  },

  getMe: async (): Promise<User> => {
    return apiFetch<User>("/auth/me");
  },

  forgotPassword: async (email: string): Promise<{ sent: boolean; reset_token?: string }> => {
    return apiFetch<{ sent: boolean; reset_token?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: { token: string; new_password: string }): Promise<{ reset: boolean }> => {
    return apiFetch<{ reset: boolean }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: { current_password: string; new_password: string }): Promise<{ changed: boolean }> => {
    return apiFetch<{ changed: boolean }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
