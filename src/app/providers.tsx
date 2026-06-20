"use client";

import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuthStore } from "./stores/authStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { init, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [init, initialized]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
