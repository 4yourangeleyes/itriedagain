
export type Role = 'FOUNDER' | 'MANAGER' | 'LEAD' | 'MEMBER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  hierarchyLevel: number; // 0 (Founder) to N
  orgId: string;
  password?: string; // Mock only
  color?: string;
  isOnline?: boolean;
  hourlyRate?: number;
  xp?: number;
  skills?: string[];
  badges?: string[];
}

export type PermissionKey = 
  | 'create_project' 
  | 'manage_team' 
  | 'approve_exceptions' 
  | 'view_analytics' 
  | 'create_shift'
  | 'view_financials'
  | 'edit_timecards';

export interface Organization {
  id: string;
  name: string;
  hierarchyLevels: string[]; // e.g. ["Founder", "VP", "Manager", "Associate"]
  settings: {
    permissions: Record<string, number>; // key: minLevel required (e.g. 'create_project': 1)
    requireHandover: boolean;
    allowedEarlyClockIn: number; // minutes
    currency: string;
    strictMode: boolean; // if true, prevents clocking in outside window absolutely
  };
}

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT';

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  leadId?: string; // Who runs this project
  assignedUserIds: string[]; // Whitelist of who can work on it
  color: string;
  phases: Phase[];
}

export interface Phase {
  id: string;
  name: string;
  goals: string[]; // Global goals for this phase
  startDate?: number;
  endDate?: number;
}

export interface Shift {
  id:string;
  orgId: string;
  projectId: string;
  phaseId: string;
  assigneeId: string;
  startAt: number;
  endAt: number;
  allowedEarlyMinutes: number;
  handoverNote?: string;
  taggedUserId?: string;
  bounty?: string; 
  personalGoals?: string[];
}

export interface ClockEntry {
  id: string;
  shiftId: string;
  userId: string;
  clockInAt: number;
  clockOutAt?: number;
  summary?: string;
  rating?: number; // 1-5 stars from leader
  managerComment?: string;
  moraleScore?: number; // 1-10 from user
  bountyClaimed?: boolean;
  bountyAwarded?: boolean; 
  status: 'ACTIVE' | 'COMPLETED' | 'LATE' | 'EXCEPTION';
}

export interface Exception {
  id: string;
  shiftId: string;
  userId: string;
  type: 'MISSED_CLOCK_OUT' | 'TIME_CORRECTION';
  description: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  createdAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'TEXT' | 'IMAGE';
}

export interface Chat {
  id: string;
  orgId: string;
  participantIds: string[];
  name?: string;
  lastMessageAt: number;
}

// New types for Employee Dashboard
export interface MoodEntry {
  id: string;
  employeeId: string;
  timestamp: number;
  type: 'PRE_SHIFT' | 'POST_SHIFT';
  moodValue: number; // 1-5
  moodEmoji: string;
  comment?: string;
  isShared: boolean;
  isUrgent: boolean;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetDate: number;
  progress: number; // 0-100
  relatedSkills: string[];
}

export interface Blocker {
  id: string;
  employeeId: string;
  timestamp: number;
  severity: 'MINOR' | 'MAJOR';
  description: string;
  isResolved: boolean;
}

export interface Recognition {
  id: string;
  recipientId: string;
  giverId: string; // or 'System'
  timestamp: number;
  message: string;
  type: 'KUDOS' | 'WIN';
}
