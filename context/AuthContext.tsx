import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import supabaseClient from '../services/supabaseClient';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AuthContext] Fetching profile for user:', userId);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile query timeout after 10 seconds')), 10000);
      });
      
      // Query without .single() to avoid 406 error
      const queryPromise = supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId);
      
      console.log('[AuthContext] Starting profile query with 10s timeout...');
      
      const { data: profileArray, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      console.log('[AuthContext] Query result - error:', error);
      console.log('[AuthContext] Query result - data array:', profileArray);
      
      // Get first item from array
      const profileData = profileArray && profileArray.length > 0 ? profileArray[0] : null;

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('[AuthContext] Profile not found (PGRST116) - no row in database for user:', userId);
          setProfile(null);
        } else {
          console.error('[AuthContext] Error fetching profile:', error);
          console.error('[AuthContext] Error details:', { code: error.code, message: error.message, details: error.details });
          setProfile(null);
        }
        return; // Exit early on error
      } 
      
      if (profileData) {
        console.log('[AuthContext] Profile loaded successfully:', profileData);
        const userProfile = {
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          companyName: profileData.company_name || '',
          industry: profileData.industry || '',
          registrationNumber: profileData.registration_number || '',
          vatRegistrationNumber: profileData.vat_registration_number || '',
          businessType: profileData.business_type || 2,
          jurisdiction: profileData.jurisdiction || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          logoUrl: profileData.logo_url || '',
          website: profileData.website || '',
          currency: profileData.currency || '$',
          taxEnabled: profileData.tax_enabled || false,
          taxName: profileData.tax_name || 'Tax',
          taxRate: profileData.tax_rate || 0,
        };
        console.log('[AuthContext] Setting profile state:', userProfile);
        setProfile(userProfile);
      } else {
        console.warn('[AuthContext] No profile data returned - data is null/undefined');
        setProfile(null);
      }
    } catch (profileErr) {
      console.error('[AuthContext] Profile fetch EXCEPTION:', profileErr);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('[AuthContext] Initializing session...');
        
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('[AuthContext] Supabase not configured - skipping authentication');
          setIsLoading(false);
          return;
        }
        
        // Set a 3-second timeout for session initialization
        const timeoutId = setTimeout(() => {
          console.warn('[AuthContext] Session initialization timeout (3s) - proceeding without auth');
          setIsLoading(false);
        }, 3000);

        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (sessionError) {
          console.error('[AuthContext] Session fetch error:', sessionError);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('[AuthContext] Session found for user:', session.user.id);
          setUser(session.user);
          const emailVerified = session.user.email_confirmed_at !== null;
          setIsEmailVerified(emailVerified);
          
          await fetchProfile(session.user.id);
        } else {
          console.log('[AuthContext] No active session found');
        }
      } catch (err) {
        console.error('[AuthContext] Session initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event);
        
        if (session?.user) {
          console.log('[AuthContext] User authenticated:', session.user.id);
          setUser(session.user);
          const emailVerified = session.user.email_confirmed_at !== null;
          setIsEmailVerified(emailVerified);
          
          await fetchProfile(session.user.id);
        } else {
          console.log('[AuthContext] User signed out');
          setUser(null);
          setProfile(null);
          setIsEmailVerified(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out user...');
      
      // Clear state immediately
      setUser(null);
      setProfile(null);
      setIsEmailVerified(false);
      
      // Clear localStorage
      localStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('[AuthContext] Supabase signOut error:', error);
        // Don't throw - continue with client-side cleanup
      }
      
      console.log('[AuthContext] Sign out complete, forcing navigation to login');
      
      // Force navigation to login
      window.location.hash = '#/login';
      window.location.reload();
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
      // Force cleanup even on error
      localStorage.clear();
      window.location.hash = '#/login';
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        isEmailVerified,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
