"use client";

import { useEffect, useState, useMemo } from "react";
import { getHighlights } from "@/lib/highlights";
import { Highlight, HighlightSortOption } from "@/types";
import { HighlightCard } from "@/components/HighlightCard";
import {
    Zap,
    Trophy,
    LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { SkeletonCard } from "@/components/ui/Skeleton";

const categories = [
    { id: "all", label: "All Clips", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "football", label: "Football", icon: "⚽" },
    { id: "basketball", label: "Basketball", icon: "🏀" },
    { id: "motorsport", label: "Formula 1", icon: "🏎️" },
    { id: "mma", label: "MMA", icon: "🥊" },
    { id: "tennis", label: "Tennis", icon: "🎾" },
];

export default function HighlightsPage() {
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState<HighlightSortOption>("recent");

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getHighlights();
            setHighlights(data);
            setLoading(false);
        }
        load();
    }, []);

    const processedHighlights = useMemo(() => {
        let filtered = highlights;
        if (selectedCategory !== "all") {
            filtered = highlights.filter(h => h.category === selectedCategory);
        }

        return [...filtered].sort((a, b) => {
            if (sortBy === "recent") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return b.views - a.views;
        });
    }, [highlights, selectedCategory, sortBy]);

    return (
        <main className="min-h-screen bg-background pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-secondary fill-secondary" />
                            <span className="text-secondary text-xs font-black uppercase tracking-widest">Instant Replays</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Sports <span className="text-primary">Highlights</span></h1>
                        <p className="text-muted text-lg font-medium">Relive the greatest moments in sport history.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
                            {(["recent", "views"] as const).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-xs font-black capitalize transition-all",
                                        sortBy === option
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-muted hover:text-white"
                                    )}
                                >
                                    {option === "recent" ? "Newest" : "Most Viewed"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-10 pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all border",
                                selectedCategory === cat.id
                                    ? "bg-white text-black border-white shadow-xl shadow-white/5"
                                    : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            {typeof cat.icon === 'string' ? cat.icon : cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {processedHighlights.map((highlight, index) => (
                                <HighlightCard
                                    key={highlight.id}
                                    highlight={highlight}
                                    index={index}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!loading && processedHighlights.length === 0 && (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
                            <Trophy className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No highlights found</h3>
                        <p className="text-muted">Try adjusting your filters or category.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
