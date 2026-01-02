"use client";

import Link from "next/link";
import { Trophy, Search, User, Menu } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
    { href: "/", label: "Home", active: true },
    { href: "#", label: "Football" },
    { href: "#", label: "Basketball" },
    { href: "#", label: "Tennis" },
    { href: "#", label: "F1" },
];

export function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ rotate: 12, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="p-2.5 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/25"
                    >
                        <Trophy className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-xl font-bold tracking-tight">
                        SPORT<span className="text-primary">STORIES</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${link.active
                                    ? "text-white bg-white/10"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:flex"
                    >
                        <User className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 hover:bg-white/5 rounded-full transition-colors md:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </motion.nav>
    );
}
