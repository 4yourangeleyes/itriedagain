# Contract System Implementation Guide

## Overview

This document outlines the comprehensive contract generation system implemented for GritDocs, including the Northcell Studios account setup with 39 professional template blocks.

## What Was Implemented

### 1. **Enhanced Type System** (`types.ts`)

#### New Contract-Specific Types:
- `ContractType` enum - 10 contract types (Service Agreement, Shareholder Agreement, NDA, etc.)
- `ContractTheme` - 4 professional themes (legal, modern, executive, minimal)
- `ContractClause` - Enhanced with `order`, `required`, and `category` fields
- `ContractMilestone` - For milestone-based contracts
- `ContractSignature` - Digital signature support
- `ContractTerms` - Comprehensive contract terms (dates, payment schedule, etc.)

#### Updated Interfaces:
- `DocumentData` - Now includes contract-specific fields:
  - `contractType`
  - `contractTheme`
  - `contractTerms`
  - `signatures`
  - `scopeOfWork`
  - `deliverables`
  
- `TemplateBlock` - Supports both single and multiple clauses:
  - `clause` (legacy, single clause)
  - `clauses` (array of clauses for comprehensive templates)
  - `contractType`

### 2. **Web Development Templates** (`services/webDevelopmentData.ts`)

#### 18 Invoice Templates:
1. Full Website Design & Development
2. E-Commerce Platform Development
3. Mobile Application Development
4. Brand Identity Package
5. CMS Implementation
6. Digital Marketing Package
7. Hosting & Infrastructure Setup
8. Custom API Development
9. UI/UX Design Package
10. Monthly Maintenance Package
11. Database Architecture & Design
12. Quality Assurance & Testing
13. High-Converting Landing Page
14. Custom WordPress Plugin Development
15. Video Production Services
16. Technical Consulting
17. Social Media Management (Monthly)
18. Emergency Support Services

#### 21 Contract Templates:
1. **Web Development Service Agreement** - Standard 9-clause contract with scope, payment, timeline, IP rights, warranty, responsibilities, termination, liability, and governing law
2. **Pre-Incorporation Shareholders Agreement** - Complete GritDocs shareholder agreement with equity structure, development fees, shared expenses, roles, IP rights, and dispute resolution
3. **Client Onboarding Agreement** - Discovery phase, communication protocols, change requests
4. **Monthly Retainer Agreement** - SLA, service hours, renewal terms
5. **Mutual Non-Disclosure Agreement** - Confidential information protection
6. **Website Maintenance Agreement** - Uptime guarantees, service levels
7. **E-Commerce Development Contract** - Payment gateway integration, PCI compliance
8. **Mobile App Development Agreement** - Platform-specific terms, App Store submissions
9. **Technical Consulting Agreement** - Advisory services, deliverables
10. **Digital Content Creation Agreement** - Usage rights, revisions
11. **API Integration Agreement** - Third-party integrations
12. **SEO Services Agreement** - No ranking guarantees, reporting
13. **Hosting Services Agreement** - Server management, SLAs
14. **Brand Identity Agreement** - Logo design, brand guidelines
15. **Emergency Support Agreement** - 24/7 premium support
16. **White Label Partnership Agreement** - Revenue sharing, confidentiality
17. **Training & Documentation Agreement** - Knowledge transfer
18. **Data Migration Agreement** - Legacy system migration
19. **Performance Optimization Agreement** - Speed improvements, metrics
20. **Security Audit Agreement** - Penetration testing, vulnerability assessment
21. **Investor Subscription Agreement** - Investment terms, use of funds, warranties

### 3. **Contract Renderer Component** (`components/ContractThemeRenderer.tsx`)

Professional contract rendering with:
- **4 Theme Styles**:
  - Legal (traditional serif, formal)
  - Modern (gradient header, clean sans-serif)
  - Executive (premium, elegant)
  - Minimal (simplicity-focused)

- **Key Features**:
  - Parties section (Service Provider & Client)
  - Contract terms (start date, end date, payment schedule)
  - Scope of work
  - Numbered clauses with titles and content
  - Signature blocks (dual-party)
  - Jurisdiction and governing law
  - Fully editable in Draft mode
  - Print-ready Final mode

### 4. **Updated Canvas Screen** (`screens/CanvasScreen.tsx`)

- Conditional rendering: `InvoiceThemeRenderer` for invoices, `ContractThemeRenderer` for contracts
- Add/delete clause functionality
- Contract-specific controls hidden for invoices

### 5. **Database Migration** (`supabase/migrations/003_contract_support.sql`)

Added to templates table:
- `contract_type` column (TEXT)
- `clauses` column (JSONB - stores array of clauses)
- `items` column (JSONB - stores array of invoice items)
- Helper views: `contract_templates`, `invoice_templates`
- Updated check constraints for flexible doc_type values

### 6. **Account Setup Script** (`setup-northcell-account.ts`)

Automated script to:
- Create Northcell Studios account (`design@northcellstudios.com`)
- Set up complete user profile with SA jurisdiction
- Load all 39 template blocks into database
- Batch insertion with error handling

## Northcell Studios Account Details

