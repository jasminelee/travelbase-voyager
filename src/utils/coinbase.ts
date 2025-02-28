
import { supabase } from '../integrations/supabase/client';

export interface CoinbaseChargeParams {
  experienceId: string;
  bookingId: string;
  amount: number;
  currency: string;
  description: string;
  redirectUrl?: string;
}

/**
 * Creates a Coinbase Commerce charge for an experience booking
 */
export const createCoinbaseCharge = async (params: CoinbaseChargeParams) => {
  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'coinbase-commerce', {
        body: {
          action: 'create-charge',
          ...params
        }
      });

    if (functionError) throw functionError;
    return { data: functionData, error: null };
  } catch (error) {
    console.error('Error creating Coinbase charge:', error);
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
export const updatePaymentStatus = async (bookingId: string, status: string, transactionHash?: string) => {
  try {
    const updates: any = { status };
    if (transactionHash) {
      updates.transaction_hash = transactionHash;
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
