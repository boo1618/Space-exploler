import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { gsap } from 'gsap';
import { searchNASAImages, NASAImageResult } from '@/lib/nasaApi';
import { Link } from 'wouter';

const PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const SUGGESTED_SEARCHES = ['Hubble', 'Mars Rover', 'Galaxy', 'Apollo'];
const RECENT_SEARCHES_KEY = 'space_recent_searches';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [nasaResults, setNasaResults] = useState<NASAImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, [isOpen]);

  // Search NASA images with debounce
  useEffect(() => {
    if (!query.trim()) {
      setNasaResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchNASAImages(query, 1);
        setNasaResults(results.slice(0, 6));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // GSAP animation
  useEffect(() => {
    if (!overlayRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in'
      });
    }
  }, [isOpen]);

  // Save search to recent
  const saveRecentSearch = (searchQuery: string) => {
    try {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    saveRecentSearch(searchQuery);
  };

  // Filter planets
  const planetResults = PLANETS.filter(planet =>
    planet.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
      style={{ backgroundColor: 'rgba(5, 8, 22, 0.95)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl glass rounded-3xl overflow-hidden shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-4 p-6 border-b border-white/10">
          <Search className="w-6 h-6 text-purple-400" />
          <input
            type="text"
            placeholder="Search planets, NASA images, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white text-lg font-orbitron placeholder:text-gray-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Empty state - Recent & Suggested */}
          {!query && (
            <div className="space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(recent)}
                        className="px-4 py-2 glass rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors"
                      >
                        {recent}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Suggested Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SEARCHES.map((suggested, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggested)}
                      className="px-4 py-2 glass rounded-lg text-sm text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Planet Results */}
          {query && planetResults.length > 0 && (
            <div className="mb-6">
              <h3 className="font-orbitron text-sm font-bold mb-3 text-purple-400 uppercase">Planets</h3>
              <div className="space-y-2">
                {planetResults.map((planet) => (
                  <Link
                    key={planet}
                    href="/planets"
                    onClick={() => {
                      saveRecentSearch(query);
                      onClose();
                    }}
                    className="flex items-center gap-4 p-3 glass rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-xl">🪐</span>
                    </div>
                    <div>
                      <p className="font-orbitron font-bold text-white">{planet}</p>
                      <span className="text-xs text-gray-400 px-2 py-1 bg-purple-500/20 rounded-full">Planet</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* NASA Image Results */}
          {query && !loading && nasaResults.length > 0 && (
            <div>
              <h3 className="font-orbitron text-sm font-bold mb-3 text-cyan-400 uppercase">NASA Images</h3>
              <div className="grid grid-cols-2 gap-3">
                {nasaResults.map((result) => (
                  <a
                    key={result.id}
                    href={result.thumbnail}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      saveRecentSearch(query);
                    }}
                    className="glass rounded-xl overflow-hidden hover:bg-white/10 transition-all group"
                  >
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                    <div className="p-3">
                      <p className="text-sm text-white font-medium line-clamp-2 mb-1">{result.title}</p>
                      <span className="text-xs text-gray-400 px-2 py-1 bg-cyan-500/20 rounded-full">NASA Image</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Searching the cosmos...</p>
            </div>
          )}

          {/* No results */}
          {query && !loading && planetResults.length === 0 && nasaResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">No results found</p>
              <p className="text-gray-500 text-sm">Try searching for planets, Hubble, galaxies, or nebulae</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-white/10 px-6 py-3 text-xs text-gray-500 flex items-center justify-between">
          <span>Press ESC to close</span>
          <span>Powered by NASA APIs</span>
        </div>
      </div>
    </div>
  );
}
