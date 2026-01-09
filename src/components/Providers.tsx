"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LibraryProvider } from "@/context/LibraryContext";
import { ReactNode, useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

// Theme initializer component
function ThemeInitializer() {
    const { theme, setTheme } = useThemeStore();

    useEffect(() => {
        // Initialize theme on mount
        setTheme(theme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                setTheme("system");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, setTheme]);

    return null;
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <LibraryProvider>
                <ThemeInitializer />
                {children}
            </LibraryProvider>
        </AuthProvider>
    );
}
