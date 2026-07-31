import { useState, useEffect, useRef } from 'react';
import { Satellite, Globe, Gauge, Ruler, MapPin } from 'lucide-react';
import { fetchISSLocation, type ISSData } from '@/lib/nasaApi';
import gsap from 'gsap';

export default function IssTrackerPage() {
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [usingCache, setUsingCache] = useState(false);

  const loadISSData = async () => {
    try {
      const data = await fetchISSLocation();
      setIssData(data);
      setLastUpdate(Date.now());
      setLoading(false);
      // Check if using fallback data
      if (data.latitude === 51.5 && data.longitude === -0.1) {
        setUsingCache(true);
      } else {
        setUsingCache(false);
      }
    } catch (error) {
      console.error('ISS fetch error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadISSData();
    const interval = setInterval(loadISSData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from('.tracker-header', { opacity: 0, y: -30, duration: 0.8, ease: 'power3.out' });
    gsap.from('.tracker-stats', { opacity: 0, y: 20, duration: 0.8, delay: 0.2, stagger: 0.1, ease: 'power3.out' });
  }, []);

  const secondsSinceUpdate = lastUpdate ? Math.floor((Date.now() - lastUpdate) / 1000) : 0;

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="tracker-header text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="font-orbitron text-5xl md:text-6xl font-bold aurora-text">
              Live ISS Tracker
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-orbitron text-sm font-bold">LIVE</span>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track the International Space Station as it orbits Earth in real-time
          </p>
          <div className="h-1 w-32 mx-auto mt-6 bg-gradient-to-r from-purple-500 via-sky-400 to-blue-500 rounded-full" />
          
          {usingCache && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 bg-yellow-500/10">
              <span className="text-yellow-400 text-sm">⚠ Using cached location</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse border-white/10">
                <div className="h-12 bg-white/5 rounded mb-2" />
                <div className="h-8 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : issData ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 tracker-stats">
              <StatCard
                icon={<MapPin className="w-8 h-8 text-cyan-400" />}
                label="Latitude"
                value={formatLatitude(issData.latitude)}
                color="cyan"
              />
              <StatCard
                icon={<Globe className="w-8 h-8 text-purple-400" />}
                label="Longitude"
                value={formatLongitude(issData.longitude)}
                color="purple"
              />
              <StatCard
                icon={<Ruler className="w-8 h-8 text-blue-400" />}
                label="Altitude"
                value={`${issData.altitude.toFixed(1)} km`}
                color="blue"
              />
              <StatCard
                icon={<Gauge className="w-8 h-8 text-green-400" />}
                label="Velocity"
                value={`${issData.velocity.toFixed(0)} km/h`}
                color="green"
              />
            </div>

            {/* Map Section */}
            <div className="glass rounded-3xl overflow-hidden border-cyan-500/20 mb-8">
              <ISSMap issData={issData} />
            </div>

            {/* Info Section */}
            <div className="text-center space-y-4">
              <p className="text-gray-400">
                Last updated: <span className="text-cyan-400 font-medium">{secondsSinceUpdate} seconds ago</span>
              </p>
              <div className="glass rounded-2xl p-6 border-white/10 max-w-3xl mx-auto">
                <Satellite className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg leading-relaxed">
                  The International Space Station orbits Earth every <span className="text-cyan-400 font-bold">90 minutes</span> at an average altitude of <span className="text-purple-400 font-bold">~408 km</span>, traveling at approximately <span className="text-blue-400 font-bold">27,600 km/h</span>. It completes about 16 orbits per day, providing astronauts with 16 sunrises and sunsets.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    cyan: 'border-cyan-500/30 hover:border-cyan-500/50',
    purple: 'border-purple-500/30 hover:border-purple-500/50',
    blue: 'border-blue-500/30 hover:border-blue-500/50',
    green: 'border-green-500/30 hover:border-green-500/50'
  };

  return (
    <div className={`glass rounded-2xl p-6 border ${colorClasses[color as keyof typeof colorClasses]} transition-all hover:-translate-y-1`} data-testid={`stat-${label.toLowerCase()}`}>
      <div className="flex items-start justify-between mb-3">
        {icon}
      </div>
      <div className="text-sm text-gray-400 mb-1 font-medium">{label}</div>
      <div className="text-2xl font-orbitron font-bold text-white" data-testid={`value-${label.toLowerCase()}`}>
        {value}
      </div>
    </div>
  );
}

function ISSMap({ issData }: { issData: ISSData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid lines (latitude/longitude)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;

    // Latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * rect.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * rect.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    // Calculate ISS position
    const x = ((issData.longitude + 180) / 360) * rect.width;
    const y = ((90 - issData.latitude) / 180) * rect.height;

    // Draw orbit path (approximate circle)
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rect.width / 2, rect.height / 2, Math.min(rect.width, rect.height) * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw ISS marker with glow
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Main marker
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Inner dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw ISS icon (simplified satellite shape)
    ctx.save();
    ctx.translate(x, y);
    
    // Satellite body
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(-6, -3, 12, 6);
    
    // Solar panels
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(-12, -2, 5, 4);
    ctx.fillRect(7, -2, 5, 4);
    
    ctx.restore();

  }, [issData]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full aspect-[2/1] rounded-xl"
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      {/* Tooltip */}
      <div className="absolute top-4 left-4 glass px-4 py-2 rounded-xl border border-cyan-500/30">
        <div className="text-xs text-gray-400 mb-1">Current Position</div>
        <div className="text-sm font-orbitron text-cyan-400">
          {formatLatitude(issData.latitude)}, {formatLongitude(issData.longitude)}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 glass px-4 py-3 rounded-xl border border-white/10 space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="text-gray-300">ISS Location</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-8 h-0.5 border-t-2 border-dashed border-purple-500" />
          <span className="text-gray-300">Orbit Path</span>
        </div>
      </div>
    </div>
  );
}

function formatLatitude(lat: number): string {
  const dir = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(4)}° ${dir}`;
}

function formatLongitude(lon: number): string {
  const dir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lon).toFixed(4)}° ${dir}`;
}
