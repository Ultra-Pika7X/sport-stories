"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/cn";

export interface ThemeToggleProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
};

const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
};

export function ThemeToggle({ size = "md", className }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useThemeStore();
    const isDark = resolvedTheme === "dark";

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={cn(
                "relative flex items-center justify-center rounded-xl",
                "bg-white/5 hover:bg-white/10 border border-white/10",
                "transition-colors duration-200",
                sizeStyles[size],
                className
            )}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <motion.div
                initial={false}
                animate={{
                    rotate: isDark ? 0 : 180,
                    scale: 1,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {isDark ? (
                    <Moon className={cn(iconSizes[size], "text-primary")} />
                ) : (
                    <Sun className={cn(iconSizes[size], "text-amber-500")} />
                )}
            </motion.div>

            {/* Glow effect */}
            <motion.div
                className={cn(
                    "absolute inset-0 rounded-xl",
                    isDark ? "bg-primary/20" : "bg-amber-500/20"
                )}
                initial={false}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.5 }}
                key={resolvedTheme}
            />
        </motion.button>
    );
}
