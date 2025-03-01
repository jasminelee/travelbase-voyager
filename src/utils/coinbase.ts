// This file contains utility functions related to Coinbase payments
import { supabase } from '../integrations/supabase/client';
import { CoinbaseTransaction } from './types';
import { 
  getOnrampBuyUrl
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
 * Launch Coinbase one-click buy experience
 * Using the getOnrampBuyUrl from onchainkit
 */
export async function launchCoinbaseOneClickBuy(
  amount: number,
  targetAddress: string
): Promise<{ success: boolean; error?: Error }> {
  try {
    console.log(`Launching Coinbase OneClickBuy for ${amount} USDC to ${targetAddress}`);
    
    // Generate UUID for partner user ID if not already in localStorage
    let partnerUserId = localStorage.getItem('cb_ramp_user_id');
    if (!partnerUserId) {
      partnerUserId = crypto.randomUUID();
      localStorage.setItem('cb_ramp_user_id', partnerUserId);
    }
    
    // Generate the one-click buy URL using the correct parameter structure according to onchainkit docs
    const buyUrl = await getOnrampBuyUrl({
      partnerUserId: partnerUserId,
      presetCryptoAmount: amount,
      defaultNetwork: 'base',
      defaultAsset: 'USDC',
      destinationAddress: targetAddress
    });
    
    console.log("Generated Coinbase OneClickBuy URL:", buyUrl);
    
    // Open the URL in a new tab
    window.open(buyUrl, '_blank');
    
    return { success: true };
  } catch (error) {
    console.error('Error launching Coinbase OneClickBuy:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}
