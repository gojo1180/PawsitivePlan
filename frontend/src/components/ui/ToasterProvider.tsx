"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "pixel-font pixel-shadow-stepped border-2",
        style: {
          background: "var(--color-surface0)",
          color: "var(--color-text)",
          border: "2px solid var(--color-surface2)",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "8px", // Smaller font for pixel style
          lineHeight: "1.5",
        },
        success: {
          iconTheme: {
            primary: "var(--color-green)",
            secondary: "var(--color-surface0)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-red)",
            secondary: "var(--color-surface0)",
          },
        },
      }}
    />
  );
}
