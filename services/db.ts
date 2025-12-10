import { createClient } from '@supabase/supabase-js';
import { 
  User, Organization, Project, Shift, ClockEntry, Exception, 
  Chat, Message, Phase, MoodEntry, Goal, Blocker, Recognition 
} from '../types';

// Initialize Supabase client
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://hdhqvfcbmbrxwbbtuoev.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

async function handleError(error: any): Promise<never> {
  console.error('Database Error:', error);
  throw new DatabaseError(
    error.message || 'An database error occurred',
    error.code
  );
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function signUp(email: string, password: string, fullName: string, username: string, orgId: string) {
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user?.id) throw new Error('Failed to create auth user');

    // Create user profile in database
    const { data: user, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        org_id: orgId,
        username,
        full_name: fullName,
        email,
        password_hash: '', // Auth handled by Supabase
        role: 'MEMBER',
        hierarchy_level: 3,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    return { user: mapUserFromDb(user), authUser: authData.user };
  } catch (error) {
    return handleError(error);
  }
}

export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    // Fetch user profile
    const user = await getUser(data.user.id);
    return user;
  } catch (error) {
    return handleError(error);
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) return handleError(error);
}

export async function getCurrentUser() {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) throw new Error('Not authenticated');

    return await getUser(authUser.id);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// USERS
// ============================================================================

function mapUserFromDb(dbUser: any): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    fullName: dbUser.full_name,
    role: dbUser.role,
    hierarchyLevel: dbUser.hierarchy_level,
    orgId: dbUser.org_id,
    color: dbUser.color,
    isOnline: dbUser.is_online,
    hourlyRate: dbUser.hourly_rate,
    xp: dbUser.xp,
    skills: dbUser.skills || [],
    badges: dbUser.badges || [],
  };
}

