
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ExperienceCard from '../components/ExperienceCard';
import { categories, fetchExperiences, fetchExperiencesByCategory } from '../utils/data';
import { Experience } from '../utils/types';
import { Search, Filter, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const Experiences = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loaded, setLoaded] = useState(false);
  
  // Fetch experiences from Supabase using React Query
  const { data: experiences, isLoading } = useQuery({
    queryKey: ['experiences', selectedCategory],
    queryFn: () => selectedCategory === 'all' 
      ? fetchExperiences() 
      : fetchExperiencesByCategory(selectedCategory)
  });
  
  // Apply search filter
  const filteredExperiences = experiences?.filter(exp => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return exp.title.toLowerCase().includes(term) || 
      exp.location.toLowerCase().includes(term) ||
      exp.description.toLowerCase().includes(term);
  }) || [];
  
  useEffect(() => {
    setLoaded(true);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary to-secondary py-16 md:py-20">
          <div className="container mx-auto container-padding">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Discover Extraordinary Experiences
              </h1>
              <p className={`text-lg text-white/90 mb-8 transition-all duration-500 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Explore unique activities hosted by locals around the world and pay with crypto
              </p>
              
              {/* Search Bar */}
              <div className={`relative max-w-2xl mx-auto transition-all duration-500 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full bg-white text-gray-900 rounded-full border-0 py-3 pl-12 pr-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search experiences, locations, or activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Filters and Results */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto container-padding">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Filter Results */}
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600">
                {isLoading ? 'Loading...' : `${filteredExperiences.length} experience${filteredExperiences.length !== 1 ? 's' : ''} found`}
              </p>
              
              <button className="flex items-center text-gray-700 hover:text-primary bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors">
                <Filter size={16} className="mr-2" />
                <span>Filters</span>
              </button>
            </div>
            
            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="animate-pulse bg-white rounded-2xl h-[400px]"></div>
                ))}
              </div>
            ) : filteredExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExperiences.map((experience) => (
                  <div key={experience.id} className="animate-on-scroll">
                    <ExperienceCard experience={experience} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No experiences found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any experiences matching your search criteria.</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Experiences;
