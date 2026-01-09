"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { NewsCard } from "@/components/NewsCard";
import {
  Trophy,
  TrendingUp,
  ChevronRight,
  Zap,
  Star,
  Play,
  Activity,
  Clock,
  Filter
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Article } from "@/types/news";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

// --- Mock Data for Live Matches & Highlights ---

const MOCK_LIVE_MATCHES = [
  { id: 1, home: "Real Madrid", away: "Barcelona", score: "2 - 1", time: "74'", league: "La Liga", color: "from-white/10 to-white/5" },
  { id: 2, home: "Lakers", away: "Warriors", score: "102 - 98", time: "Q4", league: "NBA", color: "from-purple-500/10 to-purple-500/5" },
  { id: 3, home: "Man City", away: "Arsenal", score: "0 - 0", time: "12'", league: "Premier League", color: "from-blue-400/10 to-blue-400/5" },
];

const MOCK_HIGHLIGHTS = [
  { id: 101, title: "UFC 300: Pereira finishes Hill", duration: "12:45", views: "2.4M", thumbnail: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400" },
  { id: 102, title: "LeBron's 40-point Masterclass", duration: "08:12", views: "1.1M", thumbnail: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=400" },
  { id: 103, title: "F1: Top Overtakes in Monaco", duration: "05:30", views: "850K", thumbnail: "https://images.unsplash.com/photo-1500051638674-bb996a00b717?auto=format&fit=crop&q=80&w=400" },
];

export default function Home() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "live" | "news" | "highlights">("all");

  useEffect(() => {
    async function fetchHomeData() {
      setLoading(true);
      try {
        let keywords: string[] = [];

        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setPreferences(data.preferences);

            // Extract keywords from preferences
            const p = data.preferences || {};
            keywords = [
              ...(p.sports || []),
              ...(p.leagues || []),
              ...(p.teams || []),
              ...(p.players || [])
            ];
          }
        }

        const keywordsParam = keywords.length > 0 ? `?keywords=${keywords.join(",")}` : "";
        const response = await fetch(`/api/news${keywordsParam}`);
        if (!response.ok) throw new Error("Failed to fetch news");
        const news = await response.json();
        setArticles(news);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, [user]);

  const heroArticle = articles[0];
  const gridArticles = articles.slice(1);

  return (
    <main className="min-h-screen bg-background">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Personalized Welcome */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-3">
              Good {new Date().getHours() < 12 ? "morning" : "evening"}{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted text-lg font-medium">
              {preferences?.sports?.length > 0
                ? `Catch up on the latest in ${preferences.sports[0]} and more`
                : "Your personalized sports world is ready"}
            </p>
          </div>

          {/* Filtering Tabs */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
            {(["all", "live", "news", "highlights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all",
                  activeTab === tab
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

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
              className="space-y-16"
            >

              {/* Hero Section - Featured Personalized Story */}
              {activeTab === "all" && heroArticle && (
                <section>
                  <a
                    href={heroArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative h-[500px] md:h-[600px] rounded-[32px] overflow-hidden group border border-white/5 shadow-2xl"
                  >
                    <Image
                      src={heroArticle.urlToImage}
                      alt={heroArticle.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-4/5 lg:w-2/3">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-2 bg-primary text-white text-xs font-black uppercase rounded-full tracking-widest shadow-xl">
                          Live Now
                        </span>
                        <span className="text-white/70 font-bold tracking-tight uppercase text-xs">
                          {heroArticle.source.name}
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                        {heroArticle.title}
                      </h2>
                      <span className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-black text-sm hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                        Read Story <ChevronRight className="w-5 h-5" />
                      </span>
                    </div>
                  </a>
                </section>
              )}

              {/* Live Matches Scroller */}
              {(activeTab === "all" || activeTab === "live") && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold">Live Matches</h3>
                    </div>
                    <button className="text-primary font-bold hover:underline flex items-center gap-1">
                      View Scoreboard <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                    {MOCK_LIVE_MATCHES.map((match) => (
                      <div key={match.id} className={cn(
                        "flex-shrink-0 w-80 p-6 rounded-3xl border border-white/10 glass bg-gradient-to-br",
                        match.color
                      )}>
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{match.league}</span>
                          <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                        </div>
                        <div className="flex gap-4 items-center justify-between mb-2">
                          <div className="text-center flex-1">
                            <div className="w-12 h-12 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-lg">{match.home[0]}</div>
                            <span className="font-bold text-xs line-clamp-1">{match.home}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black tracking-tighter mb-1">{match.score}</span>
                            <span className="text-[10px] text-muted-foreground font-bold">{match.time}</span>
                          </div>
                          <div className="text-center flex-1">
                            <div className="w-12 h-12 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-lg">{match.away[0]}</div>
                            <span className="font-bold text-xs line-clamp-1">{match.away}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Content Grid */}
              <section>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Recommended for You</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {gridArticles.map((article, index) => (
                    <NewsCard key={index} article={article} index={index} />
                  ))}
                </div>
              </section>

              {/* Highlights Section */}
              {(activeTab === "all" || activeTab === "highlights") && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <Play className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold">Must-watch Highlights</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_HIGHLIGHTS.map((video) => (
                      <div key={video.id} className="group relative rounded-3xl overflow-hidden glass border border-white/5 cursor-pointer">
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={video.thumbnail}
                            alt={video.title} // Added alt prop
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40">
                              <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 rounded-md text-[10px] font-bold text-white">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{video.title}</h4>
                          <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-secondary" /> {video.views} views
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="mt-32 pt-16 border-t border-white/5 text-center">
          <p className="text-muted text-sm font-medium uppercase tracking-[0.2em] mb-4">You&apos;re all caught up</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
          >
            Back to Top
          </button>
        </div>
      </div>
    </main>
  );
}
