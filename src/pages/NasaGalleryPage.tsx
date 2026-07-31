import { useState, useEffect } from 'react';
import { Heart, Download, Share2, Loader2, Search, Calendar } from 'lucide-react';
import { fetchAPOD, searchNASAImages, type APODData, type NASAImageResult } from '@/lib/nasaApi';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

export default function NasaGalleryPage() {
  const [activeTab, setActiveTab] = useState('apod');

  useEffect(() => {
    gsap.from('.gallery-header', { opacity: 0, y: -30, duration: 0.8, ease: 'power3.out' });
    gsap.from('.gallery-tabs', { opacity: 0, y: 20, duration: 0.8, delay: 0.2, ease: 'power3.out' });
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="gallery-header text-center mb-12">
          <h1 className="font-orbitron text-5xl md:text-6xl font-bold aurora-text mb-4">
            NASA Gallery
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore the cosmos through NASA's incredible archives and daily astronomical wonders
          </p>
          <div className="h-1 w-32 mx-auto mt-6 bg-gradient-to-r from-purple-500 via-sky-400 to-blue-500 rounded-full" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gallery-tabs">
          <TabsList className="glass w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="apod" className="font-orbitron">Today's APOD</TabsTrigger>
            <TabsTrigger value="search" className="font-orbitron">Image Search</TabsTrigger>
          </TabsList>

          <TabsContent value="apod">
            <APODSection />
          </TabsContent>

          <TabsContent value="search">
            <ImageSearchSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function APODSection() {
  const [apod, setApod] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isFav, setIsFav] = useState(false);

  const loadAPOD = async (date?: string) => {
    setLoading(true);
    const data = await fetchAPOD(date);
    setApod(data);
    setIsFav(isFavorite(`apod_${data.date}`));
    setLoading(false);
  };

  useEffect(() => {
    loadAPOD();
  }, []);

  const handlePrevDay = () => {
    if (!apod) return;
    const date = new Date(apod.date);
    date.setDate(date.getDate() - 1);
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    loadAPOD(dateStr);
  };

  const handleNextDay = () => {
    if (!apod) return;
    const date = new Date(apod.date);
    const today = new Date().toISOString().split('T')[0];
    if (apod.date >= today) return; // Can't go to future
    date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    loadAPOD(dateStr);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    loadAPOD(dateStr);
  };

  const handleFavorite = () => {
    if (!apod) return;
    const newState = toggleFavorite({
      id: `apod_${apod.date}`,
      type: 'apod',
      title: apod.title,
      imageUrl: apod.url,
      data: apod
    });
    setIsFav(newState);
  };

  const handleDownload = () => {
    if (!apod) return;
    window.open(apod.hdurl || apod.url, '_blank');
  };

  const handleShare = async () => {
    if (!apod) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: apod.title,
          text: apod.explanation.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (err) {
        // Fallback to copy
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-3xl overflow-hidden border-cyan-500/20 animate-pulse">
        <div className="w-full h-[70vh] bg-white/5" />
        <div className="p-8 space-y-4">
          <div className="h-8 bg-white/5 rounded w-3/4" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-32 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!apod) return null;

  return (
    <div className="glass rounded-3xl overflow-hidden border-cyan-500/20">
      {/* Image/Video Hero */}
      <div className="relative w-full max-h-[70vh] overflow-hidden bg-black">
        {apod.media_type === 'video' ? (
          <iframe
            src={apod.url}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img
            src={apod.url}
            alt={apod.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold aurora-text mb-3">
              {apod.title}
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">{apod.date}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleFavorite}
              variant="outline"
              size="icon"
              className="glass border-purple-500/30 hover:bg-purple-500/20"
              data-testid="button-favorite-apod"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-purple-500 text-purple-500' : 'text-purple-400'}`} />
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="icon"
              className="glass border-cyan-500/30 hover:bg-cyan-500/20"
              data-testid="button-download-apod"
            >
              <Download className="w-5 h-5 text-cyan-400" />
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="glass border-blue-500/30 hover:bg-blue-500/20"
              data-testid="button-share-apod"
            >
              <Share2 className="w-5 h-5 text-blue-400" />
            </Button>
            {apod.hdurl && apod.hdurl !== apod.url && (
              <Button
                onClick={() => window.open(apod.hdurl, '_blank')}
                variant="outline"
                className="glass border-purple-500/30 hover:bg-purple-500/20 font-orbitron"
                data-testid="button-hd-apod"
              >
                HD Image
              </Button>
            )}
          </div>
        </div>

        {/* Explanation */}
        <p className="text-gray-300 leading-relaxed text-base md:text-lg">
          {apod.explanation}
        </p>

        {apod.copyright && (
          <p className="text-sm text-gray-500">
            Copyright: {apod.copyright}
          </p>
        )}

        {/* Date Navigator */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/10">
          <Button
            onClick={handlePrevDay}
            variant="outline"
            className="glass border-cyan-500/30 hover:bg-cyan-500/20"
            data-testid="button-prev-day"
          >
            ← Previous Day
          </Button>
          <Input
            type="date"
            value={selectedDate || apod.date}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="glass border-cyan-500/30 w-48"
            data-testid="input-date-picker"
          />
          <Button
            onClick={handleNextDay}
            variant="outline"
            disabled={apod.date >= new Date().toISOString().split('T')[0]}
            className="glass border-cyan-500/30 hover:bg-cyan-500/20 disabled:opacity-50"
            data-testid="button-next-day"
          >
            Next Day →
          </Button>
        </div>
      </div>
    </div>
  );
}

function ImageSearchSection() {
  const [query, setQuery] = useState('galaxy');
  const [results, setResults] = useState<NASAImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<NASAImageResult | null>(null);

  const suggestedSearches = ['Mars', 'Moon', 'Galaxy', 'Saturn', 'Nebula', 'Astronaut', 'Rocket'];

  const performSearch = async (searchQuery: string, pageNum: number, append = false) => {
    setLoading(true);
    const data = await searchNASAImages(searchQuery, pageNum);
    setResults(append ? [...results, ...data] : data);
    setLoading(false);
  };

  useEffect(() => {
    performSearch(query, 1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    performSearch(query, 1);
  };

  const handleSuggestedSearch = (suggestion: string) => {
    setQuery(suggestion);
    setPage(1);
    performSearch(suggestion, 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage, true);
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NASA image archives..."
            className="glass border-purple-500/30 focus:border-purple-500 pl-12 py-6 text-lg font-medium"
            data-testid="input-search-images"
          />
        </div>

        {/* Suggested Searches */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {suggestedSearches.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestedSearch(suggestion)}
              className="px-4 py-2 rounded-full glass border border-cyan-500/30 hover:bg-cyan-500/20 text-sm font-medium text-cyan-400 transition-all hover:-translate-y-1"
              data-testid={`button-suggested-${suggestion.toLowerCase()}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      {/* Results Grid */}
      {loading && results.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden h-64 animate-pulse border-white/10">
              <div className="w-full h-full bg-white/5" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl border-white/10">
          <p className="text-gray-400 text-lg">No results for '{query}'</p>
        </div>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {results.map((image, index) => (
              <ImageCard
                key={`${image.id}_${index}`}
                image={image}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              className="glass border-purple-500/30 hover:bg-purple-500/20 font-orbitron px-8"
              data-testid="button-load-more"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        </>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <ImageDetailDialog
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

function ImageCard({ image, onClick }: { image: NASAImageResult; onClick: () => void }) {
  const [isFav, setIsFav] = useState(isFavorite(image.id));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleFavorite({
      id: image.id,
      type: 'image',
      title: image.title,
      imageUrl: image.thumbnail,
      data: image
    });
    setIsFav(newState);
  };

  return (
    <div
      onClick={onClick}
      className="relative group cursor-pointer break-inside-avoid glass rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all hover:-translate-y-1"
      data-testid={`card-image-${image.id}`}
    >
      <img
        src={image.thumbnail}
        alt={image.title}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      
      {/* Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <h3 className="text-white font-medium text-sm line-clamp-2">
          {image.title}
        </h3>
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 p-2 rounded-full glass border border-purple-500/30 hover:bg-purple-500/20 transition-all opacity-0 group-hover:opacity-100"
        data-testid={`button-favorite-image-${image.id}`}
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-purple-500 text-purple-500' : 'text-purple-400'}`} />
      </button>
    </div>
  );
}

function ImageDetailDialog({ image, onClose }: { image: NASAImageResult; onClose: () => void }) {
  const [isFav, setIsFav] = useState(isFavorite(image.id));

  const handleFavorite = () => {
    const newState = toggleFavorite({
      id: image.id,
      type: 'image',
      title: image.title,
      imageUrl: image.thumbnail,
      data: image
    });
    setIsFav(newState);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass border-cyan-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-2xl aurora-text pr-8">
            {image.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <img
            src={image.thumbnail}
            alt={image.title}
            className="w-full rounded-xl"
            loading="lazy"
          />

          {image.date && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">{image.date}</span>
            </div>
          )}

          <p className="text-gray-300 leading-relaxed">
            {image.description}
          </p>

          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Button
              onClick={handleFavorite}
              variant="outline"
              className="glass border-purple-500/30 hover:bg-purple-500/20 gap-2"
              data-testid="button-favorite-detail"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-purple-500 text-purple-500' : 'text-purple-400'}`} />
              {isFav ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              onClick={() => window.open(image.thumbnail, '_blank')}
              variant="outline"
              className="glass border-cyan-500/30 hover:bg-cyan-500/20 gap-2"
              data-testid="button-download-detail"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
