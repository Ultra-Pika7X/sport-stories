export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  author: string | null;
  categories: string[];
  keywords: string[];
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export interface SavedArticle extends Article {
  savedAt: string;
}
