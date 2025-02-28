
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
} from '../components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { 
  Calendar, 
  Loader2,
  PartyPopper
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import BookingCard from '../components/ui/card-booking';

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
  hostWalletAddress: string | null;
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
      
      // Sort the bookings by date (upcoming first)
      const sortedBookings = bookingsWithPayments.sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      
      setBookings(sortedBookings as Booking[]);
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
        return <span className="h-5 w-5 text-green-500">✓</span>;
      case 'pending':
        return <span className="h-5 w-5 text-yellow-500">⌛</span>;
      case 'failed':
        return <span className="h-5 w-5 text-red-500">✗</span>;
      default:
        return <span className="h-5 w-5 text-gray-400">?</span>;
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

export default Bookings;
