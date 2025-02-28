
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { 
  Calendar, 
  ChevronRight, 
  Clock, 
  CreditCard, 
  MapPin, 
  Users, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  PartyPopper
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

type Experience = {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  images: string[];
};

type Payment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  transaction_hash: string | null;
  wallet_address: string | null;
};

type Booking = {
  id: string;
  experience_id: string;
  start_date: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  user_id: string;
  updated_at: string;
  experience: Experience;
  payment: Payment | null;
};

const Bookings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Get the new booking ID from URL params if it exists
  const searchParams = new URLSearchParams(location.search);
  const newBookingId = searchParams.get('newBooking');
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);
  
  useEffect(() => {
    // Show toast message if a new booking was just made
    if (newBookingId) {
      toast({
        title: "Booking Successful!",
        description: "Your new experience has been booked. Enjoy your adventure!",
        variant: "default",
      });
      
      // Set active tab to upcoming to show the new booking
      setActiveTab('upcoming');
      
      // Remove the newBooking parameter from URL after showing notification
      // This prevents the notification from showing again on page refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [newBookingId, toast]);
  
  const fetchBookings = async () => {
    try {
      setFetchingBookings(true);
      
      // First, get all the bookings with their experience data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          experience:experience_id (
            id, title, location, price, currency, images
          )
        `)
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true });
        
      if (bookingsError) throw bookingsError;
      
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      // Now fetch the payment data for each booking
      const bookingsWithPayments = await Promise.all(
        bookingsData.map(async (booking) => {
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('booking_id', booking.id)
            .maybeSingle();
            
          if (paymentError) {
            console.error('Error fetching payment:', paymentError);
            return { ...booking, payment: null };
          }
          
          return { ...booking, payment: paymentData || null };
        })
      );
      
      setBookings(bookingsWithPayments as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Failed to load bookings",
        description: "There was a problem loading your bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFetchingBookings(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPaymentStatusIcon = (status: string | undefined) => {
    switch(status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const upcomingBookings = bookings.filter(
    booking => new Date(booking.start_date) >= new Date() && booking.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(
    booking => new Date(booking.start_date) < new Date() || booking.status === 'cancelled'
  );
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20 mt-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">View and manage your experience bookings</p>
          </div>
          
          {newBookingId && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <PartyPopper className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-800">Booking Successful!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your experience has been successfully booked. You can view the details below.
              </AlertDescription>
            </Alert>
          )}
          
          {fetchingBookings ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {bookings.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <div className="mx-auto flex flex-col items-center justify-center space-y-4">
                      <Calendar className="h-12 w-12 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900">No Bookings Yet</h3>
                      <p className="text-gray-500 max-w-sm">
                        You haven't booked any experiences yet. Start exploring and book your first adventure!
                      </p>
                      <Button asChild className="mt-4">
                        <Link to="/experiences">Browse Experiences</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="upcoming" className="text-base">
                      Upcoming ({upcomingBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="past" className="text-base">
                      Past ({pastBookings.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming">
                    {upcomingBookings.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <div className="mx-auto flex flex-col items-center justify-center space-y-2">
                            <Calendar className="h-10 w-10 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900">No Upcoming Bookings</h3>
                            <p className="text-gray-500">
                              You don't have any upcoming bookings.
                            </p>
                            <Button asChild variant="outline" className="mt-2">
                              <Link to="/experiences">Browse Experiences</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingBookings.map((booking) => (
                          <BookingCard 
                            key={booking.id} 
                            booking={booking} 
                            refreshBookings={fetchBookings}
                            getStatusBadge={getStatusBadge}
                            getPaymentStatusIcon={getPaymentStatusIcon}
                            isHighlighted={booking.id === newBookingId}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past">
                    {pastBookings.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <div className="mx-auto flex flex-col items-center justify-center space-y-2">
                            <Calendar className="h-10 w-10 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900">No Past Bookings</h3>
                            <p className="text-gray-500">
                              You don't have any past bookings.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pastBookings.map((booking) => (
                          <BookingCard 
                            key={booking.id} 
                            booking={booking} 
                            refreshBookings={fetchBookings}
                            getStatusBadge={getStatusBadge}
                            getPaymentStatusIcon={getPaymentStatusIcon}
                            isHighlighted={booking.id === newBookingId}
                            isPast
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

type BookingCardProps = { 
  booking: Booking; 
  refreshBookings: () => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
  getPaymentStatusIcon: (status: string | undefined) => React.ReactNode;
  isHighlighted?: boolean;
  isPast?: boolean;
};

const BookingCard = ({ 
  booking, 
  refreshBookings,
  getStatusBadge,
  getPaymentStatusIcon,
  isHighlighted = false,
  isPast = false 
}: BookingCardProps) => {
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  
  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      setCancelling(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);
        
      if (error) throw error;
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled",
      });
      
      refreshBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation failed",
        description: "There was a problem cancelling your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };
  
  return (
    <Card className={`transition-all duration-300 ${isHighlighted ? 'ring-2 ring-primary shadow-lg transform scale-[1.02]' : ''}`}>
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={booking.experience.images[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800'}
          alt={booking.experience.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          {getStatusBadge(booking.status)}
        </div>
        {isHighlighted && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-white border-primary">New Booking</Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{booking.experience.title}</CardTitle>
        <CardDescription className="flex items-center text-gray-500">
          <MapPin className="h-4 w-4 mr-1" /> {booking.experience.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">
              {format(new Date(booking.start_date), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">
              {format(new Date(booking.start_date), 'h:mm a')}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div className="font-medium">
            {booking.total_price} {booking.experience.currency}
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center">
            <div className="mr-2">
              {getPaymentStatusIcon(booking.payment?.status)}
            </div>
            <div>
              <div className="text-sm font-medium">
                Payment {booking.payment?.status || 'Not processed'}
              </div>
              {booking.payment?.transaction_hash && (
                <div className="text-xs text-gray-500 truncate max-w-[180px]">
                  Tx: {booking.payment.transaction_hash.substring(0, 12)}...
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 pt-4">
        {!isPast && booking.status !== 'cancelled' && (
          <div className="flex space-x-3 w-full">
            <Button 
              variant="destructive" 
              className="w-1/2"
              onClick={handleCancelBooking}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </Button>
            <Button 
              asChild
              className="w-1/2"
            >
              <Link to={`/experiences/${booking.experience_id}`}>
                View Experience
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
        
        {(isPast || booking.status === 'cancelled') && (
          <Button 
            asChild
            className="w-full"
          >
            <Link to={`/experiences/${booking.experience_id}`}>
              View Experience
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Bookings;
