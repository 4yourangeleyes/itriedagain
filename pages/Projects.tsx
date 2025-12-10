import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Project, User, Phase, Shift } from '../types';
import { Card, Button, Input, Badge, Modal, Textarea } from '../components/UI';
import * as Icons from 'lucide-react';

// Helper to convert timestamp to yyyy-MM-dd string
const toDateInput = (timestamp: number | undefined) => {
  if (!timestamp) return '';
  return new Date(timestamp).toISOString().split('T')[0];
};

// Helper to convert yyyy-MM-dd string to timestamp
const fromDateInput = (dateString: string) => {
  if (!dateString) return undefined;
  return new Date(dateString).getTime();
};

// Helper to convert timestamp to datetime-local string
const toDateTimeLocal = (timestamp: number) => {
  const date = new Date(timestamp);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

// Helper to convert datetime-local string to timestamp
const fromDateTimeLocal = (dateString: string) => {
  return new Date(dateString).getTime();
};

const ResourceTimeline = ({
  assignedUsers,
  allShifts,
  allProjects,
  selectedProjectId
}: {
  assignedUsers: User[],
  allShifts: Shift[],
  allProjects: Project[],
  selectedProjectId: string
}) => {
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  const handlePrevWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStart(newDate);
  };

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card title="Resource Allocation">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <Button variant="secondary" onClick={handlePrevWeek}><Icons.ChevronLeft size={16} /> Prev Week</Button>
        <div className="font-display font-bold text-lg text-text text-center">
          {weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <Button variant="secondary" onClick={handleNextWeek}>Next Week <Icons.ChevronRight size={16} /></Button>
      </div>

      <div className="overflow-x-auto custom-scrollbar border border-white/10 rounded-lg">
         <div className="grid min-w-[1200px]" style={{ gridTemplateColumns: '200px repeat(7, 1fr)'}}>
             {/* Header */}
             <div className="p-3 font-bold text-sm uppercase tracking-wider text-textMuted bg-surface border-r border-b border-white/10 sticky left-0 z-10">Team Member</div>
             {daysOfWeek.map((day, i) => (
                <div key={day} className="p-3 text-center font-bold text-sm uppercase tracking-wider text-textMuted bg-surface border-r border-b border-white/10">
                    {day} <br/> <span className="font-mono text-xs">{weekDates[i].getDate()}</span>
                </div>
             ))}

             {/* User Rows */}
             {assignedUsers.map(user => {
                const userShifts = allShifts.filter(s => s.assigneeId === user.id);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                const weeklyShifts = userShifts.filter(s => s.startAt >= weekStart.getTime() && s.startAt < weekEnd.getTime());
                const weeklyTotalHours = weeklyShifts.reduce((acc, shift) => acc + (shift.endAt - shift.startAt) / 3600000, 0);

                return (
                    <React.Fragment key={user.id}>
                        <div className="p-3 bg-surface border-r border-b border-white/10 sticky left-0 z-10">
                            <p className="font-bold text-text truncate">{user.fullName}</p>
                            <p className="text-xs text-secondary font-mono font-bold">{weeklyTotalHours.toFixed(1)} hrs / week</p>
                        </div>
                        {weekDates.map(date => {
                            const dayStart = new Date(date);
                            dayStart.setHours(0,0,0,0);
                            const dayEnd = new Date(date);
                            dayEnd.setHours(23,59,59,999);
                            
                            const dayShifts = userShifts.filter(s => s.startAt >= dayStart.getTime() && s.startAt <= dayEnd.getTime());
                            const totalHours = dayShifts.reduce((acc, shift) => {
                                const duration = (shift.endAt - shift.startAt) / 3600000;
                                return acc + duration;
                            }, 0);

                            const isOverAllocated = totalHours > 8;

                            return (
                                <div key={date.toString()} className={`p-2 border-r border-b border-white/10 min-h-[100px] space-y-1 transition-colors ${isOverAllocated ? 'bg-danger/10' : 'hover:bg-white/5'}`}>
                                    {dayShifts.map(shift => {
                                        const project = allProjects.find(p => p.id === shift.projectId);
                                        const isCurrentProject = shift.projectId === selectedProjectId;
                                        return (
                                            <div key={shift.id} className={`p-1.5 rounded text-xs border ${isCurrentProject ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface border-white/10 text-textMuted'}`}>
                                                <p className="font-bold truncate">{project?.name || 'Unknown Project'}</p>
                                                <p className="font-mono text-[10px]">{new Date(shift.startAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {new Date(shift.endAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </React.Fragment>
                )
             })}
         </div>
         {assignedUsers.length === 0 && <div className="text-center p-8 text-textMuted font-sans">No users assigned to this project to view resources.</div>}
      </div>
    </Card>
  );
}


export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mode, setMode] = useState<'LIST' | 'STUDIO'>('LIST');
  const [tab, setTab] = useState<'OVERVIEW' | 'PHASES' | 'TEAM' | 'SCHEDULE' | 'RESOURCES' | 'SETTINGS'>('OVERVIEW');

  // Create/Edit Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState<Partial<Project>>({});

  // Create/Edit Shift Modal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftFormData, setShiftFormData] = useState<Partial<Omit<Shift, 'id'>>>({});

  // FIX: Hoist assignedUsers to be available in both LIST and STUDIO modes.
  const assignedUsers = selectedProject ? users.filter(u => selectedProject.assignedUserIds?.includes(u.id)) : [];

  const load = async () => {
    if (!user) return;
    
    try {
      // Query projects for this organization
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('org_id', user.orgId);
      
      if (projectsError) throw projectsError;
      
      // Query users for this organization
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('org_id', user.orgId);
      
      if (usersError) throw usersError;
      
      // Query shifts for this organization
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('org_id', user.orgId);
      
      if (shiftsError) throw shiftsError;
      
      // Map Supabase records to app types
      const mappedProjects: Project[] = (projectsData || []).map(p => ({
        id: p.id,
        orgId: p.org_id,
        name: p.name,
        description: p.description || '',
        status: p.status || 'DRAFT',
        color: p.color || '#38BDF8',
        phases: p.phases || [],
        assignedUserIds: p.assigned_user_ids || []
      }));
      
      const mappedUsers: User[] = (usersData || []).map(u => ({
        id: u.id,
        orgId: u.org_id,
        username: u.username,
        fullName: u.full_name || '',
        email: u.email || '',
        role: u.role || 'MEMBER',
        avatar: u.avatar,
        status: u.status || 'OFFLINE',
        lastSeen: u.last_seen ? new Date(u.last_seen).getTime() : undefined,
        timezone: u.timezone || 'UTC',
        department: u.department
      }));
      
      const mappedShifts: Shift[] = (shiftsData || []).map(s => ({
        id: s.id,
        orgId: s.org_id,
        projectId: s.project_id,
        phaseId: s.phase_id,
        assigneeId: s.assignee_id,
        startAt: new Date(s.start_at).getTime(),
        endAt: new Date(s.end_at).getTime(),
        status: s.status || 'SCHEDULED',
        allowedEarlyMinutes: s.allowed_early_minutes || 15,
        allowedLateMinutes: s.allowed_late_minutes || 15
      }));
      
      setProjects(mappedProjects);
      setUsers(mappedUsers);
      setAllShifts(mappedShifts);
      
      if (selectedProject) {
        const updated = mappedProjects.find(proj => proj.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
        else setMode('LIST'); // Project was deleted, go back to list
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  useEffect(() => { load(); }, [user]);
  
  const handleOpenStudio = (project: Project) => {
    setSelectedProject(project);
    setMode('STUDIO');
    setTab('OVERVIEW');
  };
  
  const handleOpenProjectModal = (project?: Project) => {
    setProjectFormData(project || { name: '', description: '', status: 'DRAFT', color: '#38BDF8' });
    setIsProjectModalOpen(true);
  };
  
  const handleSaveProject = async () => {
    if (!user || !projectFormData.name) return;
    try {
      if (projectFormData.id) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: projectFormData.name,
            description: projectFormData.description,
            status: projectFormData.status,
            color: projectFormData.color,
            phases: projectFormData.phases,
            assigned_user_ids: projectFormData.assignedUserIds
          })
          .eq('id', projectFormData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            org_id: user.orgId,
            name: projectFormData.name,
            description: projectFormData.description || '',
            status: projectFormData.status || 'DRAFT',
            color: projectFormData.color || '#38BDF8',
            phases: [],
            assigned_user_ids: []
          });
        if (error) throw error;
      }
      setIsProjectModalOpen(false);
      load();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject || !window.confirm("Are you sure you want to permanently delete this project?")) return;
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id);
      if (error) throw error;
      setMode('LIST');
      load();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // --- Studio Functions ---
  const handleAddPhase = async () => {
    if (!selectedProject) return;
    try {
      const newPhase: Phase = {
        id: `ph-${Date.now()}`,
        name: `Phase ${selectedProject.phases.length + 1}`,
        goals: []
      };
      const updatedPhases = [...selectedProject.phases, newPhase];
      const { error } = await supabase
        .from('projects')
        .update({ phases: updatedPhases })
        .eq('id', selectedProject.id);
      if (error) throw error;
      load();
    } catch (error) {
      console.error('Error adding phase:', error);
    }
  };

  const handleUpdatePhase = async (phaseId: string, updates: Partial<Phase>) => {
    if (!selectedProject) return;
    try {
      const updatedPhases = selectedProject.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p);
      const updatedProject = { ...selectedProject, phases: updatedPhases };
      setSelectedProject(updatedProject); // Optimistic update
      const { error } = await supabase
        .from('projects')
        .update({ phases: updatedPhases })
        .eq('id', selectedProject.id);
      if (error) throw error;
      load();
    } catch (error) {
      console.error('Error updating phase:', error);
    }
  };
  
  const handleDeletePhase = async (phaseId: string) => {
    if (!selectedProject) return;
    try {
      const updatedPhases = selectedProject.phases.filter(p => p.id !== phaseId);
      const { error } = await supabase
        .from('projects')
        .update({ phases: updatedPhases })
        .eq('id', selectedProject.id);
      if (error) throw error;
      load();
    } catch (error) {
      console.error('Error deleting phase:', error);
    }
  };

  const handleUpdateProjectDetails = async (updates: Partial<Project>) => {
    if (!selectedProject) return;
    try {
      const updatedProject = { ...selectedProject, ...updates };
      setSelectedProject(updatedProject);
      const { error } = await supabase
        .from('projects')
        .update({
          name: updatedProject.name,
          description: updatedProject.description,
          status: updatedProject.status,
          color: updatedProject.color
        })
        .eq('id', selectedProject.id);
      if (error) throw error;
      load();
    } catch (error) {
      console.error('Error updating project details:', error);
    }
  };

  const toggleUserAssignment = async (userId: string) => {
    if (!selectedProject) return;
    try {
      const current = selectedProject.assignedUserIds || [];
      const updatedIds = current.includes(userId) 
        ? current.filter(id => id !== userId) 
        : [...current, userId];
      
      const { error } = await supabase
        .from('projects')
        .update({ assigned_user_ids: updatedIds })
        .eq('id', selectedProject.id);
      if (error) throw error;
      load();
    } catch (error) {
      console.error('Error toggling user assignment:', error);
    }
  };
  
  const handleOpenShiftModal = (shift?: Shift) => {
    setShiftFormData(shift || { projectId: selectedProject?.id, allowedEarlyMinutes: 15 });
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async () => {
    if (!user || !selectedProject || !shiftFormData.phaseId || !shiftFormData.assigneeId || !shiftFormData.startAt || !shiftFormData.endAt) return;
    try {
      const { error } = await supabase
        .from('shifts')
        .insert({
          org_id: user.orgId,
          project_id: selectedProject.id,
          phase_id: shiftFormData.phaseId,
          assignee_id: shiftFormData.assigneeId,
          start_at: new Date(shiftFormData.startAt).toISOString(),
          end_at: new Date(shiftFormData.endAt).toISOString(),
          status: 'SCHEDULED',
          allowed_early_minutes: shiftFormData.allowedEarlyMinutes || 15,
          allowed_late_minutes: shiftFormData.allowedLateMinutes || 15
        });
      if (error) throw error;
      setIsShiftModalOpen(false);
      load();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const projectShifts = selectedProject ? allShifts.filter(s => s.projectId === selectedProject.id) : [];

  
  if (mode === 'STUDIO' && selectedProject) {
    return (
      <div className="animate-in fade-in duration-500 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => setMode('LIST')} variant="secondary" className="p-3 h-12 w-12 !rounded-lg">
              <Icons.ArrowLeft size={24} />
            </Button>
            <div>
              <h1 className="text-4xl font-display font-bold text-text mb-1">{selectedProject.name}</h1>
              <p className="text-textMuted font-sans text-sm">{selectedProject.description}</p>
            </div>
          </div>
          <div className="flex gap-3 self-end md:self-center">
             <Badge color={selectedProject.status === 'ACTIVE' ? 'success' : 'surface'}>{selectedProject.status}</Badge>
          </div>
        </header>

        <div className="flex gap-1 border-b border-white/10 mb-8 pb-1 overflow-x-auto custom-scrollbar">
           {['OVERVIEW', 'PHASES', 'TEAM', 'SCHEDULE', 'RESOURCES', 'SETTINGS'].map(t => (
              <button 
                 key={t} 
                 onClick={() => setTab(t as any)}
                 className={`pb-3 px-4 font-sans text-sm font-bold tracking-wider transition-all whitespace-nowrap border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-text'}`}
              >
                 {t}
              </button>
           ))}
        </div>

        {tab === 'OVERVIEW' && (
           <div className="space-y-8 animate-slide-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><h4 className="text-textMuted text-sm font-bold mb-2 uppercase">Status</h4><p className="text-3xl font-display font-bold text-text">{selectedProject.status}</p></Card>
                <Card><h4 className="text-textMuted text-sm font-bold mb-2 uppercase">Phases Defined</h4><p className="text-3xl font-display font-bold text-text">{selectedProject.phases.length}</p></Card>
                <Card><h4 className="text-textMuted text-sm font-bold mb-2 uppercase">Team Size</h4><p className="text-3xl font-display font-bold text-text">{selectedProject.assignedUserIds.length}</p></Card>
             </div>
             <Card title="Team">
                <div className="flex flex-wrap gap-4">
                  {assignedUsers.length > 0 ? assignedUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-2 bg-background p-2 pr-3 rounded-full border border-white/10">
                       <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-xs">{u.username.substring(0,2).toUpperCase()}</div>
                       <span className="text-text font-sans font-semibold text-sm">{u.fullName}</span>
                    </div>
                  )) : <p className="text-textMuted text-sm font-sans">No users assigned yet.</p>}
                </div>
             </Card>
           </div>
        )}

        {tab === 'PHASES' && (
          <div className="space-y-6 animate-slide-in">
            <div className="flex justify-between items-center">
               <h3 className="font-display font-bold text-text text-2xl">Project Phases</h3>
               <Button onClick={handleAddPhase} variant="secondary"><Icons.Plus size={14} /> Add Phase</Button>
            </div>
            {selectedProject.phases.length === 0 ? (
              <div className="p-8 border-2 border-white/10 border-dashed rounded-lg text-center text-textMuted font-sans text-sm">No phases defined.</div>
            ) : (
              <div className="space-y-4">
                {selectedProject.phases.map((phase, i) => (
                  <Card key={phase.id} className="relative group">
                     <div className="flex justify-between items-start mb-6">
                        <Input value={phase.name} onChange={(e) => handleUpdatePhase(phase.id, { name: e.target.value })} className="!text-xl !font-bold !font-display !p-0 !bg-transparent !border-none !ring-0" />
                        <div className="flex items-center gap-2">
                          <Badge color="secondary">PHASE {i+1}</Badge>
                          <Button variant="ghost" size="sm" className="!p-2" onClick={() => handleDeletePhase(phase.id)}><Icons.Trash2 size={16} className="text-textMuted hover:text-danger"/></Button>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Input label="Start Date" type="date" value={toDateInput(phase.startDate)} onChange={e => handleUpdatePhase(phase.id, { startDate: fromDateInput(e.target.value) })} />
                        <Input label="End Date" type="date" value={toDateInput(phase.endDate)} onChange={e => handleUpdatePhase(phase.id, { endDate: fromDateInput(e.target.value) })} />
                     </div>
                     <div>
                        <label className="text-xs font-bold font-sans text-textMuted uppercase mb-3 block">Objectives</label>
                        <div className="space-y-2">
                          {phase.goals.map((goal, goalIndex) => (
                            <div key={goalIndex} className="flex items-center gap-2">
                              <Input 
                                value={goal} 
                                onChange={(e) => {
                                  const newGoals = [...phase.goals];
                                  newGoals[goalIndex] = e.target.value;
                                  handleUpdatePhase(phase.id, { goals: newGoals });
                                }}
                                className="text-sm"
                              />
                               <Button variant="ghost" size="sm" className="!p-2" onClick={() => handleUpdatePhase(phase.id, { goals: phase.goals.filter((_, idx) => idx !== goalIndex) })}><Icons.X size={16} /></Button>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => handleUpdatePhase(phase.id, { goals: [...phase.goals, ''] })}>+ Add Objective</Button>
                        </div>
                     </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'TEAM' && (
          <Card title="Team Assignments" className="animate-slide-in">
            <p className="text-sm text-textMuted mb-6 font-sans">Manage operatives assigned to this project.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                 <div key={u.id} onClick={() => toggleUserAssignment(u.id)} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedProject.assignedUserIds?.includes(u.id) ? 'bg-primary/20 border-primary' : 'bg-surface border-white/10 hover:border-white/30'}`}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedProject.assignedUserIds?.includes(u.id) ? 'bg-primary border-primary' : 'bg-transparent border-white/30'}`}>{selectedProject.assignedUserIds?.includes(u.id) && <Icons.Check size={16} className="text-background" />}</div>
                    <div><p className="font-bold font-sans text-md text-text">{u.fullName}</p><p className="text-xs font-mono text-textMuted/70">@{u.username}</p></div>
                 </div>
              ))}
            </div>
          </Card>
        )}
        
        {tab === 'SCHEDULE' && (
           <div className="animate-slide-in space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="font-display font-bold text-text text-2xl">Deployment Schedule</h3>
                 <Button onClick={() => handleOpenShiftModal()} variant="secondary"><Icons.Plus size={14} /> New Shift</Button>
              </div>
              {projectShifts.length === 0 ? (
                 <div className="p-8 border-2 border-white/10 border-dashed rounded-lg text-center text-textMuted font-sans text-sm">No shifts scheduled for this project.</div>
              ) : (
                 <div className="space-y-4">
                    {projectShifts.map(shift => {
                       const assignee = users.find(u => u.id === shift.assigneeId);
                       const phase = selectedProject.phases.find(p => p.id === shift.phaseId);
                       return (
                          <Card key={shift.id}>
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="font-bold text-text mb-1">{assignee?.fullName || 'Unassigned'}</p>
                                   <p className="text-sm text-textMuted font-mono">{new Date(shift.startAt).toLocaleString()} - {new Date(shift.endAt).toLocaleString()}</p>
                                </div>
                                <Badge color="surface">{phase?.name || 'General'}</Badge>
                             </div>
                          </Card>
                       )
                    })}
                 </div>
              )}
           </div>
        )}

        {tab === 'RESOURCES' && (
          <div className="animate-slide-in">
            <ResourceTimeline 
              assignedUsers={assignedUsers}
              allShifts={allShifts}
              allProjects={projects}
              selectedProjectId={selectedProject.id}
            />
          </div>
        )}


        {tab === 'SETTINGS' && (
           <div className="animate-slide-in space-y-8 max-w-3xl">
              <Card title="Project Details">
                 <div className="space-y-4">
                    <Input label="Project Name" value={selectedProject.name} onChange={e => handleUpdateProjectDetails({ name: e.target.value })} />
                    <Textarea label="Description" value={selectedProject.description} onChange={e => handleUpdateProjectDetails({ description: e.target.value })} rows={4}/>
                    <div>
                       <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1 mb-2 block">Status</label>
                       <select value={selectedProject.status} onChange={e => handleUpdateProjectDetails({ status: e.target.value as Project['status'] })} className="w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                          <option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option>
                       </select>
                    </div>
                 </div>
              </Card>
              <Card title="Danger Zone" className="border-danger/50 bg-danger/5">
                 <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                       <h4 className="font-bold text-text font-sans">Delete Project</h4>
                       <p className="text-xs text-danger/80 font-sans">This action is irreversible and will delete all associated data.</p>
                    </div>
                    <Button variant="danger" onClick={handleDeleteProject}>Delete Project</Button>
                 </div>
              </Card>
           </div>
        )}

      </div>
    );
  }

  // LIST MODE
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold text-text mb-2">Project Terminal</h1>
          <p className="font-sans text-textMuted tracking-widest text-sm">MANAGE ALL INITIATIVES</p>
        </div>
        <Button onClick={() => handleOpenProjectModal()}>
          <Icons.Plus size={16} /> New Project
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <Card key={p.id} className="group hover:border-primary/50 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display font-bold text-xl text-text">{p.name}</h3>
              <Badge color={p.status === 'ACTIVE' ? 'success' : 'surface'}>{p.status}</Badge>
            </div>
            <p className="text-sm font-sans text-textMuted flex-1 mb-6">{p.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {p.assignedUserIds.slice(0, 3).map(uid => {
                  const u = users.find(user => user.id === uid);
                  return u ? <div key={uid} title={u.fullName} className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-surface flex items-center justify-center font-bold text-xs">{u.username.substring(0,2).toUpperCase()}</div> : null;
                })}
                {p.assignedUserIds.length > 3 && <div className="w-8 h-8 rounded-full bg-surface border-2 border-surface flex items-center justify-center font-bold text-xs">+{p.assignedUserIds.length - 3}</div>}
              </div>
              <Button variant="secondary" onClick={() => handleOpenStudio(p)}>Open Studio</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title={projectFormData.id ? 'Edit Project' : 'Launch New Project'}>
        <div className="space-y-6">
          <Input label="Project Name" value={projectFormData.name} onChange={e => setProjectFormData({...projectFormData, name: e.target.value})} placeholder="e.g. Operation Chimera" />
          <Textarea label="Description" value={projectFormData.description} onChange={e => setProjectFormData({...projectFormData, description: e.target.value})} placeholder="A brief summary of the project." />
          <div>
            <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1 mb-2 block">Status</label>
            <select value={projectFormData.status} onChange={e => setProjectFormData({...projectFormData, status: e.target.value as Project['status']})} className="w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="pt-4 flex gap-4">
            <Button onClick={() => setIsProjectModalOpen(false)} variant="secondary" className="w-full">Cancel</Button>
            <Button onClick={handleSaveProject} className="w-full">Save Project</Button>
          </div>
        </div>
      </Modal>

      {selectedProject && <Modal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title="Schedule Deployment">
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1 mb-2 block">Phase</label>
                      <select value={shiftFormData.phaseId} onChange={e => setShiftFormData({...shiftFormData, phaseId: e.target.value})} className="w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                          <option value="">Select Phase...</option>
                          {selectedProject.phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1 mb-2 block">Assignee</label>
                      <select value={shiftFormData.assigneeId} onChange={e => setShiftFormData({...shiftFormData, assigneeId: e.target.value})} className="w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                          <option value="">Select Operative...</option>
                          {assignedUsers.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                      </select>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Start Time" type="datetime-local" value={shiftFormData.startAt ? toDateTimeLocal(shiftFormData.startAt) : ''} onChange={e => setShiftFormData({...shiftFormData, startAt: fromDateTimeLocal(e.target.value)})} />
                  <Input label="End Time" type="datetime-local" value={shiftFormData.endAt ? toDateTimeLocal(shiftFormData.endAt) : ''} onChange={e => setShiftFormData({...shiftFormData, endAt: fromDateTimeLocal(e.target.value)})} />
              </div>
              <Textarea label="Personal Goals" placeholder="Define specific tasks for this shift..." value={Array.isArray(shiftFormData.personalGoals) ? shiftFormData.personalGoals.join('\n') : ''} onChange={e => setShiftFormData({...shiftFormData, personalGoals: e.target.value.split('\n')})} />
              <Button onClick={handleSaveShift} className="w-full">Create Shift</Button>
          </div>
      </Modal>}
    </div>
  );
}
