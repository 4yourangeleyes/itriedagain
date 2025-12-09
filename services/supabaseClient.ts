/**
 * Supabase Client Configuration & Initialization
 * Centralizes all Supabase interactions and provides typed helpers
 */

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js'

// Environment variables (use import.meta.env for Vite)
declare global {
  interface ImportMeta {
    env: Record<string, string>
  }
}

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-key'

// Validate that keys are provided
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Missing environment variables. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  console.warn('[Supabase] App will run in offline mode without authentication')
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Export types for use throughout app
export type { Session, User }
export { supabase }

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get current session
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Log in with email and password
 */
export const signIn = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign up new user with email and password
 */
export const signUp = (email: string, password: string) => {
  return supabase.auth.signUp({ email, password })
}

/**
 * Sign out current user
 */
export const signOut = () => {
  return supabase.auth.signOut()
}

/**
 * Listen to auth state changes (mount this in App.tsx)
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
}

/**
 * Call Supabase Edge Function to generate documents with AI
 * Securely uses GENAI_API_KEY stored on Supabase backend
 */
export const generateDocumentViaEdgeFunction = async (
  prompt: string,
  docType: 'INVOICE' | 'CONTRACT' | 'HRDOC',
  clientName: string,
  businessName: string,
  industry?: string,
  conversationHistory?: Array<{role: string, content: string}>,
  templateContext?: string
) => {
  const { data, error } = await supabase.functions.invoke('generate-document', {
    body: {
      prompt,
      docType,
      clientName,
      businessName,
      industry,
      conversationHistory,
      templateContext,
    },
  })

  if (error) {
    throw new Error(error.message || 'Failed to generate document')
  }

  return data
}

/**
 * Track analytics event
 */
export const trackEvent = async (eventType: string, properties?: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_type: eventType,
    event_properties: properties || {},
  })
}

/**
 * Log audit action
 */
export const logAuditAction = async (
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: metadata || {},
    ip_address: '', // Client-side cannot get true IP; server would do this
  })
}

/**
 * Create a public share token for a document
 */
export const createShareToken = async (documentId: string, expiresIn?: number) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate a unique token
  const token = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null

  const { data, error } = await supabase
    .from('public_share_tokens')
    .insert({
      document_id: documentId,
      user_id: user.id,
      token,
      expires_at: expiresAt,
    })
    .select()

  if (error) throw error
  return { token, expiresAt }
}

/**
 * Get document by share token (public, no auth needed)
 */
export const getDocumentByShareToken = async (token: string) => {
  // This query will only work if the share token exists and is valid
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      client:clients(*),
      items:invoice_items(*)
    `)
    .eq(
      'id',
      supabase
        .from('public_share_tokens')
        .select('document_id')
        .eq('token', token)
        .single()
    )

  if (error) throw error
  return data
}

/**
 * Real-time subscription helper (use Channels instead)
 */
export const subscribeToDocuments = (userId: string, callback: (docs: any[]) => void) => {
  const channel = supabase
    .channel(`documents-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Document update:', payload)
        callback([payload.new])
      }
    )
    .subscribe()
  return channel
}

export default supabase
