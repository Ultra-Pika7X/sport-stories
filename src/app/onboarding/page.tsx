"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
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
    Star,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/cn";
import { searchTeams, searchPlayers, getPopularTeams, Team, Player } from "@/lib/sportsdb";

// --- Constants ---

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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// --- Main Component ---

export default function OnboardingPage() {
    const { user, setOnboardingComplete, isOnboardingComplete } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<{ id: string; name: string; badge?: string }[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<{ id: string; name: string; thumbnail?: string }[]>([]);
    const [selectedContent, setSelectedContent] = useState<string[]>([]);
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    // Search State
    const [teamSearch, setTeamSearch] = useState("");
    const [playerSearch, setPlayerSearch] = useState("");
    const [teamResults, setTeamResults] = useState<Team[]>([]);
    const [playerResults, setPlayerResults] = useState<Player[]>([]);
    const [isSearchingTeams, setIsSearchingTeams] = useState(false);
    const [isSearchingPlayers, setIsSearchingPlayers] = useState(false);
    const [popularTeams, setPopularTeams] = useState<Team[]>([]);

    // Debounced search values
    const debouncedTeamSearch = useDebounce(teamSearch, 400);
    const debouncedPlayerSearch = useDebounce(playerSearch, 400);

    // Fetch popular teams on mount
    useEffect(() => {
        getPopularTeams().then(teams => setPopularTeams(teams));
    }, []);

    // Search teams when debounced value changes
    useEffect(() => {
        if (debouncedTeamSearch.length >= 2) {
            setIsSearchingTeams(true);
            searchTeams(debouncedTeamSearch)
                .then(results => setTeamResults(results))
                .finally(() => setIsSearchingTeams(false));
        } else {
            setTeamResults([]);
        }
    }, [debouncedTeamSearch]);

    // Search players when debounced value changes
    useEffect(() => {
        if (debouncedPlayerSearch.length >= 2) {
            setIsSearchingPlayers(true);
            searchPlayers(debouncedPlayerSearch)
                .then(results => setPlayerResults(results))
                .finally(() => setIsSearchingPlayers(false));
        } else {
            setPlayerResults([]);
        }
    }, [debouncedPlayerSearch]);

    // Redirect if already complete
    useEffect(() => {
        if (isOnboardingComplete) {
            router.replace("/");
        }
    }, [isOnboardingComplete, router]);

    const toggleSport = (id: string) => {
        setSelectedSports(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleLeague = (id: string) => {
        setSelectedLeagues(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const addTeam = (team: Team) => {
        if (!selectedTeams.find(t => t.id === team.id)) {
            setSelectedTeams(prev => [...prev, { id: team.id, name: team.name, badge: team.badge }]);
        }
        setTeamSearch("");
        setTeamResults([]);
    };

    const removeTeam = (id: string) => {
        setSelectedTeams(prev => prev.filter(t => t.id !== id));
    };

    const addPlayer = (player: Player) => {
        if (!selectedPlayers.find(p => p.id === player.id)) {
            setSelectedPlayers(prev => [...prev, { id: player.id, name: player.name, thumbnail: player.thumbnail }]);
        }
        setPlayerSearch("");
        setPlayerResults([]);
    };

    const removePlayer = (id: string) => {
        setSelectedPlayers(prev => prev.filter(p => p.id !== id));
    };

    const toggleContent = (id: string) => {
        setSelectedContent(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleNotification = (id: string) => {
        setSelectedNotifications(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleComplete = async () => {
        if (!user) {
            setError("You must be logged in to complete onboarding");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const preferences = {
            sports: selectedSports,
            leagues: selectedLeagues,
            teams: selectedTeams.map(t => t.name),
            teamIds: selectedTeams.map(t => t.id),
            players: selectedPlayers.map(p => p.name),
            playerIds: selectedPlayers.map(p => p.id),
            contentTypes: selectedContent,
            notificationSettings: selectedNotifications,
        };

        try {
            // 1. Save to localStorage FIRST (always works, free)
            localStorage.setItem(`preferences_${user.uid}`, JSON.stringify(preferences));
            localStorage.setItem(`onboardingComplete_${user.uid}`, "true");

            // 2. Try to save to Firestore (optional, may fail on Spark plan limits)
            try {
                await setDoc(doc(db, "users", user.uid), {
                    preferences,
                    onboardingComplete: true,
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            } catch (firestoreError) {
                // Log but don't fail - localStorage is our primary source
                console.warn("Firestore sync failed (Spark plan limits?), using localStorage:", firestoreError);
            }

            // 3. Update context
            await setOnboardingComplete();

            // 4. Navigate to home
            router.replace("/");
        } catch (err) {
            console.error("Onboarding error:", err);
            setError("Failed to save preferences. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepsCount = 7;

    // Display teams to show (search results or popular)
    const displayTeams = teamResults.length > 0 ? teamResults : (teamSearch === "" ? popularTeams : []);

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

            {/* Error Message */}
            {error && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="w-full relative z-10 max-w-4xl">
                <AnimatePresence mode="wait">
                    {/* Step 0: Welcome */}
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

                    {/* Step 1: Sports */}
                    {step === 1 && (
                        <StepWrapper
                            key="step-1"
                            title="Your Favorite Sports"
                            subtitle="What do you love to watch?"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full">
                                {sports.map((sport) => {
                                    const isSelected = selectedSports.includes(sport.id);
                                    return (
                                        <motion.div
                                            key={sport.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => toggleSport(sport.id)}
                                            className={cn(
                                                "flex flex-col items-center p-6 rounded-2xl border-2 transition-all cursor-pointer",
                                                isSelected ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <span className="text-4xl mb-3">{sport.icon}</span>
                                            <span className="font-bold text-center text-sm">{sport.name}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
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

                    {/* Step 2: Leagues */}
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
                                            onClick={() => toggleLeague(league.id)}
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

                    {/* Step 3: Teams */}
                    {step === 3 && (
                        <StepWrapper
                            key="step-3"
                            title="Your Teams"
                            subtitle="Search and select the clubs you bleed for."
                        >
                            {/* Selected Teams Chips */}
                            {selectedTeams.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6 w-full">
                                    {selectedTeams.map(team => (
                                        <div
                                            key={team.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full"
                                        >
                                            {team.badge && (
                                                <img src={team.badge} alt="" className="w-5 h-5 rounded-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            )}
                                            <span className="text-sm font-bold">{team.name}</span>
                                            <button onClick={() => removeTeam(team.id)} className="hover:text-red-400">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Input */}
                            <div className="relative w-full mb-6">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search teams (e.g. Manchester United, Lakers...)"
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
                                />
                                {isSearchingTeams && (
                                    <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                                )}
                            </div>

                            {/* Teams Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-h-[400px] overflow-y-auto pr-2">
                                {displayTeams.map((team) => {
                                    const isSelected = selectedTeams.some(t => t.id === team.id);
                                    return (
                                        <div
                                            key={team.id}
                                            onClick={() => !isSelected && addTeam(team)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                                isSelected ? "border-primary bg-primary/10 opacity-50" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            {team.badge ? (
                                                <img src={team.badge} alt="" className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                                                    {team.name[0]}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-bold">{team.name}</div>
                                                <div className="text-xs text-muted">{team.league || team.sport}</div>
                                            </div>
                                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                                        </div>
                                    );
                                })}
                                {displayTeams.length === 0 && teamSearch.length >= 2 && !isSearchingTeams && (
                                    <div className="col-span-2 text-center py-8 text-muted">
                                        No teams found for &quot;{teamSearch}&quot;
                                    </div>
                                )}
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

                    {/* Step 4: Players */}
                    {step === 4 && (
                        <StepWrapper
                            key="step-4"
                            title="Favorite Players"
                            subtitle="Who are the icons you follow? (Optional)"
                        >
                            {/* Selected Players Chips */}
                            {selectedPlayers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6 w-full">
                                    {selectedPlayers.map(player => (
                                        <div
                                            key={player.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full"
                                        >
                                            {player.thumbnail && (
                                                <img src={player.thumbnail} alt="" className="w-5 h-5 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            )}
                                            <span className="text-sm font-bold">{player.name}</span>
                                            <button onClick={() => removePlayer(player.id)} className="hover:text-red-400">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Input */}
                            <div className="relative w-full mb-6">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search players (e.g. Messi, LeBron...)"
                                    value={playerSearch}
                                    onChange={(e) => setPlayerSearch(e.target.value)}
                                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
                                />
                                {isSearchingPlayers && (
                                    <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                                )}
                            </div>

                            {/* Players Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-h-[400px] overflow-y-auto pr-2">
                                {playerResults.map((player) => {
                                    const isSelected = selectedPlayers.some(p => p.id === player.id);
                                    return (
                                        <div
                                            key={player.id}
                                            onClick={() => !isSelected && addPlayer(player)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                                isSelected ? "border-primary bg-primary/10 opacity-50" : "border-white/5 bg-white/5 hover:border-white/20"
                                            )}
                                        >
                                            {player.thumbnail ? (
                                                <img src={player.thumbnail} alt="" className="w-10 h-10 rounded-full object-cover bg-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                                                    {player.name[0]}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-bold">{player.name}</div>
                                                <div className="text-xs text-muted">{player.team || player.sport}</div>
                                            </div>
                                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                                        </div>
                                    );
                                })}
                                {playerResults.length === 0 && playerSearch.length >= 2 && !isSearchingPlayers && (
                                    <div className="col-span-2 text-center py-8 text-muted">
                                        No players found for &quot;{playerSearch}&quot;
                                    </div>
                                )}
                                {playerSearch.length < 2 && (
                                    <div className="col-span-2 text-center py-8 text-muted">
                                        Start typing to search for players...
                                    </div>
                                )}
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

                    {/* Step 5: Content */}
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
                                            onClick={() => toggleContent(type.id)}
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

                    {/* Step 6: Notifications */}
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
                                            onClick={() => toggleNotification(notif.id)}
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
                                    className="px-12 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-extrabold flex items-center gap-3 transition-all shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
