
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';
import { Experience } from '../utils/types';

interface ExperienceCardProps {
  experience: Experience;
  featured?: boolean;
}

const ExperienceCard = ({ experience, featured = false }: ExperienceCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link 
      to={`/experience/${experience.id}`}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 flex flex-col h-full ${
        featured 
          ? 'bg-white shadow-card hover:shadow-lg' 
          : 'bg-white/60 backdrop-blur-md border border-gray-100 hover:shadow-soft'
      }`}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <div className={`absolute inset-0 bg-gray-200 ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}></div>
        <img
          src={experience.images[0]}
          alt={experience.title}
          className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Category Tag */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800">
          {experience.category}
        </div>
        
        {/* Price Tag */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium">
          {experience.price} {experience.currency}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col p-5 flex-grow">
        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
          <MapPin size={14} />
          <span>{experience.location}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-primary transition-colors">
          {experience.title}
        </h3>
        
        <div className="flex items-center justify-between mt-1 mb-3">
          <div className="flex items-center space-x-1">
            <Clock size={14} className="text-gray-500" />
            <span className="text-sm text-gray-500">{experience.duration}</span>
          </div>
          
          {experience.rating && (
            <div className="flex items-center">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="ml-1 text-sm font-medium">{experience.rating}</span>
              <span className="text-sm text-gray-500 ml-1">({experience.reviewCount})</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {experience.description}
        </p>
        
        {/* Host */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src={experience.host.image} 
              alt={experience.host.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{experience.host.name}</span>
          </div>
          
          <span className="text-sm font-medium text-primary">View Details</span>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceCard;