export async function getUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return mapUserFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function getUsers(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('org_id', orgId);

    if (error) throw error;
    return data.map(mapUserFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createUser(user: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        org_id: user.orgId,
        username: user.username,
        full_name: user.fullName,
        email: `${user.username}@lockin.local`,
        password_hash: '', // Will be handled by Auth
        role: user.role || 'MEMBER',
        hierarchy_level: user.hierarchyLevel || 3,
        color: user.color,
        hourly_rate: user.hourlyRate,
        xp: user.xp || 0,
        skills: user.skills || [],
        badges: user.badges || [],
      })
      .select()
      .single();

    if (error) throw error;
    return mapUserFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: updates.fullName,
        color: updates.color,
        hourly_rate: updates.hourlyRate,
        xp: updates.xp,
        skills: updates.skills,
        badges: updates.badges,
        is_online: updates.isOnline,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapUserFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function setUserOnlineStatus(userId: string, isOnline: boolean) {
  try {
    await supabase
      .from('users')
      .update({ is_online: isOnline, last_seen: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to update online status:', error);
  }
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

function mapOrgFromDb(dbOrg: any): Organization {
  return {
    id: dbOrg.id,
    name: dbOrg.name,
    hierarchyLevels: dbOrg.hierarchy_levels,
    settings: dbOrg.settings,
  };
}

export async function getOrg(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) throw error;
    return mapOrgFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function createOrg(orgName: string, founderName: string, levels: string[]) {
  try {
    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgName,
        hierarchy_levels: levels,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Create founder user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        org_id: orgData.id,
        username: founderName.toLowerCase().replace(/\s/g, ''),
        full_name: founderName,
        email: `${founderName.toLowerCase().replace(/\s/g, '')}@lockin.local`,
        password_hash: '',
        role: 'FOUNDER',
        hierarchy_level: 0,
        hourly_rate: 100,
      })
      .select()
      .single();

    if (userError) throw userError;

    return { user: mapUserFromDb(userData), org: mapOrgFromDb(orgData) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateOrg(org: Organization) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: org.name,
        hierarchy_levels: org.hierarchyLevels,
        settings: org.settings,
      })
      .eq('id', org.id)
      .select()
      .single();

    if (error) throw error;
    return mapOrgFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// PROJECTS
// ============================================================================

function mapProjectFromDb(dbProject: any): Project {
  return {
    id: dbProject.id,
    orgId: dbProject.org_id,
    name: dbProject.name,
    description: dbProject.description,
    status: dbProject.status,
    leadId: dbProject.lead_id,
    assignedUserIds: [], // Fetch separately if needed
    color: dbProject.color,
    phases: [], // Fetch separately if needed
  };
}

export async function getProjects(orgId: string, includePhases = false) {
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('org_id', orgId);

    const { data, error } = await query;
    if (error) throw error;

    if (includePhases) {
      return Promise.all(data.map(async (proj) => {
        const project = mapProjectFromDb(proj);
        const phases = await getPhases(proj.id);
        const assignments = await getProjectAssignments(proj.id);
        project.phases = phases;
        project.assignedUserIds = assignments.map(a => a.user_id);
        return project;
      }));
    }

    return data.map(mapProjectFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createProject(project: Omit<Project, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        org_id: project.orgId,
        name: project.name,
        description: project.description,
        status: project.status,
        lead_id: project.leadId,
        color: project.color,
      })
      .select()
      .single();

    if (error) throw error;

    const newProject = mapProjectFromDb(data);
    
    // Create project assignments if provided
    if (project.assignedUserIds && project.assignedUserIds.length > 0) {
      for (const userId of project.assignedUserIds) {
        await assignUserToProject(newProject.id, userId);
      }
      newProject.assignedUserIds = project.assignedUserIds;
    }

    // Create phases if provided
    if (project.phases && project.phases.length > 0) {
      newProject.phases = await Promise.all(
        project.phases.map((phase) => createPhase(newProject.id, phase))
      );
    }

    return newProject;
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProject(project: Project) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        description: project.description,
        status: project.status,
        lead_id: project.leadId,
        color: project.color,
      })
      .eq('id', project.id)
      .select()
      .single();

    if (error) throw error;
    return mapProjectFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteProject(projectId: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// PROJECT ASSIGNMENTS
// ============================================================================

export async function getProjectAssignments(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('project_assignments')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function assignUserToProject(projectId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('project_assignments')
      .insert({ project_id: projectId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return handleError(error);
  }
}

export async function removeUserFromProject(projectId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('project_assignments')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// PHASES
// ============================================================================

function mapPhaseFromDb(dbPhase: any): Phase {
  return {
    id: dbPhase.id,
    name: dbPhase.name,
    goals: dbPhase.goals || [],
    startDate: dbPhase.start_date ? new Date(dbPhase.start_date).getTime() : undefined,
    endDate: dbPhase.end_date ? new Date(dbPhase.end_date).getTime() : undefined,
  };
}

export async function getPhases(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('phases')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data.map(mapPhaseFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createPhase(projectId: string, phase: Partial<Phase>) {
  try {
    const { data, error } = await supabase
      .from('phases')
      .insert({
        project_id: projectId,
        name: phase.name,
        goals: phase.goals,
        start_date: phase.startDate ? new Date(phase.startDate).toISOString() : null,
        end_date: phase.endDate ? new Date(phase.endDate).toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapPhaseFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updatePhase(phaseId: string, phase: Partial<Phase>) {
  try {
    const { data, error } = await supabase
      .from('phases')
      .update({
        name: phase.name,
        goals: phase.goals,
        start_date: phase.startDate ? new Date(phase.startDate).toISOString() : null,
        end_date: phase.endDate ? new Date(phase.endDate).toISOString() : null,
      })
      .eq('id', phaseId)
      .select()
      .single();

    if (error) throw error;
    return mapPhaseFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deletePhase(phaseId: string) {
  try {
    const { error } = await supabase
      .from('phases')
      .delete()
      .eq('id', phaseId);

    if (error) throw error;
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// SHIFTS
// ============================================================================

function mapShiftFromDb(dbShift: any): Shift {
  return {
    id: dbShift.id,
    orgId: dbShift.org_id,
    projectId: dbShift.project_id,
    phaseId: dbShift.phase_id,
    assigneeId: dbShift.assignee_id,
    startAt: new Date(dbShift.start_at).getTime(),
    endAt: new Date(dbShift.end_at).getTime(),
    allowedEarlyMinutes: dbShift.allowed_early_minutes,
    handoverNote: dbShift.handover_note,
    taggedUserId: dbShift.tagged_user_id,
    bounty: dbShift.bounty,
    personalGoals: dbShift.personal_goals || [],
  };
}

export async function getShifts(orgId: string, startDate?: Date, endDate?: Date) {
  try {
    let query = supabase
      .from('shifts')
      .select('*')
      .eq('org_id', orgId);

    if (startDate) {
      query = query.gte('start_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('end_at', endDate.toISOString());
    }

    const { data, error } = await query.order('start_at', { ascending: true });
    if (error) throw error;

    return data.map(mapShiftFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function getShiftsByUser(userId: string, startDate?: Date, endDate?: Date) {
  try {
    let query = supabase
      .from('shifts')
      .select('*')
      .eq('assignee_id', userId);

    if (startDate) {
      query = query.gte('start_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('end_at', endDate.toISOString());
    }

    const { data, error } = await query.order('start_at', { ascending: true });
    if (error) throw error;

    return data.map(mapShiftFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createShift(shift: Omit<Shift, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        org_id: shift.orgId,
        project_id: shift.projectId,
        phase_id: shift.phaseId,
        assignee_id: shift.assigneeId,
        start_at: new Date(shift.startAt).toISOString(),
        end_at: new Date(shift.endAt).toISOString(),
        allowed_early_minutes: shift.allowedEarlyMinutes,
        handover_note: shift.handoverNote,
        tagged_user_id: shift.taggedUserId,
        bounty: shift.bounty,
        personal_goals: shift.personalGoals,
      })
      .select()
      .single();

    if (error) throw error;
    return mapShiftFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateShift(shiftId: string, shift: Partial<Shift>) {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .update({
        start_at: shift.startAt ? new Date(shift.startAt).toISOString() : undefined,
        end_at: shift.endAt ? new Date(shift.endAt).toISOString() : undefined,
        personal_goals: shift.personalGoals,
        bounty: shift.bounty,
        handover_note: shift.handoverNote,
      })
      .eq('id', shiftId)
      .select()
      .single();

    if (error) throw error;
    return mapShiftFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteShift(shiftId: string) {
  try {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId);

    if (error) throw error;
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// CLOCK ENTRIES (Time Tracking)
// ============================================================================

function mapClockEntryFromDb(dbEntry: any): ClockEntry {
  return {
    id: dbEntry.id,
    shiftId: dbEntry.shift_id,
    userId: dbEntry.user_id,
    clockInAt: new Date(dbEntry.clock_in_at).getTime(),
    clockOutAt: dbEntry.clock_out_at ? new Date(dbEntry.clock_out_at).getTime() : undefined,
    summary: dbEntry.summary,
    rating: dbEntry.rating,
    managerComment: dbEntry.manager_comment,
    moraleScore: dbEntry.morale_score,
    bountyClaimed: dbEntry.bounty_claimed,
    bountyAwarded: dbEntry.bounty_awarded,
    status: dbEntry.status,
  };
}

export async function getClockEntries(orgId: string, startDate?: Date, endDate?: Date) {
  try {
    let query = supabase
      .from('clock_entries')
      .select('ce.*, s.org_id')
      .eq('s.org_id', orgId);

    if (startDate) {
      query = query.gte('ce.clock_in_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('ce.clock_in_at', endDate.toISOString());
    }

    const { data, error } = await supabase.rpc('get_clock_entries', { org_id: orgId });
    if (error) {
      // Fallback if RPC not available
      const fallback = await supabase
        .from('clock_entries')
        .select('*')
        .order('clock_in_at', { ascending: false });
      
      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map(mapClockEntryFromDb);
    }

    return data.map(mapClockEntryFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function canClockIn(shift: Shift, orgSettings: any): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Check if already clocked in
    const { data: existing, error: checkError } = await supabase
      .from('clock_entries')
      .select('*')
      .eq('shift_id', shift.id)
      .eq('status', 'ACTIVE')
      .single();

    if (!checkError && existing) {
      return { allowed: false, reason: 'Already clocked in for this shift' };
    }

    // Check time window
    const now = Date.now();
    const earlyWindowMs = shift.allowedEarlyMinutes * 60 * 1000;
    const earlyWindow = shift.startAt - earlyWindowMs;
    const strictMode = orgSettings.strictMode;

    if (now < earlyWindow) {
      const openTime = new Date(earlyWindow);
      return { allowed: false, reason: `Too early. Window opens at ${openTime.toLocaleTimeString()}` };
    }

    if (strictMode && now > shift.endAt) {
      return { allowed: false, reason: 'Shift has ended' };
    }

    return { allowed: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function clockIn(userId: string, shiftId: string) {
  try {
    const { data, error } = await supabase
      .from('clock_entries')
      .insert({
        shift_id: shiftId,
        user_id: userId,
        clock_in_at: new Date().toISOString(),
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw error;
    return mapClockEntryFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function clockOut(entryId: string, summary: string, moraleScore: number, bountyClaimed: boolean) {
  try {
    const { data, error } = await supabase
      .from('clock_entries')
      .update({
        clock_out_at: new Date().toISOString(),
        summary,
        morale_score: moraleScore,
        bounty_claimed: bountyClaimed,
        status: 'COMPLETED',
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return mapClockEntryFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function rateShift(entryId: string, rating: number, comment?: string, approveBounty?: boolean) {
  try {
    const { data, error } = await supabase
      .from('clock_entries')
      .update({
        rating,
        manager_comment: comment,
        bounty_awarded: approveBounty,
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return mapClockEntryFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// EXCEPTIONS
// ============================================================================

function mapExceptionFromDb(dbEx: any): Exception {
  return {
    id: dbEx.id,
    shiftId: dbEx.shift_id,
    userId: dbEx.user_id,
    type: dbEx.type,
    description: dbEx.description,
    status: dbEx.status,
    createdAt: new Date(dbEx.created_at).getTime(),
  };
}

export async function getExceptions(orgId: string, status?: string) {
  try {
    let query = supabase.from('exceptions').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('requested_at', { ascending: false });
    if (error) throw error;

    return data.map(mapExceptionFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createException(exception: Omit<Exception, 'id' | 'createdAt'>) {
  try {
    const { data, error } = await supabase
      .from('exceptions')
      .insert({
        shift_id: exception.shiftId,
        user_id: exception.userId,
        type: exception.type,
        description: exception.description,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return mapExceptionFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function approveException(exceptionId: string, reviewedBy: string, comment?: string) {
  try {
    const { data, error } = await supabase
      .from('exceptions')
      .update({
        status: 'APPROVED',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_comment: comment,
      })
      .eq('id', exceptionId)
      .select()
      .single();

    if (error) throw error;
    return mapExceptionFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function denyException(exceptionId: string, reviewedBy: string, comment?: string) {
  try {
    const { data, error } = await supabase
      .from('exceptions')
      .update({
        status: 'DENIED',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_comment: comment,
      })
      .eq('id', exceptionId)
      .select()
      .single();

    if (error) throw error;
    return mapExceptionFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// CHAT & MESSAGES
// ============================================================================

function mapChatFromDb(dbChat: any): Chat {
  return {
    id: dbChat.id,
    orgId: dbChat.org_id,
    participantIds: dbChat.participant_ids || [],
    name: dbChat.name,
    lastMessageAt: dbChat.last_message_at ? new Date(dbChat.last_message_at).getTime() : Date.now(),
  };
}

function mapMessageFromDb(dbMsg: any): Message {
  return {
    id: dbMsg.id,
    chatId: dbMsg.chat_id,
    senderId: dbMsg.sender_id,
    content: dbMsg.content,
    timestamp: new Date(dbMsg.timestamp).getTime(),
    type: dbMsg.type,
  };
}

export async function getChats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('chat_participants')
      .select('chat:chats(*)')
      .eq('user_id', userId);

    if (error) throw error;

    return data
      .map((item: any) => item.chat)
      .filter(Boolean)
      .map(mapChatFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createChat(orgId: string, participantIds: string[], name?: string) {
  try {
    // Create chat
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .insert({
        org_id: orgId,
        name,
        is_group: participantIds.length > 2,
        created_by: participantIds[0],
      })
      .select()
      .single();

    if (chatError) throw chatError;

    // Add participants
    const participants = participantIds.map(userId => ({
      chat_id: chatData.id,
      user_id: userId,
    }));

    const { error: partError } = await supabase
      .from('chat_participants')
      .insert(participants);

    if (partError) throw partError;

    return mapChatFromDb(chatData);
  } catch (error) {
    return handleError(error);
  }
}

export async function getMessages(chatId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.reverse().map(mapMessageFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function sendMessage(chatId: string, senderId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        type: 'TEXT',
      })
      .select()
      .single();

    if (error) throw error;

    // Update last message timestamp on chat
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId);

    return mapMessageFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// MOOD ENTRIES
// ============================================================================

function mapMoodEntryFromDb(dbMood: any): MoodEntry {
  return {
    id: dbMood.id,
    employeeId: dbMood.employee_id,
    timestamp: new Date(dbMood.timestamp).getTime(),
    type: dbMood.type,
    moodValue: dbMood.mood_value,
    moodEmoji: dbMood.mood_emoji,
    comment: dbMood.comment,
    isShared: dbMood.is_shared,
    isUrgent: dbMood.is_urgent,
  };
}

export async function getMoodEntries(employeeId: string) {
  try {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('employee_id', employeeId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data.map(mapMoodEntryFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createMoodEntry(entry: Omit<MoodEntry, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        employee_id: entry.employeeId,
        timestamp: new Date(entry.timestamp).toISOString(),
        type: entry.type,
        mood_value: entry.moodValue,
        mood_emoji: entry.moodEmoji,
        comment: entry.comment,
        is_shared: entry.isShared,
        is_urgent: entry.isUrgent,
      })
      .select()
      .single();

    if (error) throw error;
    return mapMoodEntryFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// GOALS
// ============================================================================

function mapGoalFromDb(dbGoal: any): Goal {
  return {
    id: dbGoal.id,
    employeeId: dbGoal.employee_id,
    title: dbGoal.title,
    description: dbGoal.description,
    targetDate: dbGoal.target_date ? new Date(dbGoal.target_date).getTime() : 0,
    progress: dbGoal.progress,
    relatedSkills: dbGoal.related_skills || [],
  };
}

export async function getGoals(employeeId: string) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_completed', false);

    if (error) throw error;
    return data.map(mapGoalFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createGoal(goal: Omit<Goal, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        employee_id: goal.employeeId,
        title: goal.title,
        description: goal.description,
        target_date: goal.targetDate ? new Date(goal.targetDate).toISOString() : null,
        progress: goal.progress || 0,
        related_skills: goal.relatedSkills,
      })
      .select()
      .single();

    if (error) throw error;
    return mapGoalFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateGoal(goalId: string, goal: Partial<Goal>) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update({
        title: goal.title,
        description: goal.description,
        progress: goal.progress,
        target_date: goal.targetDate ? new Date(goal.targetDate).toISOString() : null,
        related_skills: goal.relatedSkills,
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return mapGoalFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// BLOCKERS
// ============================================================================

function mapBlockerFromDb(dbBlocker: any): Blocker {
  return {
    id: dbBlocker.id,
    employeeId: dbBlocker.employee_id,
    timestamp: new Date(dbBlocker.timestamp).getTime(),
    severity: dbBlocker.severity,
    description: dbBlocker.description,
    isResolved: dbBlocker.is_resolved,
  };
}

export async function getBlockers(employeeId: string) {
  try {
    const { data, error } = await supabase
      .from('blockers')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_resolved', false);

    if (error) throw error;
    return data.map(mapBlockerFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createBlocker(blocker: Omit<Blocker, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('blockers')
      .insert({
        employee_id: blocker.employeeId,
        timestamp: new Date(blocker.timestamp).toISOString(),
        severity: blocker.severity,
        description: blocker.description,
      })
      .select()
      .single();

    if (error) throw error;
    return mapBlockerFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function resolveBlocker(blockerId: string) {
  try {
    const { data, error } = await supabase
      .from('blockers')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', blockerId)
      .select()
      .single();

    if (error) throw error;
    return mapBlockerFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// RECOGNITIONS
// ============================================================================

function mapRecognitionFromDb(dbRec: any): Recognition {
  return {
    id: dbRec.id,
    recipientId: dbRec.recipient_id,
    giverId: dbRec.giver_id,
    timestamp: new Date(dbRec.timestamp).getTime(),
    message: dbRec.message,
    type: dbRec.type,
  };
}

export async function getRecognitions(recipientId: string) {
  try {
    const { data, error } = await supabase
      .from('recognitions')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data.map(mapRecognitionFromDb);
  } catch (error) {
    return handleError(error);
  }
}

export async function createRecognition(recognition: Omit<Recognition, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('recognitions')
      .insert({
        recipient_id: recognition.recipientId,
        giver_id: recognition.giverId,
        timestamp: new Date(recognition.timestamp).toISOString(),
        message: recognition.message,
        type: recognition.type,
      })
      .select()
      .single();

    if (error) throw error;
    return mapRecognitionFromDb(data);
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getBurnRate(orgId: string) {
  try {
    const { data, error } = await supabase.rpc('calculate_burn_rate', { org_uuid: orgId });
    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.warn('Failed to calculate burn rate:', error);
    return 0;
  }
}

export async function getActiveUsersCount(orgId: string) {
  try {
    const { data, error } = await supabase.rpc('get_active_users_count', { org_uuid: orgId });
    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.warn('Failed to get active users count:', error);
    return 0;
  }
}

export async function getTeamBurnoutRisk(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('team_burnout_risk')
      .select('*')
      .eq('org_id', orgId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Failed to get burnout risk:', error);
    return [];
  }
}

// ============================================================================
// SUBSCRIPTIONS (Real-time updates)
// ============================================================================

export function subscribeToClockEntries(orgId: string, callback: () => void) {
  const subscription = supabase
    .channel(`clock-entries-${orgId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'clock_entries',
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

export function subscribeToMessages(chatId: string, callback: () => void) {
  const subscription = supabase
    .channel(`messages-${chatId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`,
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

export function subscribeToUserPresence(orgId: string, callback: (users: any[]) => void) {
  const channel = supabase.channel(`presence-${orgId}`, {
    config: {
      presence: {
        key: orgId,
      },
    },
  });

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    callback(Object.values(state).flat());
  }).subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
