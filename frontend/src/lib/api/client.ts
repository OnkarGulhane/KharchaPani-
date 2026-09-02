
import { env } from "@/config/env";

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        sessionStorage.setItem("kharcha_access_token", token);
      } else {
        sessionStorage.removeItem("kharcha_access_token");
      }
    } catch {
      // Ignore quota/private mode errors
    }
  }
};

export const getAccessToken = (): string | null => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== "undefined") {
    try {
      return sessionStorage.getItem("kharcha_access_token");
    } catch {
      return null;
    }
  }
  return null;
};

export const setRefreshToken = (token: string | null): void => {
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem("kharcha_refresh_token", token);
      } else {
        localStorage.removeItem("kharcha_refresh_token");
      }
    } catch {
      // Ignore quota errors
    }
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("kharcha_refresh_token");
    } catch {
      return null;
    }
  }
  return null;
};

export const getAppKey = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("kharcha_app_key") || "dev-shared-access-key-kharcha-pani";
  }
  return "dev-shared-access-key-kharcha-pani";
};

export const setAppKey = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("kharcha_app_key", key);
  }
};

export const removeAppKey = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kharcha_app_key");
  }
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

export class ApiError extends Error {
  status: number;
  detail?: string | null;

  constructor(message: string, status: number, detail?: string | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.apiBaseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Essential for HttpOnly refresh cookie transmission
  };

  let res = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized with Automatic Silent Refresh
  if (
    res.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh") &&
    !endpoint.includes("/auth/register") &&
    !endpoint.includes("/auth/google")
  ) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshUrl = `${env.apiBaseUrl}/auth/refresh`;
        const refreshBody = JSON.stringify({ refresh_token: getRefreshToken() });
        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: refreshBody,
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData?.data?.access_token;
          const newRefreshToken = refreshData?.data?.refresh_token;

          if (newToken) {
            setAccessToken(newToken);
            if (newRefreshToken) {
              setRefreshToken(newRefreshToken);
            }
            isRefreshing = false;
            onRefreshed(newToken);

            // Replay original request with new token
            headers["Authorization"] = `Bearer ${newToken}`;
            res = await fetch(url, { ...fetchOptions, headers });
          } else {
            throw new Error("Missing new access token in refresh response");
          }
        } else {
          isRefreshing = false;
          setAccessToken(null);
          setRefreshToken(null);
          if (typeof window !== "undefined") {
            const path = window.location.pathname;
            if (
              !path.startsWith("/login") &&
              !path.startsWith("/register") &&
              !path.startsWith("/forgot-password") &&
              !path.startsWith("/reset-password")
            ) {
              window.location.href = "/login";
            }
          }
          throw new ApiError("Session expired. Please log in again.", 401);
        }
      } catch (err) {
        isRefreshing = false;
        setAccessToken(null);
        setRefreshToken(null);
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (
            !path.startsWith("/login") &&
            !path.startsWith("/register") &&
            !path.startsWith("/forgot-password") &&
            !path.startsWith("/reset-password")
          ) {
            window.location.href = "/login";
          }
        }
        throw new ApiError("Session expired. Please log in again.", 401);
      }
    } else {
      // Queue concurrent requests until refresh finishes
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber(async (newToken: string) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          try {
            const retryRes = await fetch(url, { ...fetchOptions, headers });
            const data = await parseResponse<T>(retryRes);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  }

  return parseResponse<T>(res);
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  let body: any = null;
  if (contentType && contentType.includes("application/json")) {
    body = await res.json();
  }

  if (!res.ok) {
    let detailMsg = body?.detail;
    if (typeof detailMsg === "object" && detailMsg !== null) {
      if (Array.isArray(detailMsg)) {
        detailMsg = detailMsg.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
      } else {
        detailMsg = detailMsg.message || JSON.stringify(detailMsg);
      }
    }
    const errorMsg = detailMsg || body?.error || `HTTP error! status: ${res.status}`;
    throw new ApiError(errorMsg, res.status, body?.detail);
  }

  if (body && typeof body === "object" && "success" in body) {
    if (!body.success) {
      throw new ApiError(body.error || "API request failed", res.status, body.detail);
    }
    return body.data as T;
  }

  return body as T;
}
