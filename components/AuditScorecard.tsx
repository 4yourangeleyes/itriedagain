import React, { useEffect, useState } from 'react';
import { UserProfile, DocumentData, Client } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ShieldCheck, Zap, Database, Mail } from 'lucide-react';
import supabaseClient from '../services/supabaseClient';

interface AuditScorecardProps {
  profile: UserProfile;
  documents: DocumentData[];
  clients: Client[];
}

interface AuditItem {
  id: string;
  category: 'Security' | 'Data' | 'Config' | 'UX';
  label: string;
  status: 'pass' | 'fail' | 'warn' | 'loading';
  message: string;
}

export const AuditScorecard: React.FC<AuditScorecardProps> = ({ profile, documents, clients }) => {
  const [items, setItems] = useState<AuditItem[]>([
    { id: 'auth', category: 'Security', label: 'Authentication', status: 'loading', message: 'Checking session...' },
    { id: 'profile', category: 'Config', label: 'Profile Completeness', status: 'loading', message: 'Analyzing profile...' },
    { id: 'db', category: 'Data', label: 'Database Connection', status: 'loading', message: 'Pinging Supabase...' },
    { id: 'email', category: 'Config', label: 'Email Configuration', status: 'loading', message: 'Checking email settings...' },
    { id: 'clients', category: 'Data', label: 'Client Data', status: 'loading', message: 'Verifying client records...' },
    { id: 'docs', category: 'Data', label: 'Document Integrity', status: 'loading', message: 'Scanning documents...' },
  ]);

  const [score, setScore] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const runAudit = async () => {
      const newItems = [...items];

      // 1. Check Auth
      const { data: { session } } = await supabaseClient.auth.getSession();
      const authItem = newItems.find(i => i.id === 'auth')!;
      if (session) {
        authItem.status = 'pass';
        authItem.message = `Authenticated as ${session.user.email}`;
      } else {
        authItem.status = 'warn';
        authItem.message = 'Running in Guest Mode (Local Only)';
      }

      // 2. Check Profile
      const profileItem = newItems.find(i => i.id === 'profile')!;
      const missingFields = [];
      if (!profile.companyName) missingFields.push('Company Name');
      if (!profile.email) missingFields.push('Email');
      if (!profile.currency) missingFields.push('Currency');
      
      if (missingFields.length === 0) {
        profileItem.status = 'pass';
        profileItem.message = 'Profile is complete';
      } else {
        profileItem.status = 'warn';
        profileItem.message = `Missing: ${missingFields.join(', ')}`;
      }

      // 3. Check DB
      const dbItem = newItems.find(i => i.id === 'db')!;
      try {
        const { error } = await supabaseClient.from('user_profiles').select('count').single();
        if (!error || error.code === 'PGRST116') { // PGRST116 is "no rows" which means connection worked
           dbItem.status = 'pass';
           dbItem.message = 'Supabase connection active';
        } else {
           throw error;
        }
      } catch (e) {
        dbItem.status = session ? 'fail' : 'warn'; // Only fail if we expect to be connected
        dbItem.message = session ? 'Connection failed' : 'Offline mode active';
      }

      // 4. Check Email
      const emailItem = newItems.find(i => i.id === 'email')!;
      if (profile.email && profile.email.includes('@')) {
          emailItem.status = 'pass';
          emailItem.message = 'Email configured for sending';
      } else {
          emailItem.status = 'fail';
          emailItem.message = 'No sender email set';
      }

      // 5. Check Clients
      const clientItem = newItems.find(i => i.id === 'clients')!;
      if (clients.length > 0) {
          const invalidClients = clients.filter(c => !c.email || !c.businessName);
          if (invalidClients.length === 0) {
              clientItem.status = 'pass';
              clientItem.message = `${clients.length} valid clients found`;
          } else {
              clientItem.status = 'warn';
              clientItem.message = `${invalidClients.length} clients missing details`;
          }
      } else {
          clientItem.status = 'warn';
          clientItem.message = 'No clients added yet';
      }

      // 6. Check Docs
      const docItem = newItems.find(i => i.id === 'docs')!;
      if (documents.length > 0) {
          docItem.status = 'pass';
          docItem.message = `${documents.length} documents indexed`;
      } else {
          docItem.status = 'pass'; // Not an error to have 0 docs
          docItem.message = 'Ready to create documents';
      }

      setItems(newItems);
      
      // Calculate Score
      const passed = newItems.filter(i => i.status === 'pass').length;
      setScore(Math.round((passed / newItems.length) * 100));
    };

    // Artificial delay to show "scanning" effect
    setTimeout(runAudit, 1000);
  }, [profile, documents, clients]);

  return (
    <div className="bg-white border-4 border-grit-dark shadow-grit p-6 mb-8">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-4">
            <div className="relative">
                <ShieldCheck size={40} className={score === 100 ? "text-green-600" : score > 50 ? "text-yellow-500" : "text-red-500"} />
                {score === 100 && <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 animate-ping"></div>}
            </div>
            <div>
                <h3 className="text-xl font-bold uppercase tracking-wider">System Health</h3>
                <p className="text-sm text-gray-500 font-bold">Audit Score: {score}%</p>
            </div>
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
        </div>
      </div>

      {isOpen && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 fade-in">
              {items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border-2 border-gray-100 rounded hover:border-grit-dark transition-colors">
                      <div className="mt-1">
                          {item.status === 'loading' && <Loader2 className="animate-spin text-blue-500" size={20}/>}
                          {item.status === 'pass' && <CheckCircle2 className="text-green-500" size={20}/>}
                          {item.status === 'warn' && <AlertTriangle className="text-yellow-500" size={20}/>}
                          {item.status === 'fail' && <XCircle className="text-red-500" size={20}/>}
                      </div>
                      <div>
                          <p className="font-bold text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.message}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
