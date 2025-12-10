
import { User, Organization, Project, Shift, ClockEntry, Exception, Chat, Message, Phase, MoodEntry, Goal, Blocker, Recognition } from '../types';

// Constants
const STORAGE_KEY = 'orbitshift_db_v4_psy';
const NETWORK_DELAY = 300; 

// Initial Seed Data Generator
const generateSeedData = () => {
  const orgId = 'org-1';
  
  const users: User[] = [
    { id: 'u-1', username: 'neo', fullName: 'Neo Anderson', role: 'FOUNDER', hierarchyLevel: 0, orgId, password: 'password', color: '#ccff00', hourlyRate: 150, xp: 5000, skills: ['Leadership', 'System Arch'], badges: ['Founder'] },
    { id: 'u-2', username: 'trinity', fullName: 'Trinity Moss', role: 'MANAGER', hierarchyLevel: 1, orgId, password: 'password', color: '#00f0ff', hourlyRate: 95, xp: 3200, skills: ['Hacking', 'Ops'], badges: ['Top Performer'] },
    { id: 'u-3', username: 'morpheus', fullName: 'Morpheus King', role: 'LEAD', hierarchyLevel: 2, orgId, password: 'password', color: '#ff00aa', hourlyRate: 85, xp: 2800, skills: ['Strategy'], badges: ['Mentor'] },
    { id: 'u-4', username: 'tank', fullName: 'Tank Operator', role: 'MEMBER', hierarchyLevel: 3, orgId, password: 'password', color: '#ffffff', hourlyRate: 45, xp: 1200, skills: ['Comms'], badges: ['Reliable'] },
    { id: 'u-5', username: 'dozer', fullName: 'Dozer Tank', role: 'MEMBER', hierarchyLevel: 3, orgId, password: 'password', color: '#a0a0a0', hourlyRate: 45, xp: 1100, skills: ['Support'], badges: [] },
  ];

  const org: Organization = {
    id: orgId,
    name: 'Zion Mainframe',
    hierarchyLevels: ['Architect', 'Commander', 'Operator', 'Crew'],
    settings: {
      permissions: {
        'create_project': 1,
        'manage_team': 1,
        'create_shift': 2,
        'approve_exceptions': 2,
        'view_analytics': 0,
        'view_financials': 0,
        'edit_timecards': 1
      },
      requireHandover: true,
      allowedEarlyClockIn: 15,
      currency: 'USD',
      strictMode: true
    }
  };

  const projects: Project[] = [
    {
      id: 'p-1',
      orgId,
      name: 'Nebuchadnezzar Rebuild',
      description: 'System overhaul for the main hovercraft. Critical priority.',
      status: 'ACTIVE',
      leadId: 'u-3',
      assignedUserIds: ['u-4', 'u-5'],
      color: '#00f0ff',
      phases: [
        { id: 'ph-1', name: 'Diagnostics', goals: ['Check EMP cores', 'Hull integrity scan'] },
        { id: 'ph-2', name: 'Refit', goals: ['Install V2 software', 'Replace coils'] }
      ]
    },
    {
      id: 'p-2',
      orgId,
      name: 'Matrix Infiltration',
      description: 'Covert ops to extract potential one.',
      status: 'DRAFT',
      leadId: 'u-2',
      assignedUserIds: ['u-2', 'u-3'],
      color: '#ccff00',
      phases: [
        { id: 'ph-3', name: 'Recon', goals: ['Locate target'] }
      ]
    }
  ];

  const today = new Date();
  today.setHours(9, 0, 0, 0);
  const shifts: Shift[] = [
    {
      id: 's-1', orgId, projectId: 'p-1', phaseId: 'ph-2', assigneeId: 'u-4',
      startAt: today.getTime(), endAt: today.getTime() + 8 * 3600000, allowedEarlyMinutes: 30,
      personalGoals: ['Calibrate engine 1', 'Sync nav computer'],
      bounty: '100% Efficiency Rating'
    }
  ];

  const clockEntries: ClockEntry[] = [
     { id: 'clk-1', shiftId: 's-1', userId: 'u-4', clockInAt: Date.now() - 3600000, status: 'ACTIVE' },
     { id: 'clk-2', shiftId: 's-1', userId: 'u-5', clockInAt: Date.now() - 7200000, status: 'ACTIVE' }
  ];

  const moodEntries: MoodEntry[] = [
    // Data for u-4 (tank)
    { id: 'm-1', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 5, type: 'PRE_SHIFT', moodValue: 4, moodEmoji: '😊', isShared: false, isUrgent: false },
    { id: 'm-2', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 5 + 8 * 3600000, type: 'POST_SHIFT', moodValue: 3, moodEmoji: '😐', comment: 'Long day, tough bug.', isShared: true, isUrgent: false },
    { id: 'm-3', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 4, type: 'PRE_SHIFT', moodValue: 5, moodEmoji: '😁', isShared: false, isUrgent: false },
    { id: 'm-4', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 4 + 8 * 3600000, type: 'POST_SHIFT', moodValue: 4, moodEmoji: '😊', comment: 'Productive session.', isShared: false, isUrgent: false },
    { id: 'm-5', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 3, type: 'PRE_SHIFT', moodValue: 3, moodEmoji: '😐', isShared: false, isUrgent: false },
    { id: 'm-6', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 3 + 8 * 3600000, type: 'POST_SHIFT', moodValue: 2, moodEmoji: '😟', comment: 'Feeling blocked on the mainframe integration.', isShared: true, isUrgent: false },
    { id: 'm-7', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 2, type: 'PRE_SHIFT', moodValue: 2, moodEmoji: '😟', isShared: false, isUrgent: true, comment: "Need to talk about the blocker." },
    { id: 'm-8', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 2 + 8 * 3600000, type: 'POST_SHIFT', moodValue: 3, moodEmoji: '😐', isShared: false, isUrgent: false },
    { id: 'm-9', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 1, type: 'PRE_SHIFT', moodValue: 4, moodEmoji: '😊', isShared: false, isUrgent: false },
    { id: 'm-10', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 1 + 8 * 3600000, type: 'POST_SHIFT', moodValue: 5, moodEmoji: '😁', comment: 'Broke through the blocker! Big win!', isShared: true, isUrgent: false },
  ];

  const goals: Goal[] = [
    { id: 'g-1', employeeId: 'u-4', title: 'Master V2 Nav-Comms', description: 'Complete all training modules for the new navigation comms system.', targetDate: Date.now() + 86400000 * 30, progress: 65, relatedSkills: ['Comms', 'V2 Systems'] },
    { id: 'g-2', employeeId: 'u-4', title: 'Achieve Level 4 Operator', description: 'Gain enough XP and proficiency to be promoted.', targetDate: Date.now() + 86400000 * 90, progress: 20, relatedSkills: ['Leadership'] }
  ];

  const blockers: Blocker[] = [
      { id: 'b-1', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 3, severity: 'MAJOR', description: 'Mainframe integration API is not responding as documented.', isResolved: false },
      { id: 'b-2', employeeId: 'u-4', timestamp: Date.now() - 86400000 * 10, severity: 'MINOR', description: 'Test environment credentials expired.', isResolved: true }
  ];

  const recognitions: Recognition[] = [
      { id: 'r-1', recipientId: 'u-4', giverId: 'u-3', timestamp: Date.now() - 86400000, message: 'Great job solving that tough mainframe bug!', type: 'KUDOS' }
  ];

  return { users, orgs: [org], projects, shifts, clockEntries, exceptions: [], chats: [], messages: [], moodEntries, goals, blockers, recognitions };
};

