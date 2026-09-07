const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");

const isLocalOrPrivateHost = (hostname: string): boolean => {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local")) {
    return true;
  }
  // IPv4 private ranges: 192.168.x.x, 10.x.x.x, 172.16-31.x.x
  return /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);
};

const getSanitizedApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // In local development or mobile local network (localhost, 127.0.0.1, 192.168.x.x)
    if (isLocalOrPrivateHost(hostname)) {
      return `${protocol}//${hostname}:8000/api/v1`;
    }

    // In production or cloud deployment (e.g. Vercel)
    if (rawApiUrl) {
      return rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;
    }
    return "https://kharchapani-0lon.onrender.com/api/v1";
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

