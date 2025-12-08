# Quick Setup Instructions for Northcell Studios

## Step 1: Run Database Migration

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/003_contract_support.sql`
4. Click "Run" to execute the migration
5. Verify success (should see "Success. No rows returned")

## Step 2: Create Northcell Studios Account

### Option A: Run the Automated Script

```bash
cd /Users/sachinphilander/Desktop/prnME/grittynittyproto
npm run setup-northcell
```

This will:
- Create the account (design@northcellstudios.com / samurai01)
- Set up the complete profile
- Load all 39 template blocks automatically

### Option B: Manual Account Creation

If the script fails, create the account manually:

1. **Sign Up:**
   - Email: `design@northcellstudios.com`
   - Password: `samurai01`

2. **Complete Profile (in Settings):**
   - Company Name: `Northcell Studios`
   - Industry: `Web Development`
   - Registration Number: `2024/123456/07`
   - VAT Number: `VAT12345`
   - Address: `123 Digital Drive, Sandton, Johannesburg, 2196`
   - Phone: `+27 11 123 4567`
   - Website: `https://northcellstudios.com`
   - Jurisdiction: `Republic of South Africa`
   - Currency: `R`
   - Tax Enabled: `Yes`
   - Tax Rate: `15%`

3. **Load Templates:**
   - The templates will be available through the industry selection
   - Select "Web Development" as industry
   - All 39 templates should load automatically from `webDevelopmentData.ts`

## Step 3: Create Your First Contract

### To Create the GritDocs Shareholder Agreement:

1. **Log in** as Northcell Studios
2. **Start New Contract:**
   - Click "New Document" → "Contract"
   - Select "Pre-Incorporation Shareholders Agreement" from templates

3. **Fill in Details:**
   
   **Parties:**
   - Technical Founder: [Your Full Name]
   - ID Number: [Your ID]
   - Address: [Your Address]
   - Co-Founder 1: [Name]
   - ID Number: [Their ID]
   - Address: [Their Address]
   - Co-Founder 2: [Name]
   - ID Number: [Their ID]
   - Address: [Their Address]

4. **Customize Clauses:**

   Replace placeholders:
   - `[COMPANY NAME]` → `GritDocs`
   - `[DURATION]` → `3` (months)
   - `[AMOUNT]` → `10,600` (Development Fee)
   - `[HOURS]` → Number of monthly hours if applicable
   
5. **Review All 9 Clauses:**
   - Incorporation and Shareholding
   - Development Fee (R10,600)
   - Shared External Expenses
   - Technical Founder Responsibilities
   - Co-Founder Responsibilities
   - Future Rights and Call Options
   - Intellectual Property Ownership
   - Pre-Emptive Rights
   - Dispute Resolution

6. **Set Contract Terms:**
   - Start Date: [Signing Date]
   - Payment Schedule: `Custom`
   - Jurisdiction: `Republic of South Africa`

7. **Export:**
   - Switch to "Preview (Final)" mode
   - Click "Export" → "Download PDF"
   - Save as `GritDocs_Shareholder_Agreement_2025.pdf`

## Step 4: Test Contract Generation

### Test Invoice Creation:
1. Select invoice template (e.g., "Full Website Design & Development")
2. Add client details
3. Modify pricing as needed
4. Export PDF

### Test Contract Creation:
1. Select contract template (e.g., "Web Development Service Agreement")
2. Fill in client and project details
3. Customize clauses
4. Set contract terms
5. Export PDF

## Verification Checklist

- [ ] Database migration successful
- [ ] Northcell Studios account created
- [ ] Profile fully completed
- [ ] 18 invoice templates visible in Settings
- [ ] 21 contract templates visible in Settings
- [ ] Can create new invoice using template
- [ ] Can create new contract using template
- [ ] Contract renders properly (different from invoice)
- [ ] Can edit clauses in Draft mode
- [ ] Preview mode shows professional formatting
- [ ] Can export contract as PDF
- [ ] Shareholder agreement template works

## Troubleshooting

### Templates Not Showing:
```bash
# Check if migration ran
# In Supabase SQL Editor:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'templates';

# Should see: contract_type, clauses, items
```

### Account Creation Failed:
- Check email is not already registered
- Verify Supabase is running
- Check console for errors
- Try manual signup in UI

### Templates Not Loading:
- Verify industry is set to "Web Development"
- Check browser console for errors
- Refresh the page
- Clear browser cache

### Contract Not Rendering:
- Check document type is "Contract"
- Verify ContractThemeRenderer is imported
- Check browser console for React errors
- Ensure clauses array exists (not undefined)

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run setup script
npm run setup-northcell

# Check TypeScript errors
npx tsc --noEmit
```

## Next Steps

After setup:
1. Create your GritDocs shareholder agreement
2. Customize as needed for your specific situation
3. Have it reviewed by a South African attorney
4. Get all parties to sign
5. Store securely

## Support

If you encounter issues:
1. Check CONTRACT_SYSTEM_GUIDE.md for detailed documentation
2. Review browser console for errors
3. Check Supabase logs
4. Verify all files were created correctly

---

**Ready to start!** Run the migration first, then create your account.
