import { Link } from 'wouter';
import { Compass, Image as ImageIcon, Navigation } from 'lucide-react';

const features = [
  {
    id: 1,
    title: '3D Solar System',
    description: 'Explore our local neighborhood in an interactive 3D environment with real orbital data.',
    icon: Compass,
    link: '/solar-system',
    color: 'from-purple-600/20 to-purple-900/20',
    borderColor: 'group-hover:border-purple-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]',
    iconColor: 'text-purple-400'
  },
  {
    id: 2,
    title: 'NASA Gallery',
    description: 'Browse the breathtaking Astronomy Picture of the Day and search the official NASA image archives.',
    icon: ImageIcon,
    link: '/nasa-gallery',
    color: 'from-cyan-600/20 to-cyan-900/20',
    borderColor: 'group-hover:border-cyan-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]',
    iconColor: 'text-cyan-400'
  },
  {
    id: 3,
    title: 'ISS Live Tracker',
    description: 'Track the International Space Station in real-time as it orbits the Earth at 17,500 mph.',
    icon: Navigation,
    link: '/iss-tracker',
    color: 'from-blue-600/20 to-blue-900/20',
    borderColor: 'group-hover:border-blue-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    iconColor: 'text-blue-400'
  }
];

export default function FeaturedSections() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold mb-4 text-white">Discover The Cosmos</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Embark on a journey through space and time with our interactive modules.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.id} href={feature.link} className="block h-full">
                <div className={`glass h-full p-8 rounded-3xl cursor-pointer group transition-all duration-500 ${feature.borderColor} ${feature.glow} bg-gradient-to-br ${feature.color}`}>
                  <div className="bg-black/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                    <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-orbitron text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}