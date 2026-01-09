import { SportEvent, LiveStream } from "@/types";

export const MOCK_STREAMS: LiveStream[] = [
    {
        id: "stream-1",
        title: "Real Madrid vs Barcelona",
        category: "football",
        description: "The Classic - La Liga Matchday 26",
        thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
        date: new Date().toISOString(),
        isLive: true,
        viewerCount: 1240500,
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        teams: {
            home: { name: "Real Madrid", logo: "RM" },
            away: { name: "Barcelona", logo: "BAR" }
        }
    },
    {
        id: "stream-2",
        title: "Lakers vs Warriors",
        category: "basketball",
        description: "NBA Regular Season",
        thumbnail: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800",
        date: new Date().toISOString(),
        isLive: true,
        viewerCount: 850200,
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        teams: {
            home: { name: "Lakers", logo: "LAL" },
            away: { name: "Warriors", logo: "GSW" }
        }
    },
    {
        id: "stream-3",
        title: "Monaco Grand Prix",
        category: "motorsport",
        description: "Formula 1 - Main Race",
        thumbnail: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?auto=format&fit=crop&q=80&w=800",
        date: new Date().toISOString(),
        isLive: true,
        viewerCount: 4200000,
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        teams: {
            home: { name: "F1 TV", logo: "F1" },
            away: { name: "Sky Sports", logo: "SKY" }
        }
    },
    {
        id: "stream-4",
        title: "Djokovic vs Alcaraz",
        category: "tennis",
        description: "Wimbledon Finals",
        thumbnail: "https://images.unsplash.com/photo-1592492152431-0f4c9443e49e?auto=format&fit=crop&q=80&w=800",
        date: new Date().toISOString(),
        isLive: true,
        viewerCount: 320400,
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        teams: {
            home: { name: "Djokovic", logo: "ND" },
            away: { name: "Alcaraz", logo: "CA" }
        }
    }
];

export async function getLiveStreams(): Promise<LiveStream[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_STREAMS;
}

export async function getStreamById(id: string): Promise<LiveStream | undefined> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_STREAMS.find(s => s.id === id);
}
