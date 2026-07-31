import { useState, useEffect } from 'react';
import { ExternalLink, Loader2, Newspaper } from 'lucide-react';
import { fetchSpaceNews, type SpaceNewsItem } from '@/lib/nasaApi';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { formatDistanceToNow } from 'date-fns';

type NewsSource = 'All' | 'NASA' | 'SpaceX' | 'ESA' | 'Other';

export default function NewsPage() {
  const [news, setNews] = useState<SpaceNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NewsSource>('All');
  const [usingCache, setUsingCache] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchSpaceNews(12);
      setNews(data);
      // Check if using fallback data (fallback has specific IDs)
      if (data.length > 0 && data[0].id <= 10) {
        setUsingCache(true);
      } else {
        setUsingCache(false);
      }
    } catch (error) {
      console.error('News fetch error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from('.news-header', { opacity: 0, y: -30, duration: 0.8, ease: 'power3.out' });
    gsap.from('.news-filters', { opacity: 0, y: 20, duration: 0.8, delay: 0.2, ease: 'power3.out' });
  }, []);

  const filters: NewsSource[] = ['All', 'NASA', 'SpaceX', 'ESA', 'Other'];

  const filteredNews = news.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Other') {
      return !['NASA', 'SpaceX', 'ESA'].some(source => 
        item.news_site.toLowerCase().includes(source.toLowerCase())
      );
    }
    return item.news_site.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="news-header text-center mb-12">
          <h1 className="font-orbitron text-5xl md:text-6xl font-bold aurora-text mb-4">
            Space News
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Latest updates from space agencies and observatories around the globe
          </p>
          <div className="h-1 w-32 mx-auto mt-6 bg-gradient-to-r from-purple-500 via-sky-400 to-blue-500 rounded-full" />
          
          {usingCache && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 bg-yellow-500/10">
              <span className="text-yellow-400 text-sm">Showing cached news</span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="news-filters flex flex-wrap justify-center gap-2 mb-12">
          {filters.map((filter) => (
            <Button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              variant="outline"
              className={`font-orbitron px-6 transition-all ${
                activeFilter === filter
                  ? 'glass border-purple-500 bg-purple-500/20 text-purple-400'
                  : 'glass border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10'
              }`}
              data-testid={`filter-${filter.toLowerCase()}`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse border-white/10">
                <div className="w-full h-48 bg-white/5" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl border-white/10">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No news articles found for this filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item, index) => (
              <NewsCard key={`${item.id}_${index}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: SpaceNewsItem }) {
  const sourceColor = getSourceColor(item.news_site);
  const relativeTime = formatDistanceToNow(new Date(item.published_at), { addSuffix: true });

  return (
    <article
      className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/30 transition-all hover:-translate-y-2 flex flex-col"
      data-testid={`card-news-${item.id}`}
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Hide broken images
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-16 h-16 text-white/20" />
          </div>
        )}

        {/* Source Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full glass border ${sourceColor.border} ${sourceColor.bg}`}>
          <span className={`text-xs font-orbitron font-bold ${sourceColor.text}`}>
            {getSourceName(item.news_site)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h2 className="font-orbitron text-lg font-semibold text-white mb-3 line-clamp-2 leading-tight">
          {item.title}
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {item.summary}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <time className="text-xs text-gray-500" dateTime={item.published_at}>
            {relativeTime}
          </time>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors group"
            data-testid={`link-read-more-${item.id}`}
          >
            Read More
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  );
}

function getSourceName(newsSite: string): string {
  const site = newsSite.toLowerCase();
  if (site.includes('nasa')) return 'NASA';
  if (site.includes('spacex')) return 'SpaceX';
  if (site.includes('esa')) return 'ESA';
  if (site.includes('space.com')) return 'Space.com';
  if (site.includes('spacenews')) return 'SpaceNews';
  return newsSite.substring(0, 12);
}

function getSourceColor(newsSite: string) {
  const site = newsSite.toLowerCase();
  
  if (site.includes('nasa')) {
    return {
      border: 'border-blue-500/50',
      bg: 'bg-blue-500/20',
      text: 'text-blue-400'
    };
  }
  
  if (site.includes('spacex')) {
    return {
      border: 'border-purple-500/50',
      bg: 'bg-purple-500/20',
      text: 'text-purple-400'
    };
  }
  
  if (site.includes('esa')) {
    return {
      border: 'border-cyan-500/50',
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-400'
    };
  }
  
  return {
    border: 'border-white/30',
    bg: 'bg-white/10',
    text: 'text-gray-300'
  };
}
