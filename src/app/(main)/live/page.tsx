"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getLiveStreams } from "@/lib/streams";
import { LiveStream } from "@/types";
import {
    Activity,
    Users,
    Play,
    Calendar,
    Trophy,
    Search
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function LivePage() {
    const [streams, setStreams] = useState<LiveStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    useEffect(() => {
        async function loadStreams() {
            setLoading(true);
            const data = await getLiveStreams();
            setStreams(data);
            setLoading(false);
        }
        loadStreams();
    }, []);

    const filteredStreams = selectedCategory === "all"
        ? streams
        : streams.filter(s => s.category === selectedCategory);

    const categories = [
        { id: "all", label: "All Live", icon: <Activity className="w-4 h-4" /> },
        { id: "football", label: "Football", icon: "⚽" },
        { id: "basketball", label: "Basketball", icon: "🏀" },
        { id: "motorsport", label: "Formula 1", icon: "🏎️" },
        { id: "tennis", label: "Tennis", icon: "🎾" },
    ];

    return (
        <main className="min-h-screen bg-background pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-500 text-xs font-black uppercase tracking-widest">Live Now</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Live <span className="text-primary">Matches</span></h1>
                        <p className="text-muted text-lg font-medium">Watch your favorite sports live in high definition.</p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black capitalize transition-all",
                                    selectedCategory === cat.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted hover:text-white"
                                )}
                            >
                                {typeof cat.icon === 'string' ? cat.icon : cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Streams Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredStreams.map((stream, index) => (
                                <Link
                                    key={stream.id}
                                    href={`/watch/${stream.id}`}
                                    className="group relative"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="premium-card overflow-hidden group-hover:border-primary/50 transition-colors"
                                    >
                                        {/* Thumbnail Container */}
                                        <div className="relative aspect-video -mx-6 -mt-6 mb-5 overflow-hidden">
                                            <Image
                                                src={stream.thumbnail}
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt={stream.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                            {/* Live Indicators on Thumbnail */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    LIVE
                                                </span>
                                                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full tracking-widest flex items-center gap-1.5">
                                                    <Users className="w-3 h-3" />
                                                    {(stream.viewerCount / 1000).toFixed(1)}K
                                                </span>
                                            </div>

                                            {/* Hover Play Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 backdrop-blur-[2px]">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"
                                                >
                                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Stream Info */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                                    {stream.title}
                                                </h3>
                                            </div>

                                            <p className="text-muted text-sm font-medium line-clamp-2">
                                                {stream.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-2">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] font-black">
                                                            {stream.teams.home.logo}
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] font-black">
                                                            {stream.teams.away.logo}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-muted-foreground uppercase">{stream.teams.home.name} v {stream.teams.away.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">{stream.category}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!loading && filteredStreams.length === 0 && (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
                            <Trophy className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No live matches in this category</h3>
                        <p className="text-muted">Check back later or explore other sports.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
