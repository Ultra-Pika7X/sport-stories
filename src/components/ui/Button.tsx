"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { motion, type HTMLMotionProps } from "framer-motion";

const variants = {
    primary:
        "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/25",
    secondary:
        "bg-white/5 text-foreground hover:bg-white/10 border border-white/10",
    ghost: "text-foreground hover:bg-white/5",
    danger:
        "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25",
    success:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25",
};

const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
    xl: "h-14 px-8 text-lg gap-3",
};

export interface ButtonProps
    extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    children?: ReactNode;
}

export function Button({
    className,
    variant = "primary",
    size = "md",
    loading,
    disabled,
    icon,
    iconPosition = "left",
    children,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            whileHover={{ scale: isDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isDisabled ? 1 : 0.98 }}
            transition={{ duration: 0.15 }}
            disabled={isDisabled}
            className={cn(
                "relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading && (
                <svg
                    className="absolute animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            <span
                className={cn(
                    "flex items-center",
                    loading && "opacity-0",
                    sizes[size]
                )}
            >
                {icon && iconPosition === "left" && icon}
                {children}
                {icon && iconPosition === "right" && icon}
            </span>
        </motion.button>
    );
}
