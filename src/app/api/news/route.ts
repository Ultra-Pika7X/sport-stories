import { NextRequest, NextResponse } from "next/server";
import { getPersonalizedNews, getSportsNews, syncNewsToFirestore, getNewsFromFirestore } from "@/lib/news";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const keywords = searchParams.get("keywords")?.split(",") || [];
    const page = parseInt(searchParams.get("page") || "1");

    try {
        // Sync to Firestore on first page requests to keep cache fresh
        if (page === 1 && keywords.length === 0) {
            // Trigger sync in the background (we don't await so it doesn't block the response)
            syncNewsToFirestore(query || undefined).catch(e => console.error("Sync background error:", e));
        }

        let articles;
        if (keywords.length > 0) {
            articles = await getPersonalizedNews(keywords);
        } else if (query || page > 1) {
            // Use Firestore for filtered/paged data
            const result = await getNewsFromFirestore({
                category: query || undefined,
                search: query || undefined,
                pageSize: 10
            });
            articles = result.articles;

            // Fallback to direct API if Firestore results are empty 
            if (articles.length === 0) {
                articles = await getSportsNews(query || undefined);
            }
        } else {
            articles = await getSportsNews(query || undefined);
        }

        return NextResponse.json(articles);
    } catch (error) {
        console.error("News API route error:", error);
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
}
