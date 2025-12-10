/**
 * API Service Layer
 * 
 * This service provides high-level functions that wrap the database layer.
 * It handles:
 * - Data validation
 * - Error handling
 * - Business logic
 * - Caching (optional)
 * - Request debouncing (optional)
 */

import * as db from './db';
import { User, Organization, Project, Shift, ClockEntry, Exception, Chat, Message, MoodEntry, Goal, Blocker, Recognition } from '../types';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateUsername(username: string): boolean {
  return username.length >= 3 && /^[a-z0-9_]+$/.test(username);
}

function validatePassword(password: string): boolean {
  // Minimum 8 chars, at least one uppercase, one number
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const authService = {
  async signup(email: string, password: string, fullName: string, username: string, orgId: string) {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    if (!validateUsername(username)) throw new Error('Username must be 3+ chars, lowercase alphanumeric');
    if (!validatePassword(password)) throw new Error('Password must be 8+ chars with uppercase and numbers');
    if (fullName.length < 2) throw new Error('Full name must be at least 2 characters');

    return db.signUp(email, password, fullName, username, orgId);
  },

  async login(email: string, password: string) {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    return db.login(email, password);
  },

  async logout() {
    return db.logout();
  },

  async getCurrentUser() {
    return db.getCurrentUser();
  },

  async setOnlineStatus(userId: string, isOnline: boolean) {
    return db.setUserOnlineStatus(userId, isOnline);
  },
};

// ============================================================================
// USER SERVICE
// ============================================================================

export const userService = {
  async getUser(userId: string) {
    return db.getUser(userId);
  },

  async getUsers(orgId: string) {
    return db.getUsers(orgId);
  },

  async createUser(user: Partial<User>) {
    if (!user.username || !validateUsername(user.username)) {
      throw new Error('Invalid username');
    }
    if (!user.fullName || user.fullName.length < 2) {
      throw new Error('Invalid full name');
    }
    return db.createUser(user);
  },

  async updateUser(userId: string, updates: Partial<User>) {
    return db.updateUser(userId, updates);
  },

  async updateUserXP(userId: string, xpGain: number) {
    const user = await db.getUser(userId);
    const newXP = (user.xp || 0) + xpGain;
    return db.updateUser(userId, { xp: newXP });
  },
};

// ============================================================================
// ORGANIZATION SERVICE
// ============================================================================

export const orgService = {
  async getOrg(orgId: string) {
    return db.getOrg(orgId);
  },

  async createOrg(orgName: string, founderName: string, levels: string[]) {
    if (orgName.length < 2) throw new Error('Organization name must be at least 2 characters');
    if (levels.length < 2) throw new Error('Must have at least 2 hierarchy levels');

    return db.createOrg(orgName, founderName, levels);
  },

  async updateOrg(org: Organization) {
    if (!org.name || org.name.length < 2) throw new Error('Invalid organization name');
    return db.updateOrg(org);
  },

  async updatePermissions(orgId: string, permissions: Record<string, number>) {
    const org = await db.getOrg(orgId);
    org.settings.permissions = permissions;
    return db.updateOrg(org);
  },
};

// ============================================================================
// PROJECT SERVICE
// ============================================================================

export const projectService = {
  async getProjects(orgId: string, includeDetails = true) {
    return db.getProjects(orgId, includeDetails);
  },

  async createProject(project: Omit<Project, 'id'>) {
    if (!project.name || project.name.length < 2) throw new Error('Project name required');
    if (!project.orgId) throw new Error('Organization ID required');
    if (!project.status) project.status = 'DRAFT';

    return db.createProject(project);
  },

  async updateProject(project: Project) {
    if (!project.name || project.name.length < 2) throw new Error('Invalid project name');
    return db.updateProject(project);
  },

  async deleteProject(projectId: string) {
    return db.deleteProject(projectId);
  },

  async assignUsersToProject(projectId: string, userIds: string[]) {
    const results = [];
    for (const userId of userIds) {
      results.push(await db.assignUserToProject(projectId, userId));
    }
    return results;
  },

  async removeUserFromProject(projectId: string, userId: string) {
    return db.removeUserFromProject(projectId, userId);
  },
};

// ============================================================================
// PHASE SERVICE
// ============================================================================

export const phaseService = {
  async getPhases(projectId: string) {
    return db.getPhases(projectId);
  },

  async createPhase(projectId: string, name: string, goals: string[] = []) {
    if (!name || name.length < 2) throw new Error('Phase name required');
    return db.createPhase(projectId, { name, goals });
  },

  async updatePhase(phaseId: string, updates: any) {
    if (updates.name && updates.name.length < 2) throw new Error('Invalid phase name');
    return db.updatePhase(phaseId, updates);
  },

  async deletePhase(phaseId: string) {
    return db.deletePhase(phaseId);
  },
};

// ============================================================================
// SHIFT SERVICE
// ============================================================================

export const shiftService = {
  async getShifts(orgId: string, startDate?: Date, endDate?: Date) {
    return db.getShifts(orgId, startDate, endDate);
  },

  async getShiftsByUser(userId: string, startDate?: Date, endDate?: Date) {
    return db.getShiftsByUser(userId, startDate, endDate);
  },

  async createShift(shift: Omit<Shift, 'id'>) {
    // Validate required fields
    if (!shift.projectId) throw new Error('Project ID required');
    if (!shift.phaseId) throw new Error('Phase ID required');
    if (!shift.assigneeId) throw new Error('Assignee required');
    if (shift.startAt >= shift.endAt) throw new Error('Start time must be before end time');

    // Validate shift doesn't exceed 12 hours
    const duration = (shift.endAt - shift.startAt) / (1000 * 60 * 60);
    if (duration > 12) throw new Error('Shift cannot exceed 12 hours');

    return db.createShift(shift);
  },

  async updateShift(shiftId: string, updates: Partial<Shift>) {
    if (updates.startAt && updates.endAt && updates.startAt >= updates.endAt) {
      throw new Error('Start time must be before end time');
    }
    return db.updateShift(shiftId, updates);
  },

  async deleteShift(shiftId: string) {
    return db.deleteShift(shiftId);
  },

  async getShiftsForWeek(userId: string, weekStart: Date) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return db.getShiftsByUser(userId, weekStart, weekEnd);
  },
};

