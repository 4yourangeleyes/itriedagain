# Database Migration Instructions

## Add is_registered_business Column

Run this SQL in your Supabase SQL Editor:

```sql
-- Add is_registered_business column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_registered_business BOOLEAN DEFAULT false;

-- Update existing profiles with registration numbers to be marked as registered
UPDATE user_profiles 
SET is_registered_business = true 
WHERE registration_number IS NOT NULL 
  AND registration_number != '';

COMMENT ON COLUMN user_profiles.is_registered_business IS 'Whether the business is formally registered (Company/CC). Controls visibility of registration/VAT fields.';
```

## Steps:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Paste the SQL above
5. Run the query

This adds a toggle to control whether registration/VAT fields are shown in settings.
