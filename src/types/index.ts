// Shared type definitions

// Theme types
export type Theme = "light" | "dark" | "system";

// Video types
export interface VideoSource {
    src: string;
    type: "hls" | "mp4" | "webm";
    quality?: string;
}

export interface VideoMetadata {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    duration?: number;
    sources: VideoSource[];
}

// Sport types
export type SportCategory =
    | "football"
    | "basketball"
    | "tennis"
    | "motorsport"
    | "mma"
    | "hockey"
    | "baseball"
    | "other";

export interface SportEvent {
    id: string;
    title: string;
    category: SportCategory;
    description?: string;
    thumbnail?: string;
    date: string;
    isLive?: boolean;
    streamUrl?: string;
}

// User types
export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: string;
}

export interface UserPreferences {
    theme: Theme;
    favoriteCategories: SportCategory[];
    autoplay: boolean;
    defaultQuality: "auto" | "1080p" | "720p" | "480p" | "360p";
}

// Re-export news and highlights types
export * from "./news";
export * from "./highlights";

export interface LiveStream extends SportEvent {
    viewerCount: number;
    streamUrl: string;
    thumbnail: string;
    teams: {
        home: { name: string; logo: string };
        away: { name: string; logo: string };
    };
}

// Re-export stream types (which are currently defined in lib/streams, but ideally should be here or separate)
// For now, let's manually define LiveStream here or move it.
// Moving it is cleaner.
