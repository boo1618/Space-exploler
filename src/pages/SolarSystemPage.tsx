import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { initSolarSystem, LabelInfo, PlanetClickInfo } from '@/lib/solarSystemScene';
import {
  X, Play, Pause, RotateCcw, Zap, CloudLightning, Wind, Thermometer,
  ChevronRight, ChevronLeft, Info, AlertTriangle, Sun, Gauge
} from 'lucide-react';

// ─── Planet encyclopedia ─────────────────────────────────────────────────────
const PLANET_INFO: Record<string, {
  color: string; bg: string; type: string;
  diameter: string; distance: string; period: string; day: string;
  moons: number; temp: string; gravity: string;
  description: string; funFacts: string[];
  weatherType: string; weatherDesc: string;
  windSpeed: string; stormFreq: string;
}> = {
  Mercury: {
    color: '#a8a8a8', bg: 'rgba(120,110,100,0.15)', type: 'Terrestrial',
    diameter:'4,879 km', distance:'57.9M km', period:'88 days', day:'59 days',
    moons:0, temp:'-180°C to 430°C', gravity:'3.7 m/s²',
    description:'The smallest planet and closest to the Sun. Mercury experiences extreme temperature swings — scorching hot by day, freezing cold at night — because it has virtually no atmosphere to trap heat.',
    funFacts:['A year on Mercury is only 88 Earth days','Despite being closest to the Sun it\'s not the hottest planet','Mercury\'s core makes up 75% of its radius'],
    weatherType:'Solar Wind', weatherDesc:'Constant bombardment of charged particles from the Sun. No real atmosphere to speak of — just a thin exosphere.',
    windSpeed:'N/A', stormFreq:'Continuous',
  },
  Venus: {
    color:'#e8cda0', bg:'rgba(200,140,50,0.15)', type:'Terrestrial',
    diameter:'12,104 km', distance:'108.2M km', period:'225 days', day:'243 days',
    moons:0, temp:'462°C avg', gravity:'8.87 m/s²',
    description:'The hottest planet in our solar system due to a runaway greenhouse effect. Venus rotates backwards and is almost the same size as Earth — our twisted twin.',
    funFacts:['Venus rotates backwards — the Sun rises in the west','A day on Venus is longer than its year','Surface pressure is 90× Earth\'s'],
    weatherType:'Acid Clouds', weatherDesc:'Thick sulfuric acid clouds blanket the entire planet. Acid rain forms but evaporates before reaching the surface.',
    windSpeed:'360 km/h', stormFreq:'Permanent',
  },
  Earth: {
    color:'#4169E1', bg:'rgba(65,105,225,0.15)', type:'Terrestrial',
    diameter:'12,742 km', distance:'149.6M km', period:'365 days', day:'24 hours',
    moons:1, temp:'-88°C to 58°C', gravity:'9.8 m/s²',
    description:'Our home — the only known planet harboring life. Earth\'s liquid water, protective magnetic field, and oxygen-rich atmosphere create a perfect haven for billions of species.',
    funFacts:['70% of Earth\'s surface is water','The magnetic field protects us from solar radiation','Earth is the densest planet in the solar system'],
    weatherType:'Thunderstorm', weatherDesc:'Dynamic weather systems driven by solar energy and ocean evaporation. Tropical cyclones, blizzards, and lightning storms define our atmospheric drama.',
    windSpeed:'Up to 400 km/h', stormFreq:'Thousands daily',
  },
  Mars: {
    color:'#cd4f2a', bg:'rgba(180,60,30,0.15)', type:'Terrestrial',
    diameter:'6,779 km', distance:'227.9M km', period:'687 days', day:'24h 37m',
    moons:2, temp:'-87°C to -5°C', gravity:'3.72 m/s²',
    description:'The Red Planet — humanity\'s next destination. Mars hosts Olympus Mons, the largest volcano in the solar system, and Valles Marineris, a canyon 10× longer than the Grand Canyon.',
    funFacts:['Olympus Mons is 3× taller than Everest','Valles Marineris stretches 4,000 km','A Martian day is only 37 minutes longer than Earth\'s'],
    weatherType:'Dust Storm', weatherDesc:'Planet-wide dust storms can last for months, blanketing the entire surface and blocking up to 99% of sunlight. The largest known storms in the solar system.',
    windSpeed:'Up to 97 km/h', stormFreq:'Seasonal (global every few years)',
  },
  Jupiter: {
    color:'#c88b3a', bg:'rgba(180,130,50,0.15)', type:'Gas Giant',
    diameter:'139,820 km', distance:'778.5M km', period:'11.9 yrs', day:'9h 56m',
    moons:95, temp:'-108°C avg', gravity:'24.79 m/s²',
    description:'The king of planets — so massive it could fit all other planets inside it twice over. Jupiter\'s Great Red Spot is a storm larger than Earth that has raged for over 350 years.',
    funFacts:['Jupiter has 95 known moons','The Great Red Spot is bigger than Earth','Jupiter acts as a cosmic shield protecting inner planets'],
    weatherType:'Lightning Storm', weatherDesc:'Lightning bolts 1,000× more powerful than Earth\'s flash in the ammonia clouds. The Great Red Spot is a perpetual hurricane with 530 km/h winds.',
    windSpeed:'530 km/h', stormFreq:'Continuous — everywhere',
  },
  Saturn: {
    color:'#d4aa60', bg:'rgba(200,160,80,0.15)', type:'Gas Giant',
    diameter:'116,460 km', distance:'1.43B km', period:'29.5 yrs', day:'10h 42m',
    moons:146, temp:'-138°C avg', gravity:'10.44 m/s²',
    description:'The jewel of the solar system. Saturn\'s iconic rings are made of billions of ice and rock fragments. The mysterious hexagonal polar storm has existed for decades.',
    funFacts:['Saturn\'s rings are 282,000 km wide but <1km thick','Saturn would float on water — it\'s less dense','A hexagonal storm the size of Earth sits at the north pole'],
    weatherType:'Polar Vortex', weatherDesc:'A perfect geometric hexagonal storm at the north pole — 30,000 km across, with 320 km/h winds. No other planet has anything like it.',
    windSpeed:'320–500 km/h', stormFreq:'Permanent polar storm',
  },
  Uranus: {
    color:'#7fdbff', bg:'rgba(100,200,220,0.15)', type:'Ice Giant',
    diameter:'50,724 km', distance:'2.87B km', period:'84 yrs', day:'17h 14m',
    moons:28, temp:'-195°C avg', gravity:'8.69 m/s²',
    description:'The tilted ice giant — Uranus rotates on its side due to an ancient massive collision. Each pole experiences 42 years of continuous sunlight then 42 years of darkness.',
    funFacts:['Uranus rotates on its side with 98° axial tilt','Its moons are named after Shakespeare characters','It\'s the coldest planetary atmosphere in the solar system'],
    weatherType:'Methane Haze', weatherDesc:'Methane ice crystals form high-altitude hazes that give the planet its cyan color. Seasonal storm systems emerge during equinoxes with unusual violence.',
    windSpeed:'Up to 900 km/h', stormFreq:'Seasonal equinox storms',
  },
  Neptune: {
    color:'#4b70dd', bg:'rgba(70,100,220,0.15)', type:'Ice Giant',
    diameter:'49,244 km', distance:'4.5B km', period:'165 yrs', day:'16h 6m',
    moons:16, temp:'-200°C avg', gravity:'11.15 m/s²',
    description:'The windiest world — Neptune\'s storms rage at 2,100 km/h, the fastest winds in the solar system. It was predicted mathematically before anyone ever saw it.',
    funFacts:['Neptune has the fastest winds in the solar system','Its moon Triton orbits backwards','Neptune was discovered through math before observation'],
    weatherType:'Supersonic Winds', weatherDesc:'Jet streams reach 2,100 km/h — nearly supersonic. The Great Dark Spot, a storm larger than Earth, comes and goes mysteriously over decades.',
    windSpeed:'2,100 km/h', stormFreq:'Continuous jet streams',
  },
};

const PLANET_NAMES = Object.keys(PLANET_INFO);

const WEATHER_ICONS: Record<string, string> = {
  'Solar Wind':       '☀️', 'Acid Clouds':    '🌫️', 'Thunderstorm':   '⛈️',
  'Dust Storm':       '🌪️', 'Lightning Storm':'⚡', 'Polar Vortex':   '❄️',
  'Methane Haze':     '🌀', 'Supersonic Winds':'💨',
};

const WEATHER_COLORS: Record<string, string> = {
  Mercury: '#ffd080', Venus: '#ffaa44', Earth: '#88ccff', Mars: '#ff7744',
  Jupiter: '#d4a042', Saturn: '#ffe090', Uranus: '#80ffee', Neptune: '#4477ff',
};

// ─── CSS Fallback ────────────────────────────────────────────────────────────
function CSSFallback({ onSelect, selected }: { onSelect: (n: string) => void; selected: string | null }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8" style={{ background: '#050816' }}>
      <h2 className="font-orbitron text-2xl text-cyan-400">Solar System Explorer</h2>
      <p className="text-gray-500 text-sm">WebGL unavailable — explore planets below</p>
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {PLANET_NAMES.map(name => {
          const info = PLANET_INFO[name];
          return (
            <button key={name} onClick={() => onSelect(name)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: selected === name ? info.color + '22' : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${selected === name ? info.color : 'rgba(255,255,255,0.1)'}`,
                color: selected === name ? '#fff' : '#94a3b8',
                fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem',
                boxShadow: selected === name ? `0 0 14px ${info.color}55` : 'none',
              }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: info.color, display: 'inline-block' }} />
              {name}
            </button>
          );
        })}
      </div>
      {selected && <PlanetCard name={selected} onClose={() => onSelect(selected)} />}
    </div>
  );
}

// ─── Planet detail card ───────────────────────────────────────────────────────
function PlanetCard({ name, onClose }: { name: string; onClose: () => void }) {
  const info = PLANET_INFO[name];
  return (
    <div className="glass rounded-2xl p-6 max-w-md w-full relative" style={{ border: `1px solid ${info.color}44` }}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-300"><X size={16}/></button>
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width:44,height:44,borderRadius:'50%',background:`radial-gradient(circle at 35% 35%, white, ${info.color}, ${info.color}66)`,boxShadow:`0 0 18px ${info.color}88`,flexShrink:0 }}/>
        <div>
          <h3 className="font-orbitron text-xl font-bold text-white">{name}</h3>
          <span className="text-xs text-gray-500">{info.type}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-4">{info.description}</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[['Diameter',info.diameter],['Distance',info.distance],['Year',info.period],['Day',info.day],['Moons',String(info.moons)],['Gravity',info.gravity]].map(([l,v])=>(
          <div key={l} className="rounded-xl p-2.5" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
            <p className="text-xs text-gray-500">{l}</p>
            <p className="text-xs font-semibold text-white font-orbitron mt-0.5">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3" style={{background:`${info.color}11`,border:`1px solid ${info.color}33`}}>
        <p className="text-xs font-semibold mb-2 font-orbitron" style={{color:info.color}}>WEATHER: {info.weatherType}</p>
        <p className="text-xs text-gray-400">{info.weatherDesc}</p>
      </div>
    </div>
  );
}

// ─── Floating planet label ───────────────────────────────────────────────────
function PlanetLabel({ label, isSelected, intensity, onClick }: {
  label: LabelInfo; isSelected: boolean; intensity: number; onClick: () => void;
}) {
  const info = PLANET_INFO[label.name];
  if (!label.visible) return null;
  const scale = Math.max(0.55, Math.min(1.0, 80 / label.distance));
  const alpha = Math.max(0.3, Math.min(1.0, 80 / label.distance));
  const wt    = info.weatherType;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: label.x, top: label.y,
        transform: `translate(-50%, -150%) scale(${scale})`,
        opacity: alpha,
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        zIndex: isSelected ? 30 : 20,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Line connector */}
      <div style={{
        position:'absolute',left:'50%',top:'100%',
        width: 1, height: 18,
        background: `linear-gradient(to bottom, ${info.color}cc, transparent)`,
        transform:'translateX(-50%)',
      }}/>
      {/* Label bubble */}
      <div style={{
        background: isSelected ? `${info.color}22` : 'rgba(5,8,22,0.82)',
        border: `1px solid ${isSelected ? info.color : info.color + '55'}`,
        borderRadius: 30,
        padding: '3px 10px 3px 6px',
        display: 'flex', alignItems: 'center', gap: 5,
        backdropFilter: 'blur(8px)',
        boxShadow: isSelected ? `0 0 16px ${info.color}66` : 'none',
        whiteSpace: 'nowrap',
      }}>
        <span style={{width:7,height:7,borderRadius:'50%',background:info.color,flexShrink:0,
          boxShadow:`0 0 6px ${info.color}`,
          animation: intensity > 0.3 ? 'pulse-dot 1s ease-in-out infinite' : 'none'
        }}/>
        <span style={{fontFamily:'Orbitron, sans-serif',fontSize:10,color:'#f8fafc',fontWeight:600}}>{label.name}</span>
        {intensity > 0.15 && (
          <span style={{fontSize:9, opacity:0.85}}>{WEATHER_ICONS[wt] ?? '🌀'}</span>
        )}
        {intensity > 0.7 && (
          <span style={{width:5,height:5,borderRadius:'50%',background:'#ff4444',animation:'blink 0.8s step-end infinite',flexShrink:0}}/>
        )}
      </div>
    </div>
  );
}

// ─── Weather bar component ────────────────────────────────────────────────────
function WeatherBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{width:`${value*100}%`, background:`linear-gradient(to right, ${color}88, ${color})`}}/>
      </div>
      <span className="text-xs w-8 text-right" style={{color, fontFamily:'Orbitron, sans-serif'}}>{Math.round(value*100)}</span>
    </div>
  );
}

// ─── Intensity label helper ───────────────────────────────────────────────────
function intensityLabel(v: number) {
  if (v === 0)  return { text: 'CALM',    color: '#64748b' };
  if (v < 0.25) return { text: 'LIGHT',   color: '#22c55e' };
  if (v < 0.50) return { text: 'MODERATE',color: '#f59e0b' };
  if (v < 0.75) return { text: 'SEVERE',  color: '#f97316' };
  return               { text: 'EXTREME', color: '#ef4444' };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SolarSystemPage() {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const ctrlRef         = useRef<ReturnType<typeof initSolarSystem>>(null);
  const infoPanelRef    = useRef<HTMLDivElement>(null);
  const weatherPanelRef = useRef<HTMLDivElement>(null);

  const [hasWebGL,   setHasWebGL]   = useState(true);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [speed,      setSpeed]      = useState(1);
  const [paused,     setPaused]     = useState(false);
  const [showHelp,   setShowHelp]   = useState(true);
  const [labels,     setLabels]     = useState<LabelInfo[]>([]);
  const [weatherPanel, setWeatherPanel] = useState(true);
  const [flaring,    setFlaring]    = useState(false);

  // Weather intensities per planet (0-100)
  const [weatherMap, setWeatherMap] = useState<Record<string,number>>(
    () => Object.fromEntries(PLANET_NAMES.map(n => [n, 0]))
  );

  // Init scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctrl = initSolarSystem(canvas);
    if (!ctrl) { setHasWebGL(false); return; }
    ctrlRef.current = ctrl;

    ctrl.onPlanetClick((info: PlanetClickInfo | null) => {
      setSelected(info ? info.name : null);
    });

    ctrl.onFrame((ls: LabelInfo[]) => setLabels(ls));

    const t = setTimeout(() => setShowHelp(false), 5000);
    return () => { clearTimeout(t); ctrl.cleanup(); ctrlRef.current = null; };
  }, []);

  // Animate panels
  useEffect(() => {
    if (infoPanelRef.current && selected)
      gsap.fromTo(infoPanelRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
  }, [selected]);

  useEffect(() => { ctrlRef.current?.setSpeed(speed);  }, [speed]);
  useEffect(() => { ctrlRef.current?.setPaused(paused); }, [paused]);

  const handleWeatherChange = useCallback((planet: string, val: number) => {
    setWeatherMap(prev => ({ ...prev, [planet]: val }));
    ctrlRef.current?.setWeather(planet, val);
  }, []);

  const handleWeatherPreset = useCallback((preset: 'calm' | 'mild' | 'storm' | 'chaos') => {
    const vals: Record<string,number> = {
      calm:  Object.fromEntries(PLANET_NAMES.map(n => [n, 0])),
      mild:  Object.fromEntries(PLANET_NAMES.map(n => [n, 25])),
      storm: Object.fromEntries(PLANET_NAMES.map(n => [n, 65 + Math.random() * 25])),
      chaos: Object.fromEntries(PLANET_NAMES.map(n => [n, 75 + Math.random() * 25])),
    }[preset];
    setWeatherMap(vals);
    Object.entries(vals).forEach(([name, v]) => ctrlRef.current?.setWeather(name, v));
  }, []);

  const handleSolarFlare = useCallback(() => {
    setFlaring(true);
    ctrlRef.current?.triggerSolarFlare();
    setTimeout(() => setFlaring(false), 4000);
  }, []);

  const handleFocus = useCallback((name: string) => {
    setSelected(name);
    ctrlRef.current?.focusPlanet(name);
  }, []);

  const handleReset = useCallback(() => {
    setSelected(null);
    ctrlRef.current?.resetCamera();
  }, []);

  const info = selected ? PLANET_INFO[selected] : null;
  const selWeather = selected ? weatherMap[selected] / 100 : 0;

  if (!hasWebGL) {
    return (
      <div className="min-h-screen pt-16">
        <CSSFallback onSelect={(n) => setSelected(prev => prev === n ? null : n)} selected={selected} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{background:'#050816'}}>

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes flare-pulse { 0%,100%{box-shadow:0 0 20px #ff880066} 50%{box-shadow:0 0 60px #ff8800cc, 0 0 120px #ff440066} }
        @keyframes storm-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        .weather-slider::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:var(--thumb-color,#7C3AED); border:2px solid rgba(255,255,255,0.3); cursor:pointer; }
        .weather-slider::-webkit-slider-runnable-track { height:4px; border-radius:2px; }
        .panel-scroll::-webkit-scrollbar { width:3px; }
        .panel-scroll::-webkit-scrollbar-thumb { background:#7C3AED44; border-radius:2px; }
      `}</style>

      {/* ── Canvas ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{cursor:'grab'}}
        onMouseDown={e=>(e.target as HTMLCanvasElement).style.cursor='grabbing'}
        onMouseUp={e=>(e.target as HTMLCanvasElement).style.cursor='grab'}
      />

      {/* ── Planet Labels overlay ── */}
      <div className="absolute inset-0 pointer-events-none" style={{zIndex:25}}>
        {labels.map(lbl => (
          <PlanetLabel
            key={lbl.name}
            label={lbl}
            isSelected={selected === lbl.name}
            intensity={weatherMap[lbl.name] / 100}
            onClick={() => handleFocus(lbl.name)}
          />
        ))}
      </div>

      {/* ── Top planet pills ── */}
      <div className="absolute top-0 left-0 right-0 pt-[72px] pb-2 px-4 z-20 pointer-events-none">
        <div className="flex items-center justify-center gap-1.5 flex-wrap pointer-events-auto">
          {PLANET_NAMES.map(name => {
            const col  = PLANET_INFO[name].color;
            const wInt = weatherMap[name] / 100;
            const iSel = selected === name;
            return (
              <button key={name} onClick={() => handleFocus(name)}
                className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200"
                style={{
                  background: iSel ? col+'25' : 'rgba(5,8,22,0.72)',
                  border:`1px solid ${iSel ? col : col+'44'}`,
                  color: iSel ? '#fff' : '#94a3b8',
                  fontFamily:'Orbitron, sans-serif', fontSize:'0.68rem',
                  boxShadow: iSel ? `0 0 14px ${col}55` : 'none',
                  backdropFilter:'blur(10px)',
                }}>
                <span style={{width:7,height:7,borderRadius:'50%',background:col,flexShrink:0,
                  boxShadow: wInt > 0.5 ? `0 0 8px ${col}` : 'none'}}/>
                {name}
                {wInt > 0.6 && <span style={{width:5,height:5,borderRadius:'50%',background:'#ef4444',animation:'blink 1s step-end infinite'}}/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Weather / Mission Control panel (LEFT) ── */}
      <div className="absolute top-20 bottom-20 z-30 transition-all duration-300" style={{left: weatherPanel ? 8 : -300}}>
        <div ref={weatherPanelRef} className="panel-scroll h-full overflow-y-auto rounded-2xl"
          style={{
            width:270,
            background:'rgba(4,7,20,0.92)',
            border:'1px solid rgba(124,58,237,0.3)',
            boxShadow:'0 0 40px rgba(124,58,237,0.12)',
            backdropFilter:'blur(20px)',
          }}>

          {/* Panel header */}
          <div className="p-4 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-orbitron text-xs font-bold text-purple-400 tracking-widest">MISSION CONTROL</span>
              <Gauge size={13} className="text-purple-400"/>
            </div>
            <p className="text-xs text-gray-600">Planetary weather command</p>
          </div>

          {/* Global presets */}
          <div className="p-3 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
            <p className="text-xs text-gray-600 mb-2 font-orbitron tracking-wider">GLOBAL PRESET</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                {id:'calm',  label:'Calm',   color:'#22c55e'},
                {id:'mild',  label:'Mild',   color:'#f59e0b'},
                {id:'storm', label:'Storm',  color:'#f97316'},
                {id:'chaos', label:'Chaos',  color:'#ef4444'},
              ].map(p => (
                <button key={p.id} onClick={() => handleWeatherPreset(p.id as any)}
                  className="py-1.5 rounded-lg text-xs transition-all hover:brightness-125"
                  style={{background:`${p.color}18`,border:`1px solid ${p.color}44`,color:p.color,fontFamily:'Orbitron, sans-serif',fontSize:'0.65rem'}}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Solar flare button */}
          <div className="p-3 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
            <button onClick={handleSolarFlare} disabled={flaring}
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-orbitron text-xs font-bold"
              style={{
                background: flaring ? 'rgba(255,136,0,0.35)' : 'rgba(255,136,0,0.15)',
                border:'1px solid rgba(255,136,0,0.5)',
                color:'#ff8800',
                animation: flaring ? 'flare-pulse 0.8s ease-in-out infinite' : 'none',
                fontSize:'0.68rem',
              }}>
              <Zap size={13} className={flaring ? 'animate-bounce' : ''}/>
              {flaring ? 'SOLAR FLARE ACTIVE!' : 'TRIGGER SOLAR FLARE'}
            </button>
          </div>

          {/* Per-planet weather controls */}
          <div className="p-3 space-y-4">
            {PLANET_NAMES.map(name => {
              const col  = PLANET_INFO[name].color;
              const wCol = WEATHER_COLORS[name];
              const wInt = weatherMap[name];
              const iLbl = intensityLabel(wInt / 100);
              const wInf = PLANET_INFO[name];

              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div style={{width:9,height:9,borderRadius:'50%',background:col,flexShrink:0,boxShadow:wInt>50?`0 0 8px ${col}`:undefined}}/>
                      <span className="font-orbitron text-white" style={{fontSize:'0.7rem'}}>{name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span style={{fontSize:9}}>{WEATHER_ICONS[wInf.weatherType]}</span>
                      <span className="font-orbitron" style={{fontSize:'0.58rem',color:iLbl.color}}>{iLbl.text}</span>
                      {wInt > 70 && <AlertTriangle size={9} style={{color:'#ef4444'}}/>}
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="relative">
                    <input type="range" min={0} max={100} step={1} value={wInt}
                      onChange={e => handleWeatherChange(name, Number(e.target.value))}
                      className="weather-slider w-full h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        '--thumb-color': wCol,
                        background: `linear-gradient(to right, ${wCol} ${wInt}%, rgba(255,255,255,0.08) ${wInt}%)`,
                      } as React.CSSProperties}
                    />
                  </div>

                  {/* Mini stats row */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-600" style={{fontSize:'0.6rem'}}>{wInf.weatherType}</span>
                    <span className="font-orbitron" style={{fontSize:'0.6rem',color:wCol}}>{wInt}%</span>
                  </div>

                  {/* Storm warning ring animation */}
                  {wInt > 75 && (
                    <div className="relative h-1 mt-1">
                      <div style={{position:'absolute',right:0,width:60,height:'2px',overflow:'visible'}}>
                        <div style={{position:'absolute',right:0,top:-2,width:6,height:6,borderRadius:'50%',background:wCol,boxShadow:`0 0 8px ${wCol}`,animation:'blink 0.6s step-end infinite'}}/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toggle weather panel button */}
      <button onClick={() => setWeatherPanel(p => !p)}
        className="absolute top-1/2 z-30 -translate-y-1/2 flex items-center justify-center rounded-r-xl transition-all hover:brightness-125"
        style={{
          left: weatherPanel ? 278 : 8,
          width: 22, height: 52,
          background:'rgba(4,7,20,0.88)',
          border:'1px solid rgba(124,58,237,0.35)',
          borderLeft:'none',
          color:'#7C3AED',
          transition:'left 0.3s ease',
        }}>
        {weatherPanel ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
      </button>

      {/* ── Planet info panel (RIGHT) ── */}
      {selected && info && (
        <div ref={infoPanelRef}
          className="absolute top-20 right-3 z-30 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto panel-scroll rounded-2xl"
          style={{
            background:'rgba(4,7,20,0.93)',
            border:`1px solid ${info.color}44`,
            boxShadow:`0 0 40px ${info.color}18, 0 20px 60px rgba(0,0,0,0.6)`,
            backdropFilter:'blur(22px)',
          }}>

          {/* Header */}
          <div className="p-5 border-b" style={{borderColor:`${info.color}22`}}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div style={{
                    width:46,height:46,borderRadius:'50%',
                    background:`radial-gradient(circle at 35% 35%, white, ${info.color}, ${info.color}55)`,
                    boxShadow:`0 0 22px ${info.color}88`,
                  }}/>
                  {selWeather > 0.1 && (
                    <div style={{
                      position:'absolute',inset:-5,borderRadius:'50%',
                      border:`1.5px solid ${WEATHER_COLORS[selected]}88`,
                      animation:'storm-ring 2s ease-out infinite',
                    }}/>
                  )}
                </div>
                <div>
                  <h2 className="font-orbitron text-lg font-bold text-white">{selected}</h2>
                  <p className="text-xs text-gray-500">{info.type}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-300 p-1 rounded-lg hover:bg-white/5"><X size={15}/></button>
            </div>
          </div>

          {/* Description */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs text-gray-400 leading-relaxed">{info.description}</p>
          </div>

          {/* Stats */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {[['Diameter',info.diameter],['Distance',info.distance],['Year',info.period],['Day',info.day],['Moons',String(info.moons)],['Gravity',info.gravity],['Temp',info.temp]].map(([l,v])=>(
                <div key={l} className="rounded-xl p-2.5" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <p className="text-gray-500" style={{fontSize:'0.6rem'}}>{l}</p>
                  <p className="font-semibold text-white font-orbitron mt-0.5" style={{fontSize:'0.68rem'}}>{v}</p>
                </div>
              ))}
            </div>

            {/* Weather forecast panel */}
            <div className="rounded-2xl p-4 mb-4" style={{background:`${WEATHER_COLORS[selected]}0d`,border:`1px solid ${WEATHER_COLORS[selected]}33`}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CloudLightning size={13} style={{color:WEATHER_COLORS[selected]}}/>
                  <span className="font-orbitron font-bold" style={{fontSize:'0.65rem',color:WEATHER_COLORS[selected]}}>
                    WEATHER FORECAST
                  </span>
                </div>
                <span style={{fontSize:16}}>{WEATHER_ICONS[info.weatherType]}</span>
              </div>

              {/* Current conditions */}
              <div className="rounded-xl p-2.5 mb-3" style={{background:'rgba(255,255,255,0.05)'}}>
                <p className="text-xs font-semibold text-white mb-0.5">{info.weatherType}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{info.weatherDesc}</p>
              </div>

              {/* Stat bars */}
              <div className="space-y-2">
                <WeatherBar value={Math.min(1, selWeather * 1.2)} color={WEATHER_COLORS[selected]} label="Storm Level"/>
                <WeatherBar value={Math.min(1, selWeather * 0.9 + 0.1)} color={WEATHER_COLORS[selected]} label="Wind"/>
                <WeatherBar value={Math.min(1, selWeather * 0.7 + 0.15)} color={WEATHER_COLORS[selected]} label="Turbulence"/>
              </div>

              {/* Readings row */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="rounded-lg p-2" style={{background:'rgba(255,255,255,0.04)'}}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Wind size={9} style={{color:WEATHER_COLORS[selected]}}/>
                    <span className="text-gray-600" style={{fontSize:'0.58rem'}}>Winds</span>
                  </div>
                  <p className="font-orbitron text-white" style={{fontSize:'0.65rem'}}>{info.windSpeed}</p>
                </div>
                <div className="rounded-lg p-2" style={{background:'rgba(255,255,255,0.04)'}}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Thermometer size={9} style={{color:WEATHER_COLORS[selected]}}/>
                    <span className="text-gray-600" style={{fontSize:'0.58rem'}}>Temp</span>
                  </div>
                  <p className="font-orbitron text-white" style={{fontSize:'0.65rem'}}>{info.temp}</p>
                </div>
              </div>

              {/* Freq */}
              <div className="mt-2 flex items-center gap-1.5">
                <Info size={9} className="text-gray-600"/>
                <p className="text-gray-500" style={{fontSize:'0.6rem'}}>{info.stormFreq}</p>
              </div>
            </div>

            {/* Weather intensity control inside panel */}
            <div className="rounded-xl p-3" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron text-gray-400" style={{fontSize:'0.62rem'}}>WEATHER INTENSITY</span>
                <span className="font-orbitron font-bold" style={{fontSize:'0.65rem',color:WEATHER_COLORS[selected]}}>
                  {weatherMap[selected]}%
                </span>
              </div>
              <input type="range" min={0} max={100} step={1} value={weatherMap[selected]}
                onChange={e => handleWeatherChange(selected, Number(e.target.value))}
                className="weather-slider w-full cursor-pointer"
                style={{
                  '--thumb-color': WEATHER_COLORS[selected],
                  height: 6, borderRadius: 3, appearance: 'none',
                  background:`linear-gradient(to right, ${WEATHER_COLORS[selected]} ${weatherMap[selected]}%, rgba(255,255,255,0.08) ${weatherMap[selected]}%)`,
                } as React.CSSProperties}
              />
              <div className="flex justify-between mt-1">
                {['CALM','LIGHT','SEVERE','EXTREME'].map((l,i)=>(
                  <span key={l} onClick={() => handleWeatherChange(selected, i*33)} className="cursor-pointer hover:text-white transition-colors"
                    style={{fontSize:'0.55rem',color:'#475569',fontFamily:'Orbitron, sans-serif'}}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Fun facts */}
          <div className="px-5 pb-5">
            <div className="rounded-xl p-3" style={{background:`${info.color}0d`,border:`1px solid ${info.color}28`}}>
              <p className="font-orbitron font-semibold mb-2" style={{fontSize:'0.62rem',color:info.color}}>FUN FACTS</p>
              <ul className="space-y-1.5">
                {info.funFacts.map((f,i)=>(
                  <li key={i} className="flex items-start gap-2 text-gray-400" style={{fontSize:'0.7rem'}}>
                    <span style={{width:5,height:5,borderRadius:'50%',background:info.color,flexShrink:0,marginTop:4}}/>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Hint when nothing selected ── */}
      {!selected && (
        <div className="absolute top-20 right-4 z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-gray-600"
            style={{background:'rgba(5,8,22,0.65)',border:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(8px)'}}>
            <Info size={11}/>
            <span>Click any planet or label to inspect</span>
          </div>
        </div>
      )}

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 flex-wrap justify-center px-4">
        {/* Play/Pause */}
        <button onClick={() => setPaused(p=>!p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all"
          style={{background:'rgba(5,8,22,0.82)',border:'1px solid rgba(255,255,255,0.1)',color:'#cbd5e1',fontFamily:'Orbitron, sans-serif',fontSize:'0.65rem',backdropFilter:'blur(10px)'}}>
          {paused ? <Play size={12}/> : <Pause size={12}/>}
          {paused ? 'RESUME' : 'PAUSE'}
        </button>

        {/* Speed */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{background:'rgba(5,8,22,0.82)',border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(10px)'}}>
          <Sun size={11} className="text-yellow-500"/>
          <input type="range" min={0.1} max={6} step={0.1} value={speed} onChange={e=>setSpeed(parseFloat(e.target.value))}
            className="w-20 cursor-pointer" style={{accentColor:'#7C3AED',height:3}}/>
          <span className="font-orbitron text-cyan-400" style={{fontSize:'0.6rem',minWidth:26}}>{speed.toFixed(1)}×</span>
        </div>

        {/* Reset */}
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all hover:text-white"
          style={{background:'rgba(5,8,22,0.82)',border:'1px solid rgba(255,255,255,0.1)',color:'#64748b',fontFamily:'Orbitron, sans-serif',fontSize:'0.65rem',backdropFilter:'blur(10px)'}}>
          <RotateCcw size={11}/>
          RESET
        </button>
      </div>

      {/* ── Help tip ── */}
      {showHelp && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{animation:'pulse-dot 2s ease infinite'}}>
          <div className="px-4 py-2 rounded-xl text-xs text-gray-500 whitespace-nowrap"
            style={{background:'rgba(5,8,22,0.85)',border:'1px solid rgba(255,255,255,0.08)',backdropFilter:'blur(10px)'}}>
            🖱 Drag to rotate · Scroll to zoom · Click planets or labels · Control weather in the panel
          </div>
        </div>
      )}

      {/* ── Solar flare overlay ── */}
      {flaring && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background:'radial-gradient(ellipse at 50% 50%, rgba(255,136,0,0.08) 0%, transparent 70%)',
          animation:'flare-pulse 0.8s ease-in-out infinite',
        }}/>
      )}
    </div>
  );
}
