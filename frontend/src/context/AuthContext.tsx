"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, RegisterResult } from "@/lib/api/auth";
import { setAccessToken, setRefreshToken, getRefreshToken } from "@/lib/api/client";
import { User } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<RegisterResult>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSetSession = (token: string, userData: User, refreshToken?: string | null) => {
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(userData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kharcha_user", JSON.stringify(userData));
      } catch {
        // Ignore quota errors
      }
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
  };

  const handleClearSession = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setAccessTokenState(null);
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("kharcha_user");
        sessionStorage.removeItem("kharcha_access_token");
        localStorage.removeItem("kharcha_access_token_fallback");
        localStorage.removeItem("kharcha_refresh_token");
      } catch {
        // Ignore errors
      }
    }
  };

  // Background non-blocking session check on mount
  useEffect(() => {
    let isMounted = true;

    // Load cached session immediately on client mount
    try {
      const cached = localStorage.getItem("kharcha_user");
      if (cached) {
        setUser(JSON.parse(cached));
      }
      const tok =
        sessionStorage.getItem("kharcha_access_token") ||
        localStorage.getItem("kharcha_access_token_fallback");
      if (tok) {
        setAccessTokenState(tok);
        setAccessToken(tok);
      }
    } catch {
      // Ignore
    }

    const verifySession = async () => {
      try {
        const storedToken =
          sessionStorage.getItem("kharcha_access_token") ||
          localStorage.getItem("kharcha_access_token_fallback");

        const storedRefresh = localStorage.getItem("kharcha_refresh_token");

        if (!storedToken && !storedRefresh) {
          if (isMounted) {
            handleClearSession();
          }
          return;
        }

        // If access token exists, verify it
        if (storedToken) {
          try {
            setAccessToken(storedToken);
            setAccessTokenState(storedToken);
            const userData = await authApi.getMe();
            if (isMounted) {
              setUser(userData);
              localStorage.setItem("kharcha_user", JSON.stringify(userData));
              return;
            }
          } catch {
            // Token expired, attempt refresh below
          }
        }

        // Silent refresh attempt
        if (storedRefresh) {
          try {
            const refreshData = await authApi.refresh();
            if (refreshData?.access_token && isMounted) {
              setAccessToken(refreshData.access_token);
              setAccessTokenState(refreshData.access_token);
              if (refreshData?.refresh_token) {
                setRefreshToken(refreshData.refresh_token);
              }
              const userData = await authApi.getMe();
              if (isMounted) {
                setUser(userData);
                localStorage.setItem("kharcha_user", JSON.stringify(userData));
              }
            }
          } catch {
            if (isMounted) {
              handleClearSession();
            }
          }
        } else {
          if (isMounted) {
            handleClearSession();
          }
        }
      } catch {
        if (isMounted) {
          handleClearSession();
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      handleSetSession(res.access_token, res.user, res.refresh_token);
      toast.success("Welcome back!", {
        description: `Logged in as ${res.user.full_name}`,
      });
      router.push("/");
    } catch (err: any) {
      toast.error("Login failed", {
        description: err.message || "Invalid credentials",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<RegisterResult> => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        full_name: fullName,
        email,
        password,
      });
      toast.success("Registration successful!", {
        description: "Please check your email to verify your account before logging in.",
      });
      return res;
    } catch (err: any) {
      toast.error("Registration failed", {
        description: err.message || "Failed to create account",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.googleAuth(idToken);
      handleSetSession(res.access_token, res.user, res.refresh_token);
      toast.success("Google Sign-In successful!", {
        description: `Logged in as ${res.user.full_name}`,
      });
      // Clean redirect to dashboard ensuring fresh session data
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error("Google Sign-In failed", {
        description: err.message || "Could not authenticate with Google",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      handleClearSession();
      toast.info("Logged out successfully");
      router.push("/login");
    } catch (err) {
      handleClearSession();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAll = async () => {
    setIsLoading(true);
    try {
      await authApi.logoutAll();
      handleClearSession();
      toast.info("Logged out from all devices");
      router.push("/login");
    } catch (err) {
      handleClearSession();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (err) {
      handleClearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        logoutAll,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