```
Email: design@northcellstudios.com
Password: samurai01
Company: Northcell Studios
Industry: Web Development
Jurisdiction: Republic of South Africa
Registration: 2024/123456/07
VAT Number: VAT12345
Address: 123 Digital Drive, Sandton, Johannesburg, 2196
```

## How to Use

### 1. Run Database Migration

In your Supabase SQL Editor:
```sql
-- Run the migration
\i supabase/migrations/003_contract_support.sql
```

### 2. Set Up Northcell Account

```bash
# Install dependencies if needed
npm install

# Run the setup script
npm run setup-northcell
```

Or manually:
```bash
npx tsx setup-northcell-account.ts
```

### 3. Create a Contract

1. Log in as Northcell Studios
2. Click "New Document" → "New Contract"
3. Select contract type from dropdown
4. Choose a contract template from the library (21 available)
5. Fill in client details
6. Edit clauses as needed
7. Set contract terms (start date, payment schedule, etc.)
8. Add scope of work
9. Switch to "Preview" mode to see final formatting
10. Export as PDF or send via email

### 4. Create Your Own Contract Template

1. Go to Settings → Template Blocks
2. Click "Create New Template"
3. Select "Contract" type
4. Choose contract type (Service Agreement, NDA, etc.)
5. Add clauses with titles and content
6. Save template
7. Reuse in future contracts

## Contract Types Available

1. **Service Agreement** - General service contracts
2. **Project Contract** - Fixed-scope projects with milestones
3. **Retainer Agreement** - Ongoing monthly services
4. **Non-Disclosure Agreement** - Confidentiality protection
5. **Shareholder Agreement** - Equity and governance
6. **Employment Contract** - Employee terms
7. **Consulting Agreement** - Advisory services
8. **Maintenance Agreement** - Ongoing support
9. **License Agreement** - IP licensing
10. **Partnership Agreement** - Business partnerships

## GritDocs Shareholder Agreement

The template includes a comprehensive pre-incorporation shareholder agreement specifically for GritDocs:

**Key Clauses:**
- Share allocation: Technical Founder (40%), Co-Founders (30% each)
- Voting structure: Unequal voting rights
- Development fee: R10,600 non-refundable
- Shared external expenses pro-rata
- IP ownership and transfer terms
- Call options for future companies
- Dispute resolution via AFSA

**To Use:**
1. Select "Pre-Incorporation Shareholder Agreement" template
2. Fill in party details (names, ID numbers, addresses)
3. Customize amounts and percentages
4. Review all 9 clauses
5. Update dates and duration
6. Export and sign

## Advanced Features

### Contract Milestones
```typescript
contractTerms: {
  paymentSchedule: 'milestone',
  milestones: [
    {
      id: '1',
      name: 'Design Approval',
      description: 'Completion of all design mockups',
      dueDate: '2025-01-15',
      amount: 12000,
      status: 'pending'
    },
    {
      id: '2',
      name: 'Development Complete',
      description: 'Functional website deployed',
      dueDate: '2025-02-28',
      amount: 18000,
      status: 'pending'
    }
  ]
}
```

### Dynamic Placeholders

Contracts support placeholders that can be replaced:
- `[COMPANY NAME]` - Company being formed
- `[DURATION]` - Project duration
- `[AMOUNT]` - Total contract value
- `[DEPOSIT]` - Deposit amount
- `[PAYMENT_PROVIDER]` - Payment gateway name
- `[TECHNOLOGY_STACK]` - Tech stack for project

### Signature Workflow

1. Contract created in Draft mode
2. Client reviews and approves
3. Status changed to "Sent"
4. Client signs digitally
5. Status changed to "Signed"
6. PDF generated with signatures

## South African Legal Compliance

All contracts include:
- Jurisdiction: Republic of South Africa
- Governing law references
- AFSA arbitration clause
- CIPC company registration references
- Section 21 Companies Act 71 of 2008
- VAT compliance (15% tax rate)
- FICA-compliant fund verification

## Best Practices

1. **Always customize clauses** - Templates are starting points
2. **Review jurisdiction** - Ensure correct for your location
3. **Legal review** - Have important contracts reviewed by attorney
4. **Version control** - Save contracts as new documents when modifying
5. **Digital signatures** - Use proper digital signature tools for binding contracts
6. **Backup** - Export PDFs for offline storage

## Troubleshooting

### Templates Not Showing
- Ensure you've run the database migration
- Check that you're logged in as the correct user
- Verify templates table has the new columns

### Contract Not Rendering
- Check browser console for errors
- Ensure `ContractThemeRenderer` is imported
- Verify document type is set to "Contract"

### Missing Clauses
- Ensure `clauses` field is array, not undefined
- Check clause order numbers
- Verify JSON structure in database

## Future Enhancements

- [ ] E-signature integration (DocuSign API)
- [ ] Contract versioning and history
- [ ] Multi-party contracts (3+ signatures)
- [ ] Contract templates marketplace
- [ ] AI-powered clause suggestions
- [ ] Contract comparison tool
- [ ] Automated renewal reminders
- [ ] Contract analytics dashboard

## Support

For issues or questions:
- Email: design@northcellstudios.com
- GitHub Issues: [repo link]
- Documentation: This file

---

**Implementation Date:** December 1, 2025  
**Version:** 1.0.0  
**Developer:** Northcell Studios
