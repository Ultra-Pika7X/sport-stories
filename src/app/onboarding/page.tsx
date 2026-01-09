"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Flame,
    Timer,
    Star,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Search,
    Bell,
    PlayCircle,
    Newspaper,
    BarChart3,
    Calendar,
    Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/cn";

// --- Constants & Mock Data ---

const sports = [
    { id: "football", name: "Football", icon: "⚽" },
    { id: "basketball", name: "Basketball", icon: "🏀" },
    { id: "tennis", name: "Tennis", icon: "🎾" },
    { id: "boxing", name: "Boxing", icon: "🥊" },
    { id: "mma", name: "MMA", icon: "🤼" },
    { id: "f1", name: "Formula 1", icon: "🏎️" },
    { id: "cricket", name: "Cricket", icon: "🏏" },
    { id: "athletics", name: "Athletics", icon: "🏃" },
    { id: "golf", name: "Golf", icon: "⛳" },
    { id: "rugby", name: "Rugby", icon: "🏉" },
];

const leagues = [
    { id: "epl", name: "Premier League", sport: "football" },
    { id: "laliga", name: "La Liga", sport: "football" },
    { id: "seriea", name: "Serie A", sport: "football" },
    { id: "bundesliga", name: "Bundesliga", sport: "football" },
    { id: "nba", name: "NBA", sport: "basketball" },
    { id: "nfl", name: "NFL", sport: "football_us" },
    { id: "ufc", name: "UFC", sport: "mma" },
    { id: "f1_league", name: "Formula 1", sport: "f1" },
];

const commonTeams = [
    { id: "real_madrid", name: "Real Madrid", detail: "Football" },
    { id: "man_utd", name: "Manchester United", detail: "Football" },
    { id: "liverpool", name: "Liverpool", detail: "Football" },
    { id: "lakers", name: "LA Lakers", detail: "Basketball" },
    { id: "warriors", name: "Golden State Warriors", detail: "Basketball" },
    { id: "ferrari", name: "Scuderia Ferrari", detail: "F1" },
    { id: "mclaren", name: "McLaren", detail: "F1" },
    { id: "ny_yankees", name: "NY Yankees", detail: "Baseball" },
    { id: "chiefs", name: "KC Chiefs", detail: "NFL" },
];

const commonPlayers = [
    { id: "messi", name: "Lionel Messi", detail: "Football" },
    { id: "ronaldo", name: "Cristiano Ronaldo", detail: "Football" },
    { id: "lebron", name: "LeBron James", detail: "Basketball" },
    { id: "verstappen", name: "Max Verstappen", detail: "F1" },
    { id: "federer", name: "Roger Federer", detail: "Tennis" },
    { id: "djokovic", name: "Novak Djokovic", detail: "Tennis" },
    { id: "mcgregor", name: "Conor McGregor", detail: "MMA" },
    { id: "hamilton", name: "Lewis Hamilton", detail: "F1" },
];

const contentTypes = [
    { id: "live", name: "Live Matches", icon: <Calendar className="w-5 h-5" /> },
    { id: "highlights", name: "Highlights", icon: <PlayCircle className="w-5 h-5" /> },
    { id: "news", name: "Breaking News", icon: <Newspaper className="w-5 h-5" /> },
    { id: "analysis", name: "Deep Analysis", icon: <BarChart3 className="w-5 h-5" /> },
];

const notificationTypes = [
    { id: "match_start", name: "Match Start", desc: "Get notified when the game begins" },
    { id: "goals", name: "Goals / Key Moments", desc: "Live score updates and highlights" },
    { id: "breaking", name: "Breaking News", desc: "Major transfers and sport updates" },
];

// --- Sub-components ---

function StepWrapper({ children, title, subtitle, className }: { children: React.ReactNode; title: string, subtitle?: string, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn("w-full max-w-2xl mx-auto flex flex-col items-center", className)}
        >
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    {title}
                </h2>
                {subtitle && <p className="text-muted text-lg">{subtitle}</p>}
            </div>
            {children}
        </motion.div>
    );
}

function SelectionGrid({ items, selected, onToggle, renderItem }: { items: any[], selected: string[], onToggle: (id: string) => void, renderItem: (item: any, isSelected: boolean) => React.ReactNode }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {items.map((item) => {
                const isSelected = selected.includes(item.id);
                return (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onToggle(item.id)}
                        className="cursor-pointer"
                    >
                        {renderItem(item, isSelected)}
                    </motion.div>
                );
            })}
        </div>
    );
}

