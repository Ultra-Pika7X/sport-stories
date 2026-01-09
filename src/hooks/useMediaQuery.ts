"use client";

import { useState, useEffect } from "react";

const breakpoints = {
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
    xl: "(min-width: 1280px)",
    "2xl": "(min-width: 1536px)",
    tv: "(min-width: 1920px)",
    mobile: "(max-width: 767px)",
    tablet: "(min-width: 768px) and (max-width: 1023px)",
    desktop: "(min-width: 1024px)",
    touch: "(hover: none) and (pointer: coarse)",
    reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect responsive breakpoints
 * @param query - A breakpoint key or custom media query string
 */
export function useMediaQuery(query: Breakpoint | string): boolean {
    const mediaQuery = breakpoints[query as Breakpoint] ?? query;

    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(mediaQuery).matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(mediaQuery);
        const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

        // Set initial value
        setMatches(mql.matches);

        // Listen for changes
        mql.addEventListener("change", handleChange);
        return () => mql.removeEventListener("change", handleChange);
    }, [mediaQuery]);

    return matches;
}

/**
 * Returns current device type based on breakpoints
 */
export function useDeviceType() {
    const isMobile = useMediaQuery("mobile");
    const isTablet = useMediaQuery("tablet");
    const isDesktop = useMediaQuery("desktop");
    const isTV = useMediaQuery("tv");

    return {
        isMobile,
        isTablet,
        isDesktop,
        isTV,
        deviceType: isTV ? "tv" : isDesktop ? "desktop" : isTablet ? "tablet" : "mobile",
    } as const;
}
