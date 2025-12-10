import { supabase } from './supabase';
import { User } from '../types';

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Generate a secure random password
 */
export function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Map database user to User type
 */
export function mapUserFromDb(dbUser: any): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    fullName: dbUser.full_name,
    role: dbUser.role,
    hierarchyLevel: dbUser.hierarchy_level,
    orgId: dbUser.org_id,
    email: dbUser.email,
    color: dbUser.color,
    isOnline: dbUser.is_online,
    hourlyRate: dbUser.hourly_rate,
    xp: dbUser.xp,
    skills: dbUser.skills || [],
    badges: dbUser.badges || [],
  };
}

/**
 * Get current authenticated user
 */
export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email || '',
    };
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<User | null> {
  try {
    const authUser = await getCurrentAuthUser();
    if (!authUser) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !data) return null;
    return mapUserFromDb(data);
  } catch (err) {
    console.error('Error getting user profile:', err);
    return null;
  }
}

/**
 * Sign up a new founder/organization
 */
export async function signUpFounder(
  email: string,
  password: string,
  fullName: string,
  orgName: string
): Promise<{ user: User; org: any } | null> {
  try {
    // 1. Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgName.trim(),
        hierarchy_levels: ['FOUNDER', 'MANAGER', 'LEAD', 'MEMBER'],
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // 2. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (authError) throw authError;

    // 3. Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        org_id: orgData.id,
        username: email.split('@')[0],
        full_name: fullName,
        email: email.trim(),
        password_hash: '',
        role: 'FOUNDER',
        hierarchy_level: 0,
      })
      .select()
      .single();

    if (userError) throw userError;

    return { user: mapUserFromDb(userData), org: orgData };
  } catch (err) {
    console.error('Sign up error:', err);
    throw err;
  }
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (userError) throw userError;

    return mapUserFromDb(userData);
  } catch (err) {
    console.error('Sign in error:', err);
    throw err;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error('Sign out error:', err);
    throw err;
  }
}

/**
 * Create a team member with auto-generated password
 */
export async function createTeamMember(
  orgId: string,
  email: string,
  fullName: string,
  role: string = 'MEMBER',
  hierarchyLevel: number = 3
): Promise<{ user: User; password: string } | null> {
  try {
    const password = generatePassword();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (authError) throw authError;

    // 2. Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        org_id: orgId,
        username: email.split('@')[0],
        full_name: fullName,
        email: email.trim(),
        password_hash: '',
        role,
        hierarchy_level: hierarchyLevel,
      })
      .select()
      .single();

    if (userError) throw userError;

    return { user: mapUserFromDb(userData), password };
  } catch (err) {
    console.error('Create team member error:', err);
    throw err;
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  } catch (err) {
    console.error('Update password error:', err);
    throw err;
  }
}

/**
 * Get organization users
 */
export async function getOrganizationUsers(orgId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('org_id', orgId);

    if (error) throw error;

    return (data || []).map(mapUserFromDb);
  } catch (err) {
    console.error('Get org users error:', err);
    return [];
  }
}

/**
 * Delete team member (for admins only)
 */
export async function deleteTeamMember(userId: string): Promise<void> {
  try {
    // Delete from database first
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) throw dbError;

    // Note: Deleting from auth requires admin API, would need backend endpoint
  } catch (err) {
    console.error('Delete team member error:', err);
    throw err;
  }
}
