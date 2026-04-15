import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Cache key for localStorage
const PROFILE_CACHE_KEY = 'trafficrom_profile';
const SESSION_CACHE_KEY = 'trafficrom_session';

const getCachedProfile = () => {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
};

const setCachedProfile = (profile) => {
  try {
    if (profile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {}
};

const getCachedSession = () => {
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  // Initialise with cached data so the page renders immediately
  const [user, setUser]       = useState(() => getCachedSession());
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data);
      setCachedProfile(data);
    }
  }, []);

  useEffect(() => {
    // Verify session in background — don't block render
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Store minimal session data
        try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(currentUser)); } catch {}
        // If we don't have a cached profile yet, fetch it
        if (!getCachedProfile()) {
          fetchProfile(currentUser.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
          // Refresh profile in background without blocking
          fetchProfile(currentUser.id);
        }
      } else {
        // Clear cache on logout
        setCachedProfile(null);
        try { localStorage.removeItem(SESSION_CACHE_KEY); } catch {}
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(currentUser)); } catch {}
          fetchProfile(currentUser.id);
        } else {
          setUser(null);
          setProfile(null);
          setCachedProfile(null);
          try { localStorage.removeItem(SESSION_CACHE_KEY); } catch {}
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async ({ email, password, username, firstName, lastName, referrerCode }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, firstName, lastName, referrerCode } },
    });
    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data.user)); } catch {}
      await fetchProfile(data.user.id);
    }
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCachedProfile(null);
    try {
      localStorage.removeItem(SESSION_CACHE_KEY);
      localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch {}
  };

  const refreshProfile = useCallback(() => {
    if (user) fetchProfile(user.id);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
