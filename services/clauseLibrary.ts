/**
 * Northcell Studios - Comprehensive Clause Library
 * 18 Professional Reusable Contract Clauses
 */

import { ContractClause, ContractType } from '../types';

export const NORTHCELL_CLAUSE_LIBRARY: ContractClause[] = [
  // 1. SCOPE OF WORK
  {
    id: 'clause_scope_work',
    title: 'Scope of Work',
    content: `The Service Provider agrees to deliver the following services ("Scope of Work") as outlined in this Agreement:

1. Project Objectives: Development and deployment of digital solutions as specified in the project brief
2. Deliverables: All agreed-upon features, functionalities, and documentation
3. Timeline: Work to be completed within the timeframe specified in the project schedule
4. Quality Standards: All deliverables must meet industry-standard quality benchmarks

Any changes to the Scope of Work must be requested in writing and approved by both parties through a formal Change Request process.`,
    category: 'Project Definition',
    required: true,
    order: 1
  },

  // 2. PAYMENT TERMS
  {
    id: 'clause_payment',
    title: 'Payment Terms and Schedule',
    content: `The Client agrees to pay the Service Provider according to the following terms:

1. Total Project Fee: As specified in the Fee Schedule attached hereto
2. Payment Schedule:
   - Deposit: 30% upon contract signing
   - Milestone 1: 30% upon completion of design phase
   - Milestone 2: 30% upon development completion
   - Final Payment: 10% upon final delivery and acceptance
3. Payment Method: Bank transfer to the account specified by Service Provider
4. Payment Terms: All invoices are due within 7 business days of receipt
5. Late Payment: Interest of 2% per month applies to overdue amounts
6. Currency: All amounts are in South African Rand (ZAR)

Non-payment may result in suspension of services and withholding of deliverables.`,
    category: 'Financial',
    required: true,
    order: 2
  },

  // 3. INTELLECTUAL PROPERTY OWNERSHIP
  {
    id: 'clause_ip_ownership',
    title: 'Intellectual Property Rights',
    content: `Ownership and licensing of intellectual property shall be governed as follows:

1. Client-Owned IP: Upon full payment, all custom-developed code, designs, and content specific to this project shall transfer to the Client
2. Service Provider IP: Pre-existing code, frameworks, libraries, and methodologies remain the property of Service Provider
3. Third-Party IP: Any third-party software, plugins, or assets are licensed separately and remain property of their respective owners
4. License Grant: Service Provider grants Client a perpetual, non-exclusive license to use all deliverables for their intended business purpose
5. Attribution: Client agrees to maintain Service Provider attribution where reasonably appropriate

Until full payment is received, Service Provider retains all rights, title, and interest in all work products.`,
    category: 'Legal',
    required: true,
    order: 3
  },

  // 4. CONFIDENTIALITY & NDA
  {
    id: 'clause_confidentiality',
    title: 'Confidentiality and Non-Disclosure',
    content: `Both parties agree to maintain confidentiality regarding proprietary information:

1. Confidential Information includes: business plans, technical data, customer lists, financial information, trade secrets, and proprietary methodologies
2. Obligations:
   - Neither party shall disclose Confidential Information to third parties without prior written consent
   - Information must be protected with the same care as one's own confidential information
   - Use of Confidential Information is limited to the purposes of this Agreement
3. Exclusions: Information that is publicly available, independently developed, or legally obtained from third parties
4. Duration: Confidentiality obligations survive for 5 years after contract termination
5. Return of Information: Upon request or termination, all Confidential Information must be returned or destroyed

Breach of confidentiality may result in immediate termination and legal action.`,
    category: 'Legal',
    required: false,
    order: 4
  },

  // 5. WARRANTY & GUARANTEE
  {
    id: 'clause_warranty',
    title: 'Warranties and Guarantees',
    content: `Service Provider provides the following warranties:

1. Quality Assurance: All work will be performed in a professional, workmanlike manner consistent with industry standards
2. Functionality Warranty: Deliverables will function as specified for 90 days post-delivery
3. Bug Fixes: Critical bugs discovered within 90 days will be fixed at no additional cost
4. Original Work: All deliverables are original or properly licensed, free from infringement claims
5. Performance: Website/application will meet specified performance benchmarks

DISCLAIMER: Except as expressly stated, Service Provider makes no other warranties, express or implied. Service Provider is not liable for issues arising from third-party services, hosting, or client modifications.`,
    category: 'Service Quality',
    required: false,
    order: 5
  },

  // 6. LIABILITY LIMITATION
  {
    id: 'clause_liability',
    title: 'Limitation of Liability',
    content: `Liability under this Agreement is limited as follows:

1. Maximum Liability: Service Provider's total liability shall not exceed the total fees paid under this Agreement
2. Consequential Damages: Neither party shall be liable for indirect, incidental, special, or consequential damages including lost profits, lost data, or business interruption
3. Service Provider Limitations:
   - Not liable for Client's failure to backup data
   - Not liable for third-party service failures (hosting, APIs, payment processors)
   - Not liable for changes made by Client after delivery
4. Client Indemnification: Client agrees to indemnify Service Provider against claims arising from Client's content, business activities, or violation of third-party rights
5. Force Majeure: Neither party is liable for delays caused by circumstances beyond reasonable control

This limitation applies to the fullest extent permitted by South African law.`,
    category: 'Legal',
    required: true,
    order: 6
  },

  // 7. CHANGE REQUESTS & AMENDMENTS
  {
    id: 'clause_change_requests',
    title: 'Change Requests and Scope Amendments',
    content: `Changes to the agreed Scope of Work must follow this process:

1. Written Request: All change requests must be submitted in writing or via email
2. Impact Assessment: Service Provider will assess the impact on timeline, cost, and resources within 3 business days
3. Quote Provision: A formal quote will be provided for approval before work commences
4. Client Approval: Changes require written approval and advance payment or purchase order
5. Timeline Adjustment: Project deadlines may be extended based on the scope of changes
6. Additional Fees: Change requests will be billed at the hourly rate specified in this Agreement

Unauthorized changes or "scope creep" may result in project delays and additional charges.`,
    category: 'Project Management',
    required: false,
    order: 7
  },

  // 8. TERMINATION CLAUSE
  {
    id: 'clause_termination',
    title: 'Termination and Exit Provisions',
    content: `Either party may terminate this Agreement under the following conditions:

1. Termination for Convenience:
   - Either party may terminate with 30 days written notice
   - Client pays for all work completed to date plus 25% of remaining contract value
   - All work products completed to date transfer to Client upon final payment
   
2. Termination for Cause:
   - Immediate termination if either party materially breaches this Agreement
   - Breaching party has 15 days to cure the breach after written notice
   - Non-payment for 30 days constitutes material breach
   
3. Upon Termination:
   - Service Provider delivers all completed work and source files
   - Client pays all outstanding invoices within 7 days
   - Confidentiality obligations continue
   - Service Provider may showcase work in portfolio unless Client objects in writing

Termination does not affect accrued rights and obligations.`,
    category: 'Contract Management',
    required: true,
    order: 8
  },

  // 9. SUPPORT & MAINTENANCE
  {
    id: 'clause_support',
    title: 'Support and Maintenance Terms',
    content: `Post-delivery support is provided as follows:

1. Warranty Period Support (90 days):
   - Bug fixes for critical functionality issues
   - Email support during business hours (response within 24 hours)
   - No charge for warranty-covered issues
   
2. Post-Warranty Support:
   - Available under separate Maintenance Agreement
   - Hourly billing at standard rates
   - Priority support packages available
   
3. Excluded from Support:
   - Issues caused by Client modifications
   - Third-party service failures
   - New feature requests (handled as Change Requests)
   - Training or user error
   
4. Maintenance Services Available:
   - Monthly retainer packages
   - Software updates and security patches
   - Performance optimization
   - Content updates

Support requests must be submitted via the designated support channel.`,
    category: 'Service Quality',
    required: false,
    order: 9
  },

  // 10. DISPUTE RESOLUTION
  {
    id: 'clause_dispute',
    title: 'Dispute Resolution and Arbitration',
    content: `Disputes arising under this Agreement shall be resolved as follows:

1. Good Faith Negotiation:
   - Parties agree to first attempt resolution through direct negotiation
   - Senior representatives from both parties must meet within 14 days of dispute notice
   
2. Mediation:
   - If negotiation fails, parties agree to mediation before a neutral mediator
   - Mediation costs split equally between parties
   - 30-day mediation period
   
3. Arbitration:
   - Unresolved disputes shall be settled by binding arbitration
   - Arbitration conducted under Arbitration Foundation of Southern Africa (AFSA) rules
   - Single arbitrator appointed by mutual agreement
   - Arbitration held in Johannesburg, Gauteng
   - Decision is final and binding
   
4. Legal Proceedings:
   - Either party may seek injunctive relief in court for IP infringement or confidentiality breaches
   - South African law governs this Agreement

This clause does not limit either party's right to seek immediate injunctive relief.`,
    category: 'Legal',
    required: true,
    order: 10
  },

  // 11. ACCEPTANCE CRITERIA
  {
    id: 'clause_acceptance',
    title: 'Deliverable Acceptance and Testing',
    content: `Acceptance of deliverables shall follow this process:

1. Delivery Notification: Service Provider notifies Client when deliverables are ready for review
2. Testing Period: Client has 7 business days to test and review deliverables
3. Acceptance:
   - Client provides written acceptance, OR
   - Deemed accepted if no response within testing period, OR
   - Client begins using deliverables in production
4. Rejection:
   - Must be in writing with specific, detailed issues
   - Issues must be material defects, not preference changes
   - Service Provider has 14 days to remedy defects
5. Final Acceptance: Required for final payment release

Preference changes or new requirements after acceptance are handled as Change Requests.`,
    category: 'Project Management',
    required: false,
    order: 11
  },

  // 12. DATA PROTECTION & PRIVACY
  {
    id: 'clause_data_protection',
    title: 'Data Protection and POPIA Compliance',
    content: `Both parties commit to compliance with the Protection of Personal Information Act (POPIA):

1. Service Provider Obligations:
   - Process personal data only as instructed by Client
   - Implement appropriate security measures
   - Notify Client of data breaches within 24 hours
   - Not transfer data outside South Africa without consent
   
2. Client Obligations:
   - Ensure lawful collection of data
   - Maintain necessary consents and privacy notices
   - Provide Service Provider with data processing instructions
   
3. Data Security:
   - Industry-standard encryption for data in transit and at rest
   - Regular security audits and updates
   - Access controls and authentication measures
   
4. Data Retention:
   - Service Provider retains project data for 12 months post-delivery
   - Client may request data deletion after project completion
   
5. Subprocessors: Service Provider may use third-party services (hosting, analytics) with appropriate safeguards

Both parties indemnify each other against claims arising from their respective POPIA violations.`,
    category: 'Legal',
    required: false,
    order: 12
  },

  // 13. FORCE MAJEURE
  {
    id: 'clause_force_majeure',
    title: 'Force Majeure',
    content: `Neither party shall be liable for delays or failures due to circumstances beyond reasonable control:

1. Covered Events:
   - Natural disasters (floods, earthquakes, fires)
   - Government actions (lockdowns, regulations)
   - War, terrorism, civil unrest
   - Pandemics or health emergencies
   - Power outages, internet failures
   - Labor strikes
   
2. Notice Requirement: Affected party must notify the other within 48 hours
3. Mitigation Duty: Affected party must make reasonable efforts to minimize impact
4. Timeline Extension: Deadlines extended by duration of force majeure event
5. Termination Right: If event continues beyond 60 days, either party may terminate without penalty

Payment obligations for completed work remain enforceable.`,
    category: 'Legal',
    required: false,
    order: 13
  },

  // 14. COMMUNICATION PROTOCOL
  {
    id: 'clause_communication',
    title: 'Communication and Project Management',
    content: `Effective project communication shall be maintained as follows:

1. Primary Contacts:
   - Each party designates one primary contact person
   - All official communications go through primary contacts
   
2. Communication Channels:
   - Email: For formal requests, approvals, and documentation
   - Project Management Tool: For task tracking and updates
   - Video Calls: Weekly progress meetings (or as agreed)
   - Instant Messaging: For quick clarifications only
   
3. Response Times:
   - Urgent matters: Within 4 business hours
   - Standard requests: Within 24 business hours
   - Change requests: Within 3 business days
   
4. Documentation:
   - All approvals and changes must be in writing
   - Meeting notes distributed within 24 hours
   - Monthly progress reports provided
   
5. Availability: Business hours are Monday-Friday, 9:00-17:00 SAST, excluding public holidays

Failure to respond within specified timeframes may result in project delays.`,
    category: 'Project Management',
    required: false,
    order: 14
  },

  // 15. SUBCONTRACTING
  {
    id: 'clause_subcontracting',
    title: 'Subcontracting and Third-Party Services',
    content: `Service Provider's use of subcontractors is governed as follows:

1. Right to Subcontract: Service Provider may engage subcontractors for specialized services
2. Service Provider Responsibility: Remains fully responsible for all subcontractor work
3. Confidentiality: All subcontractors bound by same confidentiality obligations
4. Quality Standards: Subcontractors must meet same quality standards as Service Provider
5. Client Approval: Client may request approval for specific subcontractors (not unreasonably withheld)

Common subcontracted services include:
- Copywriting and content creation
- Specialized design work
- Third-party API integrations
- Cloud hosting and infrastructure
- Payment processing services

Service Provider retains direct contractual relationship with Client.`,
    category: 'Service Delivery',
    required: false,
    order: 15
  },

  // 16. TESTING & QA RESPONSIBILITIES
  {
    id: 'clause_testing',
    title: 'Testing and Quality Assurance',
    content: `Quality assurance responsibilities are divided as follows:

1. Service Provider Testing:
   - Functional testing of all features
   - Cross-browser compatibility (Chrome, Safari, Firefox, Edge)
   - Responsive design testing (desktop, tablet, mobile)
   - Performance testing and optimization
   - Security vulnerability scanning
   
2. Client Testing Requirements:
   - User acceptance testing (UAT)
   - Business logic validation
   - Content accuracy review
   - Integration testing with existing systems
   
3. Testing Environments:
   - Development: Internal testing by Service Provider
   - Staging: Client UAT and approval
   - Production: Live deployment after acceptance
   
4. Bug Classification:
   - Critical: Breaks core functionality (fix within 24 hours)
   - Major: Significant impact (fix within 3 days)
   - Minor: Cosmetic or low-impact (fix as agreed)
   
5. Testing Timeline: Client has 7 business days per testing phase

Service Provider is not responsible for issues not reported during testing period.`,
    category: 'Service Quality',
    required: false,
    order: 16
  },

  // 17. TRAINING & DOCUMENTATION
  {
    id: 'clause_training',
    title: 'Training and Documentation Deliverables',
    content: `Service Provider will provide the following training and documentation:

1. Documentation Deliverables:
   - Technical documentation (architecture, code structure)
   - User manual for administrators
   - API documentation (if applicable)
   - Deployment and configuration guide
   - Database schema documentation
   
2. Training Sessions:
   - 2 hours of administrator training (remote or on-site)
   - Screen recordings for common tasks
   - Knowledge base of FAQs
   
3. Training Format:
   - Live training sessions via video conference
   - Recorded sessions provided for future reference
   - Written guides and walkthrough documents
   
4. Additional Training:
   - Available at hourly rate specified in Agreement
   - On-site training charged separately for travel and accommodation
   
5. Documentation Updates: Documentation updated with any approved changes

Client responsible for training end-users beyond initial administrator training.`,
    category: 'Service Delivery',
    required: false,
    order: 17
  },

  // 18. ENTIRE AGREEMENT
  {
    id: 'clause_entire_agreement',
    title: 'Entire Agreement and Amendments',
    content: `This Agreement constitutes the complete understanding between the parties:

1. Entire Agreement: This document, together with any attached schedules and exhibits, represents the entire agreement and supersedes all prior negotiations, representations, or agreements
2. Amendments: No amendment is valid unless made in writing and signed by both parties
3. Severability: If any provision is found unenforceable, the remainder continues in effect
4. Waiver: Failure to enforce any provision does not waive the right to enforce it later
5. Assignment: Neither party may assign this Agreement without written consent, except Service Provider may assign to affiliated entities
6. Governing Law: This Agreement is governed by the laws of the Republic of South Africa
7. Notices: All notices must be in writing and delivered via email or registered mail to the addresses specified
8. Survival: Provisions regarding confidentiality, IP, liability, and dispute resolution survive termination
9. Independent Contractors: Parties are independent contractors, not partners or joint venturers
10. Counterparts: This Agreement may be executed in counterparts, each constituting an original

This Agreement may be executed electronically and electronic signatures are binding.`,
    category: 'Legal',
    required: true,
    order: 18
  }
];

