import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Users, FileStack, Copy, Trophy, TrendingUp } from 'lucide-react';
import { DocumentData, UserProfile, Client } from '../types';
import { AuditScorecard } from '../components/AuditScorecard';

interface DashboardScreenProps {
    documents: DocumentData[];
    clients: Client[];
    profile: UserProfile;
    onCloneLast: () => boolean;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ documents, clients, profile, onCloneLast }) => {
  const navigate = useNavigate();

  // Money Pulse Logic
  const weeklyRevenue = documents
    .filter(d => d.status === 'Paid' || d.status === 'Sent')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);
  
  // Profile Gamification Logic
  const profileFields = [profile.fullName, profile.companyName, profile.taxEnabled, profile.registrationNumber];
  const filledFields = profileFields.filter(Boolean).length;
  const profileScore = (filledFields / 4) * 100;

  const handleCloneClick = () => {
      if (onCloneLast()) {
          navigate('/canvas');
      }
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col p-4 md:p-8 max-w-6xl mx-auto overflow-y-auto">
      
      {/* System Audit Scorecard */}
      <AuditScorecard profile={profile} documents={documents} clients={clients} />

      {/* Top Widgets */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Money Pulse */}
          <div className="flex-1 bg-grit-dark text-grit-primary p-6 shadow-grit border-2 border-grit-dark">
              <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} />
                  <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Revenue Pulse</span>
              </div>
              <p className="text-4xl md:text-5xl font-mono font-bold mb-4">{profile.currency}{weeklyRevenue.toLocaleString()}</p>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-grit-primary h-full transition-all duration-1000" style={{ width: `${Math.min(weeklyRevenue / 100, 100)}%` }}></div>
              </div>
          </div>

          {/* Profile Gamification */}
          {profileScore < 100 && (
              <div className="flex-1 bg-grit-white p-6 shadow-grit border-2 border-grit-dark flex flex-col justify-between">
                  <div>
                      <div className="flex items-center gap-2 mb-2 text-grit-secondary">
                          <Trophy size={20} />
                          <span className="font-bold text-sm uppercase tracking-widest">Profile Level</span>
                      </div>
                      <p className="text-xl font-bold mb-1">Your profile is {profileScore}% Pro.</p>
                      <p className="text-sm text-gray-500">Add Tax ID/Reg No to look 100% legitimate.</p>
                  </div>
                  <button onClick={() => navigate('/settings')} className="text-left font-bold underline mt-4 hover:text-grit-primary">Complete Profile &rarr;</button>
              </div>
          )}
      </div>

      {/* Main Actions Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        
        {/* Clone Last (The Shortcut) */}
        <button 
            onClick={handleCloneClick}
            className="group bg-yellow-100 border-4 border-grit-dark flex flex-col items-center justify-center gap-4 hover:bg-yellow-200 transition-all shadow-grit active:translate-x-1 active:translate-y-1 active:shadow-none p-4"
        >
             <div className="bg-white p-4 rounded-full border-2 border-grit-dark group-hover:scale-110 transition-transform">
                <Copy className="text-grit-dark w-8 h-8" />
            </div>
            <div className="text-center">
                <span className="text-xl font-bold uppercase tracking-wider block">Clone Last Job</span>
                <span className="text-sm text-gray-500 font-bold">Bill the same client again</span>
            </div>
        </button>

        {/* Create New (Mad Libs) */}
        <button 
            onClick={() => navigate('/chat')}
            className="group bg-grit-primary border-4 border-grit-dark flex flex-col items-center justify-center gap-4 hover:brightness-110 transition-all shadow-grit active:translate-x-1 active:translate-y-1 active:shadow-none p-4"
        >
             <div className="bg-grit-dark p-4 rounded-full border-2 border-grit-white group-hover:scale-110 transition-transform">
                <FilePlus className="text-grit-primary w-8 h-8" />
            </div>
             <div className="text-center">
                <span className="text-xl font-bold uppercase tracking-wider block text-grit-dark">New Job</span>
                <span className="text-sm text-grit-dark font-bold opacity-75">Start from scratch</span>
            </div>
        </button>

        {/* Manage Docs */}
        <button 
            onClick={() => navigate('/documents')}
            className="bg-grit-white border-4 border-grit-dark flex items-center justify-center gap-4 hover:bg-gray-50 transition-all shadow-grit active:translate-x-1 active:translate-y-1 active:shadow-none p-4"
        >
            <FileStack className="text-grit-dark w-6 h-6" />
            <span className="text-lg font-bold uppercase tracking-wider">History</span>
        </button>

        {/* Manage Clients */}
        <button 
            onClick={() => navigate('/clients')}
            className="bg-grit-white border-4 border-grit-dark flex items-center justify-center gap-4 hover:bg-gray-50 transition-all shadow-grit active:translate-x-1 active:translate-y-1 active:shadow-none p-4"
        >
            <Users className="text-grit-dark w-6 h-6" />
            <span className="text-lg font-bold uppercase tracking-wider">Clients</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardScreen;