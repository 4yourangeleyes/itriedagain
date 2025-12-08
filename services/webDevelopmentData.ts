import { TemplateBlock, DocType, ContractType, InvoiceItem, ContractClause } from '../types';
import { 
  NORTHCELL_CLAUSE_LIBRARY, 
  getRequiredClauses, 
  getClausesForContractType 
} from './clauseLibrary';

// Helper to create invoice items
const createItem = (desc: string, qty: number, price: number): InvoiceItem => ({
  id: Math.random().toString(36).substr(2, 9),
  description: desc,
  quantity: qty,
  unitType: 'ea',
  price
});

// ============================================================================
// INVOICE TEMPLATES (18 total)
// ============================================================================

export const WEB_DEV_INVOICE_TEMPLATES: TemplateBlock[] = [
  {
    id: 'web-dev-full-website',
    name: 'Full Website Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('UX/UI Design & Prototyping', 1, 12500),
      createItem('Front-end Development (React/Next.js)', 1, 18000),
      createItem('Back-end Development (Node.js/Supabase)', 1, 15000),
      createItem('Responsive Design Implementation', 1, 8500),
      createItem('SEO Optimization & Analytics Setup', 1, 6000),
      createItem('Content Management System Integration', 1, 7200),
      createItem('Testing & Quality Assurance', 1, 5000),
    ],
  },
  {
    id: 'web-dev-ecommerce',
    name: 'E-commerce Platform',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('E-commerce Platform Setup (Shopify/WooCommerce)', 1, 15000),
      createItem('Custom Theme Development', 1, 22000),
      createItem('Product Catalog Management System', 1, 12000),
      createItem('Payment Gateway Integration (Stripe/PayFast)', 1, 8500),
      createItem('Shopping Cart & Checkout Optimization', 1, 10000),
      createItem('Inventory Management System', 1, 14500),
      createItem('Order Tracking & Customer Portal', 1, 9000),
      createItem('Email Marketing Integration', 1, 6500),
      createItem('Security & PCI Compliance Setup', 1, 7800),
    ],
  },
  {
    id: 'web-dev-mobile-app',
    name: 'Mobile Application Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Mobile App Design (iOS & Android)', 1, 18000),
      createItem('React Native Development', 1, 32000),
      createItem('API Integration & Backend Services', 1, 15000),
      createItem('Push Notification System', 1, 8500),
      createItem('User Authentication & Security', 1, 9500),
      createItem('App Store Submission (iOS & Android)', 1, 5500),
      createItem('Testing & Beta Deployment', 1, 7200),
    ],
  },
  {
    id: 'web-dev-branding',
    name: 'Brand Identity & Design',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Brand Strategy & Positioning', 1, 8500),
      createItem('Logo Design (3 concepts, unlimited revisions)', 1, 12000),
      createItem('Brand Guidelines Document', 1, 6500),
      createItem('Business Card & Stationery Design', 1, 4500),
      createItem('Social Media Templates & Assets', 1, 7200),
      createItem('Marketing Collateral Design', 1, 9000),
    ],
  },
  {
    id: 'web-dev-cms',
    name: 'Content Management System',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Custom CMS Development', 1, 18500),
      createItem('Content Editor Interface', 1, 11000),
      createItem('Media Library & Asset Management', 1, 8500),
      createItem('User Roles & Permissions System', 1, 9500),
      createItem('Version Control & Publishing Workflow', 1, 7200),
      createItem('SEO Tools Integration', 1, 5500),
    ],
  },
  {
    id: 'web-dev-marketing',
    name: 'Digital Marketing Campaign',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Marketing Strategy & Planning', 1, 9500),
      createItem('Google Ads Campaign Setup & Management', 1, 12000),
      createItem('Social Media Marketing (3 months)', 1, 15000),
      createItem('Email Marketing Campaign Design', 1, 6500),
      createItem('Content Creation (Blog Posts, Graphics)', 1, 8500),
      createItem('Analytics & Performance Reporting', 1, 5000),
    ],
  },
  {
    id: 'web-dev-hosting',
    name: 'Web Hosting & Maintenance',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Premium Web Hosting (12 months)', 1, 4500),
      createItem('SSL Certificate & Security Setup', 1, 2500),
      createItem('Daily Backups & Disaster Recovery', 1, 3000),
      createItem('Monthly Maintenance & Updates', 12, 1500),
      createItem('Performance Monitoring & Optimization', 1, 5500),
      createItem('Technical Support (Business Hours)', 1, 6000),
    ],
  },
  {
    id: 'web-dev-api',
    name: 'API Development & Integration',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('RESTful API Design & Architecture', 1, 14000),
      createItem('API Development (Node.js/Express)', 1, 18500),
      createItem('Database Design & Implementation', 1, 12000),
      createItem('Authentication & Authorization (OAuth2/JWT)', 1, 9500),
      createItem('API Documentation (Swagger/Postman)', 1, 6500),
      createItem('Rate Limiting & Security Implementation', 1, 7200),
      createItem('Third-party API Integration', 1, 8500),
    ],
  },
  {
    id: 'web-dev-uiux',
    name: 'UI/UX Design Services',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('User Research & Analysis', 1, 8500),
      createItem('Wireframing & User Flow Design', 1, 9500),
      createItem('High-Fidelity Mockups (Figma)', 1, 12000),
      createItem('Interactive Prototype Development', 1, 10500),
      createItem('Usability Testing & Iteration', 1, 7200),
      createItem('Design System & Component Library', 1, 11000),
    ],
  },
  {
    id: 'web-dev-maintenance',
    name: 'Website Maintenance Package',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Monthly Website Updates & Content Changes', 1, 3500),
      createItem('Security Patches & Plugin Updates', 1, 2500),
      createItem('Performance Optimization', 1, 4000),
      createItem('Backup & Recovery Management', 1, 2000),
      createItem('Uptime Monitoring & Alerts', 1, 1500),
      createItem('Monthly Analytics Report', 1, 2500),
    ],
  },
  {
    id: 'web-dev-database',
    name: 'Database Design & Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Database Architecture & Design', 1, 11000),
      createItem('PostgreSQL/MySQL Implementation', 1, 13500),
      createItem('Data Migration Services', 1, 9500),
      createItem('Query Optimization & Indexing', 1, 7200),
      createItem('Database Security & Backup Setup', 1, 6500),
      createItem('Performance Monitoring & Tuning', 1, 5500),
    ],
  },
  {
    id: 'web-dev-testing',
    name: 'Quality Assurance & Testing',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Test Strategy & Planning', 1, 5500),
      createItem('Automated Testing Setup (Jest/Cypress)', 1, 9500),
      createItem('Manual Testing & Bug Reporting', 1, 7200),
      createItem('Cross-browser Compatibility Testing', 1, 6000),
      createItem('Performance & Load Testing', 1, 8500),
      createItem('Security Testing & Vulnerability Assessment', 1, 10500),
    ],
  },
  {
    id: 'web-dev-landing-page',
    name: 'Landing Page Design & Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Landing Page Strategy & Copywriting', 1, 6500),
      createItem('Conversion-Optimized Design', 1, 8500),
      createItem('Responsive Development', 1, 7200),
      createItem('Lead Capture Form Integration', 1, 4500),
      createItem('A/B Testing Setup', 1, 5500),
      createItem('Analytics & Tracking Implementation', 1, 3500),
    ],
  },
  {
    id: 'web-dev-wordpress',
    name: 'WordPress Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('WordPress Installation & Configuration', 1, 3500),
      createItem('Custom Theme Development', 1, 15000),
      createItem('Plugin Development & Customization', 1, 9500),
      createItem('WooCommerce Setup & Configuration', 1, 7200),
      createItem('Performance Optimization', 1, 5500),
      createItem('SEO Plugin Configuration', 1, 3000),
    ],
  },
  {
    id: 'web-dev-pwa',
    name: 'Progressive Web App (PWA)',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('PWA Architecture & Planning', 1, 9500),
      createItem('Service Worker Implementation', 1, 11000),
      createItem('Offline Functionality Development', 1, 12500),
      createItem('App Manifest & Icons Setup', 1, 4500),
      createItem('Push Notification Integration', 1, 8500),
      createItem('Installation Prompt & App Shell', 1, 7200),
    ],
  },
  {
    id: 'web-dev-saas',
    name: 'SaaS Platform Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('SaaS Architecture & Planning', 1, 18000),
      createItem('Multi-tenant System Development', 1, 25000),
      createItem('Subscription & Billing Integration (Stripe)', 1, 14500),
      createItem('User Dashboard & Analytics', 1, 16000),
      createItem('Admin Panel & Management Tools', 1, 12000),
      createItem('API Development & Documentation', 1, 15000),
      createItem('Security & Compliance Implementation', 1, 10500),
    ],
  },
  {
    id: 'web-dev-admin-panel',
    name: 'Admin Panel Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Admin Dashboard Design & Development', 1, 13500),
      createItem('User Management System', 1, 9500),
      createItem('Data Tables & Reporting Tools', 1, 11000),
      createItem('Role-based Access Control', 1, 8500),
      createItem('Real-time Analytics Dashboard', 1, 12000),
      createItem('Audit Logging & Activity Tracking', 1, 7200),
    ],
  },
  {
    id: 'web-dev-client-portal',
    name: 'Client Portal Development',
    category: 'Web Development',
    type: DocType.INVOICE,
    items: [
      createItem('Client Portal Design & Architecture', 1, 12000),
      createItem('Secure Login & Authentication', 1, 7200),
      createItem('Document Management System', 1, 10500),
      createItem('Project Status & Timeline Tracking', 1, 9500),
      createItem('Messaging & Communication Tools', 1, 8500),
      createItem('Invoice & Payment Portal', 1, 11000),
    ],
  },
];

