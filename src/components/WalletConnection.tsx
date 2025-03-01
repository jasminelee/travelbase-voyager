import React, { useState, useCallback } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

const WalletConnection = () => {
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState('');

  const connectWallet = useCallback(async () => {
    try {
      // Initialize the Coinbase Wallet SDK
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'Your Experience App',
        appLogoUrl: 'https://example.com/logo.png',
      });

      // Connect to the wallet
      const provider = coinbaseWallet.makeWeb3Provider(
        'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
        1
      );

      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      setWallet(provider);
      setAddress(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, []);

  return (
    <div>
      <h2>Connect Your Wallet</h2>
      <button onClick={connectWallet}>Connect Wallet</button>
      {address && <p>Wallet connected: {address}</p>}
    </div>
  );
};

export default WalletConnection; 