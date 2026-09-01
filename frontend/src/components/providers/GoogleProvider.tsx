"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "@/config/env";

export const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clientId =
    env.googleClientId ||
    "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
