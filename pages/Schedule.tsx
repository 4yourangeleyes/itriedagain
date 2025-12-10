import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Card, Button } from '../components/UI';
import { Shift, Project } from '../types';
import * as Icons from 'lucide-react';

export default function Schedule() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .eq('org_id', user.orgId);
        
        if (shiftsError) throw shiftsError;
        
        setShifts((shiftsData || []).map(s => ({
          id: s.id,
          orgId: s.org_id,
          projectId: s.project_id,
          phaseId: s.phase_id,
          assigneeId: s.assignee_id,
          startAt: new Date(s.start_at).getTime(),
          endAt: new Date(s.end_at).getTime(),
          status: s.status,
          allowedEarlyMinutes: s.allowed_early_minutes || 15,
          allowedLateMinutes: s.allowed_late_minutes || 15
        })));
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('org_id', user.orgId);
        
        if (projectsError) throw projectsError;
        
        setProjects((projectsData || []).map(p => ({
          id: p.id,
          orgId: p.org_id,
          name: p.name,
          description: p.description || '',
          status: p.status,
          color: p.color,
          phases: p.phases || [],
          assignedUserIds: p.assigned_user_ids || []
        })));
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };
    
    loadData();
  }, [user]);
  
  const getShiftsForDate = (dayOfMonth: number, week: number) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const date = new Date(year, month, dayOfMonth + (week * 7) - firstDay);
    
    return shifts.filter(s => {
      const shiftDate = new Date(s.startAt);
      return shiftDate.getDate() === date.getDate() && 
             shiftDate.getMonth() === date.getMonth() &&
             shiftDate.getFullYear() === date.getFullYear();
    });
  };
  
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
         <div>
            <h1 className="text-5xl font-display font-bold text-text mb-2">Deployments</h1>
            <p className="font-sans text-textMuted tracking-widest text-sm">WEEKLY SHIFT PLANNER</p>
         </div>
         <Button>
            <Icons.Plus size={16} /> Add Deployment
         </Button>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
         <div className="grid grid-cols-7 min-w-[800px]">
            {days.map(d => (
               <div key={d} className="p-4 text-center border-r border-b border-white/10 last:border-r-0 bg-surface/50">
                  <span className="font-display text-text text-sm font-bold">{d}</span>
               </div>
            ))}
         </div>
         <div className="grid grid-cols-7 min-h-[600px] min-w-[800px]">
            {Array.from({length: 35}).map((_, i) => {
              const week = Math.floor(i / 7);
              const dayOfMonth = (i % 7) + 1;
              const dayShifts = getShiftsForDate(dayOfMonth, week);
              
              return (
                <div key={i} className="border-r border-b border-white/10 p-2 relative min-h-[120px] hover:bg-white/5 transition-colors group">
                  <span className="text-xs text-textMuted/50 font-mono absolute top-2 left-2">{dayOfMonth}</span>
                  <div className="mt-6 space-y-1">
                    {dayShifts.map(shift => (
                      <div key={shift.id} className="bg-primary/10 border border-primary/20 p-2 rounded-md shadow-md cursor-pointer hover:-translate-y-0.5 transition-transform">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-[10px] text-primary font-bold">
                            {new Date(shift.startAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {new Date(shift.endAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                        <p className="font-sans font-bold text-text text-sm mb-1 truncate leading-tight">{getProjectName(shift.projectId)}</p>
                        <p className="text-[10px] text-textMuted font-sans">PHASE: {shift.phaseId}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
         </div>
        </div>
      </Card>
    </div>
  );
}
