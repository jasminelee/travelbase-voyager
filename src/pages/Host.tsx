
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  Tag, 
  Image, 
  Plus, 
  Loader2, 
  Trash2, 
  Edit, 
  UserPlus 
} from 'lucide-react';

type Experience = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  duration: string;
  location: string;
  amenities: string[];
  images: string[];
  host_id: string;
};

const Host = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hosting, setHosting] = useState<'overview' | 'create' | 'manage'>('overview');
  const [hostExperiences, setHostExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [amenity, setAmenity] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHostExperiences();
    }
  }, [user]);

  const fetchHostExperiences = async () => {
    try {
      setLoadingExperiences(true);
      
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setHostExperiences(data || []);
    } catch (error) {
      console.error('Error fetching host experiences:', error);
    } finally {
      setLoadingExperiences(false);
    }
  };

  const addAmenity = () => {
    if (amenity.trim() && !amenities.includes(amenity.trim())) {
      setAmenities([...amenities, amenity.trim()]);
      setAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const addImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category || !price || !duration || !location || amenities.length === 0 || images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const newExperience = {
        title,
        description,
        category,
        price: parseFloat(price),
        currency,
        duration,
        location,
        amenities,
        images,
        host_id: user?.id,
      };
      
      const { data, error } = await supabase
        .from('experiences')
        .insert([newExperience])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Experience Created",
        description: "Your experience has been successfully created!",
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
      setCurrency('USDC');
      setDuration('');
      setLocation('');
      setAmenity('');
      setAmenities([]);
      setImageUrl('');
      setImages([]);
      
      // Refresh experiences list
      fetchHostExperiences();
      
      // Switch to manage tab
      setHosting('manage');
    } catch (error: any) {
      console.error('Error creating experience:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20 mt-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Become a Host</h1>
            <p className="text-gray-600 mt-2">Share your local expertise and earn crypto by hosting experiences</p>
          </div>
          
          <Tabs value={hosting} onValueChange={(value) => setHosting(value as 'overview' | 'create' | 'manage')}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview" className="text-base">
                Overview
              </TabsTrigger>
              <TabsTrigger value="create" className="text-base">
                Create Experience
              </TabsTrigger>
              <TabsTrigger value="manage" className="text-base">
                Manage Experiences
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-6 w-6 text-primary" />
                      Why Host on TravelBase Voyager?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 bg-primary/10 p-2 rounded-full">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Connect with Travelers</h3>
                        <p className="text-gray-600">
                          Share your expertise and passions with travelers from around the world.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 bg-primary/10 p-2 rounded-full">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Earn Cryptocurrency</h3>
                        <p className="text-gray-600">
                          Get paid in USDC and other cryptocurrencies directly to your wallet.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Flexible Scheduling</h3>
                        <p className="text-gray-600">
                          Host experiences on your own schedule and set your own availability.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => setHosting('create')}
                      className="w-full"
                    >
                      Start Hosting
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 rounded-2xl transform rotate-3"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?auto=format&fit=crop&w=800&h=600" 
                    alt="Hosting Experience" 
                    className="rounded-2xl relative z-10 shadow-xl object-cover h-full w-full"
                  />
                </div>
              </div>
              
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Hosting Works</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                        <div className="text-xl font-bold text-primary">1</div>
                      </div>
                      <CardTitle>Create Your Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600">
                        Design an engaging experience and provide all the details travelers need to know.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="text-center">
                      <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                        <div className="text-xl font-bold text-primary">2</div>
                      </div>
                      <CardTitle>Connect Your Wallet</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600">
                        Link your cryptocurrency wallet to receive payments directly from guests.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="text-center">
                      <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                        <div className="text-xl font-bold text-primary">3</div>
                      </div>
                      <CardTitle>Host & Get Paid</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600">
                        Welcome your guests, provide an amazing experience, and receive crypto payments.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create a New Experience</CardTitle>
                  <CardDescription>
                    Fill in the details about the experience you want to host
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Experience Title *</Label>
                        <Input
                          id="title"
                          placeholder="A catchy title for your experience"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what guests will do and experience"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-32"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Input
                            id="category"
                            placeholder="e.g. Adventure, Food, Culture"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              placeholder="City, Country"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Price *</Label>
                          <Input
                            id="price"
                            type="number"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <select
                            id="currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          >
                            <option value="USDC">USDC</option>
                            <option value="ETH">ETH</option>
                            <option value="BTC">BTC</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="duration">Duration *</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="duration"
                            placeholder="e.g. 2 hours, Half day"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Amenities *</Label>
                        <div className="flex space-x-2 mb-2">
                          <Input
                            placeholder="Add an amenity"
                            value={amenity}
                            onChange={(e) => setAmenity(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addAmenity();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={addAmenity}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {amenities.map((item, index) => (
                            <div 
                              key={index}
                              className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1"
                            >
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() => removeAmenity(index)}
                                className="ml-2 text-primary hover:text-primary/80"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          {amenities.length === 0 && (
                            <p className="text-sm text-muted-foreground">No amenities added yet</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Images *</Label>
                        <div className="flex space-x-2 mb-2">
                          <Input
                            placeholder="Image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addImage();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={addImage}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                          {images.map((url, index) => (
                            <div key={index} className="relative group rounded-md overflow-hidden h-24">
                              <img 
                                src={url} 
                                alt={`Experience ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="text-white hover:text-red-400"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {images.length === 0 && (
                            <div className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-md">
                              <div className="text-sm text-muted-foreground text-center">
                                <Image className="h-6 w-6 mx-auto text-gray-400" />
                                <span>No images added yet</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setHosting('overview');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Experience'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage">
              {loadingExperiences ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {hostExperiences.length === 0 ? (
                    <Card className="text-center py-16">
                      <CardContent>
                        <div className="mx-auto flex flex-col items-center justify-center space-y-4">
                          <Building className="h-12 w-12 text-gray-300" />
                          <h3 className="text-lg font-medium text-gray-900">No Experiences Yet</h3>
                          <p className="text-gray-500 max-w-sm">
                            You haven't created any experiences yet. Get started by creating your first experience!
                          </p>
                          <Button 
                            onClick={() => setHosting('create')}
                            className="mt-4"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Experience
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Your Experiences</h2>
                        <Button onClick={() => setHosting('create')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create New
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hostExperiences.map((exp) => (
                          <HostExperienceCard 
                            key={exp.id} 
                            experience={exp}
                            refreshExperiences={fetchHostExperiences}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

type HostExperienceCardProps = {
  experience: Experience;
  refreshExperiences: () => Promise<void>;
};

const HostExperienceCard = ({ experience, refreshExperiences }: HostExperienceCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experience.id);
        
      if (error) throw error;
      
      toast({
        title: "Experience Deleted",
        description: "Your experience has been successfully deleted.",
      });
      
      refreshExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40">
        <img
          src={experience.images[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800'}
          alt={experience.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate">{experience.title}</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" /> {experience.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm mb-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            <span>{experience.duration}</span>
          </div>
          <div className="font-medium">
            {experience.price} {experience.currency}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 truncate">
          {experience.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {experience.amenities.slice(0, 3).map((amenity, index) => (
            <span 
              key={index}
              className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5"
            >
              {amenity}
            </span>
          ))}
          {experience.amenities.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              +{experience.amenities.length - 3} more
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 pt-4">
        <div className="flex space-x-2 w-full">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/experience/${experience.id}`)}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Host;
