import { Highlight } from "@/types";

export const MOCK_HIGHLIGHTS: Highlight[] = [
    {
        id: "h1",
        title: "Lionel Messi's Incredible Freekick vs Colombia",
        category: "football",
        league: "Copa America",
        thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Using HLS for consistency if needed, or MP4
        previewUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration: "0:45",
        views: 1250000,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: "h2",
        title: "LeBron James Clutch 3-Pointer to Win the Game",
        category: "basketball",
        league: "NBA",
        thumbnail: "https://images.unsplash.com/photo-1546519119-0597381eaa9e?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        previewUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        duration: "1:12",
        views: 850000,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: "h3",
        title: "Max Verstappen's Masterclass in Monaco",
        category: "motorsport",
        league: "Formula 1",
        thumbnail: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        previewUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        duration: "2:30",
        views: 2100000,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
        id: "h4",
        title: "Alcaraz Stunning Forehand Winner vs Djokovic",
        category: "tennis",
        league: "Wimbledon",
        thumbnail: "https://images.unsplash.com/photo-1592492152431-0f4c9443e49e?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        previewUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        duration: "0:58",
        views: 420000,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
    {
        id: "h5",
        title: "Conor McGregor's Fastest Knockout in UFC History",
        category: "mma",
        league: "UFC",
        thumbnail: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        previewUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        duration: "0:13",
        views: 5600000,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    }
];

export async function getHighlights(): Promise<Highlight[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_HIGHLIGHTS;
}