// ============================================================================
// CONTRACT TEMPLATES (21 total) - Using clause library
// ============================================================================

export const WEB_DEV_CONTRACT_TEMPLATES: TemplateBlock[] = [
  {
    id: 'contract-service-agreement',
    name: 'Professional Services Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.SERVICE_AGREEMENT,
    clauses: getClausesForContractType(ContractType.SERVICE_AGREEMENT),
  },
  {
    id: 'contract-gritdocs-shareholder',
    name: 'GritDocs Shareholder Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.SHAREHOLDER,
    clauses: [
      // Use clauses from clause library with proper 'required' field
      { ...NORTHCELL_CLAUSE_LIBRARY[0], required: true }, // Scope
      { ...NORTHCELL_CLAUSE_LIBRARY[1], required: true }, // Payment Terms
      { ...NORTHCELL_CLAUSE_LIBRARY[2], required: true }, // IP Rights
      { ...NORTHCELL_CLAUSE_LIBRARY[3], required: true }, // Confidentiality
      { ...NORTHCELL_CLAUSE_LIBRARY[5], required: true }, // Liability
      { ...NORTHCELL_CLAUSE_LIBRARY[7], required: true }, // Termination
      { ...NORTHCELL_CLAUSE_LIBRARY[12], required: true }, // Dispute Resolution
      { ...NORTHCELL_CLAUSE_LIBRARY[17], required: true }, // Governing Law
    ],
  },
  {
    id: 'contract-nda',
    name: 'Non-Disclosure Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.NDA,
    clauses: getClausesForContractType(ContractType.NDA),
  },
  {
    id: 'contract-website-dev',
    name: 'Website Development Contract',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PROJECT_CONTRACT,
    clauses: getClausesForContractType(ContractType.PROJECT_CONTRACT),
  },
  {
    id: 'contract-retainer',
    name: 'Monthly Retainer Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.RETAINER,
    clauses: getClausesForContractType(ContractType.RETAINER),
  },
  {
    id: 'contract-maintenance',
    name: 'Website Maintenance Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.MAINTENANCE,
    clauses: getClausesForContractType(ContractType.MAINTENANCE),
  },
  {
    id: 'contract-contractor',
    name: 'Independent Contractor Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.CONSULTING,
    clauses: getClausesForContractType(ContractType.CONSULTING),
  },
  {
    id: 'contract-license',
    name: 'Software License Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.LICENSE,
    clauses: getClausesForContractType(ContractType.LICENSE),
  },
  {
    id: 'contract-partnership',
    name: 'Strategic Partnership Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PARTNERSHIP,
    clauses: getClausesForContractType(ContractType.PARTNERSHIP),
  },
  {
    id: 'contract-employment',
    name: 'Employment Contract',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.EMPLOYMENT,
    clauses: getClausesForContractType(ContractType.EMPLOYMENT),
  },
  {
    id: 'contract-consulting',
    name: 'Consulting Services Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.CONSULTING,
    clauses: getClausesForContractType(ContractType.CONSULTING),
  },
  {
    id: 'contract-project',
    name: 'Project-Based Contract',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PROJECT_CONTRACT,
    clauses: getClausesForContractType(ContractType.PROJECT_CONTRACT),
  },
  {
    id: 'contract-support',
    name: 'Technical Support Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.SUPPORT,
    clauses: getClausesForContractType(ContractType.SUPPORT),
  },
  {
    id: 'contract-api-integration',
    name: 'API Integration Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.SERVICE_AGREEMENT,
    clauses: getRequiredClauses(),
  },
  {
    id: 'contract-white-label',
    name: 'White Label Partnership Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PARTNERSHIP,
    clauses: getClausesForContractType(ContractType.PARTNERSHIP),
  },
  {
    id: 'contract-reseller',
    name: 'Reseller Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PARTNERSHIP,
    clauses: getClausesForContractType(ContractType.PARTNERSHIP),
  },
  {
    id: 'contract-joint-venture',
    name: 'Joint Venture Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PARTNERSHIP,
    clauses: getClausesForContractType(ContractType.PARTNERSHIP),
  },
  {
    id: 'contract-co-development',
    name: 'Co-Development Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PROJECT_CONTRACT,
    clauses: getClausesForContractType(ContractType.PROJECT_CONTRACT),
  },
  {
    id: 'contract-msa',
    name: 'Master Service Agreement (MSA)',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.SERVICE_AGREEMENT,
    clauses: getClausesForContractType(ContractType.SERVICE_AGREEMENT),
  },
  {
    id: 'contract-sow',
    name: 'Statement of Work (SOW)',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.PROJECT_CONTRACT,
    clauses: getClausesForContractType(ContractType.PROJECT_CONTRACT),
  },
  {
    id: 'contract-investment',
    name: 'Investment Agreement',
    category: 'Web Development',
    type: DocType.CONTRACT,
    contractType: ContractType.SHAREHOLDER,
    clauses: getClausesForContractType(ContractType.SHAREHOLDER),
  },
];

