"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading, isOnboardingComplete } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // If not authenticated, redirect to login
        if (!user) {
            router.replace("/login");
            return;
        }

        // If authenticated but onboarding not complete, redirect to onboarding
        // (unless already on onboarding page)
        if (!isOnboardingComplete && pathname !== "/onboarding") {
            router.replace("/onboarding");
            return;
        }
    }, [user, loading, isOnboardingComplete, router, pathname]);

    // Show loading screen while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background glow-mesh">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="p-4 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-6 shadow-xl shadow-primary/20">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">
                        SPORT<span className="text-primary">STORIES</span>
                    </h1>
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </motion.div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!user) {
        return null;
    }

    // Don't render children if onboarding not complete (unless on onboarding page)
    if (!isOnboardingComplete && pathname !== "/onboarding") {
        return null;
    }

    return <>{children}</>;
}
