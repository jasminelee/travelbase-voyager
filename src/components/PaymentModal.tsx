
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
import { sendUSDCToHost, updatePaymentStatus } from '../utils/coinbase';

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
  hostWalletAddress = '0x6b1B8c4B284b59967A59b7688085315F80Abd098', // Default to the specified wallet address
}: PaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [userWalletAddress, setUserWalletAddress] = useState<string | null>(null);

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
        console.error(`Invalid experience ID format: ${experienceId}`);
        
        // Try to verify if the experience exists in the database
        const { data: experienceData, error: experienceError } = await supabase
          .from('experiences')
          .select('id')
          .eq('id', experienceId)
          .single();
        
        if (experienceError || !experienceData) {
          throw new Error(`Experience with ID ${experienceId} not found in the database`);
        }
      }

      console.log("Creating booking with experience ID:", experienceId);

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
        
        // Create initial payment record with the hostWalletAddress
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            booking_id: newBookingId,
            amount: bookingDetails.totalPrice,
            currency: 'USDC', // Always USDC now
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

  const handleDirectPaymentSuccess = async (transactionHash: string) => {
    try {
      if (!bookingId) return;

      // Update payment entry in the database
      const { error: paymentError } = await updatePaymentStatus(
        bookingId,
        'completed',
        transactionHash,
        userWalletAddress || undefined
      );

      if (paymentError) throw paymentError;

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

  const handleDirectP2PPayment = async () => {
    if (!bookingId) return;
    
    try {
      setIsProcessingPayment(true);
      
      // Mock wallet connection - in a real app, use wagmi/viem hooks or OnchainKit
      const tempWalletAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setUserWalletAddress(tempWalletAddress);
      
      // Send USDC from user to host
      const { data, error } = await sendUSDCToHost(
        tempWalletAddress,
        hostWalletAddress,
        bookingDetails.totalPrice
      );
      
      if (error) throw error;
      
      if (data?.transactionHash) {
        await handleDirectPaymentSuccess(data.transactionHash);
      }
    } catch (error) {
      console.error("Failed to complete P2P payment:", error);
      handlePaymentError("Failed to complete the USDC transfer. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
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

          {bookingCreated && (
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
              disabled={isCreatingBooking}
              className="w-full"
            >
              {isCreatingBooking ? 'Creating booking...' : 'Continue to Payment'}
            </Button>
          ) : (
            <div className="w-full space-y-4">
              <div className="space-y-4">
                {/* Option 1: Direct P2P USDC payment (for users with a wallet) */}
                <Button
                  onClick={handleDirectP2PPayment}
                  disabled={isProcessingPayment}
                  className="w-full"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isProcessingPayment ? 'Processing...' : 'Pay with Connected Wallet'}
                </Button>
                
                {/* Option 2: For users without a wallet - fund with Coinbase */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                
                <CoinbaseFundCard
                  amount={bookingDetails.totalPrice}
                  currency="USDC"
                  hostWalletAddress={hostWalletAddress}
                  onSuccess={handleDirectPaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                Your payment will be sent directly to the host.
              </p>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
