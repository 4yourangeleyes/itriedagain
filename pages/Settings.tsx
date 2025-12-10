import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Organization, PermissionKey } from '../types';
import { Card, Button, Input, SwitchToggle } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'ACCESS' | 'STRUCTURE' | 'SYSTEM'>('ACCESS');

  useEffect(() => {
    if (!user || user.role !== 'FOUNDER') {
      navigate('/');
      return;
    }
    
    const loadOrg = async () => {
      try {
        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', user.orgId)
          .single();
        
        if (error) throw error;
        
        setOrg({
          id: orgData.id,
          name: orgData.name,
          description: orgData.description || '',
          logo: orgData.logo,
          settings: orgData.settings || {}
        });
      } catch (error) {
        console.error('Error loading org:', error);
      }
    };
    
    loadOrg();
  }, [user, navigate]);

  const updatePermission = async (key: string, level: number) => {
    if (!org) return;
    try {
      const updated = { ...org, settings: { ...org.settings, permissions: { ...org.settings.permissions, [key]: level } } };
      setOrg(updated);
      const { error } = await supabase
        .from('organizations')
        .update({ settings: updated.settings })
        .eq('id', org.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  const updateSetting = async (key: keyof Organization['settings'], value: any) => {
    if (!org) return;
    try {
      const updated = { ...org, settings: { ...org.settings, [key]: value } };
      setOrg(updated);
      const { error } = await supabase
        .from('organizations')
        .update({ settings: updated.settings })
        .eq('id', org.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const addHierarchyLevel = async () => {
    if (!org) return;
    try {
      // This would require a separate hierarchy_levels table in production
      // For now, we'll just update the org settings
      const updated = { ...org, settings: { ...org.settings, newHierarchyLevel: 'New Role' } };
      setOrg(updated);
      const { error } = await supabase
        .from('organizations')
        .update({ settings: updated.settings })
        .eq('id', org.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error adding hierarchy level:', error);
    }
  };

  const updateHierarchyName = async (index: number, name: string) => {
    if (!org) return;
    try {
      const updated = { ...org, settings: { ...org.settings, hierarchyLevel: name } };
      setOrg(updated);
      const { error } = await supabase
        .from('organizations')
        .update({ settings: updated.settings })
        .eq('id', org.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating hierarchy name:', error);
    }
  };

  if (!org) return null;

  const permissionLabels: Record<PermissionKey, string> = {
    'create_project': 'Create Projects',
    'manage_team': 'Manage Team Roster',
    'create_shift': 'Schedule Deployments',
    'approve_exceptions': 'Approve Time Corrections',
    'view_analytics': 'View Global Analytics',
    'view_financials': 'View Financial Data',
    'edit_timecards': 'Edit Historical Logs'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="border-b border-white/10 pb-6">
        <h1 className="text-5xl font-display font-bold text-text mb-2">System Config</h1>
        <p className="font-sans text-textMuted tracking-widest text-sm">GLOBAL SETTINGS // {org.name.toUpperCase()}</p>
      </header>

      <div className="flex gap-2 bg-surface border border-white/10 p-1 rounded-lg w-fit">
        {['ACCESS', 'STRUCTURE', 'SYSTEM'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md font-sans text-sm font-bold transition-all ${
              activeTab === tab 
                ? 'bg-primary/10 text-primary' 
                : 'text-textMuted hover:text-text hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'ACCESS' && (
        <section className="animate-in fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-text">Permission Matrix</h2>
            <p className="text-textMuted text-sm font-sans mt-1">Define capabilities for each hierarchy level.</p>
          </div>
          
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-6 text-sm font-sans text-textMuted uppercase font-bold tracking-widest bg-surface/50">Capability</th>
                    {org.hierarchyLevels.map((level, i) => (
                      <th key={i} className="p-6 text-center border-l border-white/10 bg-surface/50">
                        <div className="text-xs font-sans text-textMuted uppercase mb-1">Level {i}</div>
                        <div className="text-sm font-bold font-display text-text">{level.toUpperCase()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(permissionLabels) as PermissionKey[]).map((perm) => (
                    <tr key={perm} className="border-t border-white/10 hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="text-md font-sans font-bold text-text">{permissionLabels[perm]}</div>
                      </td>
                      {org.hierarchyLevels.map((_, i) => {
                        const isSelected = (org.settings.permissions[perm] ?? 0) === i;
                        return (
                          <td key={i} className="p-6 text-center border-l border-white/10">
                            <button 
                              onClick={() => updatePermission(perm, i)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mx-auto border-2 ${isSelected ? 'bg-primary border-primary' : 'bg-surface border-white/20 hover:border-primary'}`}
                            >
                              {isSelected && <Icons.Check size={14} className="text-background stroke-[3]" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

      {activeTab === 'STRUCTURE' && (
        <section className="animate-in fade-in max-w-4xl">
           <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-display font-bold text-text">Hierarchy</h2>
              <p className="text-textMuted text-sm font-sans mt-1">Define the command chain.</p>
            </div>
            <Button onClick={addHierarchyLevel} variant="secondary">+ New Level</Button>
          </div>

          <div className="space-y-4">
             {org.hierarchyLevels.map((lvl, i) => (
               <div key={i} className="flex items-center gap-6 p-4 bg-surface border border-white/10 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-background border border-white/10 flex items-center justify-center font-bold text-text font-display text-xl">
                     L{i}
                  </div>
                  <div className="flex-1">
                     <label className="text-xs font-sans font-bold text-textMuted uppercase mb-1 block">Title</label>
                     <input 
                        value={lvl}
                        onChange={(e) => updateHierarchyName(i, e.target.value)}
                        className="bg-transparent text-xl font-sans font-bold text-text focus:outline-none focus:text-primary transition-colors w-full border-b-2 border-transparent focus:border-primary"
                     />
                  </div>
                  <div className="flex items-center gap-4">
                     {i === 0 ? (
                        <span className="text-xs font-bold font-sans text-success bg-success/10 px-3 py-1 rounded-full border border-success/20">ROOT</span>
                     ) : (
                        <button className="text-textMuted hover:text-danger transition-colors"><Icons.Trash2 size={20} /></button>
                     )}
                  </div>
               </div>
             ))}
          </div>
        </section>
      )}

      {activeTab === 'SYSTEM' && (
         <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
            <div>
               <Card title="System Rules">
                  <div className="space-y-1">
                     <SwitchToggle 
                        label="Require Shift Handover Notes" 
                        checked={org.settings.requireHandover} 
                        onChange={(v) => updateSetting('requireHandover', v)} 
                     />
                     <SwitchToggle 
                        label="Strict Mode (No Late Clock-ins)" 
                        checked={org.settings.strictMode} 
                        onChange={(v) => updateSetting('strictMode', v)} 
                     />
                     <div className="py-4 flex justify-between items-center border-b border-white/10">
                        <span className="font-sans font-medium text-text text-sm">Allowed Early Clock-in</span>
                        <div className="flex items-center gap-2">
                           <input 
                              type="number" 
                              value={org.settings.allowedEarlyClockIn} 
                              onChange={(e) => updateSetting('allowedEarlyClockIn', parseInt(e.target.value))}
                              className="w-20 bg-background border border-white/20 rounded-md px-2 py-1 text-right text-text font-sans font-bold text-lg focus:ring-2 focus:ring-primary"
                           />
                           <span className="text-xs text-textMuted font-bold font-sans">MINS</span>
                        </div>
                     </div>
                     <div className="py-4 flex justify-between items-center">
                        <span className="font-sans font-medium text-text text-sm">Base Currency</span>
                        <select 
                           value={org.settings.currency}
                           onChange={(e) => updateSetting('currency', e.target.value)}
                           className="bg-background border border-white/20 rounded-md px-2 py-1 text-text font-sans font-bold text-lg focus:outline-none"
                        >
                           <option value="USD">USD ($)</option>
                           <option value="EUR">EUR (€)</option>
                           <option value="GBP">GBP (£)</option>
                           <option value="BTC">BTC (₿)</option>
                        </select>
                     </div>
                  </div>
               </Card>
            </div>

            <div>
               <Card title="Danger Zone" className="border-danger/50 bg-danger/5">
                  <p className="text-sm text-danger/80 mb-6 font-sans">System-critical actions. Proceed with caution.</p>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center p-4 border border-danger/20 bg-surface rounded-lg">
                        <div>
                           <h4 className="font-bold text-text font-sans">Reset All Shift Data</h4>
                           <p className="text-xs text-textMuted font-sans">Clears clock entries and project history.</p>
                        </div>
                        <Button variant="danger">Purge</Button>
                     </div>
                     <div className="flex justify-between items-center p-4 border border-danger/20 bg-surface rounded-lg">
                        <div>
                           <h4 className="font-bold text-text font-sans">Delete Organization</h4>
                           <p className="text-xs text-textMuted font-sans">Permanent wipe of all data.</p>
                        </div>
                        <Button variant="danger">Delete</Button>
                     </div>
                  </div>
               </Card>
            </div>
         </section>
      )}
    </div>
  );
}
