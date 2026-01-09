"use client";

import { type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

export function Input({
    className,
    type = "text",
    label,
    error,
    icon,
    iconPosition = "left",
    disabled,
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && iconPosition === "left" && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    disabled={disabled}
                    className={cn(
                        "w-full h-11 px-4 rounded-xl transition-all duration-200",
                        "bg-white/5 border border-border text-foreground placeholder:text-muted",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "hover:border-primary/40",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        icon && iconPosition === "left" && "pl-10",
                        icon && iconPosition === "right" && "pr-10",
                        error &&
                        "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {icon && iconPosition === "right" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                        {icon}
                    </div>
                )}
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
    );
}
