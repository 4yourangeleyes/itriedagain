
export enum DocType {
  INVOICE = 'Invoice',
  CONTRACT = 'Contract',
  HR_DOC = 'HR Document'
}

export enum ContractType {
  SERVICE_AGREEMENT = 'Service Agreement',
  PROJECT_CONTRACT = 'Project Contract',
  RETAINER = 'Retainer Agreement',
  NDA = 'Non-Disclosure Agreement',
  SHAREHOLDER = 'Shareholder Agreement',
  EMPLOYMENT = 'Employment Contract',
  CONSULTING = 'Consulting Agreement',
  MAINTENANCE = 'Maintenance Agreement',
  LICENSE = 'License Agreement',
  PARTNERSHIP = 'Partnership Agreement',
  SUPPORT = 'Support Agreement'
}

export type DocStatus = 'Draft' | 'Sent' | 'Paid' | 'Signed';
export type InvoiceTheme = 'swiss' | 'geometric' | 'blueprint' | 'modernist' | 'minimal' | 'artisan' | 'corporate' | 'brutalist' | 'asymmetric' | 'bauhaus' | 'constructivist' | 'international';
export type ContractTheme = 'legal' | 'modern' | 'executive' | 'minimal' | 'bauhaus' | 'constructivist' | 'international';

export interface Client {
  id: string;
  businessName: string;
  registrationNumber?: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitType: string; // e.g., 'hrs', 'm', 'ea', 'days', 'items'
  price: number;
  templateBlockName?: string; // Optional: name of template block this item belongs to
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  order?: number;
  required?: boolean;
  category?: string;
}

export interface ContractMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  amount: number;
  status?: 'pending' | 'completed' | 'paid';
}

export interface ContractSignature {
  id: string;
  role: 'provider' | 'client' | 'witness';
  signedBy?: string;
  signedDate?: string;
  signatureData?: string; // Base64 image or digital signature
}

export interface VisualComponent {
  id: string;
  type: 'pie-chart' | 'bar-chart' | 'timeline' | 'cost-breakdown' | 'tech-stack' | 'site-architecture' | 'project-phases' | 'pipe-diagram' | 'feature-matrix';
  title: string;
  data: any;
  position: number; // Order in document
}

export interface ContractTerms {
  startDate: string;
  endDate?: string;
  duration?: string;
  paymentSchedule: 'upfront' | 'milestone' | 'monthly' | 'completion' | 'custom';
  paymentTermsDays?: number;
  milestones?: ContractMilestone[];
  cancellationPolicy?: string;
  renewalTerms?: string;
  jurisdiction?: string;
}

export interface DocumentData {
  id: string;
  type: DocType;
  status: DocStatus;
  title: string;
  client: Client;
  date: string;
  dueDate?: string; // Payment due date
  currency: string;
  theme?: InvoiceTheme; // New field for styling
  contractId?: string; // Optional: selected contract to attach when sending
  notes?: string; // Invoice notes/terms displayed before totals
  shareableLink?: string; // Link to publicly view invoice
  // Invoice specific
  items?: InvoiceItem[];
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  vat_enabled?: boolean; // SA compliance - whether to show VAT
  tax_rate?: number; // SA compliance - tax percentage
  // Contract specific
  contractType?: ContractType;
  contractTheme?: ContractTheme;
  clauses?: ContractClause[];
  contractTerms?: ContractTerms;
  signatures?: ContractSignature[];
  scopeOfWork?: string;
  deliverables?: string[];
  visualComponents?: VisualComponent[]; // Charts, diagrams, timelines
  // HR/Generic
  bodyText?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  companyName: string;
  industry?: string;
  registrationNumber?: string;
  vatRegistrationNumber?: string; // SA VAT compliance
  businessType?: 1 | 2; // 1 = registered, 2 = unregistered
  jurisdiction?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  website?: string;
  // Financials
  currency: string;
  taxEnabled: boolean;
  taxName?: string; // e.g. VAT, GST
  taxRate?: number; // e.g. 20
}

export interface TemplateBlock {
  id: string;
  name: string; 
  category: string; 
  type: DocType; 
  items?: InvoiceItem[]; 
  clause?: ContractClause;
  clauses?: ContractClause[]; // Multiple clauses for comprehensive templates
  contractType?: ContractType;
}

// Web Speech API Types
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}