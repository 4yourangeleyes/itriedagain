import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Card, Button, Modal } from '../components/UI';
import { Shift, Project } from '../types';
import * as Icons from 'lucide-react';

export default function TimeClock() {
  const { user } = useAuth();
  const [time, setTime] = useState(Date.now());
  const [active, setActive] = useState(false);
  const [upcomingShift, setUpcomingShift] = useState<Shift | null>(null);
  const [shiftProject, setShiftProject] = useState<Project | null>(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [clockError, setClockError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const loadShift = async () => {
      try {
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .eq('org_id', user.orgId)
          .eq('assignee_id', user.id);
        
        if (shiftsError) throw shiftsError;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const next = (shiftsData || []).find(s => {
          const startTime = new Date(s.start_at).getTime();
          return startTime >= today.getTime() && startTime < tomorrow.getTime() && new Date(s.end_at).getTime() > Date.now();
        });
        
        if (next) {
          const mappedShift: Shift = {
            id: next.id,
            orgId: next.org_id,
            projectId: next.project_id,
            phaseId: next.phase_id,
            assigneeId: next.assignee_id,
            startAt: new Date(next.start_at).getTime(),
            endAt: new Date(next.end_at).getTime(),
            status: next.status,
            allowedEarlyMinutes: next.allowed_early_minutes || 15,
            allowedLateMinutes: next.allowed_late_minutes || 15
          };
          setUpcomingShift(mappedShift);
          
          const { data: projectData } = await supabase
            .from('projects')
            .select('*')
            .eq('id', next.project_id)
            .single();
          
          if (projectData) {
            setShiftProject({
              id: projectData.id,
              orgId: projectData.org_id,
              name: projectData.name,
              description: projectData.description || '',
              status: projectData.status,
              color: projectData.color,
              phases: projectData.phases || [],
              assignedUserIds: projectData.assigned_user_ids || []
            });
          }
        }
      } catch (error) {
        console.error('Error loading shift:', error);
      }
    };
    
    loadShift();
  }, [user]);

  const handleClockPress = async () => {
    if (active) {
      try {
        if (!user || !upcomingShift) return;
        const { error } = await supabase
          .from('clock_entries')
          .update({ status: 'COMPLETED', ended_at: new Date().toISOString() })
          .eq('shift_id', upcomingShift.id)
          .eq('user_id', user.id)
          .eq('status', 'ACTIVE');
        if (error) throw error;
        setActive(false);
      } catch (error) {
        console.error('Error clocking out:', error);
        setClockError('Failed to clock out');
      }
    } else {
      if (!upcomingShift) {
        setClockError("No scheduled shift found for today.");
        return;
      }
      // Check if within allowed early minutes
      const minutesTillShift = (upcomingShift.startAt - Date.now()) / 60000;
      const allowedEarly = upcomingShift.allowedEarlyMinutes || 15;
      
      if (minutesTillShift > allowedEarly) {
        setClockError(`Cannot clock in yet. Shift starts in ${Math.round(minutesTillShift)} minutes.`);
        return;
      }
      
      setShowBriefing(true);
      setClockError(null);
    }
  };

  const confirmClockIn = async () => {
    if (!user || !upcomingShift) return;
    try {
      const { error } = await supabase
        .from('clock_entries')
        .insert({
          user_id: user.id,
          shift_id: upcomingShift.id,
          org_id: user.orgId,
          project_id: upcomingShift.projectId,
          status: 'ACTIVE',
          started_at: new Date().toISOString()
        });
      if (error) throw error;
      setActive(true);
      setShowBriefing(false);
    } catch (error) {
      console.error('Error clocking in:', error);
      setClockError('Failed to clock in');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
      <div className="text-center mb-12">
         <h1 className="text-7xl md:text-[100px] font-display font-bold text-text leading-none tracking-tighter">
            {new Date(time).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'})}
         </h1>
         <p className="font-mono text-textMuted tracking-widest text-sm mt-2">SYSTEM TIME</p>
      </div>

      <div className="relative">
         <button 
            onClick={handleClockPress}
            className={`
               w-52 h-52 md:w-64 md:h-64 rounded-full border-4 border-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-2 group z-10 relative shadow-2xl
               ${active 
                  ? 'bg-danger text-white shadow-danger/20' 
                  : 'bg-primary text-background shadow-primary/20 hover:scale-105'
               }
            `}
         >
            <Icons.Power size={48} />
            <span className={`font-display font-bold text-2xl tracking-widest`}>
               {active ? 'CLOCK OUT' : 'CLOCK IN'}
            </span>
         </button>
      </div>

      {clockError && (
         <div className="mt-8 p-4 bg-danger/10 border border-danger/50 text-danger font-sans text-sm rounded-lg">
            <strong>Error:</strong> {clockError}
         </div>
      )}

      {active && (
         <div className="mt-12 w-full max-w-md">
            <Card className="bg-surface border-success/50">
               <div className="flex items-center justify-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-success animate-pulse border-2 border-background" />
                  <span className="font-display text-text text-lg tracking-widest">SESSION ACTIVE</span>
               </div>
               {shiftProject && <p className="text-center text-textMuted mt-2 text-sm font-sans">{shiftProject.name}</p>}
            </Card>
         </div>
      )}

      <Modal isOpen={showBriefing} onClose={() => setShowBriefing(false)} title="Mission Briefing">
         <div className="space-y-6">
            <div className="bg-background border border-white/10 p-6 rounded-lg">
               <h3 className="text-xs font-sans font-bold text-textMuted uppercase tracking-widest mb-2">Project</h3>
               <p className="text-2xl font-display font-bold text-text mb-6">{shiftProject?.name}</p>
               
               <h3 className="text-xs font-sans font-bold text-textMuted uppercase tracking-widest mb-2">Today's Objectives</h3>
               <ul className="space-y-3">
                  {upcomingShift?.personalGoals?.map(g => (
                     <li key={g} className="flex items-center gap-3 text-lg font-sans text-text">
                        <Icons.CheckSquare size={20} className="text-primary" /> {g}
                     </li>
                  ))}
               </ul>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary font-sans">
               <Icons.Info size={20} />
               Clocking in confirms you are ready to engage.
            </div>

            <Button onClick={confirmClockIn} className="w-full text-lg py-3">
               Engage <Icons.Rocket size={16} className="ml-2" />
            </Button>
         </div>
      </Modal>
    </div>
  );
}
