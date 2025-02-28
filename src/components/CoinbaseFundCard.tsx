
import { useState, useEffect } from 'react';
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
  
  // Client API key for Onchain Commerce
  // Note: This key is not directly passed to FundCard as a prop since it doesn't support clientKey
  const CLIENT_API_KEY = "Tnq36rR4efG5KGwn0XHApBG7TIMBxyrz";

  useEffect(() => {
    // Initialize any required scripts or dependencies
    // This is similar to how the template initializes its environment
    console.log("Coinbase Fund Card initialized with currency:", currency);
    
    // If the onchainkit library requires client key initialization, it should be done
    // at the application level or through their recommended initialization method
    // rather than as a prop on the FundCard component
  }, [currency]);

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
      description: `Your payment of ${amount} ${currency} has been completed.`,
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

  // Use the cryptocurrency directly if it's a known crypto token
  const getAssetSymbol = () => {
    const knownCryptos = ['USDC', 'ETH', 'BTC'];
    
    if (knownCryptos.includes(currency)) {
      return currency;
    }
    
    // For fiat currencies, default to USDC
    switch(currency.toUpperCase()) {
      case 'USD':
        return 'USDC';
      case 'EUR':
        return 'USDC';
      default:
        return 'USDC'; // Default to USDC for any unrecognized currency
    }
  };

  // Handle exit/cancel from the payment component
  const handleExit = () => {
    setShowCard(false);
    setLoading(false);
    toast({
      title: "Payment cancelled",
      description: "You've cancelled the payment process.",
    });
  };

  // Format the amount with appropriate precision for the currency
  const formatAmount = () => {
    switch(currency) {
      case 'ETH':
      case 'BTC':
        return amount.toString(); // Don't round crypto amounts
      default:
        return amount.toFixed(2); // Format with 2 decimal places for fiat/USDC
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
              Pay with {getAssetSymbol()}
            </>
          )}
        </Button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <FundCard
            assetSymbol={getAssetSymbol()}
            country="US"
            currency={currency}
            headerText={`Pay ${formatAmount()} ${currency} for this experience`}
            buttonText={`Pay ${formatAmount()} ${currency}`}
            onSuccess={handleSuccess}
            onError={handleError}
            onStatus={(status) => {
              console.log("Payment status:", status);
              // Check if status is the string 'exit' without strict type comparison
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
