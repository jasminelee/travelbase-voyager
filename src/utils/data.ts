import { Experience } from './types';
import { supabase } from '../integrations/supabase/client';

// Keep the mock data as a fallback or for development
export const experienceData: Experience[] = [
  {
    id: '6edcbc9e-1a4a-4970-a970-94cca2a368b3',
    title: 'Exclusive Yacht Tour in Santorini',
    location: 'Santorini, Greece',
    price: 299,
    currency: 'USDC',
    description: 'Experience the breathtaking Santorini sunset on a private yacht. This exclusive tour takes you along the caldera with stops for swimming and snorkeling in the crystal-clear Aegean waters. The journey includes a chef-prepared Mediterranean dinner and premium drinks served on board as you watch the world-famous sunset.',
    host: {
      name: 'Alexandra',
      rating: 4.97,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&h=250&auto=format&fit=crop',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    images: [
      'https://images.unsplash.com/photo-1565874311820-41baccca7bb9?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1601041598397-c10aeee41518?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&h=800'
    ],
    amenities: ['Private boat', 'Chef', 'Open bar', 'Snorkeling gear', 'Sunset views'],
    duration: '5 hours',
    category: 'Water Activities',
    featured: true,
    rating: 4.9,
    reviewCount: 127
  },
  {
    id: '2dc97c5b-b2c8-4c4a-89a0-8d2e9f57368d',
    title: 'Kyoto Tea Ceremony & Garden Tour',
    location: 'Kyoto, Japan',
    price: 120,
    currency: 'USDC',
    description: 'Immerse yourself in the ancient ritual of Japanese tea ceremony, guided by a tea master in a traditional Kyoto tea house. After the ceremony, enjoy a private tour of hidden temple gardens not typically open to tourists, learning about the philosophy of Japanese garden design and Zen principles.',
    host: {
      name: 'Takashi',
      rating: 4.98,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&h=250&auto=format&fit=crop',
      walletAddress: '0x3eB7b1C6f88D730A0D12EB9DD7C487987C2B8F7E'
    },
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1503453363464-743ee9f8716a?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1551501419-cb31cdd15d6b?auto=format&fit=crop&w=1200&h=800'
    ],
    amenities: ['Tea ceremony', 'Private garden tour', 'Traditional sweets', 'Photo opportunities'],
    duration: '3 hours',
    category: 'Cultural',
    featured: true,
    rating: 4.95,
    reviewCount: 183
  },
  {
    id: 'f2a1abcb-da24-4cdd-8f0f-7b15c029ac18',
    title: 'Northern Lights Photography Expedition',
    location: 'Tromsø, Norway',
    price: 375,
    currency: 'USDC',
    description: 'Chase the aurora borealis with an expert photographer and guide. This small-group expedition takes you away from light pollution to the best spots for viewing the northern lights. Learn photography techniques specifically for capturing this natural phenomenon and enjoy warm drinks and traditional Norwegian snacks around a campfire while waiting for the show.',
    host: {
      name: 'Erik',
      rating: 4.92,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&h=250&auto=format&fit=crop',
      walletAddress: '0xF4992f7196d0df7F5A1c6513a7F11a6a27942cB5'
    },
    images: [
      'https://images.unsplash.com/photo-1579033485043-6ffbd5a7eefc?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1612686635542-2244ed9f8ddc?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1581418962503-64abf684c9f7?auto=format&fit=crop&w=1200&h=800'
    ],
    amenities: ['Photography guidance', 'Thermal clothing', 'Hot drinks', 'Campfire', 'Transport'],
    duration: '6 hours',
    category: 'Nature',
    rating: 4.87,
    reviewCount: 164
  },
  {
    id: 'a7b38d6a-5e96-4b51-a5f4-2c4c7e56c5f0',
    title: 'Desert Stargazing & Astronomy Night',
    location: 'Marrakech, Morocco',
    price: 85,
    currency: 'USDC',
    description: 'Escape the city lights to experience the Sahara Desert sky at night with an expert astronomer. Observe stars, planets, and celestial objects through professional-grade telescopes while learning about astronomy and Berber celestial folklore. The experience includes a traditional Moroccan dinner under the stars and transportation from Marrakech.',
    host: {
      name: 'Youssef',
      rating: 4.96,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&h=250&auto=format&fit=crop',
      walletAddress: '0xAb3930f8e99Cca0CADb6a736B9744d6583a341b9'
    },
    images: [
      'https://images.unsplash.com/photo-1464852045489-bccb7d17fe39?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1200&h=800'
    ],
    amenities: ['Telescopes', 'Dinner', 'Transport', 'Astronomy guide', 'Photography assistance'],
    duration: '7 hours',
    category: 'Night Activities',
    featured: true,
    rating: 4.92,
    reviewCount: 148
  },
  {
    id: 'c81d9a8d-54cb-4136-90b5-5e0c1f8c88a6',
    title: "Michelin Chef's Table Experience",
    location: 'Barcelona, Spain',
    price: 500,
    currency: 'USDC',
    description: "Enjoy a private chef's table experience with a Michelin-starred chef in Barcelona. Your evening begins with a market tour to select fresh ingredients, followed by an intimate cooking demonstration and an exclusive multi-course tasting menu with wine pairings. The chef will explain each dish's inspiration and technique, offering a true insider's view of high-end culinary arts.",
    host: {
      name: 'Carlos',
      rating: 4.99,
      image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=250&h=250&auto=format&fit=crop',
      walletAddress: '0x1C2f089bE2883C11B7366B6566F9C2553CdB5e3f'
    },
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=1200&h=800'
    ],
    amenities: ['Market tour', 'Wine pairings', 'Cooking demonstration', 'Multi-course meal', 'Recipe booklet'],
    duration: '4 hours',
    category: 'Food & Drink',
    rating: 4.97,
    reviewCount: 92
  },
  {
    id: '9e7b4ec0-f2a4-40c3-ac40-9940e96298a5',
    title: 'Private Helicopter Tour of the Grand Canyon',
    location: 'Las Vegas, USA',
    price: 400,
    currency: 'USDC',
    description: 'Experience the majesty of the Grand Canyon from the air with this exclusive helicopter tour departing from Las Vegas. Soar over the Hoover Dam, Lake Mead, and the Colorado River before descending 4,000 feet into the canyon for a champagne picnic on a private plateau overlooking the river. The return flight showcases the spectacular Las Vegas Strip from above.',
    host: {
      name: 'Michael',
      rating: 4.95,
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&h=250&auto=format&fit=crop',
      walletAddress: '0x2E8a0aEbA34b2055F4E352a91C95eEB8F0B51dB6'
    },
    images: [
      'https://images.unsplash.com/photo-1527333656061-facecf3bff3c?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1575382244509-9196ec3d3e39?auto=format&fit=crop&w=1200&h=800',
      'https://images.unsplash.com/photo-1501679903522-3c69bd0d0101?auto=format&fit=crop&w=1200&h=800'
    ],
    amenities: ['Private helicopter', 'Champagne picnic', 'Canyon landing', 'Professional pilot/guide', 'Hotel pickup'],
    duration: '4.5 hours',
    category: 'Adventure',
    rating: 4.89,
    reviewCount: 217
  }
];

