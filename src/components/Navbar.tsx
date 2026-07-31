import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Github, Menu, X, Search } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const links = [
  { href: '/', label: 'Home' },
  { href: '/solar-system', label: 'Solar System' },
  { href: '/nasa-gallery', label: 'NASA Gallery' },
  { href: '/iss-tracker', label: 'ISS Tracker' },
  { href: '/planets', label: 'Planets' },
  { href: '/black-holes', label: 'Black Holes' },
  { href: '/wallpapers', label: 'Wallpapers' },
  { href: '/news', label: 'News' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between relative z-50">
          <Link href="/" className="font-orbitron font-bold text-xl md:text-2xl tracking-wider aurora-text neon-glow">
            ✦ SPACE EXPLORER
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {links.slice(1).map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-cyan-400 hover:neon-glow ${
                  location === link.href ? 'text-cyan-400 neon-glow' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white transition-colors group relative"
              title="Search (Cmd/Ctrl + K)"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute -bottom-6 right-0 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
                ⌘K
              </span>
            </button>

            <a 
              href="https://github.com/replit/space-explorer" 
              target="_blank" 
              rel="noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5 md:w-6 md:h-6" />
            </a>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`fixed inset-y-0 right-0 w-64 glass shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col pt-24 px-6 gap-6 z-40 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg font-medium transition-colors hover:text-cyan-400 hover:neon-glow ${
                location === link.href ? 'text-cyan-400 neon-glow' : 'text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Global Search Overlay */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
