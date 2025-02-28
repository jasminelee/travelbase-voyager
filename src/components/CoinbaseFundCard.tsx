
import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { FundCard } from '@coinbase/onchainkit/fund';
import { 
  createSmartWallet, 
  approveUSDCSpending, 
  sendUSDCToHost,
  fundSmartWallet
} from '../utils/coinbase';

interface CoinbaseFundCardProps {
  amount: number;
  currency: string;
  hostWalletAddress: string;
  onSuccess?: (transactionHash: string, walletAddress: string) => void;
  onError?: (error: string) => void;
}

// Define the LifecycleStatus type based on the expected structure
interface LifecycleStatus {
  statusName: string;
  statusData: any;
}

const CoinbaseFundCard = ({ 
  amount, 
  currency, 
  hostWalletAddress, 
  onSuccess, 
  onError 
}: CoinbaseFundCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  const [walletFunded, setWalletFunded] = useState(false);
  const { toast } = useToast();

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create a smart wallet for the user using OnchainKit
      const { data: walletData, error: walletError } = await createSmartWallet();
      
      if (walletError || !walletData) {
        throw new Error(walletError?.message || "Failed to create smart wallet");
      }
      
      // Store the smart wallet address
      setSmartWalletAddress(walletData.address);
      setWalletReady(true);
      console.log("Created smart wallet with address:", walletData.address);
      
      toast({
        title: "Smart wallet created",
        description: "Now you can buy USDC to complete your payment",
      });
      
      // Step 2: Show the fund card to allow the user to buy USDC
      setShowCard(true);
    } catch (error) {
      console.error("Error initiating payment:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        title: "Error creating wallet",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyUSDC = async () => {
    try {
      if (!smartWalletAddress) {
        throw new Error("Smart wallet not created yet");
      }
      
      setProcessingPayment(true);
      
      // Fund the wallet with USDC using Coinbase Pay
      const { data: fundingData, error: fundingError } = await fundSmartWallet(
        smartWalletAddress,
        amount
      );
      
      if (fundingError || !fundingData) {
        throw new Error(fundingError?.message || "Failed to fund wallet with USDC");
      }
      
      setWalletFunded(true);
      
      toast({
        title: "Wallet funded with USDC",
        description: "Your wallet now has USDC and is ready to complete the payment",
      });
      
      // Process the payment to the host
      await processPaymentToHost();
      
    } catch (error) {
      console.error("Error buying USDC:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        title: "Error buying USDC",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessingPayment(false);
    }
  };

  const handleFundSuccess = async (data: any) => {
    try {
      console.log("Funding successful:", data);
      setWalletFunded(true);
      toast({
        title: "Wallet funded with USDC",
        description: "Now completing your payment to the host",
      });
      
      // Process the payment to the host
      await processPaymentToHost();
    } catch (error) {
      console.error("Error processing fund success:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        title: "Payment error",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessingPayment(false);
    }
  };

  const processPaymentToHost = async () => {
    try {
      setProcessingPayment(true);
      
      if (!smartWalletAddress) {
        throw new Error("Smart wallet address not found");
      }
      
      // Step 3: Approve USDC spending
      const { error: approvalError } = await approveUSDCSpending(
        smartWalletAddress,
        hostWalletAddress,
        amount
      );
      
      if (approvalError) {
        throw new Error("Failed to approve USDC spending");
      }
      
      // Step 4: Send USDC to host
      const { data: txData, error: txError } = await sendUSDCToHost(
        smartWalletAddress,
        hostWalletAddress,
        amount
      );
      
      if (txError || !txData) {
        throw new Error(txError?.message || "Failed to send USDC");
      }
      
      console.log("Payment successful:", txData);
      
      // Extract transaction hash
      const txHash = txData.transactionHash;
      
      if (onSuccess) {
        onSuccess(txHash, smartWalletAddress);
      }
      
      toast({
        title: "Payment successful",
        description: `Your USDC payment has been sent to the host.`,
        variant: "default",
      });
      
      setShowCard(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        title: "Payment error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
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
    
    setProcessingPayment(false);
    setLoading(false);
  };

  const handleExit = () => {
    setShowCard(false);
    setLoading(false);
    setProcessingPayment(false);
    setWalletReady(false);
    setWalletFunded(false);
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
              Creating wallet...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Buy USDC to Pay
            </>
          )}
        </Button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          {processingPayment ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-center">
                Processing your payment...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-medium text-sm mb-1">Your smart wallet is ready</h3>
                <p className="text-xs text-gray-500">
                  {walletFunded 
                    ? "Your wallet is funded with USDC and ready to complete the payment" 
                    : "Now you can buy USDC to complete your payment"}
                </p>
                {smartWalletAddress && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      {walletReady && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
                      <p className="text-xs font-mono truncate">
                        {smartWalletAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {!walletFunded ? (
                <>
                  <Button
                    variant="default"
                    className="w-full mb-4"
                    onClick={handleBuyUSDC}
                  >
                    Buy USDC
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <FundCard
                      assetSymbol="USDC"
                      country="US"
                      headerText={`Buy USDC to complete your payment`}
                      buttonText={`Buy USDC`}
                      onSuccess={handleFundSuccess}
                      onError={handleError}
                      onStatus={(status: LifecycleStatus) => {
                        console.log("Payment status:", status);
                        if (status && status.statusName === 'exit') {
                          handleExit();
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <Button
                  variant="default"
                  className="w-full mb-4"
                  onClick={processPaymentToHost}
                >
                  Complete Payment
                </Button>
              )}
              
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={handleExit}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CoinbaseFundCard;
