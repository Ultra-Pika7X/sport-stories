import {
    Trophy,
    Activity,
    Flame,
    CircleDot, // For Tennis ball-ish
    Flag, // For F1/Motorsport
    Target // For MMA/Boxing
} from "lucide-react";
import React from "react";

export type SportId = "football" | "basketball" | "motorsport" | "tennis" | "mma" | "cricket" | "rugby";

export interface SportConfig {
    id: SportId;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string; // Tailwind class-friendly or hex
    bannerImage: string;
}

export const SPORTS_CONFIG: Record<string, SportConfig> = { // Key is the 'slug' used in URL
    football: {
        id: "football",
        label: "Football",
        description: "The beautiful game. Latest scores, transfers, and match highlights.",
        icon: <Trophy className="w-4 h-4" />,
        color: "emerald",
        bannerImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
    },
    basketball: {
        id: "basketball",
        label: "Basketball",
        description: "NBA action, buzzer beaters, and slam dunks.",
        icon: <Activity className="w-4 h-4" />, // Placeholder
        color: "orange",
        bannerImage: "https://images.unsplash.com/photo-1546519119-0597381eaa9e?auto=format&fit=crop&q=80&w=1200"
    },
    motorsport: {
        id: "motorsport",
        label: "Motorsport",
        description: "F1, MotoGP, and the world of speed.",
        icon: <Flag className="w-4 h-4" />,
        color: "red",
        bannerImage: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?auto=format&fit=crop&q=80&w=1200"
    },
    tennis: {
        id: "tennis",
        label: "Tennis",
        description: "Grand Slams, ATP tours, and match points.",
        icon: <CircleDot className="w-4 h-4" />,
        color: "lime",
        bannerImage: "https://images.unsplash.com/photo-1592492152431-0f4c9443e49e?auto=format&fit=crop&q=80&w=1200"
    },
    mma: {
        id: "mma",
        label: "MMA",
        description: "UFC fight nights, knockouts, and analysis.",
        icon: <Target className="w-4 h-4" />,
        color: "rose",
        bannerImage: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=1200"
    }
};

export const getSportConfig = (slug: string): SportConfig | undefined => {
    return SPORTS_CONFIG[slug];
};

export const getAllSports = (): SportConfig[] => {
    return Object.values(SPORTS_CONFIG);
};
