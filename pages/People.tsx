
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { User, Organization, Shift, Role, MoodEntry, Goal, Blocker, Recognition } from '../types';
import { Card, Modal, Button, Input, Badge } from '../components/UI';
import * as Icons from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const moodToEmoji = (val: number) => {
  if (val <= 1) return '😩';
  if (val <= 2) return '😟';
  if (val <= 3) return '😐';
  if (val <= 4) return '😊';
  return '😁';
};

const getBurnoutRisk = (moodEntries: MoodEntry[]): {level: 'LOW' | 'MEDIUM' | 'HIGH', reason: string} => {
    const recentEntries = moodEntries.filter(e => e.timestamp > Date.now() - 7 * 86400000);
    if (recentEntries.length < 3) return { level: 'LOW', reason: 'Not enough data.' };
    
    const avgMood = recentEntries.reduce((acc, curr) => acc + curr.moodValue, 0) / (recentEntries.length || 1);
    const lowMoodStreak = recentEntries.slice(0, 3).every(e => e.moodValue <= 2);

    if (lowMoodStreak && avgMood < 2.5) {
        return { level: 'HIGH', reason: 'Sustained low mood detected.' };
    }
    if (avgMood < 3) {
        return { level: 'MEDIUM', reason: 'Mood trend is lower than average.' };
    }
    return { level: 'LOW', reason: 'No immediate concerns.' };
};


