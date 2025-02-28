
import { useState } from 'react';
import { Button } from "./ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { FundCard } from '@coinbase/onchainkit/fund';

interface CoinbaseFundCardProps {
  amount: number;
  currency: string;
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: string) => void;
}

const CoinbaseFundCard = ({ amount, currency, onSuccess, onError }: CoinbaseFundCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const { toast } = useToast();

  const handleInitiatePayment = () => {
    setLoading(true);
    setShowCard(true);
  };

  const handleSuccess = (data: any) => {
    console.log("Payment successful:", data);
    // Extract transaction hash if available
    const txHash = data?.transaction?.hash || 'transaction-completed';
    
    if (onSuccess) {
      onSuccess(txHash);
    }
    
    toast({
      title: "Payment successful",
      description: `Your payment has been completed.`,
      variant: "default",
    });
    
    setShowCard(false);
    setLoading(false);
  };

  const handleError = (error: any) => {
    console.error("Payment error:", error);
    
    if (onError) {
      onError(error.message || "An unknown error occurred");
    }
    
    toast({
      title: "Payment error",
      description: error.message || "An error occurred during the payment process.",
      variant: "destructive",
    });
    
    setLoading(false);
  };

  const handleExit = () => {
    setShowCard(false);
    setLoading(false);
    toast({
      title: "Payment cancelled",
      description: "You've cancelled the payment process.",
    });
  };

  return (
    <div className="w-full">
      {!showCard ? (
        <Button 
          onClick={handleInitiatePayment} 
          disabled={loading} 
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Pay with ETH
            </>
          )}
        </Button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <FundCard
            assetSymbol="ETH"
            amount={amount.toString()}
            headerText={`Pay ${amount} ETH for this experience`}
            buttonText={`Pay ${amount} ETH`}
            onSuccess={handleSuccess}
            onError={handleError}
            onStatus={(status) => {
              console.log("Payment status:", status);
              if (status && status.toString() === 'exit') {
                handleExit();
              }
            }}
          />
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={handleExit}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoinbaseFundCard;
