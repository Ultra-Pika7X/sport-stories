import { getSportsNews } from "@/lib/news";
import { Navbar } from "@/components/Navbar";
import { NewsCard } from "@/components/NewsCard";
import { Trophy, TrendingUp, ChevronRight, Zap, Star } from "lucide-react";

export default async function Home() {
  const articles = await getSportsNews();
  const heroArticle = articles[0];
  const gridArticles = articles.slice(1);

  return (
    <main className="min-h-screen glow-mesh">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
        {heroArticle && (
          <a
            href={heroArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative h-[550px] md:h-[600px] rounded-3xl overflow-hidden group cursor-pointer border border-white/5 shadow-2xl shadow-primary/5"
          >
            <img
              src={heroArticle.urlToImage}
              alt={heroArticle.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 md:p-14 w-full md:w-3/4 lg:w-2/3">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase bg-gradient-to-r from-primary to-secondary text-white rounded-full tracking-wider shadow-lg">
                  <Zap className="w-3.5 h-3.5" />
                  Featured Story
                </span>
                <span className="text-white/50 text-sm font-medium">• {heroArticle.source.name}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] text-white group-hover:translate-x-1 transition-transform duration-500">
                {heroArticle.title}
              </h1>
              <p className="text-white/60 text-lg mb-10 line-clamp-2 md:max-w-2xl leading-relaxed">
                {heroArticle.description}
              </p>
              <span className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-black rounded-full font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/20">
                Read Full Story
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
          </a>
        )}
      </section>

      {/* Stats/Trending Bar */}
      <section className="py-6 border-y border-white/5 glass">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-10 no-scrollbar">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-sm">Trending:</span>
            <span className="text-muted text-sm">Champions League Finale Preparation</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm">Latest:</span>
            <span className="text-muted text-sm">Transfer Window Updates Live</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Star className="w-4 h-4 text-secondary" />
            </div>
            <span className="font-bold text-sm">Popular:</span>
            <span className="text-muted text-sm">Super Bowl LVIII Analysis</span>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-14">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Latest <span className="text-gradient">Updates</span>
            </h2>
            <p className="text-muted font-medium">Breaking news from around the sporting world</p>
          </div>
          <button className="text-primary font-semibold hover:underline underline-offset-4 transition-all flex items-center gap-1">
            View All Stories
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridArticles.map((article, index) => (
            <NewsCard key={index} article={article} index={index} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                SPORT<span className="text-primary">STORIES</span>
              </span>
            </div>
            <p className="text-muted max-w-md leading-relaxed mb-8">
              The world's leading source for premium sports journalism and real-time updates.
              Our mission is to bring you closer to the game with cutting-edge analysis.
            </p>
            <div className="flex gap-3">
              {['X', 'IG', 'YT', 'LI'].map((social) => (
                <button key={social} className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-xs font-bold transition-all">
                  {social}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Categories</h4>
            <ul className="space-y-4 text-muted text-sm font-medium">
              {['Football', 'NBA Basketball', 'Formula 1', 'Grand Slam Tennis', 'UFC & MMA'].map((cat) => (
                <li key={cat} className="hover:text-foreground cursor-pointer transition-colors">{cat}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Company</h4>
            <ul className="space-y-4 text-muted text-sm font-medium">
              {['About Us', 'Careers', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item} className="hover:text-foreground cursor-pointer transition-colors">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 text-center text-muted/50 text-xs font-medium uppercase tracking-widest">
          &copy; 2025 SportStories Media Group. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
