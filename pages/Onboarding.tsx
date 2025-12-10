import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button, Input, Card } from '../components/UI';
import * as Icons from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'org-or-signin' | 'create-org' | 'signin'>('org-or-signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Org creation state
  const [orgName, setOrgName] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderEmail, setFounderEmail] = useState('');
  const [founderPassword, setFounderPassword] = useState('');

  // Sign in state
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!orgName.trim() || !founderName.trim() || !founderEmail.trim() || !founderPassword.trim()) {
        throw new Error('All fields are required');
      }

      if (founderPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // 1. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          hierarchy_levels: ['FOUNDER', 'MANAGER', 'LEAD', 'MEMBER'],
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: founderEmail.trim(),
        password: founderPassword,
      });

      if (authError) throw authError;

      // 3. Create user profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          org_id: orgData.id,
          username: founderEmail.split('@')[0],
          full_name: founderName,
          email: founderEmail,
          password_hash: '', // Auth handled by Supabase
          role: 'FOUNDER',
          hierarchy_level: 0,
        });

      if (userError) throw userError;

      // 4. Auto sign in
      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: founderEmail,
        password: founderPassword,
      });

      if (signinError) throw signinError;

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!signinEmail.trim() || !signinPassword.trim()) {
        throw new Error('Email and password are required');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: signinEmail.trim(),
        password: signinPassword,
      });

      if (signInError) throw signInError;

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse animation-delay-4000" />

      <div className="w-full max-w-md relative z-10 animate-slide-in">
        <div className="text-center mb-12 transition-transform duration-500">
          <div className="w-24 h-24 mx-auto bg-surface border-2 border-primary/20 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/10">
            <Icons.Binary size={48} className="text-primary animate-pulse-glow" />
          </div>
          <h1 className="text-7xl font-display font-bold text-text tracking-wider mb-2">lock-in</h1>
          <p className="font-sans text-textMuted tracking-widest text-sm font-bold bg-surface inline-block px-4 py-1 rounded-md border border-white/10">SYSTEM OS v4.0</p>
        </div>

        {step === 'org-or-signin' && (
          <Card className="bg-surface/50 backdrop-blur-md border-white/10" glow>
            <div className="space-y-4">
              <Button 
                onClick={() => setStep('create-org')} 
                className="w-full"
                disabled={loading}
              >
                <Icons.Plus size={16} className="mr-2" />
                Create New Organization
              </Button>
              <Button 
                onClick={() => setStep('signin')} 
                variant="secondary"
                className="w-full"
                disabled={loading}
              >
                <Icons.LogIn size={16} className="mr-2" />
                Sign In to Existing Organization
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs font-sans font-bold text-textMuted/50">HIGH-AGENCY OPERATING SYSTEM</p>
            </div>
          </Card>
        )}

        {step === 'create-org' && (
          <Card className="bg-surface/50 backdrop-blur-md border-white/10" glow>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <h2 className="text-xl font-bold text-text mb-6">Create Organization</h2>

              <Input
                label="Organization Name"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Enter organization name"
                disabled={loading}
              />

              <Input
                label="Founder Full Name"
                value={founderName}
                onChange={e => setFounderName(e.target.value)}
                placeholder="Your full name"
                disabled={loading}
              />

              <Input
                label="Email Address"
                type="email"
                value={founderEmail}
                onChange={e => setFounderEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                value={founderPassword}
                onChange={e => setFounderPassword(e.target.value)}
                placeholder="At least 8 characters"
                disabled={loading}
              />

              {error && (
                <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icons.Loader size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icons.Plus size={16} className="mr-2" />
                    Create Organization
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('org-or-signin');
                  setError('');
                }}
                className="w-full text-sm text-textMuted hover:text-text transition-colors"
                disabled={loading}
              >
                Back
              </button>
            </form>
          </Card>
        )}

        {step === 'signin' && (
          <Card className="bg-surface/50 backdrop-blur-md border-white/10" glow>
            <form onSubmit={handleSignIn} className="space-y-4">
              <h2 className="text-xl font-bold text-text mb-6">Sign In</h2>

              <Input
                label="Email Address"
                type="email"
                value={signinEmail}
                onChange={e => setSigninEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                value={signinPassword}
                onChange={e => setSigninPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />

              {error && (
                <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icons.Loader size={16} className="mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icons.LogIn size={16} className="mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('org-or-signin');
                  setError('');
                }}
                className="w-full text-sm text-textMuted hover:text-text transition-colors"
                disabled={loading}
              >
                Back
              </button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
