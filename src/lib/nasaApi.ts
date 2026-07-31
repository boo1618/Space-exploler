// NASA API configuration
const NASA_API_KEY = 'DEMO_KEY'; // Free key, rate-limited but functional

// Type definitions
export interface APODData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

export interface NASAImageResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  nasa_id: string;
}

export interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

export interface SpaceNewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  image_url: string;
  published_at: string;
  news_site: string;
}

// In-memory + localStorage cache
const cache: Record<string, { data: unknown; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const mem = cache[key];
  if (mem && Date.now() - mem.timestamp < CACHE_TTL) return mem.data as T;
  try {
    const stored = localStorage.getItem('space_cache_' + key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < 60 * 60 * 1000) return parsed.data as T; // 1hr localStorage TTL
    }
  } catch {}
  return null;
}

function setCache(key: string, data: unknown) {
  cache[key] = { data, timestamp: Date.now() };
  try { 
    localStorage.setItem('space_cache_' + key, JSON.stringify({ data, timestamp: Date.now() })); 
  } catch {}
}

// Fallback APOD data
const FALLBACK_APOD: APODData = {
  title: "Orion Nebula in Oxygen, Hydrogen, and Sulfur",
  date: new Date().toISOString().split('T')[0],
  explanation: "The Great Nebula in Orion, an immense, nearby starbirth region, is probably the most famous of all astronomical nebulas. Here, glowing gas surrounds hot young stars at the edge of an immense interstellar molecular cloud only 1500 light-years away.",
  url: "https://apod.nasa.gov/apod/image/2401/Orion_Webb_960.jpg",
  hdurl: "https://apod.nasa.gov/apod/image/2401/Orion_Webb_4000.jpg",
  media_type: "image",
  copyright: "NASA, ESA, CSA, Webb"
};

// Fallback NASA images
const FALLBACK_IMAGES: NASAImageResult[] = [
  {
    id: "PIA00342",
    nasa_id: "PIA00342",
    title: "Eagle Nebula's Pillars of Creation",
    description: "The iconic Eagle Nebula's Pillars of Creation, photographed by the Hubble Space Telescope.",
    thumbnail: "https://images-assets.nasa.gov/image/PIA00342/PIA00342~thumb.jpg",
    date: "1995-04-01"
  },
  {
    id: "PIA23122",
    nasa_id: "PIA23122",
    title: "First Image of a Black Hole",
    description: "The Event Horizon Telescope captured this image of the black hole at the center of galaxy M87.",
    thumbnail: "https://images-assets.nasa.gov/image/PIA23122/PIA23122~thumb.jpg",
    date: "2019-04-10"
  },
  {
    id: "PIA17218",
    nasa_id: "PIA17218",
    title: "Saturn's Hexagon Storm",
    description: "A massive hexagonal storm system at Saturn's north pole, captured by Cassini.",
    thumbnail: "https://images-assets.nasa.gov/image/PIA17218/PIA17218~thumb.jpg",
    date: "2013-12-04"
  },
  {
    id: "PIA00452",
    nasa_id: "PIA00452",
    title: "Jupiter's Great Red Spot",
    description: "A close-up view of Jupiter's iconic Great Red Spot storm system.",
    thumbnail: "https://images-assets.nasa.gov/image/PIA00452/PIA00452~thumb.jpg",
    date: "1996-06-26"
  },
  {
    id: "PIA23791",
    nasa_id: "PIA23791",
    title: "Mars Perseverance Landing Site",
    description: "Jezero Crater on Mars, the landing site for NASA's Perseverance rover.",
    thumbnail: "https://images-assets.nasa.gov/image/PIA23791/PIA23791~thumb.jpg",
    date: "2020-07-30"
  },
  {
    id: "PIA17563",
    nasa_id: "PIA17563",
    title: "Andromeda Galaxy",
    description: "The Andromeda Galaxy, our nearest large galactic neighbor, captured by Hubble.",
    thumbnail: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001327/GSFC_20171208_Archive_e001327~thumb.jpg",
    date: "2015-01-05"
  },
  {
    id: "PIA22228",
    nasa_id: "PIA22228",
    title: "Carina Nebula",
    description: "The Carina Nebula, a stellar nursery located about 7,500 light-years away.",
    thumbnail: "https://images-assets.nasa.gov/image/PIA22228/PIA22228~thumb.jpg",
    date: "2018-02-28"
  },
  {
    id: "PIA03149",
    nasa_id: "PIA03149",
    title: "Earth from Space",
    description: "The Blue Marble - Earth as seen from Apollo 17 in 1972.",
    thumbnail: "https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~thumb.jpg",
    date: "1972-12-07"
  },
  {
    id: "PIA21974",
    nasa_id: "PIA21974",
    title: "Pluto's Heart",
    description: "Pluto's distinctive heart-shaped feature, Tombaugh Regio, captured by New Horizons.",
    thumbnail: "https://images-assets.nasa.gov/image/PIA21974/PIA21974~thumb.jpg",
    date: "2015-07-14"
  },
  {
    id: "PIA24466",
    nasa_id: "PIA24466",
    title: "James Webb Deep Field",
    description: "Webb's First Deep Field reveals thousands of galaxies in a tiny patch of sky.",
    thumbnail: "https://images-assets.nasa.gov/image/GSFC_20220712_JWST_FirstDeep_Field/GSFC_20220712_JWST_FirstDeep_Field~thumb.jpg",
    date: "2022-07-12"
  }
];

