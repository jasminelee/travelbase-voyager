import React from 'react';
import { FundCard } from '@coinbase/onchainkit/fund';
import WalletConnection from './WalletConnection';
import './PaymentOptions.css';

// Define the window interface to include Coinbase's onramp
declare global {
  interface Window {
    CoinbaseOnramp?: {
      createOnramp: (options: any, container: HTMLElement) => any;
    };
  }
}

const PaymentOptions = () => {
  // Define the experience details
  const experiencePrice = '299'; // The price shown in your screenshot
  const experienceCurrency = 'USDC'; // The currency shown in your screenshot

  return (
    <div className="payment-container">
      <h2>Payment Options</h2>
      
      <div className="fund-card-container">
        <FundCard
          assetSymbol={experienceCurrency}
          country="US" // Default to US, can be made dynamic
          currency="USD" // Default to USD, can be made dynamic
          presetAmountInputs={[experiencePrice]} // Set the experience price as a preset amount
          onSuccess={(data) => {
            console.log('Payment successful:', data);
            // Handle successful payment (e.g., redirect to confirmation page)
          }}
          onError={(error) => {
            console.error('Payment error:', error);
            // Handle payment error
          }}
          onStatus={(status) => {
            console.log('Payment status:', status);
            // Handle payment status updates
          }}
        />
      </div>
      
      <div className="wallet-connection-container">
        <WalletConnection />
      </div>
    </div>
  );
};

export default PaymentOptions; 