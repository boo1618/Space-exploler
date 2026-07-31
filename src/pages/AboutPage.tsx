import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Telescope, Rocket, Satellite, Zap, Globe, Cpu, Palette, Smartphone, Star, Image, Newspaper, BookOpen } from 'lucide-react';

const techStack = [
  {
    icon: Zap,
    name: 'Three.js',
    description: 'Interactive 3D Visuals',
    link: 'https://threejs.org'
  },
  {
    icon: Satellite,
    name: 'NASA Open APIs',
    description: 'Real Space Data',
    link: 'https://api.nasa.gov'
  },
  {
    icon: Rocket,
    name: 'React + Vite',
    description: 'Blazing Fast UI',
    link: 'https://vitejs.dev'
  },
  {
    icon: Cpu,
    name: 'GSAP',
    description: 'Cinematic Animations',
    link: 'https://greensock.com/gsap'
  },
  {
    icon: Palette,
    name: 'Glassmorphism CSS',
    description: 'Premium Aesthetics',
    link: '#'
  },
  {
    icon: Smartphone,
    name: 'PWA',
    description: 'Works Offline',
    link: '#'
  }
];

const features = [
  { icon: Globe, title: '3D Interactive Solar System', description: 'Explore planets with Three.js WebGL' },
  { icon: Image, title: 'NASA APOD & Image Search', description: 'Astronomy Picture of the Day + 100k+ images' },
  { icon: Satellite, title: 'Live ISS Tracker', description: 'Real-time International Space Station tracking' },
  { icon: Telescope, title: 'Planet Encyclopedia', description: '8 planets with 3D models and facts' },
  { icon: Zap, title: 'Black Holes Education', description: 'Interactive educational content' },
  { icon: Newspaper, title: 'Space News Feed', description: 'Latest headlines from space agencies' },
  { icon: Image, title: 'Wallpaper Gallery', description: 'Download free NASA wallpapers' },
  { icon: Star, title: 'Favorites System', description: 'Save your favorite content locally' }
];

const nasaAPIs = [
  { name: 'APOD API', description: 'Astronomy Picture of the Day' },
  { name: 'NASA Image & Video Library', description: '100,000+ space images' },
  { name: 'ISS Location API', description: 'Real-time position from wheretheiss.at' },
  { name: 'Spaceflight News API', description: 'Latest space news and articles' }
];

export default function AboutPage() {
  const starsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  // Animated stars background
  useEffect(() => {
    if (!starsRef.current) return;

    const stars = Array.from({ length: 50 }, (_, i) => {
      const star = document.createElement('div');
      star.className = 'absolute w-1 h-1 bg-white rounded-full';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animation = `twinkling ${2 + Math.random() * 3}s infinite`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      return star;
    });

    stars.forEach(star => starsRef.current?.appendChild(star));

    return () => {
      stars.forEach(star => star.remove());
    };
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    const sections = sectionsRef.current.filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 50 },
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Animated stars */}
      <div ref={starsRef} className="fixed inset-0 pointer-events-none z-0"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-5xl md:text-7xl font-bold mb-6 aurora-text">
            About Space Explorer
          </h1>
          <div className="max-w-3xl mx-auto glass p-8 rounded-3xl mb-8">
            <p className="text-gray-300 text-xl italic leading-relaxed">
              "Space Explorer is an open-source labor of love — built to make the wonders of the universe accessible to everyone, everywhere."
            </p>
          </div>
        </div>

        {/* Built With Section */}
        <div ref={(el) => el && (sectionsRef.current[0] = el)} className="mb-16">
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center neon-glow text-cyan-400">Built With</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techStack.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <a
                  key={index}
                  href={tech.link}
                  target="_blank"
                  rel="noreferrer"
                  className="glass p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] group"
                >
                  <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="font-orbitron text-xl font-bold mb-2 text-white">{tech.name}</h3>
                  <p className="text-gray-400 text-sm">{tech.description}</p>
                </a>
              );
            })}
          </div>
        </div>

        {/* What's Inside Section */}
        <div ref={(el) => el && (sectionsRef.current[1] = el)} className="mb-16">
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center aurora-text">What's Inside</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="glass p-5 rounded-xl hover:bg-white/10 transition-all duration-300">
                  <Icon className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="font-orbitron text-sm font-bold mb-1 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* NASA APIs Used Section */}
        <div ref={(el) => el && (sectionsRef.current[2] = el)} className="mb-16">
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center neon-glow text-purple-400">NASA APIs Used</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nasaAPIs.map((api, index) => (
              <div key={index} className="glass p-6 rounded-2xl border-purple-500/30">
                <h3 className="font-orbitron text-lg font-bold mb-2 text-purple-300">{api.name}</h3>
                <p className="text-gray-400 text-sm">{api.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Source Section */}
        <div ref={(el) => el && (sectionsRef.current[3] = el)} className="mb-16 text-center">
          <h2 className="font-orbitron text-3xl font-bold mb-6 aurora-text">Open Source</h2>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            This project is open source under the MIT License. Contributions, issues, and feature requests are welcome!
          </p>
          <a
            href="https://github.com/replit/space-explorer"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-orbitron font-bold text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300"
          >
            <Star className="w-5 h-5" />
            Star on GitHub
          </a>
        </div>

        {/* GitHub README Section */}
        <div ref={(el) => el && (sectionsRef.current[4] = el)} className="glass p-8 rounded-3xl bg-black/40">
          <div className="font-mono text-sm text-gray-300 leading-relaxed">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron text-lg font-bold text-white">README.md</span>
            </div>
            
            <pre className="whitespace-pre-wrap">
<span className="text-cyan-400 font-bold text-2xl"># Space Explorer</span>

<span className="text-purple-400">MIT License</span> | <span className="text-purple-400">NASA APIs</span> | <span className="text-purple-400">PRs Welcome</span>

A premium open-source space exploration web app — your window to the universe.

<span className="text-cyan-400 font-bold">## Features</span>

• 3D Interactive Solar System (Three.js)
• NASA APOD & Image Search
• Live ISS Tracker
• Planet Encyclopedia with 3D visuals
• Black Holes educational section
• Space News feed
• NASA Wallpaper gallery
• Favorites system with local storage
• Progressive Web App (PWA)
• Global search

<span className="text-cyan-400 font-bold">## Tech Stack</span>

HTML/CSS/JS, React + Vite, Three.js, GSAP, NASA Open APIs, Glassmorphism UI

<span className="text-cyan-400 font-bold">## Installation</span>

<span className="text-purple-400">git clone</span> https://github.com/yourusername/space-explorer
<span className="text-purple-400">cd</span> space-explorer
<span className="text-purple-400">npm install</span>
<span className="text-purple-400">npm run dev</span>

<span className="text-cyan-400 font-bold">## License</span>

MIT © Space Explorer Contributors

<span className="text-gray-500">Built with passion for the cosmos 🚀</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
