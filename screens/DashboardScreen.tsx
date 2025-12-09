import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Users, FileStack, Copy, TrendingUp, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { DocumentData, UserProfile, Client } from '../types';
import { AuditScorecard } from '../components/AuditScorecard';
import { useTemplates } from '../hooks/useTemplates';
import { useOnboarding } from '../context/OnboardingContext';

interface DashboardScreenProps {
    documents: DocumentData[];
    clients: Client[];
    profile: UserProfile;
    onCloneLast: () => boolean;
    onShowWizard: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ documents, clients, profile, onCloneLast, onShowWizard }) => {
  const navigate = useNavigate();
  const { templates } = useTemplates();
  const { setActiveStep, setShowGuide, skipOnboarding, userCreatedTemplatesCount, isMilestoneCompleted } = useOnboarding();

  // Money Pulse Logic
  const weeklyRevenue = documents
    .filter(d => d.status === 'Paid' || d.status === 'Sent')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);
  
  // Onboarding Progress Logic
  const milestones = [
    { 
      id: 'account', 
      label: 'Account Created', 
      completed: true, 
      action: null 
    },
    { 
      id: 'profile', 
      label: 'Profile Completed', 
      completed: !!(profile.fullName && profile.companyName && profile.email),
      action: () => {
        setActiveStep('profile');
        setShowGuide(true);
        navigate('/settings');
      }
    },
    { 
      id: 'client', 
      label: 'First Client Saved', 
      completed: clients.length > 0,
      action: () => {
        setActiveStep('client');
        setShowGuide(true);
        navigate('/clients');
      }
    },
    { 
      id: 'templates', 
      label: '3+ Templates Created', 
      completed: userCreatedTemplatesCount >= 3, // Use user-created count, not total
      action: () => {
        setActiveStep('templates');
        setShowGuide(true);
        navigate('/templates');
      }
    },
    { 
      id: 'document', 
      label: 'First Document Created', 
      completed: documents.length > 0,
      action: () => {
        // Only show guide if milestone hasn't been completed yet
        if (!isMilestoneCompleted('document')) {
          setActiveStep('document');
          setShowGuide(true);
        }
        onShowWizard();
      }
    },
  ];
  const completedMilestones = milestones.filter(m => m.completed).length;
  const onboardingProgress = Math.round((completedMilestones / milestones.length) * 100);

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
          <div className="flex-1 bg-white p-6 shadow-grit border-4 border-grit-dark">
              <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-green-600" />
                  <span className="font-bold text-sm uppercase tracking-widest text-gray-600">Revenue Pulse</span>
              </div>
              <p className="text-4xl md:text-5xl font-mono font-bold mb-4 text-grit-dark">{profile.currency}{weeklyRevenue.toLocaleString()}</p>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${Math.min(weeklyRevenue / 100, 100)}%` }}></div>
              </div>
          </div>

          {/* Onboarding Progress */}
          {onboardingProgress < 100 && (
              <div className="flex-1 bg-blue-50 p-6 shadow-grit border-4 border-grit-dark">
                  <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                          <CheckCircle2 size={20} className="text-blue-600" />
                          <span className="font-bold text-sm uppercase tracking-widest text-gray-600">Setup Progress</span>
                      </div>
                      <button 
                          onClick={skipOnboarding}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                          Skip
                      </button>
                  </div>
                  <p className="text-3xl font-bold mb-4 text-grit-dark">{onboardingProgress}% Complete</p>
                  <div className="space-y-2">
                      {milestones.map(milestone => (
                          <button
                              key={milestone.id}
                              onClick={milestone.action || undefined}
                              disabled={milestone.completed || !milestone.action}
                              className={`w-full flex items-center gap-2 text-sm p-2 rounded transition-colors ${
                                  milestone.completed 
                                      ? 'bg-white/50' 
                                      : milestone.action 
                                          ? 'hover:bg-blue-100 cursor-pointer group' 
                                          : 'cursor-default'
                              }`}
                          >
                              {milestone.completed ? (
                                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                              ) : (
                                  <Circle size={16} className="text-gray-400 flex-shrink-0 group-hover:text-blue-500" />
                              )}
                              <span className={`font-bold flex-1 text-left ${milestone.completed ? 'text-gray-700' : 'text-gray-600 group-hover:text-blue-700'}`}>
                                  {milestone.label}
                              </span>
                              {!milestone.completed && milestone.action && (
                                  <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                          </button>
                      ))}
                  </div>
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
            onClick={onShowWizard}
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