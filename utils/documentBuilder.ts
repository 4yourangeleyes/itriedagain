import { DocumentData, DocType, Client, UserProfile, InvoiceItem, ContractClause, DocStatus } from '../types';

export interface DocumentAssemblyOptions {
  docType: DocType;
  title: string;
  client: Client;
  profile: UserProfile;
  items?: InvoiceItem[];
  clauses?: ContractClause[];
  theme?: string;
  status?: DocStatus;
  description?: string;
}

/**
 * Assemble a complete DocumentData from components
 * Used by ChatScreen to create documents from generated template blocks
 */
export const assembleDocument = (options: DocumentAssemblyOptions): DocumentData => {
  const {
    docType,
    title,
    client,
    profile,
    items = [],
    clauses = [],
    theme = 'swiss',
    status = 'Draft',
    description,
  } = options;

  const baseDoc: DocumentData = {
    id: `doc-${Date.now()}`,
    type: docType,
    status,
    title,
    client: {
      id: client.id,
      businessName: client.businessName,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
    },
    date: new Date().toLocaleDateString(),
    currency: profile.currency || '$',
    theme: theme as any,
  };

  // Add invoice-specific fields
  if (docType === DocType.INVOICE) {
    const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const taxRate = profile.taxEnabled && profile.taxRate ? profile.taxRate : 0;
    const taxTotal = subtotal * (taxRate / 100);
    const total = subtotal + taxTotal;

    return {
      ...baseDoc,
      items,
      subtotal,
      taxTotal,
      total,
    };
  }

  // Add contract-specific fields
  if (docType === DocType.CONTRACT) {
    return {
      ...baseDoc,
      clauses,
      contractTerms: {
        startDate: new Date().toISOString().split('T')[0],
        paymentSchedule: 'upfront' as const,
      },
    };
  }

  // HR Doc
  return baseDoc;
};

/**
 * Update document with user feedback from Canvas
 */
export const updateDocumentFromCanvas = (
  doc: DocumentData,
  updates: Partial<DocumentData>
): DocumentData => {
  const updated = { ...doc, ...updates };

  // Recalculate totals for invoices
  if (doc.type === DocType.INVOICE && updates.items) {
    const subtotal = updates.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    updated.subtotal = subtotal;
    // Tax calculation would need profile, so keep existing taxTotal if not provided
    updated.total = (updated.subtotal || 0) + (updated.taxTotal || 0);
  }

  return updated;
};

/**
 * Validate assembled document has all required fields
 */
export const validateAssembledDocument = (doc: DocumentData): string[] => {
  const errors: string[] = [];

  if (!doc.title || doc.title.trim().length === 0) {
    errors.push('Document missing title');
  }

  if (!doc.client || !doc.client.businessName) {
    errors.push('Document missing client information');
  }

  if (doc.type === DocType.INVOICE) {
    if (!doc.items || doc.items.length === 0) {
      errors.push('Invoice must have at least one line item');
    }
  }

  if (doc.type === DocType.CONTRACT) {
    if (!doc.clauses || doc.clauses.length === 0) {
      errors.push('Contract must have at least one clause');
    }
  }

  return errors;
};

/**
 * Format document for display in summary
 */
export const formatDocumentSummary = (doc: DocumentData): string => {
  let summary = `📄 **${doc.title}**\n`;
  summary += `Client: ${doc.client.businessName}\n`;
  summary += `Type: ${doc.type}\n`;
  summary += `Status: ${doc.status}\n`;

  if (doc.type === DocType.INVOICE && doc.items) {
    summary += `Items: ${doc.items.length}\n`;
    summary += `Total: ${doc.currency}${doc.total?.toFixed(2) || '0.00'}\n`;
  }

  if (doc.type === DocType.CONTRACT && doc.clauses) {
    summary += `Clauses: ${doc.clauses.length}\n`;
  }

  return summary;
};
