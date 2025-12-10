import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Card, Button } from '../components/UI';
import { ClockEntry, User, Project } from '../types';
import * as Icons from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [burnRate, setBurnRate] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [myStats, setMyStats] = useState({ reliability: 98, xp: 0, nextLevel: 1000 });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        // Fetch clock entries
        const { data: entries, error: entriesError } = await supabase
          .from('clock_entries')
          .select('*')
          .eq('status', 'ACTIVE');
        
        if (!entriesError && entries) {
          const mappedEntries: ClockEntry[] = entries.map(e => ({
            id: e.id,
            shiftId: e.shift_id,
            userId: e.user_id,
            clockInAt: new Date(e.clock_in_at).getTime(),
            clockOutAt: e.clock_out_at ? new Date(e.clock_out_at).getTime() : undefined,
            summary: e.summary,
            rating: e.rating,
            managerComment: e.manager_comment,
            moraleScore: e.morale_score,
            bountyAwarded: e.bounty_awarded,
            status: e.status,
          }));
          setEntries(mappedEntries);

          // Fetch users
          const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('org_id', user.orgId);

          if (users) {
            const mappedUsers: User[] = users.map(u => ({
              id: u.id,
              orgId: u.org_id,
              username: u.username,
              fullName: u.full_name,
              email: u.email,
              role: u.role,
              hierarchyLevel: u.hierarchy_level,
              color: u.color,
              hourlyRate: u.hourly_rate,
              xp: u.xp,
              skills: u.skills || [],
              badges: u.badges || [],
              isOnline: u.is_online,
            }));

            // Active Users Logic
            const activeEntries = mappedEntries.filter(e => e.status === 'ACTIVE');
            const activeUserIds = activeEntries.map(e => e.userId);
            setActiveUsers(mappedUsers.filter(u => activeUserIds.includes(u.id)));

            // Burn Rate
            let rate = 0;
            activeEntries.forEach(e => {
              const u = mappedUsers.find(u => u.id === e.userId);
              if (u?.hourlyRate) rate += u.hourlyRate;
            });
            setBurnRate(rate);

            // Recent Activity Feed
            const feed = mappedEntries
              .sort((a,b) => b.clockInAt - a.clockInAt)
              .slice(0, 5)
              .map(e => {
                 const u = mappedUsers.find(u => u.id === e.userId);
                 return {
                    user: u,
                    type: e.status === 'ACTIVE' ? 'started working' : 'wrapped up',
                    time: e.clockInAt
                 };
              });
            setRecentActivity(feed);
          }
        }

        // Fetch projects
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('org_id', user.orgId);

        if (projects) {
          const mappedProjects: Project[] = projects.map(p => ({
            id: p.id,
            orgId: p.org_id,
            name: p.name,
            description: p.description,
            status: p.status,
            leadId: p.lead_id,
            color: p.color,
            budget: p.budget,
            createdAt: new Date(p.created_at).getTime(),
            updatedAt: new Date(p.updated_at).getTime(),
          }));
          setProjects(mappedProjects);
        }

        // Employee Stats
        if (user.role !== 'FOUNDER') {
           setMyStats({
              reliability: 96,
              xp: user.xp || 0,
              nextLevel: ((Math.floor((user.xp || 0)/1000) + 1) * 1000)
           });
        }
      } catch (error) {
        console.error('Dashboard data load error:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const pulseData = Array.from({length: 12}, (_, i) => ({
    name: `${i}:00`,
    val: Math.floor(Math.random() * 80) + 20
  }));

  if (!user) return null;

  // --- FOUNDER/LEAD VIEW ---
  if (user.hierarchyLevel <= 2) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-text mb-1">System Status</h1>
            <p className="font-sans text-textMuted text-lg">Live operational overview for {user.orgId}.</p>
          </div>
          <div className="bg-surface px-6 py-3 rounded-lg border border-white/10 flex items-center gap-3">
             <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
             <p className="text-2xl font-display font-bold text-text">${burnRate}<span className="text-sm font-sans text-textMuted">/hr</span></p>
          </div>
        </header>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           <Card className="bg-primary/10 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                 <Icons.Users className="text-primary" size={20} />
                 <span className="font-sans font-bold text-sm text-primary">Active</span>
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold text-text">{activeUsers.length}</div>
           </Card>
           
           <Card className="bg-accent/10 border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                 <Icons.Zap className="text-accent" size={20} />
                 <span className="font-sans font-bold text-sm text-accent">Efficiency</span>
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold text-text">94%</div>
           </Card>

           <Card className="bg-secondary/10 border-secondary/20">
              <div className="flex items-center gap-3 mb-2">
                 <Icons.DollarSign className="text-secondary" size={20} />
                 <span className="font-sans font-bold text-sm text-secondary">Spend</span>
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold text-text">$1.2k</div>
           </Card>

           <Card>
              <div className="flex items-center gap-3 mb-2">
                 <Icons.Smile className="text-textMuted" size={20} />
                 <span className="font-sans font-bold text-sm text-textMuted">Mood</span>
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold text-text">Great</div>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Live Ops Grid */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="font-display font-bold text-2xl text-text">Team Activity</h2>
                 <Button variant="ghost" className="text-sm">View Log</Button>
              </div>
              
              <div className="space-y-4">
                 {activeUsers.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-white/10 rounded-lg text-center text-textMuted font-sans text-sm">
                       SYSTEM IDLE. AWAITING OPERATOR INPUT.
                    </div>
                 ) : (
                    activeUsers.map((u) => (
                       <div key={u.id} className="bg-surface border border-white/10 p-4 rounded-lg flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center font-display font-bold text-lg">
                                {u.username.substring(0,2).toUpperCase()}
                             </div>
                             <div>
                                <p className="font-bold text-text text-md">{u.fullName}</p>
                                <p className="text-sm font-sans text-textMuted">Working on: Matrix Rebuild</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-bold font-sans uppercase tracking-wider">ACTIVE</span>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Quick Actions & Financials */}
           <div className="space-y-6">
              <Card title="Financial Pulse">
                 <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={pulseData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                             <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <Tooltip contentStyle={{backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontFamily: 'Inter'}} labelStyle={{color: '#8B949E'}} />
                          <Area type="monotone" dataKey="val" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <Card title="Intel Briefing">
                 <div className="space-y-3 font-sans text-sm">
                    <div className="flex items-center gap-3">
                       <Icons.CheckCircle size={18} className="text-success" />
                       <span>Coffee machine has been upgraded.</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Icons.Star size={18} className="text-secondary" />
                       <span>New client contract secured.</span>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    );
  }

  // --- EMPLOYEE VIEW ---
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
       <header>
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-text mb-2">My Terminal</h1>
        <p className="font-sans text-textMuted text-xl">Welcome back, {user.fullName.split(' ')[0]}. Ready to build?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-primary/50" glow>
            <h2 className="text-2xl font-display font-bold text-text mb-6">Next Deployment</h2>
            <div className="mb-8 text-center">
               <div className="text-6xl font-display font-bold text-text mb-2">08:00</div>
               <div className="bg-surface inline-block px-4 py-1 rounded-full border border-white/10 text-sm font-bold text-textMuted">TOMORROW</div>
            </div>
            <div className="flex gap-4">
               <Button className="flex-1" variant="secondary">Details</Button>
               <Button className="flex-1">Clock In</Button>
            </div>
         </Card>

         <Card>
            <h2 className="text-2xl font-display font-bold text-text mb-6">My Progress</h2>
            <div className="space-y-6">
               <div className="text-center">
                  <div className="text-5xl font-display font-bold text-success mb-2">{myStats.reliability}%</div>
                  <div className="text-xs text-textMuted uppercase tracking-widest font-sans">Reliability Score</div>
               </div>
               <div>
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-xs text-textMuted uppercase tracking-widest font-sans">XP GAIN</span>
                     <span className="text-sm font-mono text-secondary">{myStats.xp} / {myStats.nextLevel}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-3 border border-white/10">
                     <div className="bg-secondary h-full rounded-full" style={{width: `${(myStats.xp / myStats.nextLevel) * 100}%`}}></div>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
