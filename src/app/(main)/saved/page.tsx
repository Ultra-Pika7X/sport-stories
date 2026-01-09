"use client";

import { NewsCard } from "@/components/NewsCard";
import { useAuth } from "@/context/AuthContext";
import { useLibrary } from "@/context/LibraryContext";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";

export default function SavedPage() {
    const { savedStories, loading: libraryLoading } = useLibrary();
    const { loading: authLoading } = useAuth();

    const loading = authLoading || libraryLoading;

    return (
        <main className="min-h-screen glow-mesh">
            <section className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/25">
                            <Bookmark className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold">
                            Saved <span className="text-gradient">Stories</span>
                        </h1>
                    </div>
                    <p className="text-muted font-medium">
                        Your personal collection of stories to read later
                    </p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : savedStories.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-3xl p-12 text-center max-w-lg mx-auto"
                    >
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bookmark className="w-8 h-8 text-white/40" />
                        </div>
                        <h2 className="text-xl font-bold mb-3">No saved stories yet</h2>
                        <p className="text-white/60">
                            Click the bookmark icon on any story to save it for later
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {savedStories.map((article, index) => (
                            <NewsCard key={article.url} article={article} index={index} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