// Fallback space news
const FALLBACK_NEWS: SpaceNewsItem[] = [
  {
    id: 1,
    title: "NASA's Artemis III Mission Targets 2026 Moon Landing Near South Pole",
    summary: "NASA has confirmed plans for the Artemis III mission to land astronauts near the lunar south pole in 2026, marking humanity's return to the Moon after more than 50 years.",
    url: "https://www.nasa.gov/artemis",
    image_url: "https://www.nasa.gov/wp-content/uploads/2023/03/artemis-moon.jpg",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    news_site: "NASA"
  },
  {
    id: 2,
    title: "SpaceX Starship Completes Successful Orbital Test Flight",
    summary: "SpaceX's Starship rocket successfully completed its latest orbital test flight, demonstrating key maneuvers and heat shield performance critical for future Mars missions.",
    url: "https://www.spacex.com/vehicles/starship/",
    image_url: "https://www.spacex.com/static/images/share.jpg",
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    news_site: "SpaceX"
  },
  {
    id: 3,
    title: "James Webb Telescope Reveals Earliest Galaxies in the Universe",
    summary: "The James Webb Space Telescope has discovered galaxies that formed just 300 million years after the Big Bang, pushing the boundaries of our understanding of the early universe.",
    url: "https://www.nasa.gov/webb",
    image_url: "https://www.nasa.gov/wp-content/uploads/2023/03/webb-first-deep-field.jpg",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    news_site: "NASA"
  },
  {
    id: 4,
    title: "ESA's JUICE Spacecraft Begins Jupiter System Approach",
    summary: "The European Space Agency's Jupiter Icy Moons Explorer (JUICE) has begun its approach phase to the Jupiter system, where it will study Europa, Ganymede, and Callisto.",
    url: "https://www.esa.int/juice",
    image_url: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2023/04/juice_spacecraft/24736033-1-eng-GB/JUICE_spacecraft_pillars.jpg",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    news_site: "ESA"
  },
  {
    id: 5,
    title: "China's Tianwen-3 Mars Sample Return Mission Set for 2028 Launch",
    summary: "China has announced details of its ambitious Tianwen-3 mission to collect samples from Mars and return them to Earth, competing with NASA's Mars Sample Return program.",
    url: "https://www.space.com",
    image_url: "https://www.nasa.gov/wp-content/uploads/2023/03/mars-sample-return.jpg",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    news_site: "Space.com"
  },
  {
    id: 6,
    title: "Hubble Observes Active Volcano on Jupiter's Moon Io",
    summary: "NASA's Hubble Space Telescope has captured stunning images of volcanic eruptions on Io, Jupiter's most geologically active moon, revealing details of its extreme volcanic activity.",
    url: "https://www.nasa.gov/hubble",
    image_url: "https://www.nasa.gov/wp-content/uploads/2023/03/io-volcano.jpg",
    published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    news_site: "NASA"
  },
  {
    id: 7,
    title: "SpaceX and NASA Target April for Crew-9 ISS Mission",
    summary: "NASA and SpaceX are preparing for the Crew-9 mission to the International Space Station, with four astronauts set to conduct scientific research during their six-month stay.",
    url: "https://www.nasa.gov/mission_pages/station/",
    image_url: "https://www.nasa.gov/wp-content/uploads/2023/03/crew-dragon.jpg",
    published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    news_site: "NASA"
  },
  {
    id: 8,
    title: "New Exoplanet Discovery: Earth-Sized World in Habitable Zone",
    summary: "Astronomers have discovered an Earth-sized exoplanet orbiting within the habitable zone of a nearby red dwarf star, raising exciting possibilities for the search for life beyond our solar system.",
    url: "https://www.nasa.gov/exoplanets",
    image_url: "https://www.nasa.gov/wp-content/uploads/2023/03/exoplanet.jpg",
    published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    news_site: "NASA"
  }
];

