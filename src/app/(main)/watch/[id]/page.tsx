"use client";

import { useEffect, useState, use } from "react";
import { getStreamById, MOCK_STREAMS } from "@/lib/streams";
import { LiveStream } from "@/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
    Users,
    Share2,
    MessageCircle,
    Heart,
    Info,
    ChevronRight,
    Activity,
    Shield
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";

const HLSPlayer = dynamic(
    () => import("@/components/video/HLSPlayer").then((mod) => mod.HLSPlayer),
    {
        ssr: false,
        loading: () => <Skeleton className="w-full h-full bg-black/50 rounded-3xl" />
    }
);

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [stream, setStream] = useState<LiveStream | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStream() {
            setLoading(true);
            const data = await getStreamById(id);
            if (data) setStream(data);
            setLoading(false);
        }
        loadStream();
    }, [id]);

    if (!loading && !stream) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-black mb-4">Stream not found</h1>
                    <Link href="/live" className="text-primary font-bold hover:underline">Back to Live Matches</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-24 pb-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* Main Content (Player & Details) */}
                    <div className="xl:col-span-3 space-y-8">

                        {/* Player Container */}
                        <div className="relative group shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden border border-white/5 bg-black">
                            {loading ? (
                                <Skeleton className="w-full aspect-video rounded-3xl" />
                            ) : (
                                <HLSPlayer
                                    src={stream!.streamUrl}
                                    poster={stream!.thumbnail}
                                    autoPlay
                                    className="w-full h-full"
                                />
                            )}
                        </div>

                        {/* Stream Titles & Stats */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-white/5">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-600/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            LIVE
                                        </span>
                                        <span className="text-muted font-bold tracking-tight uppercase text-xs flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5 text-primary" />
                                            Official Stream
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                                        {loading ? <Skeleton className="h-10 w-2/3" /> : stream!.title}
                                    </h1>
                                    <p className="text-muted font-medium text-lg max-w-2xl">
                                        {loading ? <Skeleton className="h-6 w-full" /> : stream!.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 py-2 px-4 rounded-2xl bg-white/5 border border-white/5 whitespace-nowrap">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span className="font-black text-sm">
                                                {loading ? "..." : (stream!.viewerCount / 1000).toFixed(1)}K
                                                <span className="text-muted font-bold ml-1 text-xs uppercase tracking-wider">watching</span>
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:text-red-500 transition-all">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Match Details Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
                                    <div className="flex items-center gap-3 text-sm text-primary font-black uppercase tracking-widest">
                                        <Info className="w-5 h-5" />
                                        Match Info
                                    </div>
                                    <div className="flex items-center justify-between text-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center font-black text-xl shadow-xl">
                                                {stream?.teams.home.logo}
                                            </div>
                                            <span className="font-black">{stream?.teams.home.name}</span>
                                        </div>
                                        <span className="text-muted-foreground font-black text-sm uppercase tracking-tighter">vs</span>
                                        <div className="flex items-center gap-4">
                                            <span className="font-black">{stream?.teams.away.name}</span>
                                            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center font-black text-xl shadow-xl">
                                                {stream?.teams.away.logo}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-white/5 border border-white/5 flex flex-col justify-center gap-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted font-bold uppercase text-xs tracking-widest">League</span>
                                        <span className="font-black text-lg">{stream?.category.toUpperCase()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted font-bold uppercase text-xs tracking-widest">Stadium</span>
                                        <span className="font-black text-lg">Metropolitano Stadium</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Up Next / Related) */}
                    <aside className="space-y-8">
                        <section className="bg-white/5 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Top Streams Now
                            </h3>
                            <div className="space-y-4">
                                {MOCK_STREAMS.filter(s => s.id !== id).map((s) => (
                                    <Link key={s.id} href={`/watch/${s.id}`} className="block group">
                                        <div className="flex gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all">
                                            <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={s.thumbnail}
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    alt={s.title}
                                                    fill
                                                    sizes="100px"
                                                />
                                                <div className="absolute inset-0 bg-black/20" />
                                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-600 rounded text-[8px] font-black text-white">LIVE</div>
                                            </div>
                                            <div className="flex flex-col justify-center min-w-0">
                                                <h4 className="font-black text-sm truncate group-hover:text-primary transition-colors">{s.title}</h4>
                                                <span className="text-[10px] text-muted font-bold uppercase">{s.category}</span>
                                                <span className="text-[10px] text-primary font-black mt-1">{(s.viewerCount / 1000).toFixed(1)}K waiting</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link href="/live" className="mt-8 flex items-center justify-center gap-2 py-3 w-full rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all">
                                View Scoreboard
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </section>

                        <section className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20">
                            <h4 className="font-black mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Fan Chat
                            </h4>
                            <p className="text-muted text-sm font-medium mb-6">Join 240,432 other fans watching this match live!</p>
                            <button className="w-full py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all">
                                Open Chat
                            </button>
                        </section>
                    </aside>

                </div>
            </div>
        </main>
    );
}
