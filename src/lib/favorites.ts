export type FavoriteItem = {
  id: string;
  type: 'apod' | 'image' | 'planet' | 'wallpaper';
  title: string;
  imageUrl: string;
  data?: unknown;
  savedAt?: number;
};

const STORAGE_KEY = 'space_favorites';

export function getFavorites(): FavoriteItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
  return [];
}

export function addFavorite(item: FavoriteItem): void {
  try {
    const favorites = getFavorites();
    // Avoid duplicates
    if (!favorites.some(f => f.id === item.id)) {
      favorites.unshift({ ...item, savedAt: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
}

export function removeFavorite(id: string): void {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

export function isFavorite(id: string): boolean {
  const favorites = getFavorites();
  return favorites.some(f => f.id === id);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
  } else {
    addFavorite(item);
    return true;
  }
}
