-- ============================================================================
-- GritDocs Supabase Schema - CLEAN SETUP (Drop & Recreate)
-- Use this if you got: "column business_name does not exist" errors
-- ============================================================================

-- Step 1: Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.item_usage CASCADE;
DROP TABLE IF EXISTS public.feature_flags CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.public_share_tokens CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.template_items CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  company_name TEXT,
  jurisdiction TEXT,
  currency TEXT DEFAULT '$',
  tax_enabled BOOLEAN DEFAULT FALSE,
  tax_name TEXT DEFAULT 'Tax',
  tax_rate NUMERIC DEFAULT 0,
  registration_number TEXT,
  logo_url TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- ============================================================================
-- 2. CLIENTS TABLE
-- ============================================================================
CREATE TABLE public.clients (
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

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_business_name ON public.clients(business_name);

-- ============================================================================
-- 3. TEMPLATES TABLE
-- ============================================================================
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('INVOICE', 'CONTRACT', 'HRDOC')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_user_id ON public.templates(user_id);
CREATE INDEX idx_templates_doc_type ON public.templates(doc_type);
CREATE INDEX idx_templates_category ON public.templates(category);

-- ============================================================================
-- 4. TEMPLATE ITEMS TABLE
-- ============================================================================
CREATE TABLE public.template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_type TEXT DEFAULT 'ea',
  price NUMERIC DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_template_items_template_id ON public.template_items(template_id);

-- ============================================================================
-- 5. DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('INVOICE', 'CONTRACT', 'HRDOC')),
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue')),
  theme TEXT DEFAULT 'swiss',
  date_issued DATE,
  due_date DATE,
  currency TEXT DEFAULT '$',
  notes TEXT,
  subtotal NUMERIC DEFAULT 0,
  tax_total NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  shareable_link TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_documents_deleted_at ON public.documents(deleted_at);

-- ============================================================================
-- 6. INVOICE ITEMS TABLE
-- ============================================================================
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_type TEXT DEFAULT 'ea',
  price NUMERIC DEFAULT 0,
  sort_order INT DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_document_id ON public.invoice_items(document_id);
CREATE INDEX idx_invoice_items_deleted_at ON public.invoice_items(deleted_at);

-- ============================================================================
-- 7. PUBLIC SHARE TOKENS TABLE
-- ============================================================================
CREATE TABLE public.public_share_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_public_share_tokens_token ON public.public_share_tokens(token);
CREATE INDEX idx_public_share_tokens_document_id ON public.public_share_tokens(document_id);

-- ============================================================================
-- 8. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- ============================================================================
-- 9. ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- ============================================================================
-- 10. FEATURE FLAGS TABLE
-- ============================================================================
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_flag_name ON public.feature_flags(flag_name);

-- ============================================================================
-- 11. ITEM USAGE TABLE
-- ============================================================================
CREATE TABLE public.item_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  usage_count INT DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_item_usage_user_id ON public.item_usage(user_id);
CREATE INDEX idx_item_usage_last_used_at ON public.item_usage(last_used_at DESC);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_usage ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- clients policies
CREATE POLICY "users_select_own_clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- templates policies
CREATE POLICY "users_select_own_templates" ON public.templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_templates" ON public.templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_templates" ON public.templates
  FOR DELETE USING (auth.uid() = user_id);

-- template_items policies
CREATE POLICY "users_select_own_template_items" ON public.template_items
  FOR SELECT USING (
    template_id IN (SELECT id FROM public.templates WHERE user_id = auth.uid())
  );

CREATE POLICY "users_insert_own_template_items" ON public.template_items
  FOR INSERT WITH CHECK (
    template_id IN (SELECT id FROM public.templates WHERE user_id = auth.uid())
  );

CREATE POLICY "users_update_own_template_items" ON public.template_items
  FOR UPDATE USING (
    template_id IN (SELECT id FROM public.templates WHERE user_id = auth.uid())
  );

CREATE POLICY "users_delete_own_template_items" ON public.template_items
  FOR DELETE USING (
    template_id IN (SELECT id FROM public.templates WHERE user_id = auth.uid())
  );

-- documents policies
CREATE POLICY "users_select_own_documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- invoice_items policies
CREATE POLICY "users_select_own_invoice_items" ON public.invoice_items
  FOR SELECT USING (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

CREATE POLICY "users_insert_own_invoice_items" ON public.invoice_items
  FOR INSERT WITH CHECK (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

CREATE POLICY "users_update_own_invoice_items" ON public.invoice_items
  FOR UPDATE USING (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

CREATE POLICY "users_delete_own_invoice_items" ON public.invoice_items
  FOR DELETE USING (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

-- public_share_tokens policies
CREATE POLICY "users_select_own_share_tokens" ON public.public_share_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_share_tokens" ON public.public_share_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- public access for valid tokens
CREATE POLICY "public_select_by_token" ON public.documents
  FOR SELECT USING (
    id IN (
      SELECT document_id FROM public.public_share_tokens
      WHERE token = current_setting('request.headers')::jsonb->>'x-share-token'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- audit_logs policies
CREATE POLICY "users_select_own_audit_logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- analytics_events policies
CREATE POLICY "users_insert_own_analytics_events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- item_usage policies
CREATE POLICY "users_select_own_item_usage" ON public.item_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_item_usage" ON public.item_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_item_usage" ON public.item_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS (Auto-update updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_items_updated_at BEFORE UPDATE ON public.template_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.user_profiles IS 'User profile data extending auth.users';
COMMENT ON TABLE public.clients IS 'Business clients for invoicing';
COMMENT ON TABLE public.templates IS 'Reusable line item templates';
COMMENT ON TABLE public.documents IS 'Main documents: invoices, contracts, HR docs';
COMMENT ON TABLE public.invoice_items IS 'Line items within documents';
COMMENT ON TABLE public.public_share_tokens IS 'Publicly shareable invoice tokens';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for compliance';
COMMENT ON TABLE public.analytics_events IS 'User activity analytics';
COMMENT ON TABLE public.item_usage IS 'Track frequently used items for suggestions';
COMMENT ON COLUMN public.documents.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN public.invoice_items.deleted_at IS 'Soft delete timestamp';

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

-- Run this query to verify all tables were created:
-- SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';
-- Expected result: 11
