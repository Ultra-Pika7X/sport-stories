import { Article } from "@/types/news";

const MOCK_ARTICLES: Article[] = [
    {
        title: "The Rise of Next-Gen Football: How Technology is Changing the Game",
        description: "From AI-driven coaching to advanced wearable tech, football is undergoing a digital revolution that is reshaping how the sport is played and watched.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "SportsTech" },
        author: "Alex Rivers"
    },
    {
        title: "NBA Season Preview: Which Teams are Poised for a Deep Run?",
        description: "As the new NBA season approaches, we analyze the rosters, coaching changes, and key matchups to predict who will be lifting the Larry O'Brien trophy.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1546519119-0597381eaa9e?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "Hoops Insider" },
        author: "James Miller"
    },
    {
        title: "Tennis: The New Era of Grand Slam Champions",
        description: "With the 'Big Three' era drawing to a close, a new generation of players is stepping up to claim their place in tennis history.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1592492152431-0f4c9443e49e?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "Court King" },
        author: "Elena Petrova"
    },
    {
        title: "Formula 1: Aerodynamics and the Quest for Speed",
        description: "We dive deep into the engineering marvels behind the latest F1 cars and how teams are finding every millisecond on the track.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?auto=format&fit=crop&q=80&w=1000",
        publishedAt: new Date().toISOString(),
        source: { name: "Speed Journal" },
        author: "F1 Insider"
    }
];

// NewsData.io response types
interface NewsDataArticle {
    title: string;
    description: string | null;
    link: string;
    image_url: string | null;
    pubDate: string;
    source_name: string;
    creator: string[] | null;
}

interface NewsDataResponse {
    status: string;
    totalResults: number;
    results: NewsDataArticle[];
}

// Transform NewsData.io article to our Article format
function transformNewsDataArticle(article: NewsDataArticle): Article {
    return {
        title: article.title || "Untitled",
        description: article.description || "No description available.",
        url: article.link || "#",
        urlToImage: article.image_url || "https://images.unsplash.com/photo-1461896704190-aa2727376a94?auto=format&fit=crop&q=80",
        publishedAt: article.pubDate || new Date().toISOString(),
        source: { name: article.source_name || "Unknown" },
        author: article.creator?.[0] || null
    };
}

export async function getSportsNews(): Promise<Article[]> {
    const apiKey = process.env.NEWSDATA_API_KEY;

    if (!apiKey) {
        console.warn("No NewsData API key found, using mock data.");
        return MOCK_ARTICLES;
    }

    try {
        const response = await fetch(
            `https://newsdata.io/api/1/latest?apikey=${apiKey}&category=sports&language=en&size=10`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data: NewsDataResponse = await response.json();

        if (data.status !== "success" || !data.results || data.results.length === 0) {
            console.warn("No results from NewsData API, using mock data.");
            return MOCK_ARTICLES;
        }

        // Transform and filter out articles without images for better UX
        const articles = data.results
            .map(transformNewsDataArticle)
            .filter(article => article.urlToImage && article.title);

        return articles.length > 0 ? articles : MOCK_ARTICLES;
    } catch (error) {
        console.error("Error fetching news:", error);
        return MOCK_ARTICLES;
    }
}
