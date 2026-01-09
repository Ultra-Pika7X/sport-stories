import { Article } from "@/types/news";

const MOCK_ARTICLES: Article[] = [
    {
        id: "mock-1",
        title: "The Rise of Next-Gen Football: How Technology is Changing the Game",
        description: "From AI-driven coaching to advanced wearable tech, football is undergoing a digital revolution that is reshaping how the sport is played and watched.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "SportsTech" },
        author: "Alex Rivers",
        categories: ["football", "technology"],
        keywords: ["ai", "wearables"]
    },
    {
        id: "mock-2",
        title: "NBA Season Preview: Which Teams are Poised for a Deep Run?",
        description: "As the new NBA season approaches, we analyze the rosters, coaching changes, and key matchups to predict who will be lifting the Larry O'Brien trophy.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1546519119-0597381eaa9e?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "Hoops Insider" },
        author: "James Miller",
        categories: ["basketball"],
        keywords: ["nba", "championship"]
    },
    {
        id: "mock-3",
        title: "Tennis: The New Era of Grand Slam Champions",
        description: "With the 'Big Three' era drawing to a close, a new generation of players is stepping up to claim their place in tennis history.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1592492152431-0f4c9443e49e?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "Court King" },
        author: "Elena Petrova",
        categories: ["tennis"],
        keywords: ["grand slam", "federer"]
    },
    {
        id: "mock-4",
        title: "Formula 1: Aerodynamics and the Quest for Speed",
        description: "We dive deep into the engineering marvels behind the latest F1 cars and how teams are finding every millisecond on the track.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "Speed Journal" },
        author: "F1 Insider",
        categories: ["motorsport", "f1"],
        keywords: ["speed", "engineering"]
    }
];

// NewsData.io response types
interface NewsDataArticle {
    article_id: string;
    title: string;
    description: string | null;
    link: string;
    image_url: string | null;
    pubDate: string;
    source_name: string;
    creator: string[] | null;
    category: string[] | null;
    keywords: string[] | null;
}

interface NewsDataResponse {
    status: string;
    totalResults: number;
    results: NewsDataArticle[];
    nextPage?: string;
}

// Transform NewsData.io article to our Article format
function transformNewsDataArticle(article: NewsDataArticle): Article {
    return {
        id: article.article_id || Math.random().toString(36).substr(2, 9),
        title: article.title || "Untitled",
        description: article.description || "No description available.",
        url: article.link || "#",
        urlToImage: article.image_url || "https://images.unsplash.com/photo-1461896704190-aa2727376a94?auto=format&fit=crop&q=80",
        publishedAt: article.pubDate || new Date().toISOString(),
        source: { name: article.source_name || "Unknown" },
        author: article.creator?.[0] || null,
        categories: article.category || [],
        keywords: article.keywords || []
    };
}

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    doc,
    setDoc
} from "firebase/firestore";
import { db } from "./firebase";

export async function syncNewsToFirestore(category?: string) {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) return;

    try {
        const catParam = category ? `&category=${category}` : "&category=sports";
        const response = await fetch(
            `https://newsdata.io/api/1/latest?apikey=${apiKey}${catParam}&language=en&size=10`
        );
        const data: NewsDataResponse = await response.json();

        if (data.status === "success" && data.results) {
            const batch = data.results.map(article => {
                const docId = article.article_id || Buffer.from(article.link).toString('base64').substring(0, 20);
                return setDoc(doc(db, "news", docId), {
                    ...transformNewsDataArticle(article),
                    syncedAt: serverTimestamp(),
                }, { merge: true });
            });
            await Promise.all(batch);
        }
    } catch (error) {
        console.error("Sync error:", error);
    }
}

export async function getNewsFromFirestore(params: {
    category?: string;
    sport?: string;
    league?: string;
    team?: string;
    search?: string;
    lastDoc?: any;
    pageSize?: number;
}) {
    let q = query(
        collection(db, "news"),
        orderBy("publishedAt", "desc"),
        limit(params.pageSize || 10)
    );

    if (params.category) {
        q = query(q, where("categories", "array-contains", params.category));
    }

    if (params.lastDoc) {
        q = query(q, startAfter(params.lastDoc));
    }

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(doc => doc.data() as Article);

    // Client side filtering for more complex queries if needed or add more where clauses
    let filtered = articles;
    if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(s) ||
            a.description.toLowerCase().includes(s)
        );
    }

    return {
        articles: filtered,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
}

export async function getSportsNews(queryStr?: string): Promise<Article[]> {
    // 1. Try reading from Firestore Cache first
    try {
        const { articles } = await getNewsFromFirestore({
            category: queryStr, // This matches how we sync (category param)
            pageSize: 10
        });

        // Simple cache validity check: if we have current data, return it.
        // In a real app, we'd check timestamps.
        if (articles.length > 0) {
            console.log(`[Cache Hit] Serving ${articles.length} articles from Firestore for: ${queryStr || 'home'}`);
            return articles;
        }
    } catch (error) {
        console.warn("[Cache Miss] Failed to read from Firestore, falling back to API", error);
    }

    console.log(`[Cache Miss] Fetching fresh data from API for: ${queryStr || 'home'}`);

    const apiKey = process.env.NEWSDATA_API_KEY;

    if (!apiKey) {
        console.warn("No NewsData API key found, using mock data.");
        return MOCK_ARTICLES;
    }

    try {
        const queryParam = queryStr ? `&category=${encodeURIComponent(queryStr)}` : "&category=sports";
        // Note: Using 'category' param for better filtering than 'q'

        const response = await fetch(
            `https://newsdata.io/api/1/latest?apikey=${apiKey}${queryParam}&language=en&size=10`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data: NewsDataResponse = await response.json();

        if (data.status !== "success" || !data.results || data.results.length === 0) {
            console.warn("No results from NewsData API, using mock data.");
            return MOCK_ARTICLES;
        }

        const articles = data.results
            .map(transformNewsDataArticle)
            .filter(article => article.urlToImage && article.title);

        // 2. Write-Through Cache: Save fresh data to Firestore
        // We don't await this to keep the UI snappy
        const saveToCache = async () => {
            const batch = articles.map(article => {
                const docId = article.id;
                // Add a 'syncedAt' timestamp or 'category' field if needed for queries
                return setDoc(doc(db, "news", docId), {
                    ...article,
                    // Ensure categories array includes the queryStr so we can find it later
                    categories: queryStr && !article.categories.includes(queryStr)
                        ? [...article.categories, queryStr]
                        : article.categories,
                    syncedAt: serverTimestamp(),
                }, { merge: true });
            });
            await Promise.all(batch);
        };

        saveToCache().catch(err => console.error("Failed to update cache:", err));

        return articles.length > 0 ? articles : MOCK_ARTICLES;
    } catch (error) {
        console.error("Error fetching news:", error);
        return MOCK_ARTICLES;
    }
}

export async function getPersonalizedNews(keywords: string[]): Promise<Article[]> {
    if (!keywords || keywords.length === 0) return getSportsNews();

    // Fetch news for the first 3 keywords to keep it efficient
    const topKeywords = keywords.slice(0, 3);
    const results = await Promise.all(
        topKeywords.map(keyword => getSportsNews(keyword))
    );

    // Flatten and shuffle for variety
    const allArticles = results.flat();
    return Array.from(new Set(allArticles)).sort(() => Math.random() - 0.5);
}
