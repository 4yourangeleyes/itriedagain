-- Add missing columns to user_profiles table
-- Run this in your Supabase SQL Editor to add the missing fields

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS vat_registration_number TEXT,
ADD COLUMN IF NOT EXISTS business_type INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.website IS 'Company website URL';
COMMENT ON COLUMN public.user_profiles.vat_registration_number IS 'VAT/Tax registration number';
COMMENT ON COLUMN public.user_profiles.business_type IS '1 = registered, 2 = unregistered';
COMMENT ON COLUMN public.user_profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN public.user_profiles.address IS 'Business address';
