"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { motion, type HTMLMotionProps } from "framer-motion";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    variant?: "default" | "glass" | "premium" | "bordered";
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
    children?: ReactNode;
}

const variantStyles = {
    default: "bg-surface border border-border",
    glass: "glass",
    premium: "premium-card",
    bordered: "bg-transparent border border-border",
};

const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

export function Card({
    className,
    variant = "default",
    hover = true,
    padding = "md",
    children,
    ...props
}: CardProps) {
    if (hover && variant !== "premium") {
        return (
            <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "rounded-xl transition-all duration-300",
                    variantStyles[variant],
                    paddingStyles[padding],
                    "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-xl transition-all duration-300",
                variantStyles[variant],
                paddingStyles[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

export function CardHeader({ className, ...props }: CardHeaderProps) {
    return (
        <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
    );
}

// Card Title
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }

export function CardTitle({ className, ...props }: CardTitleProps) {
    return (
        <h3
            className={cn("text-lg font-bold leading-tight", className)}
            {...props}
        />
    );
}

// Card Description
export interface CardDescriptionProps
    extends HTMLAttributes<HTMLParagraphElement> { }

export function CardDescription({ className, ...props }: CardDescriptionProps) {
    return <p className={cn("text-sm text-muted", className)} {...props} />;
}

// Card Content
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

export function CardContent({ className, ...props }: CardContentProps) {
    return <div className={cn("", className)} {...props} />;
}

// Card Footer
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

export function CardFooter({ className, ...props }: CardFooterProps) {
    return (
        <div className={cn("flex items-center pt-4", className)} {...props} />
    );
}
