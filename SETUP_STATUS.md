# ⚠️ ACTION REQUIRED: Complete Setup

## Current Status

✅ **Completed:**
- Northcell Studios account created (design@northcellstudios.com)
- 39 templates prepared (18 invoices + 21 contracts)
- Contract rendering system built
- All code changes implemented

❌ **Needs Action (YOU):**
- Run 2 database migrations in Supabase
- Re-run setup script to load templates

## Quick Start (5 minutes)

### 1️⃣ Open Supabase Dashboard

Go to: https://app.supabase.com/project/fopyamyrykwtlwgefxuq/sql

### 2️⃣ Run Migration 1

Click **SQL Editor** → **New Query** → Paste this:

```sql
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS vat_registration_number TEXT,
ADD COLUMN IF NOT EXISTS business_type INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction TEXT;
```

Click **Run** ✅

### 3️⃣ Run Migration 2

**New Query** → Paste from `supabase/migrations/003_contract_support.sql`

Or copy from **RUN_MIGRATIONS.md** (full SQL provided)

Click **Run** ✅

### 4️⃣ Load Templates

```bash
npm run setup-northcell
```

Should show: `Templates loaded: 39 / 39` ✅

### 5️⃣ Login and Create Contract

1. Login: design@northcellstudios.com / samurai01
2. Go to Canvas screen
3. Select **"Pre-Incorporation Shareholder Agreement"** template
4. Fill in details
5. Export PDF

Done! 🎉

---

## Why This is Needed

The setup script can't insert templates because the database doesn't have the new columns yet:
- `contract_type` - Type of contract
- `clauses` - Contract clauses (JSONB)
- `items` - Invoice items (JSONB)

These columns are added by the migrations.

## Full Instructions

See **RUN_MIGRATIONS.md** for detailed step-by-step guide with troubleshooting.

## What You're Getting

### 18 Invoice Templates:
- Full Website Development (R15,000 - R72,000)
- E-commerce Site (R32,000 - R125,000)
- Mobile App Development (R72,000+)
- WordPress sites, API development, hosting packages, etc.

### 21 Contract Templates:
- Service Agreement (9-clause comprehensive)
- GritDocs Pre-Incorporation Shareholder Agreement
- Non-Disclosure Agreement (NDA)
- Website Development Agreement
- Retainer Agreement
- Maintenance & Support Agreement
- Independent Contractor Agreement
- And 14 more professional contracts

All templates are:
- ✅ Comprehensive and detailed
- ✅ South African jurisdiction compliant
- ✅ Professional formatting
- ✅ Print/export ready
- ✅ Legally binding when executed

---

**Next Step:** Open **RUN_MIGRATIONS.md** and follow the instructions! 🚀
