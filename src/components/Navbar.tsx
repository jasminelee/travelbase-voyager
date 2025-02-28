
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Wallet } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-soft py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center container-padding">
        <Link 
          to="/" 
          className="font-medium text-xl flex items-center space-x-2"
        >
          <span className="bg-primary text-white p-1 rounded-md">DTEP</span>
          <span className={isScrolled ? 'text-gray-800' : 'text-white'}>Voyager</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/experiences" 
            className={`transition-colors hover:text-primary ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            Experiences
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors hover:text-primary ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            About
          </Link>
          <Link 
            to="/host" 
            className={`transition-colors hover:text-primary ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            Become a Host
          </Link>
          <button 
            className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Wallet size={18} className={isScrolled ? 'text-primary' : 'text-white'} />
            <span className={isScrolled ? 'text-gray-800' : 'text-white'}>Connect Wallet</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X size={24} className={isScrolled ? 'text-gray-800' : 'text-white'} />
          ) : (
            <Menu size={24} className={isScrolled ? 'text-gray-800' : 'text-white'} />
          )}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-md py-4 md:hidden animate-slide-down">
            <div className="container mx-auto container-padding flex flex-col space-y-4">
              <Link 
                to="/experiences" 
                className="text-gray-800 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                to="/about" 
                className="text-gray-800 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/host" 
                className="text-gray-800 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Become a Host
              </Link>
              <button className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary">
                <Wallet size={18} />
                <span>Connect Wallet</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
