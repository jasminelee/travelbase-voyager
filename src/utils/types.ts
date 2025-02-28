
export interface Experience {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  description: string;
  host: {
    name: string;
    rating: number;
    image: string;
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
  currency: string;
  status: PaymentStatus;
  walletAddress?: string;
  transactionHash?: string;
}