// ============================================================================
// TIME CLOCK SERVICE
// ============================================================================

export const clockService = {
  async getClockEntries(orgId: string, startDate?: Date, endDate?: Date) {
    return db.getClockEntries(orgId, startDate, endDate);
  },

  async canClockIn(shift: Shift, org: Organization) {
    return db.canClockIn(shift, org.settings);
  },

  async clockIn(userId: string, shiftId: string) {
    return db.clockIn(userId, shiftId);
  },

  async clockOut(entryId: string, summary: string, moraleScore: number, bountyClaimed: boolean) {
    if (moraleScore < 1 || moraleScore > 10) throw new Error('Morale score must be 1-10');
    if (!summary || summary.length < 10) throw new Error('Summary must be at least 10 characters');

    return db.clockOut(entryId, summary, moraleScore, bountyClaimed);
  },

  async rateShift(entryId: string, rating: number, comment?: string, approveBounty?: boolean) {
    if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');

    return db.rateShift(entryId, rating, comment, approveBounty);
  },

  async getTodayClockEntries(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await db.getClockEntries(userId, today, tomorrow);
    return entries;
  },
};

// ============================================================================
// EXCEPTION SERVICE
// ============================================================================

export const exceptionService = {
  async getExceptions(orgId: string, status?: string) {
    return db.getExceptions(orgId, status);
  },

  async createException(shiftId: string, userId: string, type: string, description: string) {
    if (!['MISSED_CLOCK_OUT', 'TIME_CORRECTION', 'EARLY_LEAVE', 'LATE_START'].includes(type)) {
      throw new Error('Invalid exception type');
    }
    if (!description || description.length < 5) throw new Error('Description must be at least 5 characters');

    return db.createException({ shiftId, userId, type: type as 'MISSED_CLOCK_OUT' | 'TIME_CORRECTION', description, status: 'PENDING' });
  },

  async approveException(exceptionId: string, reviewedBy: string, comment?: string) {
    return db.approveException(exceptionId, reviewedBy, comment);
  },

  async denyException(exceptionId: string, reviewedBy: string, comment?: string) {
    return db.denyException(exceptionId, reviewedBy, comment);
  },

  async getPendingExceptions(orgId: string) {
    return db.getExceptions(orgId, 'PENDING');
  },
};

// ============================================================================
// CHAT SERVICE
// ============================================================================

export const chatService = {
  async getChats(userId: string) {
    return db.getChats(userId);
  },

  async createChat(orgId: string, participantIds: string[], name?: string) {
    if (participantIds.length < 2) throw new Error('At least 2 participants required');
    if (name && name.length > 100) throw new Error('Chat name too long');

    return db.createChat(orgId, participantIds, name);
  },

  async getMessages(chatId: string, limit = 50) {
    if (limit < 1 || limit > 200) throw new Error('Limit must be between 1 and 200');
    return db.getMessages(chatId, limit);
  },

  async sendMessage(chatId: string, senderId: string, content: string) {
    if (!content || content.length < 1) throw new Error('Message cannot be empty');
    if (content.length > 5000) throw new Error('Message too long');

    return db.sendMessage(chatId, senderId, content);
  },
};

