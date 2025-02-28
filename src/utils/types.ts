
export interface Experience {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string; // Will always be USDC now
  description: string;
  host: {
    name: string;
    rating: number;
    image: string;
    walletAddress?: string; // Added for P2P payments
  };
  images: string[];
  amenities: string[];
  duration: string;
  category: string;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface BookingDetails {
  experienceId: string;
  startDate: Date;
  guests: number;
  totalPrice: number;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PaymentDetails {
  bookingId: string;
  amount: number;
  currency: string; // Will always be USDC
  status: PaymentStatus;
  walletAddress?: string;
  transactionHash?: string;
  hostWalletAddress?: string; // Added for P2P payments
}

export interface CoinbaseTransaction {
  hash: string;
  status: string;
  amount: string;
  currency: string;
  wallet?: {
    address: string;
  };
}
