const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");

const getSanitizedApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // In production or cloud deployment (e.g. Vercel)
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      if (rawApiUrl) {
        return rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;
      }
      return "https://kharchapani-0lon.onrender.com/api/v1";
    }

    // In local development, match the current hostname (localhost or 127.0.0.1) on port 8000
    return `${protocol}//${hostname}:8000/api/v1`;
  }

  if (rawApiUrl) {
    return rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;
  }

  return "https://kharchapani-0lon.onrender.com/api/v1";
};

export const env = {
  get apiBaseUrl() {
    return getSanitizedApiBaseUrl();
  },
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || "development",
  googleClientId:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com",
};

