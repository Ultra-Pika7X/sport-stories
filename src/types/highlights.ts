import { SportCategory } from "./index";

export interface Highlight {
    id: string;
    title: string;
    category: SportCategory;
    league: string;
    thumbnail: string;
    videoUrl: string;
    previewUrl?: string; // Short clip for hover
    duration: string;
    views: number;
    createdAt: string;
}

export type HighlightSortOption = "recent" | "views";
