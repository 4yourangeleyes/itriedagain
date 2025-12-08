import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loader2 } from 'lucide-react';

import { INDUSTRIES } from '../services/industryData';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'menu' | 'signin' | 'signup'>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('[LoginScreen] Signing in...');
      
      // Clear any stale localStorage data
      localStorage.removeItem('grit_profile');
      localStorage.removeItem('grit_auth');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('[LoginScreen] Sign in successful, user:', data.user?.email);
      
      // Wait for profile to be fetched (up to 3 seconds)
      let attempts = 0;
      const checkProfile = setInterval(async () => {
        attempts++;
        try {
          const { data: profileArray } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user?.id);
          
          const profileData = profileArray && profileArray.length > 0 ? profileArray[0] : null;
          
          if (profileData || attempts > 10) {
            clearInterval(checkProfile);
            if (profileData) {
              console.log('[LoginScreen] Profile loaded, navigating to chat');
            } else {
              console.warn('[LoginScreen] Profile loading timed out, navigating anyway');
            }
            setIsLoading(false);
            navigate('/chat');
          }
        } catch (err) {
          console.error('[LoginScreen] Error checking profile:', err);
          if (attempts > 10) {
            clearInterval(checkProfile);
            setIsLoading(false);
            navigate('/chat');
          }
        }
      }, 300);
    } catch (err: any) {
      console.error('[LoginScreen] Sign in error:', err);
      setError(err.message || 'Sign in failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('[LoginScreen] Creating account...');
      
      // Clear any stale localStorage data
      localStorage.removeItem('grit_profile');
      localStorage.removeItem('grit_auth');
      
      // Set flag to prevent App.tsx from auto-navigating during sign-up
      sessionStorage.setItem('signup_in_progress', 'true');
      
      // 1. Sign up user - just await it without timeout
      console.log('[LoginScreen] Calling signUp...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('[LoginScreen] Sign up response - error:', signUpError);
      console.log('[LoginScreen] Sign up response - user:', authData?.user?.id);
      console.log('[LoginScreen] Sign up response - session:', authData?.session ? 'exists' : 'none');

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered') || signUpError.status === 422) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw signUpError;
      }
      
      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      // Check if user already exists (Supabase might return user even if already registered)
      if (authData.user && !authData.session) {
        console.warn('[LoginScreen] User exists but no session - email might be taken');
        throw new Error('This email is already registered. Please sign in instead.');
      }

      console.log('[LoginScreen] Account created, creating profile...');

      // 2. Create user profile
      const { data: insertedData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          company_name: companyName,
          industry: industry,
          currency: 'R',
          tax_enabled: true,
          tax_name: 'VAT',
          tax_rate: 15,
        })
        .select(); // Return the inserted row

      console.log('[LoginScreen] Insert result - error:', profileError);
      console.log('[LoginScreen] Insert result - data:', insertedData);

      if (profileError) {
        console.error('[LoginScreen] Profile creation error:', profileError);
        // If profile already exists, user might have signed up before
        if (profileError.code === '23505') {
          throw new Error('Account already exists. Please sign in instead.');
        }
        throw new Error('Failed to create profile: ' + profileError.message);
      }

      console.log('[LoginScreen] Profile created successfully');
      
      // Verify profile was created before navigating
      const { data: verifyArray, error: verifyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id);
      
      const verifyProfile = verifyArray && verifyArray.length > 0 ? verifyArray[0] : null;
      
      if (verifyError || !verifyProfile) {
        console.error('[LoginScreen] Profile verification failed:', verifyError);
        throw new Error('Profile was not created properly. Please try again.');
      }
      
      console.log('[LoginScreen] Sign up successful, profile verified:', verifyProfile);
      
      // Wait for AuthContext to load the profile (up to 3 seconds)
      let attempts = 0;
      const checkAuthProfile = setInterval(async () => {
        attempts++;
        // Check if AuthContext has loaded the profile by re-fetching
        const { data: profileCheckArray } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id);
        
        const profileCheck = profileCheckArray && profileCheckArray.length > 0 ? profileCheckArray[0] : null;
        
        if (profileCheck || attempts > 10) {
          clearInterval(checkAuthProfile);
          if (profileCheck) {
            console.log('[LoginScreen] Profile confirmed in AuthContext, navigating to chat');
          } else {
            console.warn('[LoginScreen] Profile check timed out, navigating anyway');
          }
          
          // Clear the sign-up flag before navigating
          sessionStorage.removeItem('signup_in_progress');
          
          setIsLoading(false);
          navigate('/chat');
        }
      }, 300);
    } catch (err: any) {
      console.error('[LoginScreen] Sign up error:', err);
      
      // Clear the sign-up flag on error
      sessionStorage.removeItem('signup_in_progress');
      
      // Provide user-friendly error messages
      let errorMessage = err.message || 'Sign up failed. Please try again.';
      
      // Detect common issues
      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        errorMessage = 'This email is already registered. Please sign in instead or use a different email.';
      } else if (errorMessage.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorMessage.includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-grit-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tighter text-grit-primary bg-grit-dark px-6 py-3 inline-block mb-8 transform -rotate-2">
              gritDocs
            </h1>
          </div>

          <div className="bg-white border-4 border-grit-dark shadow-grit-lg p-8 space-y-6">
            <Button 
              onClick={() => setMode('signup')} 
              className="w-full bg-grit-primary border-2 border-grit-dark text-grit-dark font-bold py-6 text-xl shadow-grit-sm hover:translate-y-[-2px] hover:shadow-grit-md transition-all"
            >
              Create Account
            </Button>
            
            <Button 
              onClick={() => setMode('signin')} 
              className="w-full bg-white border-2 border-grit-dark text-grit-dark font-bold py-6 text-xl shadow-grit-sm hover:translate-y-[-2px] hover:shadow-grit-md transition-all"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'signin') {
    return (
      <div className="min-h-screen bg-grit-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tighter text-grit-primary bg-grit-dark px-6 py-3 inline-block mb-4">
              gritDocs
            </h1>
            <p className="text-xl text-grit-dark font-medium">Sign in to your account</p>
          </div>

          <div className="bg-white border-4 border-grit-dark shadow-grit-lg p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-500 p-4 text-red-700 font-medium">
                {error}
              </div>
            )}

            <Input 
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Input 
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <div className="space-y-3">
              <Button 
                onClick={handleSignIn}
                disabled={isLoading || !email || !password}
                className="w-full"
                icon={isLoading ? <Loader2 className="animate-spin" /> : undefined}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <button 
                onClick={() => setMode('menu')}
                disabled={isLoading}
                className="w-full text-center text-sm text-gray-600 hover:text-grit-dark font-medium"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className="min-h-screen bg-grit-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tighter text-grit-primary bg-grit-dark px-6 py-3 inline-block mb-4">
              gritDocs
            </h1>
            <p className="text-xl text-grit-dark font-medium">Create your account</p>
          </div>

          <div className="bg-white border-4 border-grit-dark shadow-grit-lg p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-500 p-4 space-y-2">
                <p className="text-red-700 font-medium">{error}</p>
                {error.includes('already registered') && (
                  <button 
                    onClick={() => {
                      setError('');
                      setMode('signin');
                    }}
                    className="text-sm text-red-600 hover:text-red-800 underline font-bold"
                  >
                    Click here to sign in instead →
                  </button>
                )}
              </div>
            )}

            <Input 
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />

            <Input 
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
            />

            <div className="w-full">
              <label className="block text-grit-dark font-bold mb-1 text-sm uppercase tracking-wider">Industry</label>
              <select 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-grit-white border-2 border-grit-dark p-3 focus:outline-none focus:ring-2 focus:ring-grit-primary transition-all"
                disabled={isLoading}
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <Input 
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Input 
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <div className="space-y-3">
              <Button 
                onClick={handleSignUp}
                disabled={isLoading || !email || !password || !fullName || !companyName}
                className="w-full"
                icon={isLoading ? <Loader2 className="animate-spin" /> : undefined}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <button 
                onClick={() => setMode('menu')}
                disabled={isLoading}
                className="w-full text-center text-sm text-gray-600 hover:text-grit-dark font-medium"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoginScreen;
