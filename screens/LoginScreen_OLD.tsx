import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loader2, Truck } from 'lucide-react';

const INDUSTRIES = [
  { id: 'plumbing', label: 'Plumbing', icon: <Truck size={32} />, color: 'bg-blue-50' },
  { id: 'electrical', label: 'Electrical', icon: <Truck size={32} />, color: 'bg-yellow-50' },
  { id: 'hvac', label: 'HVAC', icon: <Truck size={32} />, color: 'bg-green-50' },
];

const LoginScreen: React.FC = () => {









































































































































































































































































































































  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [step, setStep] = useState<'industry' | 'details' | 'auth'>('industry');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestSignupData, setGuestSignupData] = useState<any>(null);
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false);

  React.useEffect(() => {
    // Check if there's guest signup data from a previous guest session
    const saved = localStorage.getItem('grit_guest_signup_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGuestSignupData(data);
        setBusinessName(data.businessName || '');
      } catch (e) {
        console.error('Failed to parse guest signup data', e);
      }
    }
  }, []);

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && businessName) {
      setStep('auth');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[LoginScreen] Attempting sign in with email:', email);
      
      // Sign in with Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[LoginScreen] Sign in error:', signInError);
        throw signInError;
      }

      if (!authData.user) {
        throw new Error('No user returned from sign in');
      }

      console.log('[LoginScreen] User signed in:', authData.user.id);

      // Fetch user profile
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('[LoginScreen] Error fetching profile:', profileError);
        } else if (profileData) {
          console.log('[LoginScreen] Profile loaded during sign in');
        }
      } catch (err) {
        console.warn('[LoginScreen] Error fetching profile after sign in:', err);
      }

      // Set loading false BEFORE navigation to prevent stuck state
      setIsLoading(false);
      
      // Navigate to dashboard on successful sign in
      console.log('[LoginScreen] Sign in complete, navigating to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[LoginScreen] Sign in error:', err);
      
      let errorMessage = err.message || 'Failed to sign in';
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check and try again.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before signing in. Check your inbox for the verification link.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    if (authMode === 'signin') {
      return handleSignIn(e);
    }

    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[LoginScreen] Attempting signup with email:', email);
      
      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company_name: businessName,
            industry: selectedIndustry,
          }
        }
      });

      if (signUpError) {
        console.error('[LoginScreen] Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('[LoginScreen] User created:', authData.user.id);

      if (authData.user) {
        // Create user profile in Supabase
        try {
          console.log('[LoginScreen] Creating user profile...');
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: authData.user.id,
                full_name: name,
                email: email,
                company_name: businessName,
                industry: selectedIndustry,
                currency: '$',
                tax_enabled: false,
                tax_rate: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ]);

          if (profileError) {
            console.error('[LoginScreen] Profile creation error:', profileError);
            if (profileError.code === 'PGRST116') {
              console.error('RLS policy violation - check user_profiles table policies');
            }
          } else {
            console.log('[LoginScreen] User profile created successfully');
          }
        } catch (profileErr) {
          console.error('[LoginScreen] Profile storage error:', profileErr);
        }

        // Clear guest data
        localStorage.removeItem('grit_guest_signup_data');
        
        // Set loading false BEFORE navigation to prevent stuck state
        setIsLoading(false);
        
        // Navigate to dashboard
        console.log('[LoginScreen] Signup complete, navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('[LoginScreen] Signup error:', err);
      
      let errorMessage = err.message || 'Failed to create account';
      
      // Parse Supabase error messages
      if (errorMessage.includes('Invalid API key')) {
        errorMessage = 'Supabase configuration error: Invalid API key. Please check your Supabase setup. See SUPABASE_TROUBLESHOOTING.md for help.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (errorMessage.includes('password')) {
        errorMessage = 'Password must be at least 8 characters.';
      } else if (errorMessage.includes('invalid_grant') || errorMessage.includes('invalid')) {
        errorMessage = 'Invalid email format. Please check and try again.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-grit-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-grit-white border-2 border-grit-dark shadow-grit p-8">
        <div className="flex justify-center mb-8">
            <div className="bg-grit-dark text-grit-primary p-4 inline-block transform -rotate-2">
                <h1 className="text-4xl font-bold tracking-tighter">gritDocs</h1>
            </div>
        </div>
        
        {authMode === 'signin' ? (
            <form onSubmit={handleAuthSubmit} className="space-y-6 animate-in slide-in-from-right duration-300 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-gray-500 text-sm">Sign in to your account</p>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
                    <p className="text-sm font-bold text-red-900">{error}</p>
                  </div>
                )}

                <div className="border-2 border-grit-primary bg-white p-3 rounded">
                    <Input 
                        label="Email" 
                        type="email"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="you@example.com"
                        disabled={isLoading}
                    />
                </div>

                <div className="border-2 border-grit-primary bg-white p-3 rounded">
                    <Input 
                        label="Password" 
                        type="password"
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                </div>
                
                <Button 
                    type="submit" 
                    className="w-full text-xl py-4 shadow-lg"
                    disabled={isLoading}
                    icon={isLoading ? <Loader2 className="animate-spin" /> : undefined}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                
                <button 
                    type="button"
                    onClick={() => {
                        setAuthMode('signup');
                        setStep('industry');
                        setEmail('');
                        setPassword('');
                        setError('');
                    }}
                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-grit-dark"
                    disabled={isLoading}
                >
                    Don't have an account? Sign up
                </button>

                <button 
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-grit-dark"
                    disabled={isLoading}
                >
                    Continue as Guest
                </button>
            </form>
        ) : step === 'industry' ? (
            <div className="animate-in slide-in-from-right duration-300">
                <h2 className="text-3xl font-bold mb-2 text-center">What do you do?</h2>
                <p className="text-center text-gray-500 mb-8">We'll set up your templates automatically.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {INDUSTRIES.map(ind => (
                        <button 
                            key={ind.id}
                            onClick={() => handleIndustrySelect(ind.id)}
                            className={`flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-grit-dark hover:shadow-grit transition-all rounded-lg gap-3 ${ind.color}`}
                        >
                            {ind.icon}
                            <span className="font-bold text-lg">{ind.label}</span>
                        </button>
                    ))}
                     <button 
                            onClick={() => handleIndustrySelect('other')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-grit-dark hover:shadow-grit transition-all rounded-lg gap-3 bg-gray-100 text-gray-600"
                        >
                            <Truck size={32}/>
                            <span className="font-bold text-lg">Other</span>
                        </button>
                </div>
                 <button 
                    onClick={handleGuestLogin}
                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-grit-dark mt-8 underline"
                >
                    Skip Setup (Guest Mode)
                </button>
            </div>
        ) : step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-in slide-in-from-right duration-300 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Almost done.</h2>
                    <p className="text-gray-500">I run a <span className="font-bold text-grit-dark uppercase">{selectedIndustry}</span> business...</p>
                </div>

                {guestSignupData && (
                  <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded">
                    <p className="text-sm font-bold text-blue-900 mb-2">✓ We found your invoice details!</p>
                    <p className="text-xs text-blue-800">Invoice: <strong>{guestSignupData.invoiceTitle}</strong> for <strong>${guestSignupData.invoiceAmount}</strong></p>
                  </div>
                )}

                <div className="bg-gray-50 p-6 border-2 border-dashed border-gray-300">
                    <p className="text-xl font-draft leading-relaxed">
                        My name is <input 
                            value={name} onChange={e => setName(e.target.value)} 
                            placeholder="Your Name" 
                            className="bg-transparent border-b-2 border-grit-primary focus:outline-none font-bold text-grit-dark placeholder-gray-400 w-40"
                            autoFocus
                        /> and I run a business called <input 
                            value={businessName} onChange={e => setBusinessName(e.target.value)} 
                            placeholder="Business Name" 
                            className="bg-transparent border-b-2 border-grit-primary focus:outline-none font-bold text-grit-dark placeholder-gray-400 w-48"
                        />.
                    </p>
                </div>
                
                <Button type="submit" className="w-full text-xl py-4 shadow-lg">
                    Next
                </Button>
                
                 <button 
                    type="button"
                    onClick={() => setStep('industry')}
                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-grit-dark"
                >
                    Back
                </button>
            </form>
        ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-6 animate-in slide-in-from-right duration-300 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Create Your Account</h2>
                    <p className="text-gray-500 text-sm">One more step to get started</p>
                </div>

                {showEmailVerificationMessage && (
                  <div className="bg-green-50 border-2 border-green-200 p-4 rounded animate-pulse">
                    <p className="text-sm font-bold text-green-900 mb-2">✅ Account Created!</p>
                    <p className="text-xs text-green-800">We've sent a verification email to <strong>{email}</strong></p>
                    <p className="text-xs text-green-800 mt-2">Please check your inbox and click the verification link.</p>
                    <p className="text-xs text-green-700 mt-3 font-semibold">Redirecting to dashboard in 5 seconds...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
                    <p className="text-sm font-bold text-red-900">{error}</p>
                  </div>
                )}

                <div className="border-2 border-grit-primary bg-white p-3 rounded">
                    <Input 
                        label="Email" 
                        type="email"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="you@example.com"
                        disabled={isLoading}
                    />
                </div>

                <div className="border-2 border-grit-primary bg-white p-3 rounded">
                    <Input 
                        label="Password" 
                        type="password"
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                </div>
                
                <Button 
                    type="submit" 
                    className="w-full text-xl py-4 shadow-lg"
                    disabled={isLoading}
                    icon={isLoading ? <Loader2 className="animate-spin" /> : undefined}
                >
                    {isLoading ? 'Creating Account...' : 'Start Invoicing'}
                </Button>
                
                 <button 
                    type="button"
                    onClick={() => {
                        setStep('details');
                        setError('');
                    }}
                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-grit-dark"
                    disabled={isLoading}
                >
                    Back
                </button>

                <div className="border-t-2 border-gray-200 pt-4">
                    <p className="text-center text-sm text-gray-500 mb-3">Already have an account?</p>
                    <button 
                        type="button"
                        onClick={() => {
                            setAuthMode('signin');
                            setEmail('');
                            setPassword('');
                            setError('');
                        }}
                        className="w-full text-center text-sm font-bold text-grit-primary hover:text-grit-dark bg-grit-dark/5 py-2 rounded border-2 border-grit-dark"
                        disabled={isLoading}
                    >
                        Sign In Instead
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
