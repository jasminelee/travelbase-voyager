
import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains'; // Use base or baseSepolia for testing

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base} // Use baseSepolia for testing
    >
      {props.children}
    </OnchainKitProvider>
  );
}
