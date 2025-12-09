import { TemplateBlock, InvoiceItem, ContractClause, DocType } from '../types';

export interface GeneratedTemplateBlock {
  name: string;
  category: string;
  type: DocType;
  items?: InvoiceItem[];
  clauses?: ContractClause[];
  description?: string;
}

/**
 * Generate invoice item template blocks from AI-identified line items
 */
export const generateInvoiceItems = (
  items: Array<{ description: string; quantity: number; unitType: string; price: number }>,
  blockName: string
): InvoiceItem[] => {
  return items.map((item, index) => ({
    id: `item-${Date.now()}-${index}`,
    description: item.description,
    quantity: item.quantity,
    unitType: item.unitType,
    price: item.price,
    templateBlockName: blockName,
  }));
};

/**
 * Generate contract clause template blocks from AI-identified clauses
 */
export const generateContractClauses = (
  clauses: Array<{ title: string; content: string; section?: 'general' | 'scope' | 'terms' }>,
  blockName: string
): ContractClause[] => {
  return clauses.map((clause, index) => ({
    id: `clause-${Date.now()}-${index}`,
    title: clause.title,
    content: clause.content,
    section: clause.section || 'general',
  }));
};

/**
 * Create a TemplateBlock from generated items/clauses
 */
export const createTemplateBlock = (
  name: string,
  category: string,
  type: DocType,
  content: InvoiceItem[] | ContractClause[]
): TemplateBlock => {
  const block: TemplateBlock = {
    id: `template-${Date.now()}`,
    name,
    category,
    type,
  };

  if (type === DocType.INVOICE) {
    block.items = content as InvoiceItem[];
  } else if (type === DocType.CONTRACT) {
    block.clauses = content as ContractClause[];
  }

  return block;
};

/**
 * Parse AI response to identify what needs to be created
 * Returns structured template blocks ready for document assembly
 */
export const parseAIResponse = (
  aiResponse: {
    documentType: 'INVOICE' | 'CONTRACT' | 'HRDOC';
    blocks: Array<{
      name: string;
      category: string;
      items?: Array<{ description: string; quantity: number; unitType: string; price: number }>;
      clauses?: Array<{ title: string; content: string; section?: 'general' | 'scope' | 'terms' }>;
    }>;
  },
  userId: string
): GeneratedTemplateBlock[] => {
  const docTypeMap: Record<string, DocType> = {
    'INVOICE': DocType.INVOICE,
    'CONTRACT': DocType.CONTRACT,
    'HRDOC': DocType.HR_DOC,
  };

  return aiResponse.blocks.map(block => {
    const items = block.items?.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      description: item.description,
      quantity: item.quantity,
      unitType: item.unitType,
      price: item.price,
    }));

    const clauses = block.clauses?.map((clause, index) => ({
      id: `clause-${Date.now()}-${index}`,
      title: clause.title,
      content: clause.content,
      section: clause.section || 'general' as const,
    }));

    return {
      name: block.name,
      category: block.category,
      type: docTypeMap[aiResponse.documentType] || DocType.INVOICE,
      items,
      clauses,
      description: `Auto-generated from chat: ${block.name}`,
    };
  });
};

/**
 * Validate that generated blocks have necessary content
 */
export const validateGeneratedBlocks = (blocks: GeneratedTemplateBlock[]): string[] => {
  const errors: string[] = [];

  blocks.forEach((block, idx) => {
    if (!block.name || block.name.trim().length === 0) {
      errors.push(`Block ${idx} missing name`);
    }
    if (!block.category || block.category.trim().length === 0) {
      errors.push(`Block ${idx} missing category`);
    }

    if (block.type === DocType.INVOICE && (!block.items || block.items.length === 0)) {
      errors.push(`Invoice block ${idx} has no items`);
    }
    if (block.type === DocType.CONTRACT && (!block.clauses || block.clauses.length === 0)) {
      errors.push(`Contract block ${idx} has no clauses`);
    }
  });

  return errors;
};
