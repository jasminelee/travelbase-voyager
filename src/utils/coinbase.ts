
import { supabase } from '../integrations/supabase/client';
import { OnchainKit } from '@coinbase/onchainkit';

// Initialize OnchainKit
const PROJECT_ID = "your_project_id"; // Replace with your actual project ID
const onchainKit = new OnchainKit({ projectId: PROJECT_ID });

// USDC contract address (Base network)
export const USDC_ADDRESS = "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"; // Base USDC address

/**
 * Creates a smart wallet for users who don't have a wallet
 */
export const createSmartWallet = async () => {
  try {
    const smartWallet = await onchainKit.createWallet();
    return { data: smartWallet, error: null };
  } catch (error) {
    console.error('Error creating smart wallet:', error);
    return { data: null, error };
  }
};

/**
 * Sends USDC from user to host
 */
export const sendUSDCToHost = async (userWalletAddress: string, hostWalletAddress: string, amount: number) => {
  try {
    // This is a placeholder - in a real implementation, you would use 
    // viem/ethers or the onchainKit to facilitate the transfer
    console.log(`Sending ${amount} USDC from ${userWalletAddress} to ${hostWalletAddress}`);
    
    // Mock transaction hash for testing
    const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    return { data: { transactionHash: txHash }, error: null };
  } catch (error) {
    console.error('Error sending USDC:', error);
    return { data: null, error };
  }
};

/**
 * Gets the payment status for a booking
 */
export const getPaymentStatus = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('status, transaction_hash')
      .eq('booking_id', bookingId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting payment status:', error);
    return { data: null, error };
  }
};

/**
 * Updates the payment status in the database
 */
export const updatePaymentStatus = async (bookingId: string, status: string, transactionHash?: string, walletAddress?: string) => {
  try {
    const updates: any = { status };
    
    if (transactionHash) {
      updates.transaction_hash = transactionHash;
    }
    
    if (walletAddress) {
      updates.wallet_address = walletAddress;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('booking_id', bookingId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { data: null, error };
  }
};
