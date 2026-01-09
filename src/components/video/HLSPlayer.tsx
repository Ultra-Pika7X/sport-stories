"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useHLSPlayer } from "@/hooks/useHLSPlayer";
import { usePlayerStore } from "@/stores/playerStore";

export interface HLSPlayerProps {
    src: string;
    poster?: string;
    autoPlay?: boolean;
    className?: string;
    onEnded?: () => void;
}

export function HLSPlayer({
    src,
    poster,
    autoPlay = false,
    className,
    onEnded,
}: HLSPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showQualityMenu, setShowQualityMenu] = React.useState(false);

    const {
        isPlaying,
        currentTime,
        duration,
        buffered,
        volume,
        isMuted,
        isFullscreen,
        showControls,
        qualities,
        currentQuality,
        autoQuality,
        isLoading,
        error,
        setVolume,
        toggleMute,
        setFullscreen,
        setShowControls,
        setCurrentQuality,
    } = usePlayerStore();

    const { videoRef, toggle, seek } = useHLSPlayer(src, { autoPlay });

    // Format time for display
    const formatTime = useCallback((seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }, []);

    // Progress percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

    // Handle fullscreen
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
            setFullscreen(true);
        } else {
            await document.exitFullscreen();
            setFullscreen(false);
        }
    }, [setFullscreen]);

    // Auto-hide controls
    const showControlsTemporarily = useCallback(() => {
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        hideControlsTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying, setShowControls]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!containerRef.current?.contains(document.activeElement) &&
                document.activeElement !== document.body) return;

            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault();
                    toggle();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    seek(Math.max(0, currentTime - 10));
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    seek(Math.min(duration, currentTime + 10));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setVolume(Math.min(1, volume + 0.1));
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setVolume(Math.max(0, volume - 0.1));
                    break;
                case "m":
                    toggleMute();
                    break;
                case "f":
                    toggleFullscreen();
                    break;
            }
            showControlsTemporarily();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggle, seek, currentTime, duration, volume, setVolume, toggleMute, toggleFullscreen, showControlsTemporarily]);

    // Handle video ended
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !onEnded) return;

        video.addEventListener("ended", onEnded);
        return () => video.removeEventListener("ended", onEnded);
    }, [videoRef, onEnded]);

    // Handle click on progress bar
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seek(percent * duration);
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full aspect-video bg-black rounded-xl overflow-hidden group",
                className
            )}
            onMouseMove={showControlsTemporarily}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                poster={poster}
                className="w-full h-full object-contain"
                playsInline
                onClick={toggle}
            />

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40"
                    >
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                        <p className="text-red-500 font-medium mb-2">Playback Error</p>
                        <p className="text-muted text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <AnimatePresence>
                {showControls && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"
                    >
                        {/* Center Play Button */}
                        <button
                            onClick={toggle}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-8 h-8 text-white" />
                            ) : (
                                <Play className="w-8 h-8 text-white ml-1" />
                            )}
                        </button>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            {/* Progress Bar */}
                            <div
                                className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
                                onClick={handleProgressClick}
                            >
                                {/* Buffered */}
                                <div
                                    className="absolute h-1 bg-white/30 rounded-full"
                                    style={{ width: `${bufferedPercent}%` }}
                                />
                                {/* Progress */}
                                <div
                                    className="absolute h-1 bg-primary rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                                {/* Thumb */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                    style={{ left: `calc(${progress}% - 6px)` }}
                                />
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Play/Pause */}
                                    <button onClick={toggle} className="text-white hover:text-primary transition-colors">
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                    </button>

                                    {/* Volume */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                                            {isMuted || volume === 0 ? (
                                                <VolumeX className="w-5 h-5" />
                                            ) : (
                                                <Volume2 className="w-5 h-5" />
                                            )}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                        />
                                    </div>

                                    {/* Time */}
                                    <span className="text-white/80 text-sm font-medium tabular-nums">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Quality Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                                            className="text-white hover:text-primary transition-colors"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>

                                        <AnimatePresence>
                                            {showQualityMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute bottom-full right-0 mb-2 p-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 min-w-[120px]"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setCurrentQuality(-1);
                                                            setShowQualityMenu(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-1.5 rounded text-sm",
                                                            autoQuality ? "bg-primary text-white" : "text-white/70 hover:bg-white/10"
                                                        )}
                                                    >
                                                        Auto
                                                    </button>
                                                    {qualities.map((q) => (
                                                        <button
                                                            key={q.index}
                                                            onClick={() => {
                                                                setCurrentQuality(q.index);
                                                                setShowQualityMenu(false);
                                                            }}
                                                            className={cn(
                                                                "w-full text-left px-3 py-1.5 rounded text-sm",
                                                                currentQuality === q.index && !autoQuality
                                                                    ? "bg-primary text-white"
                                                                    : "text-white/70 hover:bg-white/10"
                                                            )}
                                                        >
                                                            {q.label}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Fullscreen */}
                                    <button
                                        onClick={toggleFullscreen}
                                        className="text-white hover:text-primary transition-colors"
                                    >
                                        {isFullscreen ? (
                                            <Minimize className="w-5 h-5" />
                                        ) : (
                                            <Maximize className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Need to import React for useState
import React from "react";
