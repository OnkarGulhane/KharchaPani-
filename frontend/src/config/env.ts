export const env = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
      ? "/api/v1"
      : "http://127.0.0.1:8000/api/v1"),
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || "development",
};