// ============================================================================
// WELLNESS SERVICE
// ============================================================================

export const wellnessService = {
  async getMoodEntries(employeeId: string) {
    return db.getMoodEntries(employeeId);
  },

  async logMood(employeeId: string, type: 'PRE_SHIFT' | 'POST_SHIFT', moodValue: number, emoji: string, comment?: string) {
    if (moodValue < 1 || moodValue > 5) throw new Error('Mood value must be 1-5');
    if (comment && comment.length > 500) throw new Error('Comment too long');

    return db.createMoodEntry({
      employeeId,
      timestamp: Date.now(),
      type,
      moodValue,
      moodEmoji: emoji,
      comment,
      isShared: false,
      isUrgent: false,
    });
  },

  async getGoals(employeeId: string) {
    return db.getGoals(employeeId);
  },

  async createGoal(employeeId: string, title: string, description: string, targetDate: number) {
    if (!title || title.length < 5) throw new Error('Goal title must be at least 5 characters');
    if (!description || description.length < 10) throw new Error('Goal description must be at least 10 characters');

    return db.createGoal({ employeeId, title, description, targetDate, progress: 0, relatedSkills: [] });
  },

  async updateGoalProgress(goalId: string, progress: number) {
    if (progress < 0 || progress > 100) throw new Error('Progress must be 0-100');
    return db.updateGoal(goalId, { progress });
  },

  async getBlockers(employeeId: string) {
    return db.getBlockers(employeeId);
  },

  async reportBlocker(employeeId: string, severity: 'MINOR' | 'MAJOR', description: string) {
    if (!['MINOR', 'MAJOR'].includes(severity)) throw new Error('Invalid severity level');
    if (!description || description.length < 10) throw new Error('Description must be at least 10 characters');

    return db.createBlocker({
      employeeId,
      timestamp: Date.now(),
      severity,
      description,
      isResolved: false,
    });
  },

  async resolveBlocker(blockerId: string) {
    return db.resolveBlocker(blockerId);
  },

  async getRecognitions(employeeId: string) {
    return db.getRecognitions(employeeId);
  },

  async giveRecognition(recipientId: string, giverId: string, message: string, type: 'KUDOS' | 'WIN') {
    if (!message || message.length < 5) throw new Error('Recognition message must be at least 5 characters');
    if (recipientId === giverId) throw new Error('Cannot recognize yourself');

    return db.createRecognition({
      recipientId,
      giverId,
      timestamp: Date.now(),
      message,
      type,
    });
  },
};

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export const analyticsService = {
  async getBurnRate(orgId: string) {
    return db.getBurnRate(orgId);
  },

  async getActiveUsersCount(orgId: string) {
    return db.getActiveUsersCount(orgId);
  },

  async getTeamBurnoutRisk(orgId: string) {
    return db.getTeamBurnoutRisk(orgId);
  },

  async getTeamEfficiency(orgId: string) {
    const entries = await db.getClockEntries(orgId);
    const completed = entries.filter(e => e.status === 'COMPLETED' && e.rating);
    if (completed.length === 0) return 0;

    const avgRating = completed.reduce((sum, e) => sum + (e.rating || 0), 0) / completed.length;
    return Math.round((avgRating / 5) * 100);
  },

  async getMoodTrend(employeeId: string, days = 7) {
    const moods = await db.getMoodEntries(employeeId);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return moods.filter(m => m.timestamp > cutoff);
  },
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscriptions = {
  onClockEntriesChange: (orgId: string, callback: () => void) => {
    return db.subscribeToClockEntries(orgId, callback);
  },

  onMessageReceived: (chatId: string, callback: () => void) => {
    return db.subscribeToMessages(chatId, callback);
  },

  onUserPresence: (orgId: string, callback: (users: any[]) => void) => {
    return db.subscribeToUserPresence(orgId, callback);
  },
};

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

export function checkPermission(user: User, org: Organization, permission: string): boolean {
  const requiredLevel = org.settings.permissions[permission];
  if (requiredLevel === undefined) return false;
  return user.hierarchyLevel <= requiredLevel;
}

export function canManageUser(actor: User, target: User): boolean {
  return actor.hierarchyLevel < target.hierarchyLevel;
}

export function canEditProject(user: User, project: Project): boolean {
  return user.id === project.leadId || user.role === 'FOUNDER';
}

export function canApproveException(user: User, org: Organization): boolean {
  return checkPermission(user, org, 'approve_exceptions');
}

export function canCreateShift(user: User, org: Organization): boolean {
  return checkPermission(user, org, 'create_shift');
}

export function canViewAnalytics(user: User, org: Organization): boolean {
  return checkPermission(user, org, 'view_analytics');
}