// Helper function to get clauses by category
export const getClausesByCategory = (category: string): ContractClause[] => {
  return NORTHCELL_CLAUSE_LIBRARY.filter(clause => clause.category === category);
};

// Helper function to get required clauses
export const getRequiredClauses = (): ContractClause[] => {
  return NORTHCELL_CLAUSE_LIBRARY.filter(clause => clause.required === true);
};

// Helper function to get clauses for specific contract type
export const getClausesForContractType = (contractType: ContractType): ContractClause[] => {
  const baseRequired = getRequiredClauses();
  
  switch (contractType) {
    case ContractType.SERVICE_AGREEMENT:
      return [
        ...baseRequired,
        ...NORTHCELL_CLAUSE_LIBRARY.filter(c => 
          ['clause_change_requests', 'clause_acceptance', 'clause_communication', 'clause_testing'].includes(c.id)
        )
      ];
    
    case ContractType.NDA:
      return NORTHCELL_CLAUSE_LIBRARY.filter(c => 
        ['clause_confidentiality', 'clause_liability', 'clause_dispute', 'clause_entire_agreement'].includes(c.id)
      );
    
    case ContractType.SHAREHOLDER:
      return [
        ...baseRequired,
        ...NORTHCELL_CLAUSE_LIBRARY.filter(c => 
          ['clause_dispute', 'clause_termination', 'clause_data_protection'].includes(c.id)
        )
      ];
    
    case ContractType.MAINTENANCE:
      return [
        ...baseRequired,
        ...NORTHCELL_CLAUSE_LIBRARY.filter(c => 
          ['clause_support', 'clause_warranty', 'clause_communication'].includes(c.id)
        )
      ];
    
    default:
      return baseRequired;
  }
};

export const CLAUSE_CATEGORIES = [
  'Project Definition',
  'Financial',
  'Legal',
  'Service Quality',
  'Project Management',
  'Contract Management',
  'Service Delivery'
];
