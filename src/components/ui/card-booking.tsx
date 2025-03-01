
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { 
  Calendar, 
  ChevronRight, 
  Clock, 
  Users, 
  MapPin,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
import { Button } from './button';
import { Badge } from './badge';

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
  
  // Debug log for payment details
  useEffect(() => {
    if (booking.payment) {
      console.log("Booking payment details:", {
        paymentId: booking.payment.id,
        paymentStatus: booking.payment.status,
        hostWalletAddress: booking.payment.hostWalletAddress
      });
    }
  }, [booking]);
  
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
              {booking.payment?.status === 'pending' && !booking.payment?.transaction_hash && (
                <div className="text-xs text-amber-600">
                  Waiting for manual USDC transfer
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

export default BookingCard;
