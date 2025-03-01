import { Providers } from './providers';
import PaymentOptions from './components/PaymentOptions';
import '@coinbase/onchainkit/styles.css'; // Import OnchainKit styles

export default function App() {
  return (
    <Providers>
      <PaymentOptions />
      {/* Other components */}
    </Providers>
  );
} 