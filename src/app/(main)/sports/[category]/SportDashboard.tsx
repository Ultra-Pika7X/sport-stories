"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getSportsNews } from "@/lib/news";
import { getLiveStreams } from "@/lib/streams";
import { getHighlights } from "@/lib/highlights";
import { getSportConfig } from "@/lib/sports";
import { Article, Highlight, LiveStream } from "@/types";
import { NewsCard } from "@/components/NewsCard";
import { HighlightCard } from "@/components/HighlightCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
    Calendar,
    Newspaper,
    Play,
    TrendingUp,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function SportDashboard({ category }: { category: string }) {
    const config = getSportConfig(category);

    const [news, setNews] = useState<Article[]>([]);
    const [streams, setStreams] = useState<LiveStream[]>([]);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Parallel fetching of all content types for this sport
                const [newsData, streamsData, highlightsData] = await Promise.all([
                    getSportsNews(category),
                    getLiveStreams(),
                    getHighlights()
                ]);

                setNews(newsData.slice(0, 6)); // Top 6 articles
                setStreams(streamsData.filter(s => s.category === category));
                setHighlights(highlightsData.filter(h => h.category === category).slice(0, 4));
            } catch (error) {
                console.error("Failed to load sport data", error);
            } finally {
                setLoading(false);
            }
        }
        if (config) {
            loadData();
        }
    }, [category, config]);

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-black">Sport Not Found</h1>
                    <Link href="/" className="text-primary hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Hero Banner */}
            <div className="relative h-[40vh] min-h-[400px] flex items-end">
                <div className="absolute inset-0">
                    <Image
                        src={config.bannerImage}
                        className="object-cover"
                        alt={config.label}
                        fill
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className={`p-3 w-fit rounded-2xl bg-${config.color}-500/20 backdrop-blur-md border border-${config.color}-500/30 text-${config.color}-400`}>
                            {config.icon}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                            {config.label}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl">
                            {config.description}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-16">

                {/* Live Streams Section */}
                {(streams.length > 0 || loading) && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Live Now
                            </h2>
                            <Link href="/live" className="text-sm font-bold text-muted hover:text-white flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                            ) : (
                                streams.map(stream => (
                                    <Link key={stream.id} href={`/watch/${stream.id}`} className="group relative block aspect-video rounded-xl overflow-hidden">
                                        <Image
                                            src={stream.thumbnail}
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            alt={stream.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-xl">
                                                <Play className="w-5 h-5 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase text-white/80 mb-1">
                                                <span>{stream.teams.home.name}</span>
                                                <span className="text-white/40">vs</span>
                                                <span>{stream.teams.away.name}</span>
                                            </div>
                                            <h3 className="font-bold text-white leading-tight">{stream.title}</h3>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* Highlights Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-secondary" />
                            Trending Highlights
                        </h2>
                        <Link href="/highlights" className="text-sm font-bold text-muted hover:text-white flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            highlights.map((highlight, index) => (
                                <HighlightCard key={highlight.id} highlight={highlight} index={index} />
                            ))
                        )}
                    </div>
                </section>

                {/* Latest News Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <Newspaper className={`w-5 h-5 text-${config.color}-400`} />
                            Latest News
                        </h2>
                        <Link href="/news" className="text-sm font-bold text-muted hover:text-white flex items-center gap-1">
                            Read more <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            news.map((article, index) => (
                                <NewsCard key={index} article={article} index={index} />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
