
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
 * 
 * Note: This only allows users to purchase crypto for themselves.
 * It does not directly transfer to the host wallet - that would need to be done
 * separately after the purchase is completed.
 */
export async function launchCoinbaseOneClickBuy(
  amount: number,
  targetAddress: string
): Promise<{ success: boolean; error?: Error }> {
  try {
    console.log(`Launching Coinbase OneClickBuy for ${amount} USDC`);
    
    // Use the actual project ID provided for the Coinbase onramp API
    const projectId = "a1792415-47ed-42f9-861b-52c86d6f7a39";
    
    // Generate the one-click buy URL using parameters supported by the API
    // According to https://docs.cdp.coinbase.com/onramp/docs/api-oneclickbuy
    const buyUrl = await getOnrampBuyUrl({
      projectId: projectId,
      // TypeScript is expecting very specific parameters, so we need to match the expected type
      presetCryptoAmount: amount,
      assets: ['USDC']
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
