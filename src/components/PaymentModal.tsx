
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Calendar, Clock, Users, Wallet } from 'lucide-react';
import { BookingDetails } from '../utils/types';
import CoinbaseFundCard from './CoinbaseFundCard';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceId: string;
  experienceTitle: string;
  experiencePrice: number;
  experienceCurrency: string;
  bookingDetails: BookingDetails;
}

export default function PaymentModal({
  open,
  onOpenChange,
  experienceId,
  experienceTitle,
  experiencePrice,
  experienceCurrency,
  bookingDetails,
}: PaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleCreateBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book an experience",
        variant: "destructive",
      });
      onOpenChange(false);
      navigate('/auth');
      return;
    }

    try {
      setIsCreatingBooking(true);

      // Ensure experienceId is a valid UUID
      if (!isValidUUID(experienceId)) {
        throw new Error(`Invalid experience ID format: ${experienceId}`);
      }

      // Create booking in the database
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          experience_id: experienceId,
          user_id: user.id,
          start_date: bookingDetails.startDate.toISOString(),
          guests: bookingDetails.guests,
          total_price: bookingDetails.totalPrice,
          status: 'pending',
        })
        .select();

      if (bookingError) throw bookingError;

      if (bookingData && bookingData.length > 0) {
        setBookingId(bookingData[0].id);
        setBookingCreated(true);
        toast({
          title: "Booking created",
          description: "Your booking has been created. Complete payment to confirm.",
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking failed",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = async (transactionHash: string) => {
    try {
      if (!bookingId) return;

      // Create payment entry in the database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: bookingDetails.totalPrice,
          currency: experienceCurrency,
          status: 'completed',
          transaction_hash: transactionHash,
        });

      if (paymentError) throw paymentError;

      // Update booking status to confirmed
      const { error: bookingUpdateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (bookingUpdateError) throw bookingUpdateError;

      toast({
        title: "Booking confirmed",
        description: "Your payment was successful and booking confirmed.",
      });

      // Close modal and redirect to bookings page
      onOpenChange(false);
      navigate('/bookings');
    } catch (error) {
      console.error('Error processing successful payment:', error);
      toast({
        title: "Payment processing error",
        description: "Your payment was received but we couldn't update your booking status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    toast({
      title: "Payment failed",
      description: errorMessage || "There was a problem processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  // Helper function to validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bookingCreated ? 'Complete Payment' : 'Confirm Booking'}</DialogTitle>
          <DialogDescription>
            {bookingCreated 
              ? 'Complete your payment to confirm your booking' 
              : 'Review your booking details before payment'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">{experienceTitle}</h3>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(bookingDetails.startDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>{format(bookingDetails.startDate, 'h:mm a')}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>{bookingDetails.guests} {bookingDetails.guests === 1 ? 'Guest' : 'Guests'}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{bookingDetails.totalPrice} {experienceCurrency}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          {!bookingCreated ? (
            <Button 
              onClick={handleCreateBooking} 
              disabled={isCreatingBooking}
              className="w-full"
            >
              {isCreatingBooking ? 'Creating booking...' : 'Continue to Payment'}
            </Button>
          ) : (
            <CoinbaseFundCard
              amount={bookingDetails.totalPrice}
              currency={experienceCurrency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