const EmployeeDashboard = ({ employee, moods, goals, blockers }: { employee: User, moods: MoodEntry[], goals: Goal[], blockers: Blocker[] }) => {
    const [tab, setTab] = useState<'OVERVIEW' | 'MOOD' | 'GOALS' | 'BLOCKERS'>('OVERVIEW');
    
    // Derived Metrics
    const latestPreShift = moods.find(m => m.type === 'PRE_SHIFT');
    const latestPostShift = moods.find(m => m.type === 'POST_SHIFT');
    const moodDelta = latestPostShift && latestPreShift ? latestPostShift.moodValue - latestPreShift.moodValue : null;
    
    const engagementRate = Math.min(100, Math.round((moods.length / (30 * 2)) * 150)); // Mock calculation
    const goalProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;
    
    const burnoutRisk = getBurnoutRisk(moods);

    const moodChartData = moods
      .filter(m => m.type === 'POST_SHIFT')
      .slice(0, 15).reverse()
      .map(m => ({
        date: new Date(m.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'}),
        mood: m.moodValue,
      }));

    const Header = () => (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-text font-bold text-3xl font-display flex-shrink-0">
          {employee.username.substring(0,2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-display font-bold text-text">{employee.fullName}</h2>
          <p className="font-mono text-textMuted text-lg">@{employee.username}</p>
        </div>
        <div className="flex gap-2 self-stretch sm:self-center">
            <Button variant="secondary"><Icons.MessageSquare size={16} /> Message</Button>
            <Button variant="ghost" className="!p-3"><Icons.MoreVertical size={16} /></Button>
        </div>
      </div>
    );
    
    const Summary = () => (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
              <h4 className="text-xs text-textMuted font-bold uppercase tracking-wider mb-2">Latest Mood</h4>
              <div className="text-4xl">{latestPostShift ? moodToEmoji(latestPostShift.moodValue) : 'N/A'}</div>
              {moodDelta !== null && <p className={`text-sm font-bold ${moodDelta >= 0 ? 'text-success' : 'text-danger'}`}>{moodDelta > 0 ? '+' : ''}{moodDelta}</p>}
          </Card>
          <Card className={`text-center ${burnoutRisk.level === 'HIGH' ? 'bg-danger/10 border-danger/50' : ''}`}>
              <h4 className="text-xs text-textMuted font-bold uppercase tracking-wider mb-2">Burnout Risk</h4>
              <div className={`text-3xl font-display font-bold ${burnoutRisk.level === 'HIGH' ? 'text-danger' : 'text-text'}`}>{burnoutRisk.level}</div>
          </Card>
          <Card className="text-center">
              <h4 className="text-xs text-textMuted font-bold uppercase tracking-wider mb-2">Engagement</h4>
              <div className="text-3xl font-display font-bold">{engagementRate}%</div>
          </Card>
          <Card className="text-center">
              <h4 className="text-xs text-textMuted font-bold uppercase tracking-wider mb-2">Goal Progress</h4>
              <div className="text-3xl font-display font-bold">{goalProgress}%</div>
          </Card>
      </div>
    );

    return (
        <div className="space-y-6">
            <Header />
            <Summary />

            <div className="flex gap-1 border-b border-white/10 pb-1 overflow-x-auto">
              {['OVERVIEW', 'MOOD', 'GOALS', 'BLOCKERS'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTab(t as any)}
                  className={`px-4 py-2 rounded-t-md font-sans text-sm font-bold tracking-wider transition-all whitespace-nowrap ${tab === t ? 'bg-surface text-primary border-x border-t border-white/10' : 'text-textMuted hover:text-text hover:bg-white/5'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="min-h-[300px] bg-background p-4 rounded-md border border-white/5">
              {tab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                  <Card title="Active Goals">
                    {goals.length === 0 ? <p className="text-sm text-textMuted">No active goals.</p> : (
                      <div className="space-y-4">
                        {goals.map(g => (
                          <div key={g.id}>
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-bold text-text text-sm">{g.title}</p>
                              <span className="font-mono text-secondary text-sm font-bold">{g.progress}%</span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-2.5 border border-white/10"><div className="bg-secondary h-full rounded-full" style={{width: `${g.progress}%`}}></div></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                  <Card title="Open Blockers">
                    {blockers.filter(b => !b.isResolved).length === 0 ? <p className="text-sm text-textMuted">No open blockers.</p> : (
                      <div className="space-y-3">
                        {blockers.filter(b => !b.isResolved).map(b => (
                          <div key={b.id} className="flex items-start gap-3 p-3 bg-surface rounded-md border border-white/10">
                            <Icons.AlertTriangle size={20} className="text-danger mt-1 flex-shrink-0"/>
                            <div>
                              <p className="text-sm text-text font-semibold">{b.description}</p>
                              <span className="text-xs text-textMuted">{new Date(b.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {tab === 'MOOD' && (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in fade-in">
                      <Card title="Mood Timeline (Last 15 shifts)" className="lg:col-span-3">
                          <div className="h-[250px] w-full">
                              <ResponsiveContainer>
                                  <LineChart data={moodChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false}/>
                                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#8B949E'}}/>
                                      <YAxis domain={[1, 5]} tick={{fontSize: 12, fill: '#8B949E'}}/>
                                      <Tooltip contentStyle={{backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px'}}/>
                                      <Line type="monotone" dataKey="mood" stroke="#38BDF8" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}}/>
                                  </LineChart>
                              </ResponsiveContainer>
                          </div>
                      </Card>
                      <Card title="Recent Check-ins" className="lg:col-span-2">
                          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                              {moods.map(m => (
                                  <div key={m.id} className="flex items-start gap-3">
                                      <div className="text-2xl pt-1">{m.moodEmoji}</div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-baseline">
                                              <p className="text-sm text-textMuted font-bold">{m.type === 'PRE_SHIFT' ? 'Pre-Shift' : 'Post-Shift'}</p>
                                              <p className="text-xs text-textMuted/70 font-mono">{new Date(m.timestamp).toLocaleDateString()}</p>
                                          </div>
                                          {m.comment && (
                                              <div className={`text-sm rounded-md p-2 mt-1 ${m.isShared ? 'bg-surface border border-white/10 text-text' : 'bg-background italic text-textMuted'}`}>
                                                  {m.isShared ? <p>{m.comment}</p> : <div className="flex items-center gap-2"><Icons.Lock size={12}/> Comment not shared.</div>}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </Card>
                  </div>
              )}

              {tab === 'GOALS' && (
                <div className="space-y-4 animate-in fade-in">
                  {goals.map(g => (
                    <Card key={g.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-display font-bold text-lg text-text">{g.title}</h4>
                          <p className="text-sm text-textMuted mt-1 mb-4 max-w-prose">{g.description}</p>
                        </div>
                        <span className="text-xs font-mono text-textMuted">Due: {new Date(g.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-bold text-textMuted uppercase tracking-wider">Progress</p>
                          <span className="font-mono text-secondary text-sm font-bold">{g.progress}%</span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2.5 border border-white/10"><div className="bg-secondary h-full rounded-full" style={{width: `${g.progress}%`}}></div></div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {tab === 'BLOCKERS' && (
                <div className="animate-in fade-in">
                  <h3 className="font-display text-xl font-bold mb-4">Blocker History</h3>
                  <div className="space-y-3">
                    {blockers.map(b => (
                      <div key={b.id} className={`p-4 rounded-lg border flex gap-4 items-start ${b.isResolved ? 'bg-surface/50 border-white/10 text-textMuted' : 'bg-danger/10 border-danger/50 text-text'}`}>
                        <div className="flex-shrink-0 mt-1">
                          {b.isResolved ? <Icons.CheckCircle size={20} className="text-success"/> : <Icons.AlertTriangle size={20} className="text-danger"/>}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{b.description}</p>
                          <p className="text-xs mt-1">Reported on {new Date(b.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge color={b.severity === 'MAJOR' ? 'danger' : 'secondary'}>{b.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
    );
};

export default function People() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userMood, setUserMood] = useState<MoodEntry[]>([]);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [userBlockers, setUserBlockers] = useState<Blocker[]>([]);
  
  const [isRecruitOpen, setIsRecruitOpen] = useState(false);
  const [recruitForm, setRecruitForm] = useState({ fullName: '', username: '', role: 'MEMBER' as Role, level: 3, rate: 20 });

  const loadData = async () => {
    if (!user) return;
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('org_id', user.orgId);
      
      if (usersError) throw usersError;
      
      setUsers((usersData || []).map(u => ({
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
      })));
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.orgId)
        .single();
      
      if (orgError) throw orgError;
      
      setOrg({
        id: orgData.id,
        name: orgData.name,
        description: orgData.description || '',
        logo: orgData.logo,
        settings: orgData.settings || {}
      });
    } catch (error) {
      console.error('Error loading people data:', error);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  useEffect(() => {
    if (selectedUser && user) {
      const loadUserDetails = async () => {
        try {
          const { data: moodData, error: moodError } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', selectedUser.id)
            .order('timestamp', { ascending: false });
          
          if (moodError) throw moodError;
          
          setUserMood((moodData || []).map(m => ({
            id: m.id,
            userId: m.user_id,
            moodValue: m.mood_value,
            type: m.type,
            timestamp: new Date(m.timestamp).getTime(),
            notes: m.notes
          })));
          
          const { data: goalsData, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', selectedUser.id);
          
          if (goalsError) throw goalsError;
          
          setUserGoals((goalsData || []).map(g => ({
            id: g.id,
            userId: g.user_id,
            title: g.title,
            progress: g.progress || 0,
            status: g.status || 'ACTIVE',
            dueDate: g.due_date ? new Date(g.due_date).getTime() : undefined
          })));
          
          const { data: blockersData, error: blockersError } = await supabase
            .from('blockers')
            .select('*')
            .eq('user_id', selectedUser.id)
            .order('timestamp', { ascending: false });
          
          if (blockersError) throw blockersError;
          
          setUserBlockers((blockersData || []).map(b => ({
            id: b.id,
            userId: b.user_id,
            title: b.title,
            description: b.description || '',
            status: b.status || 'ACTIVE',
            severity: b.severity || 'MEDIUM',
            timestamp: new Date(b.timestamp).getTime()
          })));
        } catch (error) {
          console.error('Error loading user details:', error);
        }
      };
      loadUserDetails();
    }
  }, [selectedUser, user]);

  const handleRecruit = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          org_id: user.orgId,
          username: recruitForm.username,
          full_name: recruitForm.fullName,
          email: `${recruitForm.username}@company.com`,
          role: recruitForm.role,
          avatar: '#' + Math.floor(Math.random()*16777215).toString(16),
          status: 'ONLINE',
          timezone: 'UTC'
        });
      if (error) throw error;
      setIsRecruitOpen(false);
      setRecruitForm({ fullName: '', username: '', role: 'MEMBER', level: 3, rate: 20 });
      loadData();
    } catch (error) {
      console.error('Error recruiting user:', error);
    }
  };

  if (!org) return null;

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-12 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold text-text mb-2">Team Roster</h1>
          <p className="font-sans text-textMuted tracking-widest text-sm">OPERATIVE DATABASE</p>
        </div>
        {(user?.hierarchyLevel <= 1) && (
           <Button onClick={() => setIsRecruitOpen(true)}>
             <Icons.UserPlus size={18} /> Recruit Operative
           </Button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((u) => (
          <Card key={u.id} className="relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer hover:border-primary/50" onClick={() => setSelectedUser(u)}>
             <div className="absolute top-4 right-4">
                <div className={`w-3 h-3 rounded-full border-2 border-background ${u.isOnline ? 'bg-success' : 'bg-textMuted'}`} />
             </div>
             
             <div className="flex flex-col items-center text-center mt-2">
                <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1 mb-4 bg-background shadow-lg">
                   <div className="w-full h-full rounded-full bg-secondary/10 flex items-center justify-center text-3xl font-bold font-display text-text relative overflow-hidden">
                      {u.username.substring(0,2).toUpperCase()}
                   </div>
                </div>
                
                <h3 className="text-xl font-display font-bold text-text mb-1">{u.fullName}</h3>
                <p className="font-mono text-sm text-textMuted mb-6">@{u.username}</p>
                
                <div className="w-full space-y-3 bg-background p-3 rounded-md border border-white/10">
                   <div className="flex justify-between text-xs font-sans text-textMuted">
                      <span>LEVEL</span>
                      <span className="text-text font-bold">{u.hierarchyLevel}</span>
                   </div>
                   <div className="flex justify-between text-xs font-sans text-textMuted">
                      <span>ROLE</span>
                      <span className="text-text font-bold uppercase">{u.role}</span>
                   </div>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isRecruitOpen} onClose={() => setIsRecruitOpen(false)} title="New Operative Registration">
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Full Name" value={recruitForm.fullName} onChange={e => setRecruitForm({...recruitForm, fullName: e.target.value})} />
               <Input label="Username" value={recruitForm.username} onChange={e => setRecruitForm({...recruitForm, username: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1 mb-2 block">Role</label>
                  <select 
                     className="w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                     value={recruitForm.role}
                     onChange={e => setRecruitForm({...recruitForm, role: e.target.value as Role})}
                  >
                     <option value="MEMBER">Member</option>
                     <option value="LEAD">Lead</option>
                     <option value="MANAGER">Manager</option>
                  </select>
               </div>
               <div>
                  <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1 mb-2 block">Hierarchy Level</label>
                  <select 
                     className="w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                     value={recruitForm.level}
                     onChange={e => setRecruitForm({...recruitForm, level: parseInt(e.target.value)})}
                  >
                     {org.hierarchyLevels.map((lvl, i) => (
                        <option key={i} value={i}>{i} - {lvl}</option>
                     ))}
                  </select>
               </div>
            </div>

            <Input label="Hourly Rate ($)" type="number" value={recruitForm.rate} onChange={e => setRecruitForm({...recruitForm, rate: parseInt(e.target.value)})} />

            <div className="pt-4 flex gap-4">
               <Button onClick={handleRecruit} className="w-full">Authorize Operative</Button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Operative Dossier">
        {selectedUser && (
          <EmployeeDashboard 
            employee={selectedUser}
            moods={userMood}
            goals={userGoals}
            blockers={userBlockers}
          />
        )}
      </Modal>
    </div>
  );
}
