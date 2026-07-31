import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const nebulae = [
  {
    name: 'Horsehead Nebula',
    type: 'Dark Nebula',
    location: 'Orion Constellation',
    distance: '1,375 light-years',
    description: 'A dark nebula silhouetted against the bright emission nebula IC 434.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Barnard_33.jpg/1024px-Barnard_33.jpg'
  },
  {
    name: 'Orion Nebula (M42)',
    type: 'Emission Nebula',
    location: 'Orion Constellation',
    distance: '1,344 light-years',
    description: 'A stellar nursery where thousands of new stars are being born.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg/1280px-Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'
  },
  {
    name: 'Eagle Nebula',
    type: 'Emission Nebula',
    location: 'Serpens Constellation',
    distance: '7,000 light-years',
    description: 'Home of the iconic "Pillars of Creation" — towering columns of interstellar gas.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg/800px-Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg'
  },
  {
    name: 'Crab Nebula (M1)',
    type: 'Supernova Remnant',
    location: 'Taurus Constellation',
    distance: '6,500 light-years',
    description: 'The remnant of a supernova explosion observed by Chinese astronomers in 1054 AD.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1280px-Crab_Nebula.jpg'
  },
  {
    name: 'Carina Nebula',
    type: 'Emission Nebula',
    location: 'Carina Constellation',
    distance: '7,500 light-years',
    description: 'One of the largest and brightest nebulae, containing massive stars and protostars.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/ESO-The_Carina_Nebula.jpg/1280px-ESO-The_Carina_Nebula.jpg'
  }
];

export default function NebulaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target.querySelectorAll('.nebula-card'),
              { opacity: 0, x: -50 },
              { 
                opacity: 1, 
                x: 0, 
                duration: 0.8, 
                stagger: 0.1,
                ease: 'power3.out' 
              }
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4 neon-glow text-cyan-400">
            Nebula Gallery
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Cosmic clouds where stars are born and die — the universe's most beautiful nurseries and graveyards.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
          {nebulae.map((nebula, index) => (
            <div
              key={index}
              className="nebula-card glass p-6 rounded-2xl min-w-[320px] md:min-w-[380px] snap-center hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] group flex-shrink-0"
            >
              <div className="w-full h-56 rounded-xl mb-4 overflow-hidden bg-black">
                <img
                  src={nebula.image}
                  alt={nebula.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                  }}
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full">
                  {nebula.type}
                </span>
                <span className="text-gray-500 text-xs">{nebula.distance}</span>
              </div>

              <h3 className="font-orbitron text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                {nebula.name}
              </h3>

              <p className="text-gray-400 text-sm mb-3">{nebula.description}</p>

              <div className="pt-3 border-t border-white/10">
                <p className="text-purple-300 text-xs font-medium">
                  📍 {nebula.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
