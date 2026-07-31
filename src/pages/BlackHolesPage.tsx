import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function BlackHolesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const [rotation, setRotation] = useState(0);

  // Animated black hole canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const drawBlackHole = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Event horizon (black circle)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Photon sphere (bright ring)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Accretion disk (rotating ellipses)
      const diskLayers = 8;
      for (let i = 0; i < diskLayers; i++) {
        const radius = 100 + i * 15;
        const alpha = 0.6 - i * 0.05;
        const colors = ['#FF6B35', '#F7931E', '#FDC830', '#F37335', '#FF4500'];
        const color = colors[i % colors.length];

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + i * 0.3);
        ctx.scale(1, 0.3);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, `rgba(139, 0, 0, ${alpha * 0.3})`);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.restore();
      }

      // Gravitational lensing glow
      const lensGradient = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, 200);
      lensGradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
      lensGradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
      lensGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
      ctx.fillStyle = lensGradient;
      ctx.fill();

      // Jets (top and bottom)
      ctx.save();
      ctx.translate(centerX, centerY);

      // Top jet
      const jetGradient1 = ctx.createLinearGradient(0, -80, 0, -180);
      jetGradient1.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      jetGradient1.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = jetGradient1;
      ctx.fillRect(-8, -180, 16, 100);

      // Bottom jet
      const jetGradient2 = ctx.createLinearGradient(0, 80, 0, 180);
      jetGradient2.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      jetGradient2.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = jetGradient2;
      ctx.fillRect(-8, 80, 16, 100);

      ctx.restore();

      angle += 0.02;
      animationFrameId = requestAnimationFrame(drawBlackHole);
    };

    drawBlackHole();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-4xl md:text-6xl font-bold mb-6 aurora-text">
            Black Holes
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-8">
            The most mysterious objects in the universe — where gravity becomes so extreme that nothing, not even light, can escape.
          </p>

          {/* Animated Black Hole Canvas */}
          <div className="flex justify-center mb-8">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="rounded-2xl glass"
            />
          </div>
        </div>

        {/* Event Horizon Section */}
        <div
          ref={(el) => el && (sectionsRef.current[0] = el)}
          className="glass p-8 md:p-10 rounded-3xl mb-8 grid md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-purple-500 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <div className="w-10 h-10 rounded-full bg-purple-500 animate-pulse"></div>
            </div>
          </div>
          <div>
            <h2 className="font-orbitron text-3xl font-bold mb-4 text-purple-400">The Point of No Return</h2>
            <p className="text-gray-300 mb-4">
              The event horizon is the boundary around a black hole beyond which nothing can escape — not matter, not radiation, not even light itself. Once you cross this invisible threshold, you're committed to falling into the singularity.
            </p>
            <p className="text-gray-300 mb-4">
              The size of the event horizon depends on the black hole's mass. For a stellar black hole, it might be just a few kilometers across. For supermassive black holes like those at galaxy centers, it can span millions of kilometers.
            </p>
            <p className="text-gray-300 mb-4">
              Time itself behaves strangely near the event horizon. To an outside observer, anything falling in appears to slow down and freeze at the boundary, never quite crossing it — though from the falling object's perspective, the crossing happens in finite time.
            </p>
            <div className="glass bg-purple-500/10 border-purple-500/30 p-4 rounded-xl mt-6">
              <p className="text-sm text-purple-200 font-medium">
                <strong>Key Fact:</strong> At the event horizon, escape velocity equals the speed of light (299,792 km/s)
              </p>
            </div>
          </div>
        </div>

        {/* Singularity Section */}
        <div
          ref={(el) => el && (sectionsRef.current[1] = el)}
          className="glass p-8 md:p-10 rounded-3xl mb-8 grid md:grid-cols-2 gap-8 items-center"
        >
          <div className="order-2 md:order-1">
            <h2 className="font-orbitron text-3xl font-bold mb-4 text-cyan-400">The Singularity</h2>
            <p className="text-gray-300 mb-4">
              At the very center of a black hole lies the singularity — a point of infinite density where all the black hole's mass is concentrated. Here, the fabric of spacetime curves infinitely, and the laws of physics as we know them break down completely.
            </p>
            <p className="text-gray-300 mb-4">
              Quantum mechanics and general relativity — our two most successful theories — give contradictory predictions at the singularity. This is one of the greatest unsolved problems in physics, suggesting we need a theory of quantum gravity to truly understand what happens there.
            </p>
            <p className="text-gray-300 mb-4">
              For rotating black holes (which most real black holes are), the singularity might take the form of a ring rather than a point. But whether ring or point, it remains hidden forever behind the event horizon — the "cosmic censorship" hypothesis.
            </p>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-black"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Accretion Disk Section */}
        <div
          ref={(el) => el && (sectionsRef.current[2] = el)}
          className="glass p-8 md:p-10 rounded-3xl mb-8"
        >
          <h2 className="font-orbitron text-3xl font-bold mb-4 text-orange-400 text-center">The Accretion Disk</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-300 mb-4">
                Matter falling toward a black hole doesn't plunge straight in — it forms a swirling disk of superheated gas and dust called an accretion disk. Friction between particles heats the disk to millions of degrees, making it glow brilliantly across the electromagnetic spectrum.
              </p>
              <p className="text-gray-300 mb-4">
                These disks are some of the brightest objects in the universe, often outshining entire galaxies. The innermost regions, closest to the event horizon, can reach temperatures of 10 million Kelvin or more, emitting intense X-rays and gamma rays.
              </p>
              <p className="text-gray-300">
                The disk's rotation follows the black hole's spin, and matter gradually spirals inward, losing energy and angular momentum until it crosses the point of no return.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-red-600 animate-spin" style={{ animationDuration: '4s' }}></div>
                <div className="absolute inset-8 rounded-full bg-black"></div>
                <div className="absolute inset-16 rounded-full bg-gradient-to-r from-yellow-300 to-orange-500 opacity-60 blur-md"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Spaghettification Section */}
        <div
          ref={(el) => el && (sectionsRef.current[3] = el)}
          className="glass p-8 md:p-10 rounded-3xl mb-8"
        >
          <h2 className="font-orbitron text-3xl font-bold mb-4 text-red-400 text-center">Spaghettification</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="relative h-40 w-24 flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-400 rounded-full mb-20 animate-pulse"></div>
                <div className="absolute w-4 h-32 bg-gradient-to-b from-blue-400 to-blue-600 animate-bounce" style={{ animationDuration: '2s' }}></div>
              </div>
            </div>
            <div>
              <p className="text-gray-300 mb-4">
                If you fell into a black hole feet-first, the gravitational pull on your feet would be significantly stronger than on your head. This difference in gravitational force — called a tidal force — would stretch you vertically while compressing you horizontally.
              </p>
              <p className="text-gray-300 mb-4">
                Physicists call this process "spaghettification" (yes, really). For stellar-mass black holes, you'd be torn apart long before reaching the event horizon. But for supermassive black holes, the event horizon is so far from the singularity that you could cross it intact — though you'd still meet the same fate eventually.
              </p>
              <p className="text-gray-300">
                The stretching would continue until the molecular bonds in your body couldn't withstand the stress, reducing you to a stream of atoms falling toward the singularity.
              </p>
            </div>
          </div>
        </div>

        {/* Types of Black Holes */}
        <div
          ref={(el) => el && (sectionsRef.current[4] = el)}
          className="mb-8"
        >
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center aurora-text">Types of Black Holes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <h3 className="font-orbitron text-xl font-bold mb-3 text-purple-400">Stellar Black Holes</h3>
              <p className="text-gray-400 text-sm mb-4">Mass: 3–30 solar masses</p>
              <p className="text-gray-300 text-sm">
                Formed when massive stars (at least 20 times the Sun's mass) collapse at the end of their lives in supernova explosions. The most common type of black hole in the universe.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              <h3 className="font-orbitron text-xl font-bold mb-3 text-cyan-400">Intermediate Black Holes</h3>
              <p className="text-gray-400 text-sm mb-4">Mass: 100–100,000 solar masses</p>
              <p className="text-gray-300 text-sm">
                A mysterious category. Few confirmed examples exist, but they might form from mergers of stellar black holes or the collapse of massive star clusters.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <h3 className="font-orbitron text-xl font-bold mb-3 text-orange-400">Supermassive Black Holes</h3>
              <p className="text-gray-400 text-sm mb-4">Mass: millions to billions of solar masses</p>
              <p className="text-gray-300 text-sm">
                Found at the centers of most galaxies. How they grow so massive remains a mystery — possibly through continuous accretion and mergers over billions of years.
              </p>
            </div>
          </div>
        </div>

        {/* Famous Black Holes */}
        <div
          ref={(el) => el && (sectionsRef.current[5] = el)}
          className="mb-8"
        >
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center neon-glow text-cyan-400">Famous Black Holes</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            <div className="glass p-6 rounded-2xl min-w-[300px] md:min-w-[350px] snap-center">
              <div className="w-full h-48 rounded-xl mb-4 bg-gradient-to-br from-purple-900 to-black overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Black_hole_-_Messier_87_crop_max_res.jpg/800px-Black_hole_-_Messier_87_crop_max_res.jpg"
                  alt="Sagittarius A*"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full mb-3">Supermassive</span>
              <h3 className="font-orbitron text-xl font-bold mb-2 text-white">Sagittarius A*</h3>
              <p className="text-gray-400 text-sm mb-3">At the center of our Milky Way galaxy</p>
              <p className="text-gray-300 text-sm">
                Mass: 4 million solar masses. Located 26,000 light-years away. First imaged by the Event Horizon Telescope in 2022.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl min-w-[300px] md:min-w-[350px] snap-center">
              <div className="w-full h-48 rounded-xl mb-4 bg-gradient-to-br from-orange-900 to-black overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/800px-Black_hole_-_Messier_87_crop_max_res.jpg"
                  alt="M87*"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-medium rounded-full mb-3">Supermassive</span>
              <h3 className="font-orbitron text-xl font-bold mb-2 text-white">M87*</h3>
              <p className="text-gray-400 text-sm mb-3">First black hole ever photographed</p>
              <p className="text-gray-300 text-sm">
                Mass: 6.5 billion solar masses. The first direct visual evidence of a black hole's event horizon, captured in 2019.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl min-w-[300px] md:min-w-[350px] snap-center">
              <div className="w-full h-48 rounded-xl mb-4 bg-gradient-to-br from-red-900 to-black"></div>
              <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded-full mb-3">Ultramassive</span>
              <h3 className="font-orbitron text-xl font-bold mb-2 text-white">TON 618</h3>
              <p className="text-gray-400 text-sm mb-3">One of the most massive black holes known</p>
              <p className="text-gray-300 text-sm">
                Mass: 66 billion solar masses. Its accretion disk is so luminous it outshines hundreds of galaxies combined. Located 10.4 billion light-years away.
              </p>
            </div>
          </div>
        </div>

        {/* Did You Know */}
        <div
          ref={(el) => el && (sectionsRef.current[6] = el)}
          className="glass p-8 rounded-3xl"
        >
          <h2 className="font-orbitron text-3xl font-bold mb-8 text-center aurora-text">Mind-Bending Facts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <div className="text-4xl font-orbitron font-bold mb-2 text-purple-400 neon-glow">10¹⁸</div>
              <p className="text-gray-300 text-sm">
                The density at a black hole's singularity exceeds 10^18 kg/cm³ — matter compressed to unfathomable extremes.
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <div className="text-4xl font-orbitron font-bold mb-2 text-cyan-400 neon-glow">∞</div>
              <p className="text-gray-300 text-sm">
                Time dilation at the event horizon is infinite from an outside observer's perspective — you'd appear frozen in time forever.
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-2xl">
              <div className="text-4xl font-orbitron font-bold mb-2 text-orange-400 neon-glow">100M</div>
              <p className="text-gray-300 text-sm">
                There are an estimated 100 million stellar black holes in the Milky Way alone — most completely invisible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
