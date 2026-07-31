import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { init } from '@/lib/spaceScene';
import { ChevronDown } from 'lucide-react';
import { Link } from 'wouter';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Init Three.js Scene (returns null if WebGL is unavailable)
    const cleanup = init(canvasRef.current);
    
    // If WebGL unavailable, hide canvas — CSS fallback background is shown
    if (!cleanup && canvasRef.current) {
      canvasRef.current.style.display = 'none';
    }

    // GSAP Animations
    const tl = gsap.timeline();
    
    const headline = headlineRef.current;
    if (headline) {
      const words = headline.innerText.split(' ');
      headline.innerHTML = '';
      words.forEach((word) => {
        const span = document.createElement('span');
        span.className = 'inline-block opacity-0 translate-y-10 mr-[0.2em]';
        if (word === 'Universe') {
          span.className += ' aurora-text';
        }
        span.innerText = word;
        headline.appendChild(span);
      });
      
      tl.to(headline.children, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });
    }

    tl.fromTo(".hero-sub", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.4"
    );

    tl.fromTo(".hero-btn",
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "back.out(1.5)" },
      "-=0.4"
    );

    tl.fromTo(".hero-badge",
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" },
      "-=0.6"
    );

    // Parallax text effect on mouse move
    const onMouseMove = (e: MouseEvent) => {
      if (!contentRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      
      gsap.to(contentRef.current, {
        x: -x,
        y: -y,
        duration: 1,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden flex items-center">
      {/* Three.js Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.8)_100%)] z-0 pointer-events-none" />

      {/* Main Content */}
      <div ref={contentRef} className="container mx-auto px-4 md:px-8 z-10 relative mt-16 md:mt-0">
        <div className="max-w-3xl">
          {/* Floating Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="hero-badge glass px-4 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-2">
              <span className="text-base">🪐</span> 8 Planets
            </span>
            <span className="hero-badge glass px-4 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-2">
              <span className="text-base">🌌</span> 200B Stars
            </span>
            <span className="hero-badge glass px-4 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-2 text-cyan-300">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Live ISS Tracker
            </span>
          </div>

          {/* Heading */}
          <h1 
            ref={headlineRef} 
            className="font-orbitron font-bold text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
          >
            Explore The Universe
          </h1>
          
          <p className="hero-sub text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            Discover planets, galaxies, black holes, NASA images, satellites, and the latest space discoveries.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/solar-system" className="hero-btn group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(56,189,248,0.7)]">
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
              <span className="relative">Explore →</span>
            </Link>
            
            <Link href="/nasa-gallery" className="hero-btn glass px-8 py-4 font-bold text-white rounded-full hover:bg-white/10 transition-colors border border-white/20 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] text-center">
              Today's Space Image
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer animate-bounce"
           onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        <span className="text-xs uppercase tracking-[0.2em] mb-2 text-gray-400 font-orbitron">Scroll to explore</span>
        <ChevronDown className="w-5 h-5 text-cyan-400" />
      </div>
    </section>
  );
}