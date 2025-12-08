-- Script to fix missing user profiles
-- Run this in Supabase SQL Editor

-- Check which users don't have profiles
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  up.id as profile_id
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Create missing profiles for all users without them
-- UNCOMMENT THE LINES BELOW TO RUN THE FIX:

-- INSERT INTO public.user_profiles (id, email, full_name, company_name, currency, tax_enabled, tax_name, tax_rate)
-- SELECT 
--   au.id,
--   au.email,
--   COALESCE(au.raw_user_meta_data->>'full_name', ''),
--   COALESCE(au.raw_user_meta_data->>'company_name', ''),
--   'R',
--   true,
--   'VAT',
--   15
-- FROM auth.users au
-- LEFT JOIN public.user_profiles up ON au.id = up.id
-- WHERE up.id IS NULL;
