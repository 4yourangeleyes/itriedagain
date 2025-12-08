/**
 * Fix: Create GROUPED legal templates (all clauses together, not separate)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

envLines.forEach(line => {
  const match = line.match(/^VITE_SUPABASE_URL=(.+)$/);
  if (match) SUPABASE_URL = match[1].trim();
  
  const keyMatch = line.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/);
  if (keyMatch) SUPABASE_ANON_KEY = keyMatch[1].trim();
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const NORTHCELL_EMAIL = 'design@northcellstudios.com';
const NORTHCELL_PASSWORD = 'samurai01';

// Grouped legal templates - ALL clauses together
const GROUPED_TEMPLATES = {
  projectBrief: {
    name: 'GritDocs Project Scope & Brief',
    category: 'GritDocs Legal',
    contract_type: 'Project Brief',
    clauses: [
      {
        id: 'pb-1',
        title: 'Original Project Requirements',
        content: `The client requested a business document management application with the following specifications:

PRIMARY PURPOSE:
An application to create personalized business invoices, contracts, and internal HR documents for service-based businesses.

TARGET AUDIENCE:
- Plumbers
- Electricians  
- Construction companies
- BPO (Business Process Outsourcing) companies
- General service businesses

CORE FEATURES REQUESTED:
1. User authentication (email/password and Google sign-in)
2. Five primary screens: Sign-in, Canvas, Dashboard, Settings, Chat
3. Document creation via AI chat (voice notes and text)
4. PDF export functionality
5. Email delivery system
6. Client management database
7. Template block system for quick document assembly
8. SVG logo upload and integration
9. Business profile configuration
10. Contract clause management`,
        sortOrder: 1
      },
      {
        id: 'pb-2',
        title: 'Delivered Features - Core Functionality',
        content: `AUTHENTICATION & USER MANAGEMENT:
✓ Email/password authentication
✓ Google OAuth integration
✓ Secure session management with Supabase
✓ User profile system with comprehensive business fields

DOCUMENT TYPES:
✓ Professional invoices with 12 theme options
✓ Legal contracts with 7 professional themes
✓ HR documents support
✓ Multi-page document support with realistic pagination

TEMPLATE SYSTEM:
✓ Template blocks with categorization
✓ Reusable line items and service packages
✓ Contract clause library (100+ professional clauses)
✓ Industry-specific templates (Web Development, Plumbing, Construction, etc.)

CLIENT MANAGEMENT:
✓ Full CRUD operations for clients
✓ Client history tracking
✓ Business registration number support
✓ Multiple contact methods per client`,
        sortOrder: 2
      },
      {
        id: 'pb-3',
        title: 'Delivered Features - Enhanced Capabilities',
        content: `ADVANCED FEATURES BEYOND ORIGINAL SCOPE:

PROFESSIONAL THEMING ENGINE:
✓ 12 invoice themes with print optimization
✓ 7 contract themes including Bauhaus, Constructivist, International Swiss Grid
✓ Brand consistency across all documents
✓ A4-compliant layouts (210mm x 297mm)

CONTRACT MANAGEMENT SYSTEM:
✓ Dynamic multi-page preview (3 clauses per page)
✓ Realistic page numbering and headers
✓ Professional signature blocks
✓ Terms and conditions library
✓ Payment schedule configuration
✓ Jurisdiction and compliance fields

AI INTEGRATION:
✓ Conversational chat interface
✓ Voice note to document conversion
✓ Natural language processing with Gemini AI
✓ Context-aware suggestions

DOCUMENT WORKFLOW:
✓ Status tracking (Draft, Sent, Paid, Overdue)
✓ Email delivery with PDF attachments
✓ CC/BCC support
✓ Shareable public links for invoices
✓ Real-time syncing across devices`,
        sortOrder: 3
      },
      {
        id: 'pb-4',
        title: 'Technical Architecture',
        content: `TECHNOLOGY STACK:

Frontend:
- React 19.2.0 (latest stable release)
- TypeScript 5.8.2 for type safety
- Vite build system for optimal performance
- Tailwind CSS for responsive design
- Lucide React icon library

Backend & Database:
- Supabase (PostgreSQL) for data persistence
- Row-Level Security (RLS) for multi-tenant isolation
- Real-time subscriptions for live updates
- Edge functions for serverless compute
- Secure JWT-based authentication

Document Generation:
- Professional PDF rendering engine
- Print-optimized CSS with @page rules
- Dynamic pagination system
- Multi-theme support with consistent branding

Integrations:
- Email service for document delivery
- Gemini AI for natural language processing
- Cloud storage for document persistence
- Version control with Git/GitHub`,
        sortOrder: 4
      },
      {
        id: 'pb-5',
        title: 'Development Timeline',
        content: `THREE-MONTH DEVELOPMENT PHASES:

MONTH 1 - FOUNDATION (Weeks 1-4):
✓ Project architecture and database schema design
✓ Authentication system implementation
✓ Core screens (Login, Dashboard, Canvas, Settings, Chat)
✓ Basic invoice creation and editing
✓ Client management foundation

MONTH 2 - CORE FEATURES (Weeks 5-8):
✓ Template block system
✓ PDF generation and export
✓ Email integration and delivery
✓ Multi-theme support for invoices
✓ Document status tracking
✓ Advanced client CRUD operations

MONTH 3 - ADVANCED FEATURES (Weeks 9-12):
✓ Contract management system
✓ Professional contract renderer with 7 themes
✓ Clause library and management (100+ clauses)
✓ AI chat integration with Gemini
✓ Voice note processing
✓ Multi-page preview with realistic pagination (3 clauses per page)
✓ Print-optimized layouts
✓ Testing and quality assurance
✓ Production deployment preparation`,
        sortOrder: 5
      }
    ]
  },

  serviceAgreement: {
    name: 'GritDocs Service Agreement',
    category: 'GritDocs Legal',
    contract_type: 'Service Agreement',
    clauses: [
      {
        id: 'sa-1',
        title: 'Scope of Development Services',
        content: `The Developer agrees to provide comprehensive software development services for the GritDocs application, including:

a) Full-stack web application development using React, TypeScript, and Supabase
b) User authentication and authorization system
c) Database schema design and migration management
d) Document generation system (invoices, contracts, HR documents)
e) AI integration for conversational document creation
f) Professional theming engine with multiple design options
g) Client relationship management system
h) Template block architecture
i) PDF export functionality
j) Email delivery integration
k) Multi-page preview system with realistic pagination
l) Contract management with professional legal templates
m) Testing, debugging, and quality assurance
n) Documentation and deployment support`,
        sortOrder: 1
      },
      {
        id: 'sa-2',
        title: 'Payment Terms',
        content: `Total development fee for the three-month period: Ten Thousand Six Hundred South African Rand (R10,600.00)

PAYMENT STRUCTURE:
1. Initial Payment: R5,300.00 (50%)
   Due: Upon execution of this Agreement
   
2. Milestone Payment: R2,650.00 (25%)
   Due: Upon completion of Month 2 deliverables
   
3. Final Payment: R2,650.00 (25%)
   Due: Upon completion and final delivery

Payment Method: Electronic Funds Transfer (EFT)
Late Payment: 2% per month on overdue balances after 14 days`,
        sortOrder: 2
      },
      {
        id: 'sa-3',
        title: 'Intellectual Property Rights',
        content: `Upon full payment of all fees, the Client shall own all intellectual property rights in the GritDocs application, including:

a) Custom code written for the application
b) Database schemas and data structures
c) User interface designs and layouts
d) Documentation and user guides
e) Template libraries and clause collections
f) Business logic and algorithms

The Developer retains ownership of:
a) Pre-existing code libraries and frameworks
b) General programming techniques
c) Third-party open-source components (React, Tailwind CSS, etc.)

Upon final payment, the Developer shall provide:
- Complete source code repository access
- Database migration scripts
- Configuration files
- Deployment documentation
- Admin access to third-party services`,
        sortOrder: 3
      },
      {
        id: 'sa-4',
        title: 'Warranties & Support',
        content: `The Developer warrants that:

a) All code is written according to industry best practices
b) Code is well-documented and maintainable
c) The application is free from material defects upon delivery
d) All work is original or properly licensed

BUG FIX PERIOD:
The Developer shall provide bug fixes for critical issues discovered within 30 days of final delivery at no additional cost.

Critical issues defined as:
- Application crashes or complete failures
- Data loss or corruption
- Security vulnerabilities
- Core functionality not working as specified

Non-critical enhancements requested after acceptance shall be subject to separate negotiation and pricing.`,
        sortOrder: 4
      }
    ]
  },

  partnerAgreement40_60: {
    name: 'GritDocs Partner Agreement - Option 1 (40/60 Split)',
    category: 'GritDocs Legal',
    contract_type: 'Partner Agreement',
    clauses: [
      {
        id: 'pa1-1',
        title: 'Partnership Structure (40/60 Split)',
        content: `This Agreement establishes ownership of GritDocs as follows:

CO-FOUNDERS (The Two Founding Partners):
- Combined Equity: 40% (20% each)
- Title: Co-Founders
- Initial Investment: R5,300.00 total (R2,650.00 each)

FOUNDER (Developer):
- Equity: 60%
- Title: Founder
- Contribution: Development services (valued at R10,600)

COMPANY VALUATION:
Based on R1,060 per 1% of equity:
- Total Company Value: R106,000
- Co-Founders 40% Value: R42,400
- Founder 60% Value: R63,600`,
        sortOrder: 1
      },
      {
        id: 'pa1-2',
        title: 'Super-Voting Rights Structure',
        content: `VOTING POWER ALLOCATION:

Co-Founders:
- Votes per percentage point: 3 votes
- Total votes: 40% × 3 = 120 votes
- Voting control: 16.7%

Founder:
- Votes per percentage point: 10 votes  
- Total votes: 60% × 10 = 600 votes
- Voting control: 83.3%

TOTAL VOTING STRUCTURE:
- Total company votes: 720 votes
- Founder controls 83.3% of voting power

This super-voting structure recognizes the Founder's role in developing the application while providing Co-Founders meaningful economic participation.

MATTERS REQUIRING MAJORITY VOTE (>360 votes):
- Annual budget approval
- Major expenditures (>R50,000)
- Hiring employees
- Entering significant contracts
- Quarterly profit distributions`,
        sortOrder: 2
      },
      {
        id: 'pa1-3',
        title: 'Additional Equity Purchase Option',
        content: `OPTIONAL INVESTMENT:

The Co-Founders have a one-time option to purchase an additional 30% equity:

Option Terms:
- Additional Equity: 30% combined (15% per Co-Founder)
- Exercise Price: R5,300.00 (R2,650.00 each)
- Exercise Period: 90 days from this Agreement
- Price Basis: R1,060 per 1% (consistent valuation)

POST-EXERCISE OWNERSHIP (if option exercised in full):
- Co-Founders: 70% equity, 210 votes (53.8% voting control)
- Founder: 30% equity, 300 votes (46.2% voting control)

PARTIAL EXERCISE:
One Co-Founder may exercise independently:
- Exercising Co-Founder: 35% ownership, 105 votes
- Non-Exercising Co-Founder: 20% ownership, 60 votes
- Founder: 45% ownership, 450 votes

No obligation to exercise. If not exercised within 90 days, the original 60/40 split remains.`,
        sortOrder: 3
      },
      {
        id: 'pa1-4',
        title: 'Revenue Distribution',
        content: `All net revenues shall be distributed according to equity ownership:

DISTRIBUTION FORMULA:
- Founder: 60% of distributable profits
- Co-Founder 1: 20% of distributable profits
- Co-Founder 2: 20% of distributable profits

(Adjusted if Additional Equity Option is exercised)

DISTRIBUTABLE PROFITS CALCULATION:
Gross Revenue
LESS: Operating Expenses
LESS: Taxes and Regulatory Fees  
LESS: Reserve Fund (minimum 10% of net income)
EQUALS: Distributable Profits

DISTRIBUTION TIMING:
- Quarterly distributions (Mar 31, Jun 30, Sep 30, Dec 31)
- Declared within 30 days of quarter end
- Paid within 45 days of quarter end

RESERVE REQUIREMENTS:
Company must maintain 3 months of operating expenses in reserve before distributing profits.`,
        sortOrder: 4
      },
      {
        id: 'pa1-5',
        title: 'Roles & Responsibilities',
        content: `FOUNDER (Developer) - 60% Owner:
- Technical development and maintenance
- Software architecture decisions
- Code quality and security oversight
- Infrastructure management
- Product roadmap leadership
- Time Commitment: 20 hours/week minimum

CO-FOUNDERS - 40% Combined:
- Business development and sales
- Customer acquisition and relationships
- Marketing and branding
- Financial management and bookkeeping
- Strategic planning participation
- Time Commitment: 40 hours/week combined (20 each)

DECISION AUTHORITY:

Founder Exclusive (Technical):
- Technology stack and architecture
- Code deployment and releases
- Development tool selection
- Technical integrations

Co-Founders Exclusive (Operational):
- Marketing campaign execution (within budget)
- Customer service policies
- Day-to-day operations under R5,000

Majority Vote Required (>360 votes):
- Annual budget
- Expenditures over R10,000
- Hiring employees
- New product lines
- Major partnerships`,
        sortOrder: 5
      }
    ]
  },

  partnerAgreement60_40: {
    name: 'GritDocs Partner Agreement - Option 2 (60/40 Split)',
    category: 'GritDocs Legal',
    contract_type: 'Partner Agreement',
    clauses: [
      {
        id: 'pa2-1',
        title: 'Partnership Structure (60/40 Split)',
        content: `This Agreement establishes ownership of GritDocs as follows:

CO-FOUNDERS (The Two Founding Partners):
- Combined Equity: 60% (30% each)
- Title: Co-Founders
- Total Investment: R10,600.00 (R5,300.00 each)

FOUNDER (Developer):
- Equity: 40%
- Title: Founder
- Contribution: Development services

COMPANY VALUATION:
Based on R1,060 per 1% of equity:
- Total Company Value: R106,000
- Co-Founders 60% Value: R63,600
- Founder 40% Value: R42,400

VOTING STRUCTURE:
Equal voting rights - 1 vote per 1% owned:
- Co-Founders: 60 votes (60% control - majority)
- Founder: 40 votes (40% control)`,
        sortOrder: 1
      },
      {
        id: 'pa2-2',
        title: 'Investment Terms',
        content: `PAYMENT FOR EQUITY OWNERSHIP:

Total Investment: R10,600.00 for 60% equity

BREAKDOWN:
- Co-Founder 1: R5,300.00 for 30%
- Co-Founder 2: R5,300.00 for 30%

Payment Method: Electronic Funds Transfer (EFT)
Due Date: Within 7 business days of execution

PRICE PER PERCENTAGE:
R1,060 per 1% (consistent with Option 1 valuation)

PURPOSE OF PAYMENT:
- Three months of completed development work
- Full ownership rights to GritDocs source code
- All intellectual property created
- Professional theming and feature systems
- Production-ready application

EQUITY CERTIFICATES:
Upon payment receipt:
- Co-Founder 1: 30% ownership, 30 votes
- Co-Founder 2: 30% ownership, 30 votes
- Founder: 40% ownership, 40 votes`,
        sortOrder: 2
      },
      {
        id: 'pa2-3',
        title: 'Governance & Control',
        content: `VOTING STRUCTURE:
Each percentage point = 1 vote
- Co-Founders: 60 votes combined (majority control)
- Founder: 40 votes (minority position)

MAJORITY VOTE MATTERS (51+ votes):
a) Annual budget approval
b) Hiring or terminating employees
c) Expenditures R10,000 - R50,000
d) Marketing campaigns over R5,000
e) Contracts R5,000 - R25,000
f) Quarterly profit distributions
g) Vendor selection
h) Product pricing changes

SUPERMAJORITY MATTERS (67+ votes):
a) Amendments to Partnership Agreement
b) Sale or merger of company
c) Dissolution of partnership
d) New equity issuance
e) Expenditures over R50,000
f) Borrowing over R100,000
g) Admission of new partners

FOUNDER TECHNICAL VETO:
Despite minority position, Founder retains veto on:
- Technology stack changes
- Code deployment schedules
- Development framework selection
- Database architecture
- Security protocols

CO-FOUNDER OPERATIONAL AUTHORITY:
With 60% majority, final authority on:
- Business strategy and positioning
- Sales and marketing execution
- Customer policies
- Operational procedures
- Budget allocation`,
        sortOrder: 3
      },
      {
        id: 'pa2-4',
        title: 'Revenue Distribution',
        content: `PROFIT DISTRIBUTION (60/40 Structure):

DISTRIBUTION FORMULA:
- Co-Founder 1: 30% of distributable profits
- Co-Founder 2: 30% of distributable profits
- Founder: 40% of distributable profits

CALCULATION:
Gross Revenue
LESS: Cost of Goods Sold
LESS: Operating Expenses
LESS: Taxes
LESS: Mandatory Reserve (15% of net income)
EQUALS: Distributable Profits

TIMING:
- Quarterly distributions
- Financial statements within 20 days of quarter end
- Distributions declared within 30 days
- Payment within 45 days

MINIMUM RESERVES:
Before distribution, maintain:
- Emergency Reserve: R25,000 minimum
- Operating Reserve: 3 months expenses
- Growth Reserve: 15% of quarterly net income

APPROVAL:
Distributions require 60% vote (Co-Founders can approve without Founder, or Founder + one Co-Founder)

SALARIES (separate from distributions):
When revenue permits:
- CEO (Co-Founder 1): Up to R20,000/month
- COO (Co-Founder 2): Up to R20,000/month
- CTO (Founder): Up to R15,000/month
(Requires 60% vote approval annually)`,
        sortOrder: 4
      },
      {
        id: 'pa2-5',
        title: 'Roles & Responsibilities',
        content: `CO-FOUNDERS (60% - Majority Control):

Co-Founder 1 - CEO:
- Overall business leadership
- Strategic partnerships
- Investor relations
- External stakeholder management

Co-Founder 2 - COO:
- Day-to-day operations
- Customer success
- Process optimization
- Financial oversight

Combined Responsibilities:
- Business development and sales
- Marketing strategy and execution
- Customer acquisition
- Financial management
- Team building and hiring
- Time Commitment: 40 hours/week combined

FOUNDER (40% - Technical Leadership):

Responsibilities:
- Software development and features
- System architecture
- Code quality and security
- Infrastructure management
- Product roadmap (technical)
- Bug fixes and support
- Time Commitment: 20 hours/week

RESERVED TECHNICAL AUTHORITY:
Despite minority position, Founder has final say on:
- Technology stack
- Code deployment
- Database architecture
- Security protocols
- Development tools

COLLABORATIVE DECISIONS (60% vote):
- Annual budget
- Expenditures over R10,000
- New product lines
- Major contracts (>R25,000)
- Equity structure changes
- New partner admission
- Company sale/merger`,
        sortOrder: 5
      }
    ]
  },

  investorAgreement: {
    name: 'GritDocs Investor Agreement',
    category: 'GritDocs Legal',
    contract_type: 'Investor Agreement',
    clauses: [
      {
        id: 'ia-1',
        title: 'Investment Structure',
        content: `This Investment Agreement governs investment in GritDocs (Pty) Ltd.

INVESTMENT TERMS:
- Investment Amount: [To be negotiated]
- Equity Percentage: [To be negotiated]
- Pre-Money Valuation: [Based on revenue multiples or R106,000 seed]
- Post-Money Valuation: [Pre-money + Investment]

SECURITIES ISSUED:
[Number] ordinary/preference shares representing [X]% of fully-diluted capitalization.

USE OF PROCEEDS:
- Product development: 35%
- Sales and marketing: 30%
- Customer acquisition: 15%
- Team expansion: 10%
- Working capital: 10%

PRICE PER PERCENTAGE:
Minimum R1,060 per 1% (seed valuation)
Adjusted based on traction, revenue, and market conditions.`,
        sortOrder: 1
      },
      {
        id: 'ia-2',
        title: 'Investor Rights',
        content: `INFORMATION RIGHTS:

Monthly:
- Management accounts (revenue, expenses, cash)
- Key metrics (MRR, ARR, churn, customers)

Quarterly:
- Detailed financials (P&L, balance sheet, cash flow)
- Updated cap table
- Customer metrics

Annually:
- Audited statements (if required)
- Budget and business plan

BOARD REPRESENTATION:
- 10-19% ownership: Board observer rights
- 20-39% ownership: One board seat
- 40%+ ownership: Two board seats

PROTECTIVE PROVISIONS:
Investor consent required for:
a) Issuance of new equity
b) Sale or merger
c) Dissolution
d) Amendment of articles
e) Borrowing over [Amount]
f) Sale of material assets
g) Related party transactions
h) Executive compensation changes

PRO-RATA RIGHTS:
Right to participate in future rounds to maintain ownership percentage.`,
        sortOrder: 2
      },
      {
        id: 'ia-3',
        title: 'Liquidation Preference',
        content: `Upon liquidation, dissolution, or deemed liquidation event:

PREFERENCE:
Investor receives [1x or 2x] investment amount first, plus accrued dividends, before common shareholders.

PARTICIPATION:
After preference, Investor participates pro-rata with common in remaining proceeds.

EXAMPLE (R10M investment, 20% ownership, 1x participating):
Exit at R50M:
1. Investor receives R10M (preference)
2. Remaining R40M × 20% = R8M
3. Total Investor proceeds: R18M (180% return)

DEEMED LIQUIDATION EVENTS:
- Sale of substantially all assets
- Merger where shareholders receive cash/securities
- Exclusive licensing of core IP
- Sale of >50% voting power

TAG-ALONG & DRAG-ALONG:
- Tag-Along: If Founders sell >25%, Investor can participate
- Drag-Along: If 75%+ approve sale, minority must participate`,
        sortOrder: 3
      },
      {
        id: 'ia-4',
        title: 'Founder Vesting',
        content: `VESTING SCHEDULE:
- Total Period: 4 years
- Cliff: 1 year (25% vests)
- Monthly vesting: 1/48 per month thereafter
- Acceleration: On exit or change of control

VESTING COMMENCEMENT:
From [Investment Closing Date or earlier]

UNVESTED BUYBACK:
If Founder leaves before full vesting:
- Company/Investors may repurchase unvested shares
- Price: Greater of cost or fair market value
- Payment within 90 days

FOUNDER COMMITMENTS:
- Remain full-time employed
- No competing businesses
- Maintain key person insurance [if required]
- All IP assigned to company

NON-COMPETE:
During employment + 18 months after:
- No competing in business document software
- No customer solicitation
- No employee solicitation
- Geographic: South Africa and active markets`,
        sortOrder: 4
      },
      {
        id: 'ia-5',
        title: 'Exit Rights',
        content: `INVESTOR EXIT MECHANISMS:

1. STRATEGIC ACQUISITION:
   - Minimum valuation or revenue multiple
   - Investor consent required
   - Liquidation preference applies

2. IPO (Initial Public Offering):
   - Listing on JSE or international exchange
   - Lock-up: 180 days standard
   - Piggyback registration rights

3. REDEMPTION RIGHTS:
   If no exit within [5-7] years:
   - Investor may require share redemption
   - Price: Greater of (Investment + 8% annual return) or FMV
   - Payment over 12-24 months

REGISTRATION RIGHTS:

Demand Rights:
- Investor may demand IPO filing
- [1-2] demand rights total
- Company uses best efforts

Piggyback Rights:
- Include shares in company registration
- Pro-rata cutback if underwriters limit size
- Unlimited piggyback rights

TRANSFER RESTRICTIONS:
Founders cannot sell except:
- Company exit
- With Investor consent
- After [X] years: up to [Y]% annually with ROFR`,
        sortOrder: 5
      }
    ]
  }
};

async function fixGroupedTemplates() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  🔧 FIX: Creating GROUPED Legal Templates                    ║');
  console.log('║  (All clauses together, not separate)                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Authenticate
    console.log('🔐 Step 1: Authentication');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: NORTHCELL_EMAIL,
      password: NORTHCELL_PASSWORD
    });
    
    if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);
    
    const user = signInData.user;
    console.log(`✅ Signed in as: ${NORTHCELL_EMAIL}`);
    console.log(`👤 User ID: ${user.id}`);
    console.log('');

    // Delete old separated legal templates
    console.log('🗑️  Step 2: Removing Old Separated Templates');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('user_id', user.id)
      .in('category', ['Partner Agreement', 'Service Agreement', 'Project Brief', 'Investor Agreement']);
    
    if (deleteError) {
      console.log(`⚠️  Could not delete old templates: ${deleteError.message}`);
    } else {
      console.log('✅ Removed all separated legal clause templates');
    }
    console.log('');

    // Create grouped templates
    console.log('📦 Step 3: Creating Grouped Templates');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const templatesToInsert = [
      {
        user_id: user.id,
        name: GROUPED_TEMPLATES.projectBrief.name,
        category: GROUPED_TEMPLATES.projectBrief.category,
        doc_type: 'Contract',
        contract_type: GROUPED_TEMPLATES.projectBrief.contract_type,
        clauses: JSON.stringify(GROUPED_TEMPLATES.projectBrief.clauses),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: user.id,
        name: GROUPED_TEMPLATES.serviceAgreement.name,
        category: GROUPED_TEMPLATES.serviceAgreement.category,
        doc_type: 'Contract',
        contract_type: GROUPED_TEMPLATES.serviceAgreement.contract_type,
        clauses: JSON.stringify(GROUPED_TEMPLATES.serviceAgreement.clauses),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: user.id,
        name: GROUPED_TEMPLATES.partnerAgreement40_60.name,
        category: GROUPED_TEMPLATES.partnerAgreement40_60.category,
        doc_type: 'Contract',
        contract_type: GROUPED_TEMPLATES.partnerAgreement40_60.contract_type,
        clauses: JSON.stringify(GROUPED_TEMPLATES.partnerAgreement40_60.clauses),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: user.id,
        name: GROUPED_TEMPLATES.partnerAgreement60_40.name,
        category: GROUPED_TEMPLATES.partnerAgreement60_40.category,
        doc_type: 'Contract',
        contract_type: GROUPED_TEMPLATES.partnerAgreement60_40.contract_type,
        clauses: JSON.stringify(GROUPED_TEMPLATES.partnerAgreement60_40.clauses),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: user.id,
        name: GROUPED_TEMPLATES.investorAgreement.name,
        category: GROUPED_TEMPLATES.investorAgreement.category,
        doc_type: 'Contract',
        contract_type: GROUPED_TEMPLATES.investorAgreement.contract_type,
        clauses: JSON.stringify(GROUPED_TEMPLATES.investorAgreement.clauses),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('templates')
      .insert(templatesToInsert)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert templates: ${insertError.message}`);
    }

    console.log(`✅ Created ${insertData.length} grouped templates`);
    console.log('');
    insertData.forEach((t: any) => {
      const clauseData = JSON.parse(t.clauses);
      console.log(`   ✓ ${t.name} (${clauseData.length} clauses)`);
    });
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🎉 SUCCESS!');
    console.log('');
    console.log('📋 Grouped Templates Created:');
    console.log('   • GritDocs Project Scope & Brief (5 clauses)');
    console.log('   • GritDocs Service Agreement (4 clauses)');
    console.log('   • GritDocs Partner Agreement - Option 1 (5 clauses)');
    console.log('   • GritDocs Partner Agreement - Option 2 (5 clauses)');
    console.log('   • GritDocs Investor Agreement (5 clauses)');
    console.log('');
    console.log('📁 Category: "GritDocs Legal"');
    console.log('');
    console.log('✨ Now when you click "Add Clauses or Template" in Canvas,');
    console.log('   you\'ll see these as complete documents under "GritDocs Legal"!');
    console.log('');
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

fixGroupedTemplates()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