export const categories = [
  { name: 'All Experiences', value: 'all' },
  { name: 'Adventure', value: 'Adventure' },
  { name: 'Cultural', value: 'Cultural' },
  { name: 'Food & Drink', value: 'Food & Drink' },
  { name: 'Nature', value: 'Nature' },
  { name: 'Water Activities', value: 'Water Activities' },
  { name: 'Night Activities', value: 'Night Activities' }
];

// Fetch all experiences from the database
export async function fetchExperiences(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*, host_id');
    
    if (error) {
      console.error('Error fetching experiences:', error);
      return experienceData; // Fallback to mock data
    }
    
    // Map the database results to the Experience type
    return data.map((exp) => {
      // Try to find a matching experience in our mock data to get the wallet address
      const mockExp = experienceData.find(mock => mock.id === exp.id);
      const walletAddress = mockExp?.host.walletAddress || 
        (exp.host_id ? `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined);
      
      return {
        id: exp.id,
        title: exp.title,
        location: exp.location,
        price: exp.price,
        currency: exp.currency,
        description: exp.description,
        host: {
          name: 'Host', // This would need to be fetched from profiles table
          rating: 4.9,  // This would need to be calculated or fetched
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&h=250&auto=format&fit=crop',
          walletAddress: walletAddress
        },
        images: exp.images,
        amenities: exp.amenities,
        duration: exp.duration,
        category: exp.category,
        featured: exp.featured,
        rating: exp.rating ? parseFloat(exp.rating.toString()) : undefined,
        reviewCount: exp.review_count || 0
      };
    });
  } catch (error) {
    console.error('Error in fetchExperiences:', error);
    return experienceData; // Fallback to mock data
  }
}

// Get an experience by ID from the database
export async function fetchExperienceById(id: string): Promise<Experience | undefined> {
  try {
    console.log("Fetching experience with ID:", id);
    
    // First try to get a mock experience to have wallet address available
    const mockExp = getExperienceById(id);
    console.log("Mock experience found:", mockExp ? "yes" : "no");
    console.log("Mock wallet address:", mockExp?.host.walletAddress);
    
    // Query the experiences table by ID
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching experience by ID:', error);
      // Fallback to mock data
      console.log("Using fallback mock experience with host wallet:", mockExp?.host.walletAddress);
      return mockExp;
    }
    
    // Always use the wallet address from the mock data for now
    // In a real app, this would come from a proper wallet address field in the database
    const walletAddress = mockExp?.host.walletAddress || 
      `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    console.log("Found experience with ID:", id);
    console.log("Using wallet address:", walletAddress);
    
    return {
      id: data.id,
      title: data.title,
      location: data.location,
      price: data.price,
      currency: data.currency,
      description: data.description,
      host: {
        name: 'Host', // This would need to be fetched from profiles table
        rating: 4.9,  // This would need to be calculated or fetched
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&h=250&auto=format&fit=crop',
        walletAddress: walletAddress // Always provide a wallet address
      },
      images: data.images,
      amenities: data.amenities,
      duration: data.duration,
      category: data.category,
      featured: data.featured,
      rating: data.rating ? parseFloat(data.rating.toString()) : undefined,
      reviewCount: data.review_count || 0
    };
  } catch (error) {
    console.error('Error in fetchExperienceById:', error);
    return getExperienceById(id); // Fallback to mock data
  }
}

// Keep these synchronous methods for backward compatibility
export function getExperienceById(id: string): Experience | undefined {
  return experienceData.find(exp => exp.id === id);
}

export function getFeaturedExperiences(): Experience[] {
  return experienceData.filter(exp => exp.featured);
}

export function getExperiencesByCategory(category: string): Experience[] {
  if (category === 'all') return experienceData;
  return experienceData.filter(exp => exp.category === category);
}

// New asynchronous methods to fetch from database
export async function fetchFeaturedExperiences(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('featured', true);
    
    if (error) {
      console.error('Error fetching featured experiences:', error);
      return getFeaturedExperiences(); // Fallback to mock data
    }
    
    // Map the database results to the Experience type
    return data.map((exp) => ({
      id: exp.id,
      title: exp.title,
      location: exp.location,
      price: exp.price,
      currency: exp.currency,
      description: exp.description,
      host: {
        name: 'Host', // This would need to be fetched from profiles table
        rating: 4.9,  // This would need to be calculated or fetched
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&h=250&auto=format&fit=crop',
        walletAddress: exp.host_id ? `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined // Generate mock wallet address
      },
      images: exp.images,
      amenities: exp.amenities,
      duration: exp.duration,
      category: exp.category,
      featured: exp.featured,
      rating: exp.rating ? parseFloat(exp.rating.toString()) : undefined,
      reviewCount: exp.review_count || 0
    }));
  } catch (error) {
    console.error('Error in fetchFeaturedExperiences:', error);
    return getFeaturedExperiences(); // Fallback to mock data
  }
}

export async function fetchExperiencesByCategory(category: string): Promise<Experience[]> {
  try {
    let query = supabase
      .from('experiences')
      .select('*');
    
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching experiences by category:', error);
      return getExperiencesByCategory(category); // Fallback to mock data
    }
    
    // Map the database results to the Experience type
    return data.map((exp) => ({
      id: exp.id,
      title: exp.title,
      location: exp.location,
      price: exp.price,
      currency: exp.currency,
      description: exp.description,
      host: {
        name: 'Host', // This would need to be fetched from profiles table
        rating: 4.9,  // This would need to be calculated or fetched
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&h=250&auto=format&fit=crop',
        walletAddress: exp.host_id ? `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined // Generate mock wallet address
      },
      images: exp.images,
      amenities: exp.amenities,
      duration: exp.duration,
      category: exp.category,
      featured: exp.featured,
      rating: exp.rating ? parseFloat(exp.rating.toString()) : undefined,
      reviewCount: exp.review_count || 0
    }));
  } catch (error) {
    console.error('Error in fetchExperiencesByCategory:', error);
    return getExperiencesByCategory(category); // Fallback to mock data
  }
}
