import { cn } from "@/lib/cn";

export interface SkeletonProps {
    className?: string;
    variant?: "default" | "circular" | "rounded";
    animation?: "pulse" | "shimmer" | "none";
}

export function Skeleton({
    className,
    variant = "default",
    animation = "shimmer",
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "bg-white/5",
                variant === "circular" && "rounded-full",
                variant === "rounded" && "rounded-xl",
                variant === "default" && "rounded-lg",
                animation === "pulse" && "animate-pulse",
                animation === "shimmer" && "skeleton-shimmer",
                className
            )}
        />
    );
}

// Preset skeleton components
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-4",
                        i === lines - 1 && "w-4/5" // Last line shorter
                    )}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-xl bg-surface border border-border p-6", className)}>
            <Skeleton className="w-full h-40 mb-4" variant="rounded" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <SkeletonText lines={2} />
            <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-20" variant="rounded" />
                <Skeleton className="h-8 w-20" variant="rounded" />
            </div>
        </div>
    );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
    };

    return <Skeleton className={sizeClasses[size]} variant="circular" />;
}
