-- Add is_registered_business column to user_profiles
-- This toggle controls whether to show registration/VAT fields in settings

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_registered_business BOOLEAN DEFAULT false;

-- Update existing profiles with registration numbers to be marked as registered
UPDATE user_profiles 
SET is_registered_business = true 
WHERE registration_number IS NOT NULL 
  AND registration_number != '';

COMMENT ON COLUMN user_profiles.is_registered_business IS 'Whether the business is formally registered (Company/CC). Controls visibility of registration/VAT fields.';
