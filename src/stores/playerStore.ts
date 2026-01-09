import { create } from "zustand";

export interface QualityLevel {
    index: number;
    height: number;
    width: number;
    bitrate: number;
    label: string;
}

interface PlayerState {
    // Playback state
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    buffered: number;

    // Controls
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    showControls: boolean;

    // Quality
    qualities: QualityLevel[];
    currentQuality: number;
    autoQuality: boolean;

    // Loading
    isLoading: boolean;
    error: string | null;

    // Actions
    setPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setBuffered: (buffered: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    setFullscreen: (fullscreen: boolean) => void;
    setShowControls: (show: boolean) => void;
    setQualities: (qualities: QualityLevel[]) => void;
    setCurrentQuality: (index: number) => void;
    setAutoQuality: (auto: boolean) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    showControls: true,
    qualities: [],
    currentQuality: -1,
    autoQuality: true,
    isLoading: true,
    error: null,
};

export const usePlayerStore = create<PlayerState>()((set, get) => ({
    ...initialState,

    setPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    setBuffered: (buffered) => set({ buffered }),
    setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
    toggleMute: () => {
        const { isMuted, volume } = get();
        set({ isMuted: !isMuted, volume: isMuted ? (volume || 1) : volume });
    },
    setFullscreen: (isFullscreen) => set({ isFullscreen }),
    setShowControls: (showControls) => set({ showControls }),
    setQualities: (qualities) => set({ qualities }),
    setCurrentQuality: (currentQuality) => set({ currentQuality, autoQuality: currentQuality === -1 }),
    setAutoQuality: (autoQuality) => set({ autoQuality }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    reset: () => set(initialState),
}));
