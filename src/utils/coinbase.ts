
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
 * Based directly on the official Coinbase demo application
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
      // Import the onchainkit module dynamically
      const { OnRampKit } = await import('@coinbase/onchainkit');
      
      if (!OnRampKit) {
        throw new Error("OnRampKit not found in @coinbase/onchainkit");
      }
      
      // Create a new instance of the OnRampKit
      const onRampKit = new OnRampKit({
        appId: 'a1792415-47ed-42f9-861b-52c86d6f7a39', // Your Coinbase project ID
        element: '#coinbase-onramp-container',
        onSuccess: (data: any) => {
          console.log('Coinbase onramp success:', data);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        },
        onExit: () => {
          console.log('Coinbase onramp closed');
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        },
        onEvent: (event: any) => {
          console.log('Coinbase onramp event:', event);
        },
        onError: (error: any) => {
          console.error('Coinbase onramp error:', error);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        },
        theme: 'dark'
      });
      
      // Set up the purchase configuration
      await onRampKit.setupPurchase({
        destinationWallets: [
          {
            address: targetAddress,
            supportedNetworks: ['base'],
            assets: ['USDC'],
          }
        ],
        amount: {
          value: amount.toString(),
          currencyCode: 'USDC'
        },
        preselectedNetwork: 'base'
      });
      
      // Open the Coinbase Onramp experience
      await onRampKit.open();
      
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
