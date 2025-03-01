// This file contains utility functions related to Coinbase payments
import { supabase } from '../integrations/supabase/client';
import { CoinbaseTransaction } from './types';

// USDC contract address on Base network
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC

/**
 * Updates the payment status in the database
 */
export async function updatePaymentStatus(
  bookingId: string, 
  status: 'pending' | 'completed' | 'failed',
  transactionHash?: string,
  walletAddress?: string
) {
  try {
    console.log("Updating payment status for booking:", bookingId);
    console.log("New status:", status);
    console.log("Transaction hash:", transactionHash);
    console.log("Wallet address:", walletAddress);
    
    const updateData: any = { status };
    
    if (transactionHash) {
      updateData.transaction_hash = transactionHash;
    }
    
    if (walletAddress) {
      updateData.wallet_address = walletAddress;
    }
    
    return await supabase
      .from('payments')
      .update(updateData)
      .eq('booking_id', bookingId);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

/**
 * Launch Coinbase Onramp experience
 * Based on the official Coinbase demo application
 */
export async function launchCoinbaseOnramp(
  amount: number,
  targetAddress: string,
  experienceTitle: string
): Promise<{ success: boolean; error?: Error }> {
  try {
    console.log(`Launching Coinbase Onramp for ${amount} USDC to ${targetAddress}`);
    
    // Create a container for the Coinbase widget
    const container = document.createElement('div');
    container.id = 'coinbase-onramp-container';
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    document.body.appendChild(container);
    
    try {
      // Import the Coinbase SDK dynamically
      // Based on the CryptoRamp.tsx implementation from the demo
      const onchainkit = await import('@coinbase/onchainkit');
      
      if (!onchainkit.CryptoRamp) {
        throw new Error("CryptoRamp not found in onchainkit");
      }
      
      // Create an instance of CryptoRamp
      const ramp = new onchainkit.CryptoRamp({
        appId: 'a1792415-47ed-42f9-861b-52c86d6f7a39', // Your Coinbase project ID
        containerElement: container, // Pass the container element
        darkMode: true,
        closeOnExit: true,
        closeOnSuccess: true,
        defaultDestinationAddress: targetAddress,
        defaultTokenAddress: USDC_ADDRESS, // Base USDC
        defaultNetwork: 'base',
        defaultAmount: amount.toString(),
        onExit: () => {
          console.log('Coinbase onramp closed');
          // Clean up on exit
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        },
        onSuccess: (data) => {
          console.log('Coinbase onramp success:', data);
          // Remove container when done
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        },
        onEvent: (event) => {
          console.log('Coinbase onramp event:', event);
        },
        onError: (error) => {
          console.error('Coinbase onramp error:', error);
          // Remove container on error
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        },
      });
      
      // Open the Coinbase Onramp experience
      await ramp.open();
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing Coinbase SDK:', error);
      // Remove container on error
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error launching Coinbase Onramp:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}
