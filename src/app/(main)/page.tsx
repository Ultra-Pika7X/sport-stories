"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { MatchCard } from "@/components/MatchCard";
import { HighlightCard } from "@/components/HighlightCard";
import {
  TrendingUp,
  ChevronRight,
  Play,
  Activity,
  Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Article } from "@/types/news";
import { Highlight } from "@/types/highlights";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

// --- Mock Data ---

const MOCK_LIVE_MATCHES = [
  { id: 1, home: "Real Madrid", away: "Barcelona", score: "2 - 1", time: "74'", league: "El Clásico", color: "from-white/10 to-white/5", isLive: true },
  { id: 2, home: "Lakers", away: "Warriors", score: "102 - 98", time: "Q4 3:12", league: "NBA", color: "from-purple-500/10 to-purple-500/5", isLive: true },
  { id: 3, home: "Man City", away: "Arsenal", score: "0 - 0", time: "12'", league: "Premier League", color: "from-blue-400/10 to-blue-400/5", isLive: true },
  { id: 4, home: "Chiefs", away: "Bills", score: "14 - 21", time: "Q2 8:45", league: "NFL", color: "from-red-500/10 to-red-500/5", isLive: true },
];

const MOCK_HIGHLIGHTS: Highlight[] = [
  {
    id: "101",
    title: "UFC 300: Pereira finishes Hill properly",
    category: "mma",
    league: "UFC",
    thumbnail: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=600",
    videoUrl: "",
    duration: "12:45",
    views: 2400000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "102",
    title: "LeBron's 40-point Masterclass vs Warriors",
    category: "basketball",
    league: "NBA",
    thumbnail: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=600",
    videoUrl: "",
    duration: "08:12",
    views: 1100000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "103",
    title: "F1 Monaco Grand Prix: Top Overtakes",
    category: "f1",
    league: "Formula 1",
    thumbnail: "https://images.unsplash.com/photo-1500051638674-bb996a00b717?auto=format&fit=crop&q=80&w=600",
    videoUrl: "",
    duration: "05:30",
    views: 850000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "104",
    title: "Champions League Final: Full Highlights",
    category: "football",
    league: "UCL",
    thumbnail: "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&q=80&w=600",
    videoUrl: "",
    duration: "14:20",
    views: 3200000,
    createdAt: new Date().toISOString(),
  },
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
          // 1. Try reading from LocalStorage FIRST (Fastest & Free)
          const localPrefs = localStorage.getItem(`preferences_${user.uid}`);

          if (localPrefs) {
            const p = JSON.parse(localPrefs);
            setPreferences(p);
            keywords = [
              ...(p.sports || []),
              ...(p.leagues || []),
              ...(p.teams || []),
              ...(p.players || [])
            ];
          }

          // 2. Only check Firestore if LocalStorage missed (or to sync)
          if (keywords.length === 0) {
            try {
              const userDoc = await getDoc(doc(db, "users", user.uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                setPreferences(data.preferences);
                const p = data.preferences || {};
                keywords = [
                  ...(p.sports || []),
                  ...(p.leagues || []),
                  ...(p.teams || []),
                  ...(p.players || [])
                ];
                // Update localStorage for next time
                localStorage.setItem(`preferences_${user.uid}`, JSON.stringify(p));
              }
            } catch (err) {
              console.warn("Firestore fetch failed, relying on defaults", err);
            }
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
    <main className="min-h-screen bg-background text-foreground">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
              {new Date().getHours() < 12 ? "Good Morning" : "Good Evening"}
            </h1>
            <p className="text-xl font-medium text-white/40">
              {preferences?.sports?.length > 0
                ? <>Your daily brief on <span className="text-white/80">{preferences.sports[0]}</span>, <span className="text-white/80">{preferences.leagues?.[0] || "Top Leagues"}</span> & more.</>
                : "Your personalized sports world is ready."}
            </p>
          </div>

          {/* Premium Tab Switcher */}
          <div className="flex p-1.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-md">
            {(["all", "live", "news", "highlights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === tab
                    ? "bg-white text-black shadow-lg scale-100"
                    : "text-white/40 hover:text-white hover:bg-white/5"
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
              className="space-y-20"
            >
              {/* Hero Section */}
              {activeTab === "all" && heroArticle && (
                <section className="relative group rounded-[2.5rem] overflow-hidden aspect-[4/3] md:aspect-[21/9] border border-white/10 shadow-2xl cursor-pointer">
                  <a href={heroArticle.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <Image
                      src={heroArticle.urlToImage}
                      alt={heroArticle.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-[10s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />

                    <div className="absolute bottom-0 left-0 p-8 md:p-14 w-full md:w-2/3">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-red-600/20 animate-pulse">
                          Breaking
                        </span>
                        <span className="text-xs font-bold text-white/70 uppercase tracking-widest border-l border-white/20 pl-4">
                          {heroArticle.source.name}
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-8 text-white drop-shadow-2xl">
                        {heroArticle.title}
                      </h2>
                      <div className="flex items-center gap-4 group/btn">
                        <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </span>
                        <span className="font-bold text-sm tracking-widest uppercase text-white/80 group-hover/btn:text-white transition-colors">Read Full Story</span>
                      </div>
                    </div>
                  </a>
                </section>
              )}

              {/* Live Matches */}
              {(activeTab === "all" || activeTab === "live") && (
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">Live Action</h3>
                      <p className="text-sm text-muted font-medium">Happening right now across the globe</p>
                    </div>
                  </div>

                  <div className="relative -mx-6 px-6">
                    <div className="flex overflow-x-auto gap-5 pb-8 no-scrollbar snap-x snap-mandatory">
                      {MOCK_LIVE_MATCHES.map((match) => (
                        <div key={match.id} className="snap-center">
                          <MatchCard {...match} />
                        </div>
                      ))}
                    </div>
                    {/* Fade edges */}
                    <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-background to-transparent pointer-events-none" />
                  </div>
                </section>
              )}

              {/* News Grid */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">For You</h3>
                    <p className="text-sm text-muted font-medium">Curated based on your interests</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridArticles.map((article, index) => (
                    <NewsCard key={index} article={article} index={index} />
                  ))}
                </div>
              </section>

              {/* Highlights */}
              {(activeTab === "all" || activeTab === "highlights") && (
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">Must Watch</h3>
                      <p className="text-sm text-muted font-medium">Top moments from the last 24h</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MOCK_HIGHLIGHTS.map((highlight, index) => (
                      <HighlightCard key={highlight.id} highlight={highlight} index={index} />
                    ))}
                  </div>
                </section>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-40 pt-10 border-t border-white/5 flex flex-col items-center">
          <Zap className="w-8 h-8 text-white/20 mb-6" />
          <p className="text-white/20 font-medium text-sm text-center max-w-md">
            You&apos;ve reached the end. New content is being curated for you. Check back in a few minutes.
          </p>
        </div>

      </div>
    </main>
  );
}
