import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import FeaturedSections from '@/components/FeaturedSections';
import GalaxySection from '@/components/GalaxySection';
import NebulaSection from '@/components/NebulaSection';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      <Hero />
      <StatsSection />
      <FeaturedSections />
      <GalaxySection />
      <NebulaSection />
    </div>
  );
}
