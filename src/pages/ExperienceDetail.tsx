
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Calendar, Clock, MapPin, Star, Users, ChevronLeft, ChevronRight, Share2, Heart, Award } from 'lucide-react';
import { getExperienceById, fetchExperienceById } from '../utils/data';
import { BookingDetails, Experience } from '../utils/types';
import PaymentModal from '../components/PaymentModal';
import { useToast } from '../hooks/use-toast';

const ExperienceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [guests, setGuests] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
      window.scrollTo(0, 0);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadExperience() {
      if (!id) return;
      
      try {
        setLoading(true);
        const foundExperience = await fetchExperienceById(id);
        
        if (!foundExperience) {
          toast({
            title: "Experience not found",
            description: "The experience you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          });
          navigate('/experiences');
          return;
        }
        
        setExperience(foundExperience);
      } catch (error) {
        console.error("Error loading experience:", error);
        toast({
          title: "Error loading experience",
          description: "There was a problem loading the experience details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadExperience();
  }, [id, navigate, toast]);

  const handleNextImage = () => {
    if (experience) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % experience.images.length);
    }
  };

  const handlePrevImage = () => {
    if (experience) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? experience.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleIncrementGuests = () => {
    if (guests < 10) {
      setGuests(prev => prev + 1);
    }
  };

  const handleDecrementGuests = () => {
    if (guests > 1) {
      setGuests(prev => prev - 1);
    }
  };

  const handleBookNow = () => {
    const bookingDetails: BookingDetails = {
      experienceId: experience?.id || '',
      startDate,
      guests,
      totalPrice: experience ? experience.price * guests : 0,
    };
    
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold mb-4">Experience not found</h1>
          <p className="text-gray-600 mb-6">The experience you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/experiences')}>Browse Experiences</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Image Gallery */}
        <div className="relative h-[50vh] md:h-[60vh] bg-gray-100">
          <img 
            src={experience.images[currentImageIndex]} 
            alt={experience.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button 
              onClick={handlePrevImage}
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <button 
              onClick={handleNextImage}
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          </div>
          
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5 text-gray-900" />
            </button>
            <button 
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
              aria-label="Save"
            >
              <Heart className="h-5 w-5 text-gray-900" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 font-medium text-sm">
              {currentImageIndex + 1} / {experience.images.length}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{experience.location}</span>
                  {experience.rating && (
                    <>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span>{experience.rating}</span>
                        <span className="ml-1">({experience.reviewCount} reviews)</span>
                      </div>
                    </>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{experience.title}</h1>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{experience.duration}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <span>{experience.category}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 py-6">
                <h2 className="text-xl font-semibold mb-4">About this experience</h2>
                <p className="text-gray-700 whitespace-pre-line mb-6">{experience.description}</p>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Hosted by {experience.host.name}</h3>
                      <p className="text-gray-600 mb-3">Professional host with {experience.host.rating} rating</p>
                      <div className="flex items-center">
                        <img 
                          src={experience.host.image} 
                          alt={experience.host.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-4">What's included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {experience.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 py-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="bg-gray-200 h-64 rounded-lg overflow-hidden mb-2">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBQC6QM-nGQZNJMXSJ_8gWAEWJ_Np8RiC4&q=${encodeURIComponent(experience.location)}`}
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600 text-sm">{experience.location}</p>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-2xl font-bold">{experience.price} {experience.currency}</div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="date"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          value={format(startDate, 'yyyy-MM-dd')}
                          onChange={(e) => setStartDate(new Date(e.target.value))}
                          min={format(new Date(), 'yyyy-MM-dd')}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                      <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
                        <button
                          type="button"
                          className="px-3 py-2 text-gray-400 hover:text-gray-500"
                          onClick={handleDecrementGuests}
                          disabled={guests <= 1}
                        >
                          <span className="sr-only">Decrease</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="flex-1 px-4 py-2 text-center">
                          <div className="flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 text-gray-400 hover:text-gray-500"
                          onClick={handleIncrementGuests}
                          disabled={guests >= 10}
                        >
                          <span className="sr-only">Increase</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <div>{experience.price} × {guests} {guests === 1 ? 'guest' : 'guests'}</div>
                      <div>{experience.price * guests} {experience.currency}</div>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <div>Total</div>
                      <div>{experience.price * guests} {experience.currency}</div>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={handleBookNow}>
                    Book now
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    You won't be charged yet. Payment will be collected when you complete your booking.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {showPaymentModal && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          experienceId={experience.id}
          experienceTitle={experience.title}
          experiencePrice={experience.price}
          experienceCurrency={experience.currency}
          bookingDetails={{
            experienceId: experience.id,
            startDate,
            guests,
            totalPrice: experience.price * guests,
          }}
        />
      )}
    </div>
  );
};

export default ExperienceDetail;
