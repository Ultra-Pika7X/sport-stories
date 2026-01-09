import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for conditional class names
 * with proper Tailwind CSS class merging
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