// ============================================================================
// COMBINED EXPORTS
// ============================================================================

export const NORTHCELL_INVOICE_TEMPLATES = WEB_DEV_INVOICE_TEMPLATES;
export const NORTHCELL_CONTRACT_TEMPLATES = WEB_DEV_CONTRACT_TEMPLATES;

export const NORTHCELL_STUDIOS_TEMPLATES: TemplateBlock[] = [
  ...WEB_DEV_INVOICE_TEMPLATES,
  ...WEB_DEV_CONTRACT_TEMPLATES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getInvoiceTemplates = (): TemplateBlock[] => {
  return NORTHCELL_STUDIOS_TEMPLATES.filter(t => t.type === DocType.INVOICE);
};

export const getContractTemplates = (): TemplateBlock[] => {
  return NORTHCELL_STUDIOS_TEMPLATES.filter(t => t.type === DocType.CONTRACT);
};

export const getContractTemplatesByType = (contractType: ContractType): TemplateBlock[] => {
  return NORTHCELL_CONTRACT_TEMPLATES.filter(t => t.contractType === contractType);
};

export const getTemplateById = (id: string): TemplateBlock | undefined => {
  return NORTHCELL_STUDIOS_TEMPLATES.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): TemplateBlock[] => {
  return NORTHCELL_STUDIOS_TEMPLATES.filter(t => t.category === category);
};

// ============================================================================
// TEMPLATE STATISTICS
// ============================================================================

export const TEMPLATE_STATS = {
  total: NORTHCELL_STUDIOS_TEMPLATES.length,
  invoices: WEB_DEV_INVOICE_TEMPLATES.length,
  contracts: WEB_DEV_CONTRACT_TEMPLATES.length,
  categories: [...new Set(NORTHCELL_STUDIOS_TEMPLATES.map(t => t.category))].length,
};

console.log('📦 Northcell Studios Templates Loaded:', TEMPLATE_STATS);
