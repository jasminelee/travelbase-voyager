
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ExperienceCard from './ExperienceCard';
import { getFeaturedExperiences } from '../utils/data';

const FeaturedExperiences = () => {
  const [experiences] = useState(getFeaturedExperiences());
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`py-20 bg-gradient-to-b from-gray-50 to-white transition-opacity duration-1000 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto container-padding">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-sm text-primary font-medium mb-2 block">Featured Experiences</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Extraordinary Adventures</h2>
          </div>
          
          <Link 
            to="/experiences" 
            className="inline-flex items-center mt-4 md:mt-0 text-primary hover:text-primary/80 font-medium group"
          >
            View All Experiences
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((experience, index) => (
            <div 
              key={experience.id}
              className={`transition-all duration-700 delay-${index * 100} ${
                visible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <ExperienceCard experience={experience} featured />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedExperiences;