// --- Main Component ---

export default function OnboardingPage() {
    const { user, setOnboardingComplete, isOnboardingComplete } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [selectedContent, setSelectedContent] = useState<string[]>([]);
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    // Search State
    const [teamSearch, setTeamSearch] = useState("");
    const [playerSearch, setPlayerSearch] = useState("");

    const filteredTeams = useMemo(() =>
        commonTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase())),
        [teamSearch]);

    const filteredPlayers = useMemo(() =>
        commonPlayers.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase())),
        [playerSearch]);

    if (isOnboardingComplete) {
        router.replace("/");
        return null;
    }

    const toggleItem = (id: string, state: string[], setState: (val: string[]) => void) => {
        setState(state.includes(id) ? state.filter(i => i !== id) : [...state, id]);
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleComplete = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                preferences: {
                    sports: selectedSports,
                    leagues: selectedLeagues,
                    teams: selectedTeams,
                    players: selectedPlayers,
                    contentTypes: selectedContent,
                    notificationSettings: selectedNotifications,
                },
                onboardingComplete: true,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            await setOnboardingComplete();
            router.replace("/");
        } catch (error) {
            console.error("Onboarding error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepsCount = 7;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 glow-mesh overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px]" />
            </div>

            {/* Progress Bar */}
            <div className="fixed top-12 left-0 w-full px-12 z-50">
                <div className="max-w-4xl mx-auto flex gap-2">
                    {Array.from({ length: stepsCount }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                i <= step ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-white/10"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full relative z-10 max-w-4xl">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <StepWrapper
                            key="step-0"
                            title="Setup Your Profile"
                            subtitle="Let's build your custom sports dashboard in seconds."
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
                                {[
                                    { icon: <Trophy />, title: "Personalized", desc: "Follow your fav clubs" },
                                    { icon: <Zap />, title: "Instant", desc: "Real-time alerts" },
                                    { icon: <Star />, title: "Premium", desc: "Exclusive coverage" }
                                ].map((item, i) => (
                                    <div key={i} className="glass p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                                            {item.icon}
                                        </div>
                                        <h3 className="font-bold mb-1">{item.title}</h3>
                                        <p className="text-sm text-muted">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleNext}
                                className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-105 transition-all text-xl"
                            >
                                Welcome to the Game
                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </StepWrapper>
                    )}

                    {step === 1 && (
                        <StepWrapper
                            key="step-1"
                            title="Your Favorite Sports"
                            subtitle="What do you love to watch?"
                        >
                            <SelectionGrid
                                items={sports}
                                selected={selectedSports}
                                onToggle={(id) => toggleItem(id, selectedSports, setSelectedSports)}
                                renderItem={(sport, isSelected) => (
                                    <div className={cn(
                                        "flex flex-col items-center p-6 rounded-2xl border-2 transition-all h-full justify-center",
                                        isSelected ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                    )}>
                                        <span className="text-4xl mb-3">{sport.icon}</span>
                                        <span className="font-bold text-center text-sm">{sport.name}</span>
                                    </div>
                                )}
                            />
                            <div className="flex gap-4 mt-12">
                                <button onClick={handleBack} className="px-8 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" /> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={selectedSports.length === 0}
                                    className="px-12 py-4 rounded-2xl bg-primary text-white font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                                >
                                    Next Step <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepWrapper>
                    )}

                    {step === 2 && (
                        <StepWrapper
                            key="step-2"
                            title="Select Leagues"
                            subtitle="Which leagues do you follow the most?"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                {leagues.map((league) => {
                                    const isSelected = selectedLeagues.includes(league.id);
                                    return (
                                        <div
                                            key={league.id}
                                            onClick={() => toggleItem(league.id, selectedLeagues, setSelectedLeagues)}
                                            className={cn(
                                                "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                                                isSelected ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold">{league.name}</span>
                                                <span className="text-xs text-muted uppercase tracking-wider">{league.sport}</span>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                isSelected ? "bg-primary border-primary" : "border-white/20"
                                            )}>
                                                {isSelected && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-4 mt-12">
                                <button onClick={handleBack} className="px-8 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={selectedLeagues.length === 0}
                                    className="px-12 py-4 rounded-2xl bg-primary text-white font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                                >
                                    Continue <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepWrapper>
                    )}

                    {step === 3 && (
                        <StepWrapper
                            key="step-3"
                            title="Your Teams"
                            subtitle="Search and select the clubs you bleed for."
                        >
                            <div className="relative w-full mb-8">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search teams (e.g. Manchester United, Lakers...)"
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                {filteredTeams.map((team) => {
                                    const isSelected = selectedTeams.includes(team.id);
                                    return (
                                        <div
                                            key={team.id}
                                            onClick={() => toggleItem(team.id, selectedTeams, setSelectedTeams)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                                isSelected ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                                                {team.name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold">{team.name}</div>
                                                <div className="text-xs text-muted">{team.detail}</div>
                                            </div>
                                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={handleBack} className="px-8 py-4 rounded-2xl border border-white/10 font-bold">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={selectedTeams.length === 0}
                                    className="px-12 py-4 rounded-2xl bg-primary text-white font-bold disabled:opacity-50 flex items-center gap-2 transition-all"
                                >
                                    Keep Going <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepWrapper>
                    )}

                    {step === 4 && (
                        <StepWrapper
                            key="step-4"
                            title="Favorite Players"
                            subtitle="Who are the icons you follow?"
                        >
                            <div className="relative w-full mb-8">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search players (e.g. Messi, LeBron...)"
                                    value={playerSearch}
                                    onChange={(e) => setPlayerSearch(e.target.value)}
                                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                {filteredPlayers.map((player) => {
                                    const isSelected = selectedPlayers.includes(player.id);
                                    return (
                                        <div
                                            key={player.id}
                                            onClick={() => toggleItem(player.id, selectedPlayers, setSelectedPlayers)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                                isSelected ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold overflow-hidden">
                                                {player.name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold">{player.name}</div>
                                                <div className="text-xs text-muted">{player.detail}</div>
                                            </div>
                                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={handleBack} className="px-8 py-4 rounded-2xl border border-white/10 font-bold">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-12 py-4 rounded-2xl bg-primary text-white font-bold flex items-center gap-2 transition-all"
                                >
                                    {selectedPlayers.length > 0 ? "Next" : "Skip for now"} <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepWrapper>
                    )}

                    {step === 5 && (
                        <StepWrapper
                            key="step-5"
                            title="Content Preferences"
                            subtitle="What type of content do you prefer?"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                {contentTypes.map((type) => {
                                    const isSelected = selectedContent.includes(type.id);
                                    return (
                                        <div
                                            key={type.id}
                                            onClick={() => toggleItem(type.id, selectedContent, setSelectedContent)}
                                            className={cn(
                                                "p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4 text-center",
                                                isSelected ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center",
                                                isSelected ? "bg-primary text-white" : "bg-white/10 text-muted"
                                            )}>
                                                {type.icon}
                                            </div>
                                            <span className="font-bold text-lg">{type.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-4 mt-12">
                                <button onClick={handleBack} className="px-8 py-4 rounded-2xl border border-white/10 font-bold">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={selectedContent.length === 0}
                                    className="px-12 py-4 rounded-2xl bg-primary text-white font-bold disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                                >
                                    Almost there <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepWrapper>
                    )}

                    {step === 6 && (
                        <StepWrapper
                            key="step-6"
                            title="Stay Updated"
                            subtitle="Set your notification preferences."
                        >
                            <div className="space-y-4 w-full">
                                {notificationTypes.map((notif) => {
                                    const isSelected = selectedNotifications.includes(notif.id);
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => toggleItem(notif.id, selectedNotifications, setSelectedNotifications)}
                                            className={cn(
                                                "flex items-center gap-6 p-6 rounded-3xl border transition-all cursor-pointer shadow-sm",
                                                isSelected ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                isSelected ? "bg-primary text-white" : "bg-white/10 text-muted"
                                            )}>
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-lg">{notif.name}</div>
                                                <div className="text-sm text-muted">{notif.desc}</div>
                                            </div>
                                            <div className={cn(
                                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                                isSelected ? "bg-primary/50" : "bg-white/10"
                                            )}>
                                                <div className={cn(
                                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                                                    isSelected ? "right-1" : "left-1"
                                                )} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button onClick={handleBack} className="px-8 py-4 rounded-2xl border border-white/10 font-bold">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    className="px-12 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-extrabold flex items-center gap-3 transition-all shadow-xl shadow-primary/30 hover:scale-105 active:scale-95"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" /> Finalizing...
                                        </>
                                    ) : (
                                        <>
                                            Complete Setup <Trophy className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </StepWrapper>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
