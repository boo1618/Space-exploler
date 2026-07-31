import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const galaxies = [
  {
    name: 'Milky Way',
    type: 'Barred Spiral',
    fact: '~100,000 light-years diameter, 200-400 billion stars',
    description: 'Our home galaxy — a vast spiral of stars, gas, and dust orbiting a supermassive black hole.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/ESO-VLT-Laser-phot-0a-99.jpg/1280px-ESO-VLT-Laser-phot-0a-99.jpg'
  },
  {
    name: 'Andromeda (M31)',
    type: 'Spiral',
    fact: '2.537 million light-years away',
    description: 'Our nearest large galactic neighbor, destined to collide with the Milky Way in 4.5 billion years.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg/1280px-Andromeda_Galaxy_%28with_h-alpha%29.jpg'
  },
  {
    name: 'Whirlpool (M51)',
    type: 'Grand Design Spiral',
    fact: 'Interacting with companion NGC 5195',
    description: 'A classic spiral galaxy with a smaller companion, creating stunning tidal interactions.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Messier51_sRGB.jpg/1280px-Messier51_sRGB.jpg'
  },
  {
    name: 'Sombrero (M104)',
    type: 'Spiral',
    fact: 'Prominent dust lane and bright nucleus',
    description: 'An edge-on galaxy with a distinctive dark dust lane and brilliant central bulge.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Sombrero_Galaxy_-_Hubble_2005_full_size.jpg/1280px-Sombrero_Galaxy_-_Hubble_2005_full_size.jpg'
  }
];

export default function GalaxySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target.querySelectorAll('.galaxy-card'),
              { opacity: 0, y: 60 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                stagger: 0.15,
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
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4 aurora-text">Galaxy Explorer</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Venture beyond our solar system to explore the magnificent spiral cities of stars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {galaxies.map((galaxy, index) => (
            <div
              key={index}
              className="galaxy-card glass p-6 rounded-2xl hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] group"
            >
              <div className="w-full h-48 rounded-xl mb-4 overflow-hidden bg-black">
                <img
                  src={galaxy.image}
                  alt={galaxy.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }}
                />
              </div>

              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full mb-3">
                {galaxy.type}
              </span>

              <h3 className="font-orbitron text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                {galaxy.name}
              </h3>

              <p className="text-gray-400 text-sm mb-3">{galaxy.description}</p>

              <div className="pt-3 border-t border-white/10">
                <p className="text-cyan-300 text-xs font-medium">
                  {galaxy.fact}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
