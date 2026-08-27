const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");

const getSanitizedApiBaseUrl = (): string => {
  if (rawApiUrl) {
    if (rawApiUrl.endsWith("/api/v1")) {
      return rawApiUrl;
    }
    return `${rawApiUrl}/api/v1`;
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "/api/v1";
  }

  return "http://127.0.0.1:8000/api/v1";
};

export const env = {
  apiBaseUrl: getSanitizedApiBaseUrl(),
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || "development",
};
