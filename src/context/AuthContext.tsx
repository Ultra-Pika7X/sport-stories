"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    browserLocalPersistence,
    setPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isOnboardingComplete: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    setOnboardingComplete: () => Promise<void>;
    checkOnboardingStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

    // Check if user has completed onboarding
    const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
        if (!user) return false;

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const complete = data?.onboardingComplete === true;
                setIsOnboardingComplete(complete);
                return complete;
            }
            return false;
        } catch (error) {
            console.error("Error checking onboarding status:", error);
            return false;
        }
    }, [user]);

    // Set auth persistence and listen for auth state changes
    useEffect(() => {
        // Set persistence to local (survives browser restart)
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Check localStorage FIRST (free, always works)
                const localOnboardingComplete = localStorage.getItem(`onboardingComplete_${firebaseUser.uid}`);

                if (localOnboardingComplete === "true") {
                    setIsOnboardingComplete(true);
                    setLoading(false);
                    return;
                }

                // Fall back to Firestore check
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        const complete = userDoc.data()?.onboardingComplete === true;
                        setIsOnboardingComplete(complete);
                        // Sync to localStorage
                        if (complete) {
                            localStorage.setItem(`onboardingComplete_${firebaseUser.uid}`, "true");
                        }
                    } else {
                        // Create user document if it doesn't exist
                        try {
                            await setDoc(doc(db, "users", firebaseUser.uid), {
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                createdAt: serverTimestamp(),
                                onboardingComplete: false,
                            });
                        } catch {
                            // Ignore Firestore errors (Spark plan limits)
                            console.warn("Could not create user doc in Firestore");
                        }
                        setIsOnboardingComplete(false);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Still allow app to work with localStorage
                    setIsOnboardingComplete(localOnboardingComplete === "true");
                }
            } else {
                setIsOnboardingComplete(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    }, []);

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing in with email:", error);
            throw error;
        }
    }, []);

    const signUpWithEmail = useCallback(async (email: string, password: string) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Create user document
            await setDoc(doc(db, "users", result.user.uid), {
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                createdAt: serverTimestamp(),
                onboardingComplete: false,
            });
        } catch (error) {
            console.error("Error signing up with email:", error);
            throw error;
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await firebaseSignOut(auth);
            setIsOnboardingComplete(false);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    }, []);

    const setOnboardingComplete = useCallback(async () => {
        if (!user) return;

        try {
            await setDoc(doc(db, "users", user.uid), {
                onboardingComplete: true,
                onboardingCompletedAt: serverTimestamp(),
            }, { merge: true });
            setIsOnboardingComplete(true);
        } catch (error) {
            console.error("Error setting onboarding complete:", error);
            throw error;
        }
    }, [user]);

    const contextValue = useMemo(() => ({
        user,
        loading,
        isOnboardingComplete,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        setOnboardingComplete,
        checkOnboardingStatus,
    }), [
        user,
        loading,
        isOnboardingComplete,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        setOnboardingComplete,
        checkOnboardingStatus
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
