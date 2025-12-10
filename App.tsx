import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User } from './types';
import { supabase } from './services/supabase';
import * as authService from './services/auth';
import * as Icons from 'lucide-react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

// --- Layout ---
const NavItem = ({ icon: Icon, label, path, active }: any) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      className={`group relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all w-full text-left
        ${active ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-textMuted hover:text-text'}
      `}
      title={label}
    >
      <Icon size={22} className="flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
      <span className={`font-semibold text-sm truncate ${active ? 'font-bold' : ''}`}>{label}</span>
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />}
    </button>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { icon: Icons.LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: Icons.FolderGit2, label: 'Projects', path: '/projects' },
    { icon: Icons.CalendarDays, label: 'Schedule', path: '/schedule' },
    { icon: Icons.Clock, label: 'Time Clock', path: '/clock' },
    { icon: Icons.MessageSquare, label: 'Messages', path: '/chat' },
    { icon: Icons.Users, label: 'Team', path: '/people' },
  ];

  if (user?.hierarchyLevel <= 1) { // Founder or Manager
    navItems.push(
      { icon: Icons.Users, label: 'Team Management', path: '/team-management' },
      { icon: Icons.Settings, label: 'Settings', path: '/settings' }
    );
  }
  
  const SidebarContent = () => (
    <div className="w-64 flex flex-col p-4 bg-surface/50 md:bg-surface border-r border-white/10 h-full">
      <div className="mb-8 flex items-center gap-3 px-2 pt-4">
         <div className="w-10 h-10 rounded-lg bg-primary/10 border-2 border-primary/50 flex items-center justify-center animate-pulse-glow">
            <Icons.Binary size={24} className="text-primary"/>
         </div>
         <h1 className="font-display font-bold text-2xl tracking-wider text-text">lock-in</h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} active={location.pathname === item.path} />
        ))}
      </nav>

      <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-display font-bold text-lg border-2 border-secondary/50">
          {user?.username.substring(0,2).toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
           <p className="font-bold text-sm truncate text-text">{user?.fullName}</p>
           <p className="text-xs text-textMuted font-mono">@{user?.username}</p>
        </div>
        <button onClick={logout} className="text-textMuted hover:text-danger transition-colors p-2 rounded-md">
          <Icons.LogOut size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden text-text bg-background font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-white/10">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
            <Icons.Menu size={24} />
          </button>
          <h1 className="font-display font-bold text-xl tracking-wider text-text">lock-in</h1>
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-display font-bold text-sm border-2 border-secondary/50">
            {user?.username.substring(0,2).toUpperCase()}
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto min-h-full pb-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Pages ---
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Schedule from './pages/Schedule';
import TimeClock from './pages/TimeClock';
import ChatPage from './pages/Chat';
import People from './pages/People';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import TeamManagement from './pages/TeamManagement';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="w-screen h-screen flex items-center justify-center bg-background"><Icons.Loader className="animate-spin text-primary" size={48} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await authService.getCurrentUserProfile();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Session restore error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session) {
          const currentUser = await authService.getCurrentUserProfile();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.signIn(email, password);
      if (user) {
        setUser(user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      <HashRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/clock" element={<ProtectedRoute><TimeClock /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/team-management" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