class MockDatabase {
  private data: any;
  private broadcastChannel: BroadcastChannel;

  constructor() {
    this.broadcastChannel = new BroadcastChannel('orbitshift_rt');
    // Pre-load data logic
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.data = generateSeedData();
      this.persist(); 
    }
    
    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'SYNC_DATA') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) this.data = JSON.parse(stored);
      }
    };
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SYNC_DATA' });
    }
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));
  }

  // --- Base ---
  async getServerTime(): Promise<number> { await this.delay(); return Date.now(); }
  async login(username: string): Promise<User | null> { await this.delay(); return this.data.users.find((u: User) => u.username === username) || null; }
  
  // --- Org & Users ---
  async getOrg(orgId: string): Promise<Organization | null> { await this.delay(); return this.data.orgs.find((o: Organization) => o.id === orgId) || null; }
  async updateOrg(org: Organization): Promise<Organization> { 
    await this.delay(); 
    const idx = this.data.orgs.findIndex((o: Organization) => o.id === org.id);
    if (idx !== -1) { this.data.orgs[idx] = org; this.persist(); }
    return org; 
  }
  async createOrg(orgName: string, founderName: string, levels: string[]): Promise<{ user: User, org: Organization }> {
    await this.delay();
    const orgId = `org-${Date.now()}`;
    const org: Organization = { 
      id: orgId, name: orgName, hierarchyLevels: levels, 
      settings: { 
         permissions: {'create_project': 1, 'manage_team': 1, 'create_shift': 2, 'approve_exceptions': 2, 'view_analytics': 0, 'view_financials': 0, 'edit_timecards': 1}, 
         requireHandover: true,
         allowedEarlyClockIn: 15,
         currency: 'USD',
         strictMode: true
      } 
    };
    const user: User = { id: `u-${Date.now()}`, username: founderName.toLowerCase().replace(/\s/g, ''), fullName: founderName, role: 'FOUNDER', hierarchyLevel: 0, orgId, password: 'password', color: '#ccff00', hourlyRate: 100, xp: 0 };
    this.data.orgs.push(org); this.data.users.push(user); this.persist();
    return { user, org };
  }
  async getUsers(orgId: string): Promise<User[]> { await this.delay(); return this.data.users.filter((u: User) => u.orgId === orgId); }
  
  async createUser(user: Partial<User>): Promise<User> {
    await this.delay();
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
      password: 'password', // Default password
      xp: 0,
      skills: [],
      badges: [],
      isOnline: false,
    } as User;
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  async getAvailableUsers(orgId: string): Promise<User[]> {
    await this.delay();
    return this.data.users.filter((u: User) => u.orgId === orgId);
  }

  // --- Projects ---
  async getProjects(orgId: string): Promise<Project[]> { await this.delay(); return this.data.projects.filter((p: Project) => p.orgId === orgId); }
  
  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    await this.delay();
    const newP = { ...project, id: `p-${Date.now()}` };
    this.data.projects.push(newP);
    this.persist();
    return newP;
  }

  async updateProject(project: Project): Promise<Project> {
    await this.delay();
    const idx = this.data.projects.findIndex((p: Project) => p.id === project.id);
    if (idx !== -1) { this.data.projects[idx] = project; this.persist(); }
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await this.delay();
    this.data.projects = this.data.projects.filter((p: Project) => p.id !== id);
    this.persist();
  }

  // --- Shifts & Clock ---
  async getShifts(orgId: string): Promise<Shift[]> { await this.delay(); return this.data.shifts.filter((s: Shift) => s.orgId === orgId); }
  async createShift(shift: Omit<Shift, 'id'>): Promise<Shift> { 
    await this.delay(); 
    const ns = { ...shift, id: `s-${Date.now()}` }; 
    this.data.shifts.push(ns); this.persist(); 
    return ns; 
  }
  async getClockEntries(orgId: string): Promise<ClockEntry[]> { await this.delay(); return this.data.clockEntries; }
  
  async canClockIn(shift: Shift): Promise<{ allowed: boolean; reason?: string }> {
    await this.delay();
    const now = Date.now();
    const earlyWindow = shift.startAt - (shift.allowedEarlyMinutes * 60 * 1000);
    
    // Check if already clocked in
    const existing = this.data.clockEntries.find((c: ClockEntry) => c.shiftId === shift.id && c.status === 'ACTIVE');
    if (existing) return { allowed: false, reason: 'Already clocked in' };

    // Check time window
    if (now < earlyWindow) {
      return { allowed: false, reason: `Too early. Window opens at ${new Date(earlyWindow).toLocaleTimeString()}` };
    }
    
    // Check late (optional strictness)
    // if (now > shift.endAt) return { allowed: false, reason: 'Shift ended' };

    return { allowed: true };
  }

  async clockIn(userId: string, shiftId: string): Promise<ClockEntry> {
    await this.delay();
    const entry: ClockEntry = { id: `clk-${Date.now()}`, shiftId, userId, clockInAt: Date.now(), status: 'ACTIVE' };
    this.data.clockEntries.push(entry); this.persist();
    return entry;
  }
  
  async clockOut(entryId: string, summary: string, moraleScore: number, bountyClaimed: boolean): Promise<ClockEntry> {
    await this.delay();
    const idx = this.data.clockEntries.findIndex((c: ClockEntry) => c.id === entryId);
    if (idx === -1) throw new Error("Entry not found");
    const updated = { ...this.data.clockEntries[idx], clockOutAt: Date.now(), summary, moraleScore, bountyClaimed, status: 'COMPLETED' };
    this.data.clockEntries[idx] = updated; this.persist();
    return updated;
  }

  async rateShift(entryId: string, rating: number, comment?: string, approveBounty?: boolean): Promise<ClockEntry> {
    await this.delay();
    const idx = this.data.clockEntries.findIndex((c: ClockEntry) => c.id === entryId);
    if (idx === -1) throw new Error("Entry not found");
    const updated = { ...this.data.clockEntries[idx], rating, managerComment: comment, bountyAwarded: approveBounty };
    this.data.clockEntries[idx] = updated; this.persist();
    return updated;
  }

  // --- Chat ---
  async getChats(userId: string): Promise<Chat[]> { await this.delay(); return this.data.chats.filter((c: Chat) => c.participantIds.includes(userId)); }
  async createChat(orgId: string, participantIds: string[], name?: string): Promise<Chat> {
    await this.delay();
    const chat: Chat = { id: `chat-${Date.now()}`, orgId, participantIds, name, lastMessageAt: Date.now() };
    this.data.chats.push(chat); 
    this.persist(); 
    if (this.broadcastChannel) this.broadcastChannel.postMessage({ type: 'SYNC_DATA' });
    return chat;
  }
  async getMessages(chatId: string): Promise<Message[]> { await this.delay(); return this.data.messages.filter((m: Message) => m.chatId === chatId); }
  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    await this.delay();
    const msg: Message = { id: `msg-${Date.now()}`, chatId, senderId, content, timestamp: Date.now(), type: 'TEXT' };
    this.data.messages.push(msg); this.persist();
    if (this.broadcastChannel) this.broadcastChannel.postMessage({ type: 'NEW_MESSAGE', chatId });
    return msg;
  }
  
  // --- Analytics ---
  async getBurnRate(orgId: string): Promise<number> {
     await this.delay();
     const activeEntries = this.data.clockEntries.filter((c: ClockEntry) => c.status === 'ACTIVE');
     let burnRate = 0;
     for (const entry of activeEntries) {
        const user = this.data.users.find((u: User) => u.id === entry.userId);
        if (user && user.hourlyRate) burnRate += user.hourlyRate;
     }
     return burnRate;
  }
  
  // --- Employee Dashboard ---
  async getMoodEntries(employeeId: string): Promise<MoodEntry[]> { await this.delay(); return this.data.moodEntries.filter((m: MoodEntry) => m.employeeId === employeeId); }
  async getGoals(employeeId: string): Promise<Goal[]> { await this.delay(); return this.data.goals.filter((g: Goal) => g.employeeId === employeeId); }
  async getBlockers(employeeId: string): Promise<Blocker[]> { await this.delay(); return this.data.blockers.filter((b: Blocker) => b.employeeId === employeeId); }
  async getRecognitions(employeeId: string): Promise<Recognition[]> { await this.delay(); return this.data.recognitions.filter((r: Recognition) => r.recipientId === employeeId); }


  subscribeToChat(callback: () => void) {
    const handler = (e: MessageEvent) => { if (e.data.type === 'NEW_MESSAGE' || e.data.type === 'SYNC_DATA') callback(); };
    this.broadcastChannel.addEventListener('message', handler);
    return () => this.broadcastChannel.removeEventListener('message', handler);
  }
}

export const db = new MockDatabase();
