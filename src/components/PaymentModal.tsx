
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
import { Calendar, Clock, Users, Wallet, Loader2, CreditCard } from 'lucide-react';
import { BookingDetails } from '../utils/types';
import { 
  createSmartWallet, 
  sendUSDCFromSmartWallet, 
  updatePaymentStatus,
  checkUsdcBalance 
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
  const [paymentStep, setPaymentStep] = useState<'initial' | 'smart-wallet' | 'funding' | 'buy-usdc' | 'confirm-payment'>('initial');
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [showCoinbaseOptions, setShowCoinbaseOptions] = useState(false);

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

  const handleCreateSmartWallet = async () => {
    if (!hostWalletAddress || !bookingId) return;
    
    try {
      setIsProcessingPayment(true);
      
      // Create a smart wallet for the user
      const { data: walletData, error: walletError } = await createSmartWallet();
      
      if (walletError || !walletData) {
        throw new Error(walletError?.toString() || "Failed to create smart wallet");
      }
      
      setSmartWalletAddress(walletData.address);
      console.log("Created smart wallet with address:", walletData.address);
      
      toast({
        title: "Smart wallet created",
        description: "Now checking your wallet balance",
      });
      
      // Check if the wallet has enough USDC already
      await checkWalletBalance(walletData.address);

    } catch (error) {
      console.error("Error creating smart wallet:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      toast({
        title: "Error creating wallet",
        description: errorMessage,
        variant: "destructive",
      });
      setPaymentStep('initial');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const checkWalletBalance = async (walletAddress: string) => {
    try {
      setIsCheckingBalance(true);
      
      // Check the wallet's USDC balance
      const { data: balanceData, error: balanceError } = await checkUsdcBalance(walletAddress);
      
      if (balanceError || !balanceData) {
        throw new Error(balanceError?.toString() || "Failed to check USDC balance");
      }
      
      setUsdcBalance(balanceData.balance);
      console.log("Wallet USDC balance:", balanceData.balance);
      
      // Determine next step based on balance
      if (balanceData.balance >= bookingDetails.totalPrice) {
        // If wallet has enough USDC, go to confirm payment step
        setPaymentStep('confirm-payment');
        toast({
          title: "Wallet funded",
          description: `Your wallet has ${balanceData.balance} USDC. Ready to complete payment.`,
        });
      } else {
        // If wallet needs more USDC, go to buy USDC step
        setPaymentStep('buy-usdc');
        toast({
          title: "USDC needed",
          description: `Your wallet needs more USDC to complete this payment.`,
        });
      }
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      toast({
        title: "Balance check failed",
        description: "Could not verify your USDC balance. Please try again.",
        variant: "destructive",
      });
      // Default to buy USDC step if balance check fails
      setPaymentStep('buy-usdc');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleBuyUsdc = () => {
    // Move to the funding step to buy USDC
    setPaymentStep('funding');
  };

  const simulateBuyUsdc = async () => {
    if (!smartWalletAddress) return;
    
    try {
      setIsProcessingPayment(true);
      
      // Simulate a delay for USDC purchase
      toast({
        title: "Processing purchase",
        description: "Purchasing USDC for your wallet..."
      });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Update wallet balance after purchase
      setUsdcBalance(prev => prev + 5); // Add 5 USDC to balance
      
      toast({
        title: "USDC purchased",
        description: "Successfully added 5 USDC to your wallet."
      });
      
      // If we now have enough USDC, move to confirm payment step
      if (usdcBalance + 5 >= bookingDetails.totalPrice) {
        setPaymentStep('confirm-payment');
      }
    } catch (error) {
      console.error("Error buying USDC:", error);
      toast({
        title: "Purchase failed",
        description: "There was a problem buying USDC. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
      setShowCoinbaseOptions(false);
    }
  };

  const handleFundSuccess = async (data: any) => {
    console.log("Fund success data:", data);
    
    if (!smartWalletAddress) {
      console.error("No smart wallet address found");
      return;
    }
    
    try {
      // After successful funding, check balance again
      await checkWalletBalance(smartWalletAddress);
    } catch (error) {
      console.error("Error after funding:", error);
      toast({
        title: "Funding verification failed",
        description: "Your wallet may have been funded, but we couldn't verify the new balance.",
        variant: "destructive",
      });
      
      // Move to confirm payment step anyway, user can try to complete payment
      setPaymentStep('confirm-payment');
    }
  };

  const handleCompletePayment = async () => {
    if (!smartWalletAddress || !hostWalletAddress || !bookingId) return;
    
    try {
      setIsProcessingPayment(true);
      
      console.log("Processing payment from smart wallet to host");
      
      // Send payment from smart wallet to host
      const { data: txData, error: txError } = await sendUSDCFromSmartWallet(
        smartWalletAddress,
        hostWalletAddress,
        bookingDetails.totalPrice
      );
      
      if (txError || !txData) {
        throw new Error(txError?.toString() || "Failed to send USDC payment");
      }
      
      console.log("Payment successful:", txData);
      
      // Extract transaction hash
      const transactionHash = txData.transactionHash;
      
      // Update payment status in database
      await handlePaymentSuccess(transactionHash, smartWalletAddress);
      
    } catch (error) {
      console.error("Error processing payment:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      toast({
        title: "Payment error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (transactionHash: string, walletAddress: string) => {
    try {
      if (!bookingId) return;

      console.log("Processing successful payment for booking:", bookingId);
      console.log("Transaction hash:", transactionHash);
      console.log("Wallet address:", walletAddress);

      // Update payment entry in the database
      const { error: paymentError } = await updatePaymentStatus(
        bookingId,
        'completed',
        transactionHash,
        walletAddress
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

      // Close modal and redirect to bookings page with the new booking ID
      onOpenChange(false);
      navigate(`/bookings?newBooking=${bookingId}`);
    } catch (error) {
      console.error('Error processing successful payment:', error);
      toast({
        title: "Payment processing error",
        description: "Your payment was received but we couldn't update your booking status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleConnectExistingWallet = () => {
    // In a real implementation, this would connect to an existing wallet
    // using wagmi/viem or another wallet connector
    toast({
      title: "Wallet connection",
      description: "This would connect to your existing wallet in a production environment",
    });
  };

  const renderPaymentStep = () => {
    if (!bookingCreated) return null;
    
    switch (paymentStep) {
      case 'initial':
        return (
          <div className="space-y-4 w-full">
            <Button
              onClick={handleCreateSmartWallet}
              disabled={isProcessingPayment || !hostWalletAddress}
              className="w-full"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Pay with Smart Wallet
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleConnectExistingWallet}
            >
              Connect Existing Wallet
            </Button>
          </div>
        );
        
      case 'buy-usdc':
        return (
          <div className="space-y-4 w-full">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium mb-1">Your smart wallet is ready</p>
              <p className="text-xs text-gray-600 mb-2">
                Your wallet needs USDC to complete this payment
              </p>
              {smartWalletAddress && (
                <p className="text-xs font-mono bg-white p-2 rounded truncate">
                  {smartWalletAddress}
                </p>
              )}
              
              <div className="mt-3 flex justify-between text-sm">
                <span>Current balance:</span>
                <span className="font-medium">{usdcBalance} USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Required amount:</span>
                <span className="font-medium">{bookingDetails.totalPrice} USDC</span>
              </div>
            </div>
            
            <Button 
              onClick={handleBuyUsdc}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Buy USDC
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPaymentStep('initial')}
            >
              Back
            </Button>
          </div>
        );
        
      case 'funding':
        return (
          <div className="space-y-4 w-full">
            {isProcessingPayment ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-center">Processing your payment...</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-1">Buy USDC to complete your payment</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Your wallet needs {bookingDetails.totalPrice} USDC to complete this payment
                  </p>
                  {smartWalletAddress && (
                    <p className="text-xs font-mono bg-white p-2 rounded truncate">
                      {smartWalletAddress}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xl font-bold">5</p>
                        <p className="text-sm text-gray-600">USD</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">5 USDC</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setShowCoinbaseOptions(!showCoinbaseOptions)}
                        variant="outline" 
                        className="flex justify-between items-center w-full"
                      >
                        <span className="flex items-center">
                          <img 
                            src="https://assets.coinbase.com/assets/favicon.ico" 
                            alt="Coinbase Logo" 
                            className="w-5 h-5 mr-2" 
                          />
                          Coinbase
                        </span>
                        <span className="text-sm text-gray-500">Select</span>
                      </Button>
                      
                      {showCoinbaseOptions && (
                        <div className="space-y-2 border-t pt-2 mt-2">
                          <Button 
                            onClick={simulateBuyUsdc}
                            variant="ghost" 
                            className="flex justify-between items-center w-full text-left pl-6"
                          >
                            <div>
                              <p className="font-medium text-sm">Buy USDC</p>
                              <p className="text-xs text-gray-500">ACH, debit, cash, crypto balance</p>
                            </div>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            className="flex justify-between items-center w-full text-left pl-6"
                          >
                            <div>
                              <p className="font-medium text-sm">Debit card</p>
                              <p className="text-xs text-gray-500">Up to $500/week. No sign up required.</p>
                            </div>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPaymentStep('buy-usdc')}
                >
                  Back
                </Button>
              </>
            )}
          </div>
        );
        
      case 'confirm-payment':
        return (
          <div className="space-y-4 w-full">
            {isProcessingPayment ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-center">Processing your payment...</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-1">Your smart wallet is ready</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Ready to send {bookingDetails.totalPrice} USDC to the host
                  </p>
                  {smartWalletAddress && (
                    <p className="text-xs font-mono bg-white p-2 rounded truncate">
                      {smartWalletAddress}
                    </p>
                  )}
                  
                  <div className="mt-3 flex justify-between text-sm">
                    <span>Available balance:</span>
                    <span className="font-medium">{usdcBalance} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment amount:</span>
                    <span className="font-medium">{bookingDetails.totalPrice} USDC</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                  <p>Payment will be sent directly to the host's wallet:</p>
                  <p className="font-mono text-xs mt-1 truncate">{hostWalletAddress}</p>
                </div>
                
                <Button 
                  onClick={handleCompletePayment}
                  className="w-full"
                >
                  Complete Payment
                </Button>
                
                {usdcBalance < bookingDetails.totalPrice && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPaymentStep('buy-usdc')}
                  >
                    Add More USDC
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPaymentStep('initial')}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        );
        
      default:
        return null;
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

          {bookingCreated && hostWalletAddress && paymentStep === 'initial' && (
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
            renderPaymentStep()
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
