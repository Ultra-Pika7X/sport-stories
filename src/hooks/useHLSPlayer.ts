"use client";

import { useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
import { usePlayerStore, type QualityLevel } from "@/stores/playerStore";

interface UseHLSPlayerOptions {
    autoPlay?: boolean;
    startLevel?: number;
}

export function useHLSPlayer(src: string | null, options: UseHLSPlayerOptions = {}) {
    const { autoPlay = false, startLevel = -1 } = options;

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const {
        setPlaying,
        setCurrentTime,
        setDuration,
        setBuffered,
        setLoading,
        setError,
        setQualities,
        setCurrentQuality,
        currentQuality,
        volume,
        isMuted,
        reset,
    } = usePlayerStore();

    // Initialize HLS
    useEffect(() => {
        if (!src || !videoRef.current) return;

        const video = videoRef.current;
        reset();
        setLoading(true);

        // Check if HLS is supported
        if (Hls.isSupported()) {
            const hls = new Hls({
                startLevel,
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
            });

            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                const qualities: QualityLevel[] = data.levels.map((level, index) => ({
                    index,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    label: `${level.height}p`,
                }));
                setQualities(qualities);
                setLoading(false);

                if (autoPlay) {
                    video.play().catch(() => { });
                }
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
                setCurrentQuality(data.level);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    setError(data.details);
                    setLoading(false);
                }
            });

            return () => {
                hls.destroy();
                hlsRef.current = null;
            };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Native HLS support (Safari)
            video.src = src;
            setLoading(false);

            if (autoPlay) {
                video.play().catch(() => { });
            }
        } else {
            setError("HLS is not supported in this browser");
            setLoading(false);
        }
    }, [src, autoPlay, startLevel, reset, setLoading, setError, setQualities, setCurrentQuality]);

    // Video event handlers
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlers = {
            play: () => setPlaying(true),
            pause: () => setPlaying(false),
            timeupdate: () => setCurrentTime(video.currentTime),
            durationchange: () => setDuration(video.duration),
            progress: () => {
                if (video.buffered.length > 0) {
                    setBuffered(video.buffered.end(video.buffered.length - 1));
                }
            },
            waiting: () => setLoading(true),
            canplay: () => setLoading(false),
            error: () => setError("Video playback error"),
        };

        Object.entries(handlers).forEach(([event, handler]) => {
            video.addEventListener(event, handler);
        });

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                video.removeEventListener(event, handler);
            });
        };
    }, [setPlaying, setCurrentTime, setDuration, setBuffered, setLoading, setError]);

    // Sync volume
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Quality switching
    useEffect(() => {
        if (hlsRef.current && currentQuality !== undefined) {
            hlsRef.current.currentLevel = currentQuality;
        }
    }, [currentQuality]);

    // Controls
    const play = useCallback(() => videoRef.current?.play(), []);
    const pause = useCallback(() => videoRef.current?.pause(), []);
    const toggle = useCallback(() => {
        const video = videoRef.current;
        if (video?.paused) video.play();
        else video?.pause();
    }, []);
    const seek = useCallback((time: number) => {
        if (videoRef.current) videoRef.current.currentTime = time;
    }, []);

    return {
        videoRef,
        hlsRef,
        play,
        pause,
        toggle,
        seek,
    };
}
