
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedExperiences from '../components/FeaturedExperiences';
import Footer from '../components/Footer';
import { ArrowRight, Globe, CreditCard, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  
  useEffect(() => {
    // Initialize animation observers for elements
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });
      
      elements.forEach(element => {
        observer.observe(element);
      });
      
      return () => {
        elements.forEach(element => {
          observer.unobserve(element);
        });
      };
    };
    
    // Hide scroll indicator after scrolling
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };
    
    const animationCleanup = animateOnScroll();
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      animationCleanup;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* Featured Experiences */}
        <FeaturedExperiences />
        
        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto container-padding">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-sm text-primary font-medium mb-2 block animate-on-scroll">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 animate-on-scroll">
                Travel and Pay with Crypto, Simplified
              </h2>
              <p className="text-lg text-gray-600 animate-on-scroll">
                Our platform makes it easy to discover unique experiences and pay with cryptocurrency, connecting travelers directly with local hosts around the world.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl animate-on-scroll">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Globe className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Browse Experiences</h3>
                <p className="text-gray-600 mb-4">
                  Explore our curated collection of unique experiences offered by local hosts worldwide.
                </p>
                <div className="mt-auto">
                  <Link 
                    to="/experiences" 
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
                  >
                    Explore Now
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </Link>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl animate-on-scroll">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Pay with Crypto</h3>
                <p className="text-gray-600 mb-4">
                  Book your experience and pay securely with cryptocurrency via Coinbase or direct wallet transfer.
                </p>
                <div className="mt-auto">
                  <Link 
                    to="/about" 
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
                  >
                    Learn More
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </Link>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl animate-on-scroll">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Enjoy Securely</h3>
                <p className="text-gray-600 mb-4">
                  Experience your adventure with confidence, backed by our secure blockchain payment system.
                </p>
                <div className="mt-auto">
                  <Link 
                    to="/security" 
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
                  >
                    About Security
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary">
          <div className="container mx-auto container-padding">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:mr-12 max-w-xl animate-on-scroll">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm mb-4">
                  Join Our Community
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                  Ready to Host or Experience Travel in a New Way?
                </h2>
                <p className="text-white/90 text-lg mb-8">
                  Whether you want to share your local expertise or discover new destinations, our platform connects travelers and hosts through the power of crypto.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/experiences" 
                    className="bg-white text-primary px-8 py-3 rounded-full font-medium inline-flex items-center justify-center group hover:bg-white/90 transition-all"
                  >
                    Find Experiences
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </Link>
                  
                  <Link 
                    to="/host" 
                    className="bg-transparent hover:bg-white/10 text-white border border-white/30 px-8 py-3 rounded-full font-medium inline-flex items-center justify-center transition-all"
                  >
                    Become a Host
                  </Link>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 lg:w-2/5 animate-on-scroll">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 rounded-2xl transform rotate-3"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1466854076813-4aa9ac0fc347?auto=format&fit=crop&w=800&h=600" 
                    alt="Travel Experience" 
                    className="rounded-2xl relative z-10 shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
