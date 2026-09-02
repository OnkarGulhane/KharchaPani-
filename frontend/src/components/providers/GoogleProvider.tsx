"use client";

import React from "react";
import Script from "next/script";

export const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
};