// Fetch APOD
export async function fetchAPOD(date?: string): Promise<APODData> {
  const cacheKey = `apod_${date || 'today'}`;
  const cached = getCached<APODData>(cacheKey);
  if (cached) return cached;

  try {
    const url = date 
      ? `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`
      : `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('APOD fetch failed');
    
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('APOD fetch error:', error);
    // Return fallback with today's or requested date
    return { ...FALLBACK_APOD, date: date || FALLBACK_APOD.date };
  }
}

// Search NASA Images
export async function searchNASAImages(query: string, page = 1): Promise<NASAImageResult[]> {
  const cacheKey = `nasa_search_${query}_${page}`;
  const cached = getCached<NASAImageResult[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page=${page}&page_size=20`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('NASA Image search failed');
    
    const data = await response.json();
    const items = data.collection?.items || [];
    
    const results: NASAImageResult[] = items.map((item: any) => ({
      id: item.data[0]?.nasa_id || Math.random().toString(),
      nasa_id: item.data[0]?.nasa_id || '',
      title: item.data[0]?.title || 'Untitled',
      description: item.data[0]?.description || 'No description available',
      thumbnail: item.links?.[0]?.href || FALLBACK_IMAGES[0].thumbnail,
      date: item.data[0]?.date_created?.split('T')[0] || ''
    }));
    
    setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('NASA Image search error:', error);
    return FALLBACK_IMAGES;
  }
}

// Fetch ISS Location
export async function fetchISSLocation(): Promise<ISSData> {
  const cacheKey = 'iss_location';
  const mem = cache[cacheKey];
  // ISS cache only valid for 5 seconds
  if (mem && Date.now() - mem.timestamp < 5000) return mem.data as ISSData;

  try {
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!response.ok) throw new Error('ISS fetch failed');
    
    const data = await response.json();
    const issData: ISSData = {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
      timestamp: data.timestamp
    };
    
    cache[cacheKey] = { data: issData, timestamp: Date.now() };
    return issData;
  } catch (error) {
    console.error('ISS fetch error:', error);
    return {
      latitude: 51.5,
      longitude: -0.1,
      altitude: 408,
      velocity: 27600,
      timestamp: Date.now() / 1000
    };
  }
}

// Fetch Space News
export async function fetchSpaceNews(limit = 12): Promise<SpaceNewsItem[]> {
  const cacheKey = `space_news_${limit}`;
  const cached = getCached<SpaceNewsItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}&format=json`);
    if (!response.ok) throw new Error('Space news fetch failed');
    
    const data = await response.json();
    const items = data.results || [];
    
    const results: SpaceNewsItem[] = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      url: item.url,
      image_url: item.image_url,
      published_at: item.published_at,
      news_site: item.news_site
    }));
    
    setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Space news fetch error:', error);
    return FALLBACK_NEWS;
  }
}
