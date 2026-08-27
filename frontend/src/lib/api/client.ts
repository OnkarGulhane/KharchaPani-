import { env } from "@/config/env";
import { SuccessResponse } from "@/types/api";

const DEFAULT_DEV_KEY = "dev-shared-access-key-kharcha-pani";

export const getAppKey = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("kharcha_app_key");
    if (
      saved &&
      saved.trim() &&
      saved !== "undefined" &&
      saved !== "null" &&
      !saved.includes("Cannot read properties") &&
      !saved.includes("Failed to fetch")
    ) {
      return saved;
    }
  }
  return DEFAULT_DEV_KEY;
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
  const key = getAppKey();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (key) {
    headers["X-App-Key"] = key;
  }

  const url = `${env.apiBaseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kharcha_app_key");
      if (!window.location.pathname.startsWith("/access")) {
        window.location.href = "/access";
      }
    }
    throw new ApiError("Unauthorized. Please check your Access Key.", 401);
  }

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
