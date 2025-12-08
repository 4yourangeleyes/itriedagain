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
