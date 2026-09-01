"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "@/config/env";

export const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clientId = env.googleClientId || "dummy-client-id-for-dev";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
