import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserProfile, DocumentData, Client, DocType, TemplateBlock } from './types';
import { Menu, Plus, Settings as SettingsIcon, LogOut, Moon, Sun, Loader } from 'lucide-react';
import { PLUMBING_TEMPLATES } from './services/plumbingData';
import { getIndustryTemplates, getIndustryExampleInvoice } from './services/industryData';
import { AuthProvider, useAuth } from './context/AuthContext';
import supabaseClient from './services/supabaseClient';
import { useDocuments } from './hooks/useDocuments';
import { useClients } from './hooks/useClients';
import { useTemplates } from './hooks/useTemplates';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DocumentCreationWizard } from './components/DocumentCreationWizard';
import { ContractType } from './types';
import { getClausesForContractType } from './services/clauseLibrary';

// Lazy Load Screens for Performance
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const ChatScreen = lazy(() => import('./screens/ChatScreenConversational'));
const CanvasScreen = lazy(() => import('./screens/CanvasScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const ClientsScreen = lazy(() => import('./screens/ClientsScreen'));
const DocumentsScreen = lazy(() => import('./screens/DocumentsScreen'));
const PublicInvoiceView = lazy(() => import('./screens/PublicInvoiceView'));

// Loading Component
const PageLoader = () => (
  <div className="h-full flex items-center justify-center p-8">
    <Loader className="animate-spin text-grit-primary" size={32} />
  </div>
);

// Smart Defaults
const DETECTED_CURRENCY = new Intl.NumberFormat().resolvedOptions().currency === 'EUR' ? '€' : 
                          new Intl.NumberFormat().resolvedOptions().currency === 'GBP' ? '£' : '$';

const INITIAL_PROFILE: UserProfile = {
  fullName: "Guest User",
  email: "guest@gritdocs.com",
  companyName: "My Business",
  jurisdiction: "",
  currency: DETECTED_CURRENCY,
  taxEnabled: false,
  taxName: 'Tax',
  taxRate: 0
};

// Helper for local storage
const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return fallback;
};

// Haptic Helper
export const triggerHaptic = (type: 'success' | 'light' | 'heavy') => {
  if (navigator.vibrate) {
    if (type === 'success') navigator.vibrate([50, 50, 50]);
    if (type === 'light') navigator.vibrate(10);
    if (type === 'heavy') navigator.vibrate(50);
  }
};

const Layout: React.FC<{ 
  children: React.ReactNode; 
  onSignOut: () => void;
  onShowWizard: () => void;
}> = ({ children, onSignOut, onShowWizard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Night Mode / Admin Mode Logic
  useEffect(() => {
    const hour = new Date().getHours();
    const isEvening = hour > 18 || hour < 6;
    const isSettings = location.pathname === '/settings' || location.pathname === '/documents';
    
    if (isEvening || isSettings) {
      setIsAdminMode(true);
      document.body.classList.add('admin-mode');
    } else {
      setIsAdminMode(false);
      document.body.classList.remove('admin-mode');
    }
  }, [location]);

  // Header
  const Header = () => (
    <div className={`h-16 border-b-2 border-grit-dark flex items-center justify-between px-4 sticky top-0 z-50 shadow-grit-sm transition-colors duration-500 ${isAdminMode ? 'bg-[#E1D8CE]' : 'bg-grit-white'}`}>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-black/5 border-2 border-transparent hover:border-grit-dark transition-all">
        <Menu size={28} className="text-grit-dark" />
      </button>
      
      <h1 onClick={() => navigate('/')} className="text-2xl font-bold tracking-tighter text-grit-primary bg-grit-dark px-3 py-1 cursor-pointer transform hover:-rotate-1 transition-transform">
        gritDocs
      </h1>

      <div className="flex gap-2">
        <button onClick={onShowWizard} className="p-2 bg-grit-primary border-2 border-grit-dark shadow-grit-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all" title="Create New Document">
          <Plus size={24} className="text-grit-dark" />
        </button>
      </div>
    </div>
  );

  // Overlay Menu
  const MenuOverlay = () => (
    <div className={`fixed inset-0 z-[60] bg-grit-dark/90 backdrop-blur-sm transition-opacity duration-200 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-grit-white w-72 h-full border-r-2 border-grit-dark p-6 flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
           <h2 className="font-bold text-xl">Menu</h2>
           <button onClick={() => setIsMenuOpen(false)}><Plus size={24} className="rotate-45"/></button>
        </div>
        
        <nav className="flex flex-col gap-4">
          <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="text-left font-bold text-lg hover:text-grit-primary p-2 border-b border-gray-100">Dashboard</button>
          <button onClick={() => { navigate('/chat'); setIsMenuOpen(false); }} className="text-left font-bold text-lg hover:text-grit-primary p-2 border-b border-gray-100">AI Chat</button>
          <button onClick={() => { setIsMenuOpen(false); onShowWizard(); }} className="text-left font-bold text-lg hover:text-grit-primary p-2 border-b border-gray-100">Create Document</button>
          <button onClick={() => { navigate('/documents'); setIsMenuOpen(false); }} className="text-left font-bold text-lg hover:text-grit-primary p-2 border-b border-gray-100">Documents</button>
          <button onClick={() => { navigate('/clients'); setIsMenuOpen(false); }} className="text-left font-bold text-lg hover:text-grit-primary p-2 border-b border-gray-100">Clients</button>
          <button onClick={() => { navigate('/settings'); setIsMenuOpen(false); }} className="text-left font-bold text-lg hover:text-grit-primary p-2 border-b border-gray-100">Settings & Profile</button>
        </nav>

        <div className="mt-auto pt-8 border-t-2 border-grit-dark">
           <button 
             onClick={() => {
               console.log('[Menu] Sign out button clicked');
               setIsMenuOpen(false);
               onSignOut();
             }} 
             className="flex items-center gap-2 font-bold text-red-500 w-full p-2 hover:bg-red-50"
           >
             <LogOut size={20}/> Sign Out
           </button>
        </div>
      </div>
      <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
    </div>
  );

  return (
    <div className={`min-h-screen font-sans text-grit-dark flex flex-col transition-colors duration-500 ${isAdminMode ? 'bg-grit-warm' : 'bg-grit-bg'}`}>
      <MenuOverlay />
      <Header />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  // Remove localStorage-based templates - use Supabase instead
  const [itemUsage, setItemUsage] = useState<Record<string, number>>(() => loadState('grit_item_usage', {}));
  const [currentDoc, setCurrentDoc] = useState<DocumentData | null>(null);

  useEffect(() => localStorage.setItem('grit_item_usage', JSON.stringify(itemUsage)), [itemUsage]);

  const handleDocumentCreated = (doc: DocumentData) => {
    setCurrentDoc(doc);
    triggerHaptic('success');
  };

  const handleDuplicateLast = (documents: DocumentData[]) => {
      if (documents.length > 0) {
          const lastDoc = documents[0];
          const clonedDoc = {
              ...lastDoc,
              id: Date.now().toString(),
              status: 'Draft' as const,
              date: new Date().toLocaleDateString(),
              title: `${lastDoc.title} (Copy)`
          };
          setCurrentDoc(clonedDoc);
          return true;
      }
      return false;
  };

  const trackItemUsage = (description: string) => {
    const key = description.trim();
    if (!key) return;
    setItemUsage(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  // Removed handleLogin and handleLogout - AuthContext handles all authentication

  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes 
          currentDoc={currentDoc}
          setCurrentDoc={setCurrentDoc}
          handleDocumentCreated={handleDocumentCreated}
          handleDuplicateLast={handleDuplicateLast}
          itemUsage={itemUsage}
          trackItemUsage={trackItemUsage}
        />
      </AuthProvider>
    </HashRouter>
  );
}

// Inner router component that uses Auth context
const AppRoutes: React.FC<any> = (props) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, profile, signOut } = useAuth();
  
  // Document creation wizard state
  const [showWizard, setShowWizard] = useState(false);
  
  // CRITICAL: All hooks must be called unconditionally, in the same order every render
  const { documents, setDocuments, saveDocument, deleteDocument } = useDocuments(
    loadState('grit_documents', [])
  );
  const { clients, setClients, saveClient, deleteClient } = useClients(
    loadState('grit_clients', [])
  );
  
  // Load templates from Supabase
  const { templates, setTemplates, saveTemplate, deleteTemplate, isLoading: templatesLoading } = useTemplates(
    getIndustryTemplates(profile?.industry || 'Web Development')
  );
  
  console.log('[AppRoutes] Render:', { isAuthenticated, isLoading, path: window.location.hash });
  console.log('[AppRoutes] Templates:', templates.length, 'templates loaded');

  // Listen for industry login to seed data
  useEffect(() => {
    if (profile?.industry && documents.length === 0) {
       // Check if we already have the demo invoice
       const hasDemo = documents.some(d => d.id === 'DEMO-5PAGE-001');
       if (!hasDemo) {
         const demoInvoice = getIndustryExampleInvoice(profile.industry, profile.companyName);
         saveDocument(demoInvoice);
         console.log('Seeded Demo Invoice for', profile.industry);
       }
    }
  }, [profile, documents.length]);

  useEffect(() => {
    localStorage.setItem('grit_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('grit_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    console.log('[App] Navigation Effect:', { isLoading, isAuthenticated, hash: window.location.hash });
    
    if (isLoading) {
      console.log('[App] Still loading, skipping navigation');
      return;
    }
    
    // Allow access to public routes like /view/:docId
    const currentPath = window.location.hash.replace('#', '') || '/';
    const publicRoutes = ['/login', '/view'];
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
    
    console.log('[App] Path check:', { currentPath, isPublicRoute, isAuthenticated });
    
    if (!isAuthenticated && !isPublicRoute) {
      console.log('[App] User not authenticated, redirecting to login from:', currentPath);
      navigate('/login', { replace: true });
    } else if (isAuthenticated && (currentPath === '/login' || currentPath === '/')) {
      // Don't auto-redirect if sign-up is in progress
      const signupInProgress = sessionStorage.getItem('signup_in_progress');
      if (signupInProgress) {
        console.log('[App] Sign-up in progress, skipping auto-redirect');
        return;
      }
      console.log('[App] User authenticated:', user?.email, '- redirecting to chat');
      navigate('/chat', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Use profile from AuthContext - single source of truth
  console.log('[App] Using profile from AuthContext:', profile);

  // Show loading screen AFTER all hooks are called
  if (isLoading) {
    console.log('[App] Rendering loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-grit-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-grit-primary" size={48} />
          <p className="text-grit-dark font-bold">Loading your session...</p>
          <p className="text-grit-dark text-sm text-center max-w-xs">Checking authentication status...</p>
          <button 
            onClick={() => window.location.href = '/#/login'}
            className="mt-4 text-sm text-grit-secondary underline hover:text-grit-primary"
          >
            Skip to Login
          </button>
        </div>
      </div>
    );
  }
  
  const handleSaveDocument = async (doc: DocumentData) => {
    try {
      await saveDocument(doc);
    } catch (err) {
      console.error('Failed to save document:', err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleSignOut = async () => {
    console.log('[App] Initiating sign out...');
    // signOut() in AuthContext will handle everything including navigation
    await signOut();
  };

  const handleWizardComplete = (client: Client, docType: DocType, contractType?: ContractType) => {
    console.log('[App] Wizard completed:', { client, docType, contractType });
    
    // Get appropriate clauses for contract type
    const contractClauses = docType === DocType.CONTRACT && contractType 
      ? getClausesForContractType(contractType)
      : undefined;
    
    console.log('[App] Generated clauses:', contractClauses?.length || 0, 'clauses');
    
    // Create new document with selected client and type
    const newDoc: DocumentData = {
      id: Date.now().toString(),
      type: docType,
      contractType: contractType,
      status: 'Draft',
      title: docType === DocType.INVOICE ? 'New Invoice' : `New ${contractType || 'Contract'}`,
      client: client,
      date: new Date().toLocaleDateString(),
      items: [],
      clauses: contractClauses,
      currency: profile?.currency || '$',
      subtotal: 0,
      taxTotal: 0,
      total: 0,
      theme: docType === DocType.INVOICE ? 'swiss' : undefined,
      contractTheme: docType === DocType.CONTRACT ? 'legal' : undefined
    };
    
    props.setCurrentDoc(newDoc);
    setShowWizard(false);
    navigate('/canvas');
    triggerHaptic('success');
  };

  return (
    <>
      <Layout 
        onSignOut={handleSignOut}
        onShowWizard={() => setShowWizard(true)}
      >
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            
            <Route path="/view/:docId" element={<PublicInvoiceView documents={documents} />} />
            
            <Route path="/" element={
               !isAuthenticated 
                  ? <Navigate to="/login" replace /> 
                  : documents.length === 0 
                     ? <Navigate to="/chat" replace /> 
                     : <DashboardScreen documents={documents} clients={clients} profile={profile || INITIAL_PROFILE} onCloneLast={() => props.handleDuplicateLast(documents)} /> 
            } />
            
            <Route path="/dashboard" element={
               !isAuthenticated 
                  ? <Navigate to="/login" replace />
                  : documents.length === 0 
                     ? <Navigate to="/chat" replace /> 
                     : <DashboardScreen documents={documents} clients={clients} profile={profile || INITIAL_PROFILE} onCloneLast={() => props.handleDuplicateLast(documents)} /> 
            } />
            
            <Route path="/chat" element={
               !isAuthenticated 
                  ? <Navigate to="/login" replace />
                  : <ChatScreen 
                       clients={clients} 
                       setClients={setClients} 
                       profile={profile || INITIAL_PROFILE} 
                       onDocGenerated={props.handleDocumentCreated} 
                       templates={templates} 
                       setTemplates={setTemplates}
                    /> 
            } />
            
            <Route path="/canvas" element={
               !isAuthenticated 
                  ? <Navigate to="/login" replace />
                  : <CanvasScreen 
                       doc={props.currentDoc} 
                       profile={profile || INITIAL_PROFILE} 
                       updateDoc={props.setCurrentDoc} 
                       templates={templates} 
                       setTemplates={setTemplates}
                       onSave={handleSaveDocument} 
                       itemUsage={props.itemUsage}
                       onTrackItemUsage={props.trackItemUsage}
                       clients={clients}
                       setClients={setClients}
                    /> 
            } />

            <Route path="/documents" element={!isAuthenticated ? <Navigate to="/login" replace /> : <DocumentsScreen documents={documents} openDocument={props.setCurrentDoc} />} />
            <Route path="/clients" element={!isAuthenticated ? <Navigate to="/login" replace /> : <ClientsScreen clients={clients} documents={documents} saveClient={saveClient} deleteClient={deleteClient} />} />
            <Route path="/settings" element={!isAuthenticated ? <Navigate to="/login" replace /> : <SettingsScreen clients={clients} setClients={setClients} templates={templates} setTemplates={setTemplates} saveClient={saveClient} deleteClient={deleteClient} />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>

    {/* Document Creation Wizard */}
    {showWizard && (
      <DocumentCreationWizard
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
        existingClients={clients}
        onAddClient={saveClient}
      />
    )}
    </>
  );
}
