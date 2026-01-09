"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Article, SavedArticle } from "@/types/news";

interface LibraryContextType {
    savedStories: SavedArticle[];
    history: SavedArticle[];
    saveStory: (article: Article) => Promise<void>;
    removeStory: (articleUrl: string) => Promise<void>;
    isStorySaved: (articleUrl: string) => boolean;
    addToHistory: (article: Article) => Promise<void>;
    loading: boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Create a URL-safe document ID
function createDocId(url: string): string {
    return btoa(url).replace(/[/+=]/g, '_').substring(0, 100);
}

export function LibraryProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [savedStories, setSavedStories] = useState<SavedArticle[]>([]);
    const [history, setHistory] = useState<SavedArticle[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to saved stories
    useEffect(() => {
        if (!user) {
            setSavedStories([]);
            setLoading(false);
            return;
        }

        const savedRef = collection(db, "users", user.uid, "saved");
        const q = query(savedRef, orderBy("savedAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const stories: SavedArticle[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                stories.push({
                    ...data,
                    savedAt: data.savedAt?.toDate?.()?.toISOString() || new Date().toISOString()
                } as SavedArticle);
            });
            setSavedStories(stories);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to history
    useEffect(() => {
        if (!user) {
            setHistory([]);
            return;
        }

        const historyRef = collection(db, "users", user.uid, "history");
        const q = query(historyRef, orderBy("savedAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: SavedArticle[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    ...data,
                    savedAt: data.savedAt?.toDate?.()?.toISOString() || new Date().toISOString()
                } as SavedArticle);
            });
            setHistory(items);
        });

        return () => unsubscribe();
    }, [user]);

    const saveStory = useCallback(async (article: Article) => {
        if (!user) return;

        const docId = createDocId(article.url);
        const savedRef = doc(db, "users", user.uid, "saved", docId);

        await setDoc(savedRef, {
            ...article,
            savedAt: Timestamp.now()
        });
    }, [user]);

    const removeStory = useCallback(async (articleUrl: string) => {
        if (!user) return;

        const docId = createDocId(articleUrl);
        const savedRef = doc(db, "users", user.uid, "saved", docId);

        await deleteDoc(savedRef);
    }, [user]);

    const isStorySaved = useCallback((articleUrl: string) => {
        return savedStories.some(story => story.url === articleUrl);
    }, [savedStories]);

    const addToHistory = useCallback(async (article: Article) => {
        if (!user) return;

        const docId = createDocId(article.url);
        const historyRef = doc(db, "users", user.uid, "history", docId);

        await setDoc(historyRef, {
            ...article,
            savedAt: Timestamp.now()
        });
    }, [user]);

    const contextValue = useMemo(() => ({
        savedStories,
        history,
        saveStory,
        removeStory,
        isStorySaved,
        addToHistory,
        loading
    }), [
        savedStories,
        history,
        saveStory,
        removeStory,
        isStorySaved,
        addToHistory,
        loading
    ]);

    return (
        <LibraryContext.Provider value={contextValue}>
            {children}
        </LibraryContext.Provider>
    );
}

export function useLibrary() {
    const context = useContext(LibraryContext);
    if (context === undefined) {
        throw new Error("useLibrary must be used within a LibraryProvider");
    }
    return context;
}
