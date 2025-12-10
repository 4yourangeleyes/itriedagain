import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, SwitchToggle } from '../components/UI';
import * as Icons from 'lucide-react';
import * as authService from '../services/auth';
import { User } from '../types';
import * as db from '../services/db';

export default function TeamManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'MANAGER' | 'LEAD' | 'MEMBER'>('MEMBER');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Only founders and managers can manage team
    if (!user || !['FOUNDER', 'MANAGER'].includes(user.role)) {
      navigate('/');
      return;
    }

    loadTeamMembers();
  }, [user, navigate]);

  const loadTeamMembers = async () => {
    if (!user) return;
    try {
      const members = await authService.getOrganizationUsers(user.orgId);
      setTeamMembers(members.sort((a, b) => a.hierarchyLevel - b.hierarchyLevel));
    } catch (err) {
      console.error('Error loading team members:', err);
    }
  };

  const getRoleHierarchyLevel = (role: string): number => {
    const levels: Record<string, number> = {
      'FOUNDER': 0,
      'MANAGER': 1,
      'LEAD': 2,
      'MEMBER': 3,
    };
    return levels[role] || 3;
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!newMemberEmail.trim() || !newMemberName.trim()) {
        throw new Error('Email and name are required');
      }

      if (!newMemberEmail.includes('@')) {
        throw new Error('Invalid email address');
      }

      // Check if email already exists
      const existingMembers = await authService.getOrganizationUsers(user?.orgId || '');
      if (existingMembers.some(m => m.email === newMemberEmail.trim())) {
        throw new Error('This email is already registered');
      }

      // Create team member
      const result = await authService.createTeamMember(
        user?.orgId || '',
        newMemberEmail,
        newMemberName,
        newMemberRole,
        getRoleHierarchyLevel(newMemberRole)
      );

      if (result) {
        setGeneratedPassword(result.password);
        setSuccess(`Team member added! Temporary password: ${result.password}`);
        
        // Reset form
        setTimeout(() => {
          setNewMemberEmail('');
          setNewMemberName('');
          setNewMemberRole('MEMBER');
          setGeneratedPassword('');
          loadTeamMembers();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    setLoading(true);
    try {
      await authService.deleteTeamMember(memberId);
      setSuccess('Team member removed');
      loadTeamMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setSuccess('Password copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'FOUNDER': 'bg-primary/20 text-primary border-primary/50',
      'MANAGER': 'bg-secondary/20 text-secondary border-secondary/50',
      'LEAD': 'bg-accent/20 text-accent border-accent/50',
      'MEMBER': 'bg-white/5 text-textMuted border-white/20',
    };
    return colors[role] || colors['MEMBER'];
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-text tracking-wider mb-2">Team Management</h1>
          <p className="text-textMuted">Manage your organization's team members and permissions</p>
        </div>
        {user?.role === 'FOUNDER' && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Icons.Plus size={18} className="mr-2" />
            {showAddForm ? 'Cancel' : 'Add Team Member'}
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/20 border border-success/50 rounded-lg text-success text-sm flex items-center justify-between">
          <span>{success}</span>
          {generatedPassword && (
            <button
              onClick={handleCopyPassword}
              className="ml-2 text-success hover:text-success/80 transition-colors"
            >
              <Icons.Copy size={16} />
            </button>
          )}
        </div>
      )}

      {showAddForm && (
        <Card className="bg-surface/50 border-primary/20" glow>
          <form onSubmit={handleAddTeamMember} className="space-y-4">
            <h2 className="text-xl font-bold text-text mb-6">Add New Team Member</h2>

            <Input
              label="Email Address"
              type="email"
              value={newMemberEmail}
              onChange={e => setNewMemberEmail(e.target.value)}
              placeholder="team@example.com"
              disabled={loading}
            />

            <Input
              label="Full Name"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-textMuted mb-2">Role</label>
                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value as any)}
                  disabled={loading}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="LEAD">Team Lead</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-textMuted">
              <p className="font-semibold text-text mb-2">Auto-Generated Password:</p>
              <p className="font-mono text-xs bg-background px-2 py-1 rounded border border-white/10 truncate">
                A secure password will be auto-generated and displayed after creation
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Icons.Loader size={16} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Icons.Plus size={16} className="mr-2" />
                    Add Team Member
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAddForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-text">Team Members ({teamMembers.length})</h2>

        {teamMembers.length === 0 ? (
          <Card className="bg-surface/30 border-white/10">
            <div className="text-center py-12">
              <Icons.Users size={48} className="mx-auto text-textMuted/50 mb-4" />
              <p className="text-textMuted">No team members yet. Add your first team member to get started.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {teamMembers.map(member => (
              <Card key={member.id} className="bg-surface/50 border-white/10">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/50 font-bold text-primary">
                      {member.fullName.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-text">{member.fullName}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-sm text-textMuted">{member.email}</p>
                    </div>
                  </div>

                  {user?.role === 'FOUNDER' && member.role !== 'FOUNDER' && (
                    <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      disabled={loading}
                      className="p-2 hover:bg-danger/10 rounded-lg text-danger transition-colors"
                      title="Remove team member"
                    >
                      <Icons.Trash2 size={20} />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
