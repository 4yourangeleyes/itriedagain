import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button, Input, Card } from '../components/UI';
import * as Icons from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Email and password are required');
      }

      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
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

        <Card className="bg-surface/50 backdrop-blur-md border-white/10" glow>
           <form onSubmit={handleLogin} className="space-y-6">
              <h2 className="text-xl font-bold text-text mb-6">Sign In</h2>

              <Input 
                label="EMAIL ADDRESS" 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="your@email.com"
                disabled={loading}
              />
              <Input 
                label="PASSWORD" 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />

              {error && (
                <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-4 text-base py-3" disabled={loading}>
                 {loading ? (
                   <>
                     <Icons.Loader size={16} className="mr-2 animate-spin"/>
                     SIGNING IN...
                   </>
                 ) : (
                   <>
                     <Icons.LogIn size={16} className="mr-2"/>
                     ACCESS TERMINAL
                   </>
                 )}
              </Button>
           </form>
           
           <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-3">
              <p className="text-xs font-sans font-bold text-textMuted/50">HIGH-AGENCY OPERATING SYSTEM</p>
              <button
                onClick={() => window.location.hash = '#/onboarding'}
                className="text-xs text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                CREATE NEW ORGANIZATION →
              </button>
           </div>
        </Card>
      </div>
    </div>
  );
}
