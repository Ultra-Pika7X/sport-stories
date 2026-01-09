import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: "dark",
            resolvedTheme: "dark",
            setTheme: (theme) => {
                const resolved = theme === "system"
                    ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                    : theme;
                set({ theme, resolvedTheme: resolved });

                // Apply to document
                if (typeof document !== "undefined") {
                    document.documentElement.classList.remove("light", "dark");
                    document.documentElement.classList.add(resolved);
                }
            },
            toggleTheme: () => {
                const current = get().resolvedTheme;
                get().setTheme(current === "dark" ? "light" : "dark");
            },
        }),
        {
            name: "sport-stories-theme",
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state && typeof document !== "undefined") {
                    document.documentElement.classList.remove("light", "dark");
                    document.documentElement.classList.add(state.resolvedTheme);
                }
            },
        }
    )
);
