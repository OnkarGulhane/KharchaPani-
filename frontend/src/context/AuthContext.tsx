"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { setAccessToken, setRefreshToken, getRefreshToken } from "@/lib/api/client";
import { User } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const handleSetSession = (token: string, userData: User, refreshToken?: string | null) => {
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(userData);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
  };

  const handleClearSession = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setAccessTokenState(null);
    setUser(null);
  };

  // Initial silent auth check on mount (optimized for Chrome & all browsers)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedToken = typeof window !== "undefined" ? sessionStorage.getItem("kharcha_access_token") : null;

        // If we have an access token stored, verify it directly
        if (storedToken) {
          try {
            setAccessToken(storedToken);
            setAccessTokenState(storedToken);
            const userData = await authApi.getMe();
            if (isMounted) {
              setUser(userData);
              setIsLoading(false);
              return;
            }
          } catch {
            // Access token expired, attempt refresh below
          }
        }

        // Silent refresh attempt via HttpOnly cookie or stored refresh token
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
            }
          }
        } catch {
          if (isMounted) {
            handleClearSession();
          }
        }
      } catch (err) {
        if (isMounted) {
          handleClearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

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

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        full_name: fullName,
        email,
        password,
      });
      handleSetSession(res.access_token, res.user, res.refresh_token);
      toast.success("Account created successfully!", {
        description: `Welcome to Kharcha Pani, ${res.user.full_name}`,
      });
      router.push("/");
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
      router.push("/");
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
