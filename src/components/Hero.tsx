
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&h=1200&q=80" 
          alt="Travel Experience"
          className={`w-full h-full object-cover object-center transition-all duration-700 ${loaded ? 'opacity-100 filter-none' : 'opacity-0 filter blur-xl'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 z-10"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-20 container mx-auto h-full flex flex-col justify-center container-padding">
        <div className="max-w-2xl">
          <span className={`inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm mb-4 transition-all duration-500 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Decentralized Travel Experiences
          </span>
          
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 transition-all duration-500 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Explore Extraordinary <span className="text-primary/90">Experiences</span> With Crypto
          </h1>
          
          <p className={`text-lg text-white/90 mb-8 max-w-lg transition-all duration-500 delay-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Discover and book unique travel experiences worldwide, pay seamlessly with cryptocurrency, and connect directly with local hosts.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-500 delay-900 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link 
              to="/experiences" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium inline-flex items-center justify-center group transition-all"
            >
              Browse Experiences
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            
            <Link 
              to="/host" 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-full font-medium inline-flex items-center justify-center transition-all"
            >
              Become a Host
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000 delay-1500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-white/80 text-sm mb-2">Scroll to explore</span>
        <div className="w-0.5 h-10 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full bg-white animate-[scroll_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
