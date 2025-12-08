# 🔧 Run Database Migrations

The setup script is failing because the database migrations haven't been run yet. Follow these steps:

## Step 1: Run Missing Profile Columns Migration

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: **fopyamyrykwtlwgefxuq**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS vat_registration_number TEXT,
ADD COLUMN IF NOT EXISTS business_type INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.website IS 'Company website URL';
COMMENT ON COLUMN public.user_profiles.vat_registration_number IS 'VAT/Tax registration number';
COMMENT ON COLUMN public.user_profiles.business_type IS '1 = registered, 2 = unregistered';
COMMENT ON COLUMN public.user_profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN public.user_profiles.address IS 'Business address';
COMMENT ON COLUMN public.user_profiles.jurisdiction IS 'Legal jurisdiction (e.g., Republic of South Africa)';
```

6. Click **Run** (or press Cmd+Enter)
7. You should see: **Success. No rows returned**

## Step 2: Run Contract Support Migration

1. Still in **SQL Editor**, click **New Query** again
2. Copy and paste this SQL:

```sql
-- Migration: Add contract support to templates table
-- This migration adds fields needed for comprehensive contract templates

-- Add contract_type column to templates table
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS contract_type TEXT;

-- Add clauses column to store contract clauses as JSONB
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS clauses JSONB;

-- Add items column to store invoice items as JSONB (for backward compatibility)
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS items JSONB;

-- Create an index on contract_type for faster queries
CREATE INDEX IF NOT EXISTS idx_templates_contract_type ON public.templates(contract_type);

-- Update the doc_type check constraint to be more flexible
ALTER TABLE public.templates 
DROP CONSTRAINT IF EXISTS templates_doc_type_check;

ALTER TABLE public.templates 
ADD CONSTRAINT templates_doc_type_check 
CHECK (doc_type IN ('INVOICE', 'Invoice', 'CONTRACT', 'Contract', 'HRDOC', 'HR Document'));

-- Add comment for documentation
COMMENT ON COLUMN public.templates.contract_type IS 'Type of contract: Service Agreement, NDA, Shareholder Agreement, etc.';
COMMENT ON COLUMN public.templates.clauses IS 'Array of contract clauses stored as JSON';
COMMENT ON COLUMN public.templates.items IS 'Array of invoice line items stored as JSON';

-- Create a helper view for contract templates
CREATE OR REPLACE VIEW public.contract_templates AS
SELECT 
  id,
  user_id,
  name,
  category,
  contract_type,
  clauses,
  created_at,
  updated_at
FROM public.templates
WHERE doc_type IN ('CONTRACT', 'Contract');

-- Create a helper view for invoice templates
CREATE OR REPLACE VIEW public.invoice_templates AS
SELECT 
  id,
  user_id,
  name,
  category,
  items,
  created_at,
  updated_at
FROM public.templates
WHERE doc_type IN ('INVOICE', 'Invoice');

-- Grant access to views
GRANT SELECT ON public.contract_templates TO authenticated;
GRANT SELECT ON public.invoice_templates TO authenticated;
```

3. Click **Run** (or press Cmd+Enter)
4. You should see: **Success. No rows returned**

## Step 3: Verify Clients Table Exists

1. Still in **SQL Editor**, click **New Query** again  
2. Copy and paste this SQL to ensure the clients table exists:

```sql
-- Ensure clients table exists with all required columns
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  registration_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_business_name ON public.clients(business_name);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'users_select_own_clients') THEN
    CREATE POLICY "users_select_own_clients" ON public.clients
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'users_insert_own_clients') THEN
    CREATE POLICY "users_insert_own_clients" ON public.clients
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'users_update_own_clients') THEN
    CREATE POLICY "users_update_own_clients" ON public.clients
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'users_delete_own_clients') THEN
    CREATE POLICY "users_delete_own_clients" ON public.clients
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. Click **Run** (or press Cmd+Enter)
4. You should see: **Success. No rows returned**

## Step 4: Run Setup Script Again

Now that the migrations are complete, run the setup script:

```bash
npm run setup-northcell
```

You should see:
```
✅ Account created successfully
✅ Profile created/updated
✅ Inserted batch 1 (10 templates)
✅ Inserted batch 2 (10 templates)
✅ Inserted batch 3 (10 templates)
✅ Inserted batch 4 (9 templates)

🎉 Setup complete!
📊 Summary:
   - Templates loaded: 39 / 39
   - Invoice templates: 18
   - Contract templates: 21
```

## Step 4: Login and Test

1. Open your GritDocs app
2. Login with:
   - **Email**: design@northcellstudios.com
   - **Password**: samurai01
3. Go to **Canvas** screen
4. Select **Web Development** industry
5. You should see **39 template blocks** available!

## Troubleshooting

### Error: "Could not find the column"
- This means you haven't run the migrations yet
- Go back to Step 1 and run both SQL scripts

### Error: "User already registered"
- This is fine! The account exists, templates will be updated
- Make sure you run the migrations (Steps 1-2)
- Then run the setup script again

### Templates not showing up
- Check that migrations ran successfully
- Check that setup script shows "Templates loaded: 39 / 39"
- Refresh the app or logout/login again

## What These Migrations Do

### Migration 1: Profile Columns
Adds missing fields to store complete business information:
- `website` - Company website URL
- `vat_registration_number` - Tax registration
- `business_type` - Registered/unregistered business
- `phone` - Contact number
- `address` - Physical address
- `jurisdiction` - Legal jurisdiction

### Migration 2: Contract Support
Adds contract functionality to templates table:
- `contract_type` - Type of contract (Service Agreement, NDA, etc.)
- `clauses` - JSONB array of contract clauses
- `items` - JSONB array of invoice line items
- Creates helper views for easy querying
- Updates constraints to allow CONTRACT doc type

---

**Once complete, you'll have:**
- ✅ Northcell Studios account fully configured
- ✅ 18 invoice templates for web development
- ✅ 21 contract templates (including GritDocs shareholder agreement)
- ✅ Professional contract rendering system
- ✅ Ready to generate legal-binding contracts!
