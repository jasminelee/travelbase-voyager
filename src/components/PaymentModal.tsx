
import { useState, useEffect } from 'react';
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
import { Calendar, Clock, Users, Loader2, CreditCard } from 'lucide-react';
import { BookingDetails } from '../utils/types';
import { 
  updatePaymentStatus,
  launchCoinbaseOnramp
} from '../utils/coinbase';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceId: string;
  experienceTitle: string;
  experiencePrice: number;
  experienceCurrency: string;
  bookingDetails: BookingDetails;
  hostWalletAddress?: string;
}

export default function PaymentModal({
  open,
  onOpenChange,
  experienceId,
  experienceTitle,
  experiencePrice,
  experienceCurrency,
  bookingDetails,
  hostWalletAddress,
}: PaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Debug log for host wallet address
  useEffect(() => {
    if (open) {
      console.log("PaymentModal opened with host wallet address:", hostWalletAddress);
    }
  }, [open, hostWalletAddress]);

  // Check if host wallet address is available
  const isHostWalletAvailable = !!hostWalletAddress;

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

    if (!isHostWalletAvailable) {
      toast({
        title: "Host wallet required",
        description: "The host hasn't set up a wallet address for payments.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingBooking(true);

      console.log("Creating booking with experience ID:", experienceId);
      console.log("User ID:", user.id);
      console.log("Booking details:", bookingDetails);
      console.log("Host wallet address:", hostWalletAddress);

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

      if (bookingError) {
        console.error("Booking error details:", bookingError);
        throw bookingError;
      }

      if (bookingData && bookingData.length > 0) {
        const newBookingId = bookingData[0].id;
        setBookingId(newBookingId);
        
        console.log("Created booking with ID:", newBookingId);
        
        // Create initial payment record with the host wallet address
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            booking_id: newBookingId,
            amount: bookingDetails.totalPrice,
            currency: 'USDC',
            status: 'pending',
            hostWalletAddress: hostWalletAddress,
          });
        
        if (paymentError) {
          console.error("Payment creation error:", paymentError);
          throw paymentError;
        }

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

  const handleStartPayment = async () => {
    if (!hostWalletAddress || !bookingId) return;
    
    try {
      setIsProcessingPayment(true);
      
      // Call our updated Coinbase Onramp integration
      const { success, error } = await launchCoinbaseOnramp(
        bookingDetails.totalPrice,
        hostWalletAddress,
        experienceTitle
      );
      
      if (!success) {
        throw error || new Error("Payment initiation failed");
      }
      
      toast({
        title: "Payment initiated",
        description: "Please complete your payment through the Coinbase Onramp widget.",
      });
      
      // Update payment status to pending
      await updatePaymentStatus(bookingId, 'pending');
      
      // Note: In a production environment, you'd implement a webhook to receive confirmations
      // For the demo, we'll keep the manual confirmation button
      
    } catch (error) {
      console.error("Error processing payment:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      toast({
        title: "Payment error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Update payment status to failed
      if (bookingId) {
        await updatePaymentStatus(bookingId, 'failed');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // This function would typically be called by a webhook in production
  // For demo purposes, you can add a manual "confirm payment" button
  const handleManualPaymentConfirmation = async () => {
    if (!bookingId) return;
    
    try {
      // Update payment status to completed
      await updatePaymentStatus(bookingId, 'completed');
      
      // Update booking status to confirmed
      const { error: bookingUpdateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (bookingUpdateError) throw bookingUpdateError;

      toast({
        title: "Booking confirmed",
        description: "Your USDC payment was successful and booking confirmed.",
      });

      // Close modal and redirect to bookings page with the new booking ID
      onOpenChange(false);
      navigate(`/bookings?newBooking=${bookingId}`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Payment confirmation error",
        description: "We couldn't update your booking status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bookingCreated ? 'Complete Payment' : 'Confirm Booking'}</DialogTitle>
          <DialogDescription>
            {bookingCreated 
              ? 'Complete your USDC payment to confirm your booking' 
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
              <span className="font-medium">{bookingDetails.totalPrice} USDC</span>
            </div>
          </div>

          {!isHostWalletAvailable && (
            <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
              <p>This experience cannot be booked because the host hasn't set up a wallet address for payments.</p>
            </div>
          )}

          {bookingCreated && hostWalletAddress && (
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
              <p>Payment will be sent directly to the host's wallet:</p>
              <p className="font-mono text-xs mt-1 truncate">{hostWalletAddress}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {!bookingCreated ? (
            <Button 
              onClick={handleCreateBooking} 
              disabled={isCreatingBooking || !isHostWalletAvailable}
              className="w-full"
            >
              {isCreatingBooking ? 'Creating booking...' : 'Continue to Payment'}
            </Button>
          ) : (
            isProcessingPayment ? (
              <div className="flex flex-col items-center py-4 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-center">Processing your payment...</p>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <Button 
                  onClick={handleStartPayment}
                  className="w-full"
                  disabled={!hostWalletAddress}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Coinbase
                </Button>
                
                {/* For demo purposes only - in production this would be triggered by a webhook */}
                <Button 
                  onClick={handleManualPaymentConfirmation}
                  variant="outline"
                  className="w-full text-xs"
                  disabled={!bookingId}
                >
                  Demo: Manually confirm payment
                </Button>
              </div>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
