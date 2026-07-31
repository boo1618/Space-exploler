import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import SolarSystemPage from '@/pages/SolarSystemPage';
import NasaGalleryPage from '@/pages/NasaGalleryPage';
import IssTrackerPage from '@/pages/IssTrackerPage';
import PlanetsPage from '@/pages/PlanetsPage';
import BlackHolesPage from '@/pages/BlackHolesPage';
import WallpapersPage from '@/pages/WallpapersPage';
import NewsPage from '@/pages/NewsPage';
import AboutPage from '@/pages/AboutPage';

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full flex flex-col min-h-[100dvh]">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/solar-system" component={SolarSystemPage} />
          <Route path="/nasa-gallery" component={NasaGalleryPage} />
          <Route path="/iss-tracker" component={IssTrackerPage} />
          <Route path="/planets" component={PlanetsPage} />
          <Route path="/black-holes" component={BlackHolesPage} />
          <Route path="/wallpapers" component={WallpapersPage} />
          <Route path="/news" component={NewsPage} />
          <Route path="/about" component={AboutPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;