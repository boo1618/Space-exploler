import { useState, useEffect } from 'react';
import { Heart, Download } from 'lucide-react';
import { searchNASAImages, NASAImageResult } from '@/lib/nasaApi';
import { toggleFavorite, isFavorite, getFavorites, FavoriteItem } from '@/lib/favorites';

type Category = 'AMOLED' | 'Galaxy' | 'Nebula' | 'Planets' | 'Moon' | 'Earth' | 'Minimal' | 'All';

const categories: Category[] = ['All', 'AMOLED', 'Galaxy', 'Nebula', 'Planets', 'Moon', 'Earth', 'Minimal'];

const categorySearchTerms: Record<Category, string> = {
  'AMOLED': 'dark space stars',
  'Galaxy': 'galaxy spiral',
  'Nebula': 'nebula colorful',
  'Planets': 'planet surface',
  'Moon': 'moon surface',
  'Earth': 'earth from space',
  'Minimal': 'space minimal',
  'All': 'space universe'
};

export default function WallpapersPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [images, setImages] = useState<NASAImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState<Set<Category>>(new Set());

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites().filter(f => f.type === 'wallpaper'));
  }, []);

  // Load images for active category
  useEffect(() => {
    if (loadedCategories.has(activeCategory)) return;

    const loadImages = async () => {
      setLoading(true);
      try {
        const results = await searchNASAImages(categorySearchTerms[activeCategory], 1);
        setImages(results);
        setLoadedCategories(prev => new Set(prev).add(activeCategory));
      } catch (error) {
        console.error('Failed to load wallpapers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [activeCategory, loadedCategories]);

  const handleToggleFavorite = (image: NASAImageResult) => {
    const item: FavoriteItem = {
      id: image.id,
      type: 'wallpaper',
      title: image.title,
      imageUrl: image.thumbnail,
      data: image
    };
    toggleFavorite(item);
    setFavorites(getFavorites().filter(f => f.type === 'wallpaper'));
  };

  const handleDownload = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-bold mb-4 aurora-text">
            Cosmic Wallpapers
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Download stunning space photography from NASA's archives — all free, all breathtaking.
          </p>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-12">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="glass px-6 py-3 rounded-xl mb-4 flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              <span className="font-orbitron text-lg">Your Favorites</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">
                {favorites.length}
              </span>
            </button>

            {showFavorites && (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="glass rounded-xl overflow-hidden min-w-[200px] snap-center group relative"
                  >
                    <img
                      src={fav.imageUrl}
                      alt={fav.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white text-sm font-medium mb-2 line-clamp-2">{fav.title}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleFavorite(fav.data as NASAImageResult)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                        >
                          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                        </button>
                        <button
                          onClick={() => handleDownload(fav.imageUrl)}
                          className="p-2 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4 text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 snap-x snap-mandatory">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap snap-center transition-all duration-300 ${
                activeCategory === category
                  ? 'glass bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-white/5"></div>
              </div>
            ))}
          </div>
        )}

        {/* Images Grid */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => {
              const isPortrait = index % 3 === 0;
              const isFav = isFavorite(image.id);

              return (
                <div
                  key={image.id}
                  className={`glass rounded-xl overflow-hidden group relative ${
                    isPortrait ? 'row-span-2' : ''
                  }`}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className={`w-full object-cover ${isPortrait ? 'h-full' : 'h-64'}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%230F172A" width="400" height="400"/%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-sm font-medium mb-3 line-clamp-2">{image.title}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleFavorite(image)}
                        className={`flex-1 p-2 rounded-lg transition-all duration-300 ${
                          isFav
                            ? 'bg-red-500/40 hover:bg-red-500/60'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 mx-auto ${isFav ? 'text-red-400 fill-red-400' : 'text-white'}`} />
                      </button>
                      <button
                        onClick={() => handleDownload(image.thumbnail)}
                        className="flex-1 p-2 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-cyan-400 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && (
          <div className="glass p-12 rounded-3xl text-center">
            <p className="text-gray-400 text-lg">No wallpapers found. Try another category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
