"use client";

import { Article } from "@/types/news";
import { motion } from "framer-motion";
import { Calendar, User, ArrowUpRight, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLibrary } from "@/context/LibraryContext";
import { useState } from "react";
import { AuthModal } from "./AuthModal";

import { cn } from "@/lib/cn";

interface NewsCardProps {
    article: Article;
    index: number;
    className?: string;
}

export function NewsCard({ article, index, className }: NewsCardProps) {
    const { user } = useAuth();
    const { saveStory, removeStory, isStorySaved, addToHistory } = useLibrary();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const isListView = className?.includes("flex-row");
    const isSaved = isStorySaved(article.url);

    const handleSaveClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setShowAuthModal(true);
            return;
        }

        setSaving(true);
        try {
            if (isSaved) {
                await removeStory(article.url);
            } else {
                await saveStory(article);
            }
        } catch (error) {
            console.error("Error saving story:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCardClick = () => {
        if (user) {
            addToHistory(article);
        }
    };

    return (
        <>
            <Link href={article.url} target="_blank" rel="noopener noreferrer" onClick={handleCardClick}>
                <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: index * 0.1,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    className={cn("premium-card group cursor-pointer h-full transition-all", className)}
                >
                    <div className={cn(
                        "relative h-52 -mx-6 -mt-6 mb-5 overflow-hidden",
                        className?.includes("flex-row") && "h-auto w-1/3 -my-6 -ml-6 -mr-0 mb-0 rounded-l-2xl"
                    )}>
                        <Image // Replaced img with Image component
                            src={article.urlToImage || "https://images.unsplash.com/photo-1461896704190-aa2727376a94?auto=format&fit=crop&q=80"}
                            alt={article.title}
                            fill // Added fill prop
                            sizes={isListView ? "200px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"} // Added sizes prop
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary/90 backdrop-blur-sm text-white rounded-full shadow-lg">
                                {article.source.name}
                            </span>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveClick}
                            disabled={saving}
                            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${isSaved
                                ? "bg-primary text-white"
                                : "bg-black/30 text-white hover:bg-primary/80"
                                } ${saving ? "opacity-50" : ""}`}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                        </button>

                        <div className="absolute bottom-4 right-4 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <div className="p-2 bg-white rounded-full shadow-lg">
                                <ArrowUpRight className="w-4 h-4 text-black" />
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "flex flex-col flex-1",
                        className?.includes("flex-row") && "pl-6 py-2"
                    )}>
                        <h3 className="text-lg font-bold mb-3 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {article.title}
                        </h3>

                        <p className="text-muted text-sm mb-5 line-clamp-2 leading-relaxed">
                            {article.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted font-medium pt-4 border-t border-white/5 mt-auto">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                            {article.author && (
                                <div className="flex items-center gap-1.5 truncate">
                                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{article.author.split(',')[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.article>
            </Link>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
