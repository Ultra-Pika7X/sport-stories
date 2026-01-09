"use client";

import Link from "next/link";
import Image from "next/image";
import { Trophy, Search, User, Menu, Bookmark, History, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { SPORTS_CONFIG } from "@/lib/sports";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "./AuthModal";
import { cn } from "@/lib/cn";

import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/live", label: "Live" },
    { href: "/highlights", label: "Highlights" },
    { href: "/news", label: "News" },
];

export function Navbar() {
    const { user, loading, signOut } = useAuth();
    const pathname = usePathname();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSportsMenu, setShowSportsMenu] = useState(false); // New state
    const menuRef = useRef<HTMLDivElement>(null);
    const sportsMenuRef = useRef<HTMLDivElement>(null); // New ref

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (sportsMenuRef.current && !sportsMenuRef.current.contains(event.target as Node)) {
                setShowSportsMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleUserClick = () => {
        if (loading) return;
        if (user) {
            setShowUserMenu(!showUserMenu);
        } else {
            setShowAuthModal(true);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setShowUserMenu(false);
        } catch (error) {
            console.error("Failed to sign out", error);
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4"
            >
                <div className="glass rounded-full px-4 py-3 md:px-6 md:py-3 flex items-center justify-between max-w-7xl mx-auto shadow-2xl shadow-black/20 border border-white/5 backdrop-blur-xl">

                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Trophy className="w-6 h-6 text-primary" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-white">
                            SPORT<span className="text-primary">STORIES</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {/* Static Links */}
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        isActive
                                            ? "text-white bg-white/10"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        {/* Dynamic Sports Dropdown */}
                        <div className="relative" ref={sportsMenuRef}>
                            <button
                                onClick={() => setShowSportsMenu(!showSportsMenu)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                    pathname.startsWith("/sports")
                                        ? "text-white bg-white/10"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                Sports
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showSportsMenu && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {showSportsMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl border border-white/10 shadow-xl overflow-hidden p-1"
                                    >
                                        {Object.values(SPORTS_CONFIG).map((sport) => (
                                            <Link
                                                key={sport.id}
                                                href={`/sports/${sport.id}`}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                                                onClick={() => setShowSportsMenu(false)}
                                            >
                                                <div className={cn("p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", `text-${sport.color}-400`)}>
                                                    {sport.icon}
                                                </div>
                                                <span className="text-sm font-medium">{sport.label}</span>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </motion.button>

                        <div className="w-px h-6 bg-white/10 mx-1" />

                        {loading ? (
                            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
                        ) : user ? (
                            <div className="relative" ref={menuRef}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="relative"
                                >
                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-black/20">
                                        {user.photoURL ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={user.photoURL}
                                                    alt={user.displayName || "User"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-sm">
                                                {user.displayName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                                </motion.button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 glass rounded-xl border border-white/10 shadow-xl overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-white/5">
                                                <p className="font-semibold truncate">{user.displayName}</p>
                                                <p className="text-xs text-white/50 truncate">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link
                                                    href="/saved"
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Bookmark className="w-4 h-4 text-white/60" />
                                                    <span className="text-sm">Saved Stories</span>
                                                </Link>
                                                <Link
                                                    href="/history"
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <History className="w-4 h-4 text-white/60" />
                                                    <span className="text-sm">History</span>
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="text-sm">Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAuthModal(true)}
                                className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
                            >
                                Sign In
                            </motion.button>
                        )}

                        <div className="relative md:hidden">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 hover:bg-white/5 rounded-full transition-colors md:hidden"
                                onClick={() => setShowSportsMenu(!showSportsMenu)}
                            >
                                <Menu className="w-5 h-5" />
                            </motion.button>

                            {/* Mobile Menu Overlay could go here, for now simpler toggle */}
                        </div>

                    </div>
                </div>
            </motion.nav>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
