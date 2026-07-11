"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/** Aplica o tema salvo do membro (segue a conta, não o dispositivo). */
export function AppearanceSync({ theme }: { theme?: string | null }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (theme === "light" || theme === "dark" || theme === "system") {
      setTheme(theme);
    }
  }, [theme, setTheme]);

  return null;
}
