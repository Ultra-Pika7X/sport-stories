"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { NewsCard } from "@/components/NewsCard";
import {
    Search,
    Filter,
    Trophy,
    ChevronDown,
    Loader2,
    Calendar,
    Grid3X3,
    LayoutList
} from "lucide-react";
import { Article } from "@/types/news";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

const categories = [
    { id: "all", label: "All Sports", icon: <Grid3X3 className="w-4 h-4" /> },
    { id: "football", label: "Football", icon: "⚽" },
    { id: "basketball", label: "Basketball", icon: "🏀" },
    { id: "tennis", label: "Tennis", icon: "🎾" },
    { id: "motorsport", label: "F1", icon: "🏎️" },
    { id: "mma", label: "MMA", icon: "🥊" },
    { id: "cricket", label: "Cricket", icon: "🏏" },
];

export default function NewsPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNews = useCallback(async (isNewSearch = false) => {
        if (isNewSearch) {
            setLoading(true);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            // For now, we use our proxy API which can handle categories
            const categoryParam = selectedCategory !== "all" ? `&q=${selectedCategory}` : "";
            const searchParam = searchQuery ? `&q=${searchQuery}` : "";
            const res = await fetch(`/api/news?page=${isNewSearch ? 1 : page + 1}${categoryParam}${searchParam}`);

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();

            if (isNewSearch) {
                setArticles(data);
            } else {
                setArticles(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
            }

            setHasMore(data.length >= 10);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [selectedCategory, searchQuery, page]);

    useEffect(() => {
        fetchNews(true);
    }, [selectedCategory]); // Re-fetch when category changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchNews(true);
    };

    return (
        <main className="min-h-screen bg-background pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Sports <span className="text-primary">News</span></h1>
                        <p className="text-muted font-medium">Get the latest updates from your favorite arenas.</p>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search news, teams, players..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                        />
                    </form>
                </div>

                {/* Filters & View Switches */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                                    selectedCategory === cat.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-white/5 text-muted hover:text-white hover:bg-white/10"
                                )}
                            >
                                {typeof cat.icon === 'string' ? <span>{cat.icon}</span> : cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-white/10 text-white" : "text-muted hover:text-white")}
                        >
                            <Grid3X3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-white/10 text-white" : "text-muted hover:text-white")}
                        >
                            <LayoutList className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className={cn(
                            "grid gap-8",
                            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                        )}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {articles.length > 0 ? (
                                <div className={cn(
                                    "grid gap-8 mb-16",
                                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                                )}>
                                    {articles.map((article, index) => (
                                        <NewsCard
                                            key={`${article.id}-${index}`}
                                            article={article}
                                            index={index}
                                            className={viewMode === "list" ? "flex-row h-48" : ""}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
                                        <Search className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No news found</h3>
                                    <p className="text-muted">Try adjusting your filters or search query.</p>
                                </div>
                            )}

                            {hasMore && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => fetchNews(false)}
                                        disabled={loadingMore}
                                        className="group px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Load More Stories
                                                <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
