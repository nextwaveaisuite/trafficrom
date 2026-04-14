import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useCredits = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const spendCredits = useCallback(async (amount, description) => {
    if (!user) return { error: 'Not authenticated' };
    setLoading(true);
    const { error } = await supabase.rpc('spend_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description,
    });
    setLoading(false);
    if (!error) refreshProfile();
    return { error };
  }, [user, refreshProfile]);

  const earnCredits = useCallback(async (amount, description) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.rpc('earn_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description,
    });
    if (!error) refreshProfile();
    return { error };
  }, [user, refreshProfile]);

  const fetchTransactions = useCallback(async (limit = 20) => {
    if (!user) return [];
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  }, [user]);

  return { spendCredits, earnCredits, fetchTransactions, loading };
};
