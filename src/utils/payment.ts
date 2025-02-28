
import { BookingDetails, PaymentDetails } from './types';

// Function to generate a QR code for manual payments (fallback option)
export function generatePaymentQRCode(walletAddress: string, amount: number): string {
  // Generate a QR code with payment details
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:${walletAddress}?amount=${amount}`;
}

// Function to check if the payment was successful
export async function verifyPayment(transactionHash: string): Promise<boolean> {
  console.log('Verifying payment transaction:', transactionHash);
  
  // In a real application, this would verify the transaction on the blockchain
  // For this demo, we'll simulate a successful verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}

// Function to format payment amount with currency
export function formatPaymentAmount(amount: number, currency: string): string {
  // Format the amount with appropriate currency
  return `${amount} ${currency}`;
}

// Function to determine if currency is a cryptocurrency
export function isCryptoCurrency(currency: string): boolean {
  const cryptoCurrencies = ['BTC', 'ETH', 'USDC', 'USDT', 'XRP', 'SOL', 'ADA', 'AVAX'];
  return cryptoCurrencies.includes(currency.toUpperCase());
}
