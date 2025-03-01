
// This file contains utility functions related to Coinbase payments
import { supabase } from '../integrations/supabase/client';
import { CoinbaseTransaction } from './types';
import { 
  fetchOnrampConfig, 
  fetchOnrampOptions 
} from '@coinbase/onchainkit/fund';

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
 * Using the direct script injection approach
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
      // Generate UUID for partner user ID if not already in localStorage
      let partnerUserId = localStorage.getItem('cb_ramp_user_id');
      if (!partnerUserId) {
        partnerUserId = crypto.randomUUID();
        localStorage.setItem('cb_ramp_user_id', partnerUserId);
      }
      
      // Load the Coinbase script
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://static-assets.coinbase.com/onramp-web-sdk/v1.0.0/onramp.js';
        script.async = true;
        
        // Set up event handlers
        script.onload = () => {
          // @ts-ignore - the script adds coinbase to the window object
          if (window.CoinbaseOnramp) {
            try {
              // @ts-ignore
              const onramp = new window.CoinbaseOnramp({
                appId: 'a1792415-47ed-42f9-861b-52c86d6f7a39',
                target: '#coinbase-onramp-container',
                onExit: () => {
                  console.log('Coinbase onramp closed');
                  if (document.body.contains(container)) {
                    document.body.removeChild(container);
                  }
                  if (document.body.contains(script)) {
                    document.body.removeChild(script);
                  }
                  resolve({ success: true });
                },
                onSuccess: (result: any) => {
                  console.log('Coinbase onramp success:', result);
                  if (document.body.contains(container)) {
                    document.body.removeChild(container);
                  }
                  if (document.body.contains(script)) {
                    document.body.removeChild(script);
                  }
                  resolve({ success: true });
                },
                onEvent: (event: any) => {
                  console.log('Coinbase onramp event:', event);
                },
                experienceLoggedIn: 'embedded',
                experienceLoggedOut: 'popup',
                defaultExperience: 'embedded',
                theme: 'dark'
              });
              
              // Open the onramp
              onramp.open({
                destinationWallets: [
                  {
                    address: targetAddress,
                    blockchains: ['base'],
                    assets: ['USDC']
                  }
                ],
                presetCryptoAmount: amount,
                partnerUserId: partnerUserId
              });
            } catch (error) {
              console.error('Error initializing Coinbase onramp:', error);
              if (document.body.contains(container)) {
                document.body.removeChild(container);
              }
              reject(error);
            }
          } else {
            console.error('Coinbase onramp not available');
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            reject(new Error('Coinbase onramp not available'));
          }
        };
        
        script.onerror = (error) => {
          console.error('Error loading Coinbase script:', error);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          reject(new Error('Failed to load Coinbase script'));
        };
        
        // Add the script to the page
        document.body.appendChild(script);
      });
    } catch (error) {
      console.error('Error initializing Coinbase onramp:', error);
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
