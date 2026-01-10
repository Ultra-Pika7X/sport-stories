import { cn } from "@/lib/cn";
import { Activity } from "lucide-react";

interface MatchCardProps {
    home: string;
    away: string;
    score: string;
    time: string;
    league: string;
    color: string;
    isLive?: boolean;
}

export function MatchCard({ home, away, score, time, league, color, isLive = true }: MatchCardProps) {
    const [homeScore, awayScore] = score.split(" - ");

    return (
        <div className={cn(
            "flex-shrink-0 w-80 p-6 rounded-[2rem] border border-white/10 glass relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:border-white/20 cursor-pointer",
            "bg-gradient-to-br",
            color
        )}>
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

            <div className="flex justify-between items-center mb-8 relative z-10">
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50">{league}</span>
                {isLive && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        LIVE
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between relative z-10">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-xl font-bold shadow-lg">
                        {home[0]}
                    </div>
                    <span className="font-bold text-xs text-center text-white/90 line-clamp-1">{home}</span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center px-4">
                    <div className="text-4xl font-black tracking-tighter tabular-nums flex gap-3 text-white">
                        <span>{homeScore}</span>
                        <span className="text-white/20">-</span>
                        <span>{awayScore}</span>
                    </div>
                    <span className="mt-1 text-xs font-bold text-green-400 flex items-center gap-1">
                        {time}
                    </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-xl font-bold shadow-lg">
                        {away[0]}
                    </div>
                    <span className="font-bold text-xs text-center text-white/90 line-clamp-1">{away}</span>
                </div>
            </div>
        </div>
    );
}
