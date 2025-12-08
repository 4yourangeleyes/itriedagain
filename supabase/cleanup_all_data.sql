-- ============================================================================
-- CLEANUP SCRIPT - Delete ALL test data from database
-- ============================================================================
-- WARNING: This will delete ALL users, profiles, documents, clients, and related data
-- Run this in your Supabase SQL Editor when you want to reset the database
-- ============================================================================

-- 1. Delete all data from tables (order matters due to foreign keys)
DELETE FROM public.analytics_events;
DELETE FROM public.audit_logs;
DELETE FROM public.public_share_tokens;
DELETE FROM public.invoice_items;
DELETE FROM public.documents;
DELETE FROM public.template_items;
DELETE FROM public.templates;
DELETE FROM public.clients;
DELETE FROM public.item_usage;
DELETE FROM public.user_profiles;

-- 2. Delete users from auth.users (this will cascade delete profiles due to FK)
-- Note: You may need to run this from the Supabase Dashboard > Authentication > Users
-- or use the Supabase Dashboard API, as direct auth table access may be restricted

-- To delete auth users via SQL (if you have access):
-- DELETE FROM auth.users;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check that tables are empty
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM public.user_profiles
UNION ALL
SELECT 'clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'templates', COUNT(*) FROM public.templates
UNION ALL
SELECT 'template_items', COUNT(*) FROM public.template_items
UNION ALL
SELECT 'documents', COUNT(*) FROM public.documents
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM public.invoice_items
UNION ALL
SELECT 'public_share_tokens', COUNT(*) FROM public.public_share_tokens
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs
UNION ALL
SELECT 'analytics_events', COUNT(*) FROM public.analytics_events
UNION ALL
SELECT 'item_usage', COUNT(*) FROM public.item_usage;

-- ============================================================================
-- Note: To delete authentication users:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Select all users and click "Delete users"
-- OR
-- 3. Use the Management API to delete users programmatically
-- ============================================================================
