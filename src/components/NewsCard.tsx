"use client";

import { Article } from "@/types/news";
import { motion } from "framer-motion";
import { Calendar, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface NewsCardProps {
    article: Article;
    index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
    return (
        <Link href={article.url} target="_blank" rel="noopener noreferrer">
            <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className="premium-card group cursor-pointer h-full"
            >
                <div className="relative h-52 -mx-6 -mt-6 mb-5 overflow-hidden">
                    <img
                        src={article.urlToImage || "https://images.unsplash.com/photo-1461896704190-aa2727376a94?auto=format&fit=crop&q=80"}
                        alt={article.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary/90 backdrop-blur-sm text-white rounded-full shadow-lg">
                            {article.source.name}
                        </span>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <div className="p-2 bg-white rounded-full shadow-lg">
                            <ArrowUpRight className="w-4 h-4 text-black" />
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold mb-3 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {article.title}
                </h3>

                <p className="text-muted text-sm mb-5 line-clamp-2 leading-relaxed">
                    {article.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted font-medium pt-4 border-t border-white/5">
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
            </motion.article>
        </Link>
    );
}
