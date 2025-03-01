// This file contains utility functions related to Coinbase payments
import { supabase } from '../integrations/supabase/client';
import { OnchainKit } from '@coinbase/onchainkit';
import { CoinbaseSDK } from '@coinbase/coinbase-sdk';

// USDC contract address on Base network
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC

// Coinbase OnchainKit project ID
const ONCHAIN_KIT_PROJECT_ID = "a1792415-47ed-42f9-861b-52c86d6f7a39";

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
 * Creates a smart wallet for a user using OnchainKit
 */
export async function createSmartWallet() {
  try {
    console.log("Creating smart wallet for user using OnchainKit");
    console.log("Using project ID:", ONCHAIN_KIT_PROJECT_ID);
    
    // Use the actual OnchainKit library
    const onchainKit = new OnchainKit({ 
      projectId: ONCHAIN_KIT_PROJECT_ID,
      network: "base-mainnet" 
    });
    
    const smartWallet = await onchainKit.createWallet();
    
    console.log("Created smart wallet with address:", smartWallet.address);
    
    return {
      data: {
        address: smartWallet.address
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating smart wallet:', error);
    return {
      data: null,
      error
    };
  }
}

/**
 * Check USDC balance of a wallet
 */
export async function checkUsdcBalance(walletAddress: string) {
  try {
    console.log(`Checking USDC balance for wallet ${walletAddress}`);
    
    // IMPORTANT: In production code, replace this with:
    // import { createPublicClient, http } from 'viem';
    // import { base } from 'viem/chains';
    // import { erc20Abi } from 'viem/abis';
    // 
    // const publicClient = createPublicClient({
    //   chain: base,
    //   transport: http()
    // });
    // 
    // const balance = await publicClient.readContract({
    //   address: USDC_ADDRESS,
    //   abi: erc20Abi,
    //   functionName: 'balanceOf',
    //   args: [walletAddress]
    // });
    // 
    // return { data: { balance: Number(balance) / 10**6 }, error: null };
    
    // For demo purposes, return a zero balance to force USDC purchase
    return {
      data: {
        balance: 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error checking USDC balance:', error);
    return {
      data: null,
      error
    };
  }
}

/**
 * Buy USDC directly via Coinbase
 */
export async function buyUsdc(walletAddress: string, amount: number) {
  try {
    console.log(`Buying ${amount} USDC for wallet ${walletAddress}`);
    
    // In a real implementation, this would integrate with Coinbase's SDK
    // For demo purposes, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      data: {
        success: true,
        amount: amount,
        walletAddress: walletAddress
      },
      error: null
    };
  } catch (error) {
    console.error('Error buying USDC:', error);
    return {
      data: null,
      error
    };
  }
}

/**
 * Launch Coinbase Onramp experience
 * This function initiates the Coinbase Onramp flow for users to purchase crypto
 */
export async function launchCoinbaseOnramp(
  amount: number,
  targetAddress: string,
  experienceTitle: string
) {
  try {
    console.log(`Launching Coinbase Onramp for ${amount} USDC to ${targetAddress}`);
    
    // Initialize the CoinbaseSDK
    const coinbaseSDK = new CoinbaseSDK({
      appId: ONCHAIN_KIT_PROJECT_ID, // Using the same project ID
      widgetParameters: {
        amount: amount.toString(),
        destinationWallets: [{
          address: targetAddress,
          assets: ['USDC'],
          blockchains: ['base']
        }],
        defaultNetwork: 'base',
        topUpAmount: amount.toString(),
        presetCryptoAmount: amount.toString(),
        partnerUserId: `payment_${Date.now()}`,
        displayName: `Payment for ${experienceTitle}`
      }
    });
    
    // Open the Coinbase Onramp widget
    await coinbaseSDK.showOnramp();
    
    // Return success (note: actual transaction confirmation would require
    // either webhook integration or user confirmation in a production app)
    return {
      data: {
        success: true,
        amount: amount,
        targetAddress: targetAddress
      },
      error: null
    };
  } catch (error) {
    console.error('Error launching Coinbase Onramp:', error);
    return {
      data: null,
      error
    };
  }
}

/**
 * Send USDC from user wallet to host wallet using OnchainKit
 */
export async function sendUSDCFromSmartWallet(
  smartWalletAddress: string,
  hostWalletAddress: string,
  amount: number
) {
  try {
    console.log(`Sending ${amount} USDC from ${smartWalletAddress} to ${hostWalletAddress}`);
    
    // Use the actual OnchainKit library
    const onchainKit = new OnchainKit({ 
      projectId: ONCHAIN_KIT_PROJECT_ID,
      network: "base-mainnet" 
    });
    
    const smartWallet = await onchainKit.getWallet(smartWalletAddress);
    
    // Send USDC from the smart wallet to the host
    const txHash = await smartWallet.transferToken({
      tokenAddress: USDC_ADDRESS,
      to: hostWalletAddress,
      amount: amount.toString()
    });
    
    console.log("Transaction completed with hash:", txHash);
    
    return {
      data: {
        transactionHash: txHash,
        status: 'success',
        amount: amount.toString(),
        currency: 'USDC'
      },
      error: null
    };
  } catch (error) {
    console.error('Error sending USDC:', error);
    return {
      data: null,
      error
    };
  }
}
