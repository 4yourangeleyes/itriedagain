-- Add compliance fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS vat_registration_number TEXT,
ADD COLUMN IF NOT EXISTS business_type INT DEFAULT 2 CHECK (business_type IN (1, 2));

-- Add index for vat lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_vat_number ON public.user_profiles(vat_registration_number);

-- Add unique ID field to clients (for future global sync)
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id_format TEXT UNIQUE;

-- Add vat_enabled and tax fields to documents for invoice compliance
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS vat_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tax_name TEXT DEFAULT 'VAT',
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;

-- Comments for documentation
COMMENT ON COLUMN public.user_profiles.registration_number IS 'Company registration number (CIPC) - required for registered businesses';
COMMENT ON COLUMN public.user_profiles.vat_registration_number IS 'VAT registration number - required for VAT-registered businesses';
COMMENT ON COLUMN public.user_profiles.business_type IS '1 = Registered business, 2 = Unregistered business';
COMMENT ON COLUMN public.clients.user_id_format IS 'Global unique ID for this client across all users - format: AB-1234-5678-1/2';
COMMENT ON COLUMN public.documents.vat_enabled IS 'Whether this invoice requires VAT/tax';
COMMENT ON COLUMN public.documents.tax_rate IS 'Tax rate as decimal (e.g., 0.15 for 15% VAT)';
