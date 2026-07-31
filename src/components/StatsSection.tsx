import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Globe, Star, Clock, Satellite } from 'lucide-react';

const stats = [
  { id: 1, label: 'Planets in Solar System', value: 8, suffix: '', icon: Globe },
  { id: 2, label: 'Billion Stars in Milky Way', value: 200, suffix: 'B', icon: Star },
  { id: 3, label: 'Billion Years — Age of Universe', value: 13.8, suffix: 'B', icon: Clock, isFloat: true },
  { id: 4, label: 'Active Satellites', value: 1234, suffix: '', icon: Satellite }
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        countersRef.current.forEach((el, index) => {
          if (!el) return;
          const targetValue = stats[index].value;
          const isFloat = stats[index].isFloat;
          
          gsap.to(el, {
            innerHTML: targetValue,
            duration: 2.5,
            ease: "power2.out",
            snap: { innerHTML: isFloat ? 0.1 : 1 },
            onUpdate: function() {
              el.innerHTML = isFloat 
                ? Number(this.targets()[0].innerHTML).toFixed(1)
                : Math.round(Number(this.targets()[0].innerHTML)).toLocaleString();
            }
          });
        });
        
        gsap.fromTo(
          ".stat-card",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
        );
        
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 relative border-t border-purple-500/20 bg-gradient-to-b from-purple-900/10 to-transparent">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="stat-card glass p-6 rounded-2xl flex flex-col items-center text-center opacity-0 transform translate-y-10 group hover:border-cyan-500/50 transition-colors duration-500">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="font-orbitron text-4xl font-bold text-white mb-2 flex items-center">
                  <span ref={el => countersRef.current[i] = el}>0</span>
                  <span>{stat.suffix}</span>
                </h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}