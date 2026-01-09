import Image from "next/image";
import { Highlight } from "@/types";
import { Play, Eye, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface HighlightCardProps {
    highlight: Highlight;
    index: number;
}

export function HighlightCard({ highlight, index }: HighlightCardProps) {
    const [isHovering, setIsHovering] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isHovering && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay might be blocked, mutes help
                });
            }
        } else if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isHovering]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="premium-card group overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Thumbnail / Video Preview */}
            <div className="relative aspect-video -mx-6 -mt-6 mb-4 overflow-hidden bg-black/20">
                <Image
                    src={highlight.thumbnail}
                    alt={highlight.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={cn(
                        "object-cover transition-opacity duration-500",
                        isHovering ? "opacity-0" : "opacity-100"
                    )}
                />

                {highlight.previewUrl && (
                    <video
                        ref={videoRef}
                        src={highlight.previewUrl}
                        muted
                        loop
                        playsInline
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                            isHovering ? "opacity-100" : "opacity-0"
                        )}
                    />
                )}

                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-black text-white z-10">
                    {highlight.duration}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 pointer-events-none z-20">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-primary">
                        {highlight.league}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
                        <Eye className="w-3 h-3" />
                        {highlight.views >= 1000000
                            ? `${(highlight.views / 1000000).toFixed(1)}M`
                            : `${(highlight.views / 1000).toFixed(0)}K`}
                    </div>
                </div>

                <h3 className="font-black text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                    {highlight.title}
                </h3>

                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(highlight.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{highlight.category}</span>
                </div>
            </div>
        </motion.div>
    );
}
