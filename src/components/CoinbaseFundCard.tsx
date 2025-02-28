
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
      description: "Your transaction has been completed successfully.",
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

  // Determine which cryptocurrency to use based on the currency provided
  // Map common fiat currencies to appropriate crypto
  const getAssetSymbol = () => {
    switch(currency.toUpperCase()) {
      case 'USD':
        return 'USDC';
      case 'EUR':
        return 'USDC';
      default:
        return currency; // Assume it's already a crypto symbol
    }
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
              Pay with Crypto
            </>
          )}
        </Button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <FundCard
            assetSymbol={getAssetSymbol()}
            country="US"
            currency={currency}
            headerText="Complete your payment"
            buttonText="Pay now"
            onSuccess={handleSuccess}
            onError={handleError}
            onExit={() => {
              setShowCard(false);
              setLoading(false);
              toast({
                title: "Payment cancelled",
                description: "You've cancelled the payment process.",
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CoinbaseFundCard;
