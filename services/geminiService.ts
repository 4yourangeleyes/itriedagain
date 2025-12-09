

/**
 * Gemini Service - Wrapper around Supabase Edge Function
 * 
 * This now calls a secure backend Edge Function instead of making
 * client-side API calls. The actual API key is stored securely on Supabase.
 */

import { generateDocumentViaEdgeFunction } from './supabaseClient';
import { docTypeToAPI } from '../utils/docTypeConverter';
import { DocType, TemplateBlock } from '../types';export const generateDocumentContent = async (
  prompt: string,
  docType: DocType,
  clientName: string,
  businessName: string,
  industry?: string,
  conversationHistory?: Array<{role: string, content: string}>,
  templates?: TemplateBlock[]
) => {
  try {
    // Build template context string for AI to reference
    let templateContext = '';
    if (templates && templates.length > 0) {
      templateContext = templates
        .filter(t => t.type === docType)
        .slice(0, 5) // Only send top 5 templates to avoid token limits
        .map(t => {
          const itemList = t.items?.slice(0, 10).map(i => 
            `  - ${i.description}: R${i.price} (${i.quantity} ${i.unitType})`
          ).join('\n') || '';
          return `${t.name} (${t.category}):\n${itemList}`;
        })
        .join('\n\n');
    }

    // Convert DocType enum to API string
    const apiDocType = docTypeToAPI(docType);

    // Call the Supabase Edge Function (which securely uses GENAI_API_KEY)
    const result = await generateDocumentViaEdgeFunction(
      prompt,
      apiDocType,
      clientName,
      businessName,
      industry,
      conversationHistory,
      templateContext
    );

    return result;
  } catch (error) {
    console.error("Document generation error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate document.");
  }
};

/**
 * Identify document type from user message
 * Returns INVOICE, CONTRACT, or HRDOC
 */
export const identifyDocumentType = async (
  userMessage: string
): Promise<DocType> => {
  try {
    const result = await generateDocumentViaEdgeFunction(
      `Based on this user request, identify what type of document they want (INVOICE, CONTRACT, or HRDOC). Only respond with one word: INVOICE, CONTRACT, or HRDOC.\n\nRequest: "${userMessage}"\n\nDocument type:`,
      'INVOICE', // Dummy value, not used for classification
      'Classification',
      'System',
      undefined,
      undefined,
      ''
    );

    const docTypeStr = result?.items?.[0]?.description?.toUpperCase() || 'INVOICE';
    if (docTypeStr.includes('CONTRACT')) return DocType.CONTRACT;
    if (docTypeStr.includes('HRDOC') || docTypeStr.includes('HR')) return DocType.HR_DOC;
    return DocType.INVOICE;
  } catch (error) {
    console.warn('Failed to identify document type, defaulting to INVOICE');
    return DocType.INVOICE;
  }
};

/**
 * Generate suggested clients from user message
 * Helps user identify which client this document is for
 */
export const suggestClientsFromMessage = async (
  userMessage: string,
  availableClients: Array<{ id: string; businessName: string }>
): Promise<Array<{ id: string; businessName: string; relevance: number }>> => {
  try {
    const clientList = availableClients.map(c => c.businessName).join(', ');
    
    const result = await generateDocumentViaEdgeFunction(
      `From this message, identify which client (if any) is being referenced. Available clients: ${clientList}.\n\nMessage: "${userMessage}"\n\nRespond with ONLY the client name or "NONE" if unclear.`,
      'INVOICE',
      'Selection',
      'System',
      undefined,
      undefined,
      ''
    );

    const identified = result?.items?.[0]?.description || 'NONE';
    const matches = availableClients
      .filter(c => identified.toUpperCase().includes(c.businessName.toUpperCase()))
      .map(c => ({ ...c, relevance: 1 }));

    if (matches.length > 0) return matches;
    
    // If no exact match, return all clients with lower relevance for user to choose
    return availableClients.map(c => ({ ...c, relevance: 0.5 }));
  } catch (error) {
    console.warn('Failed to suggest clients');
    return availableClients.map(c => ({ ...c, relevance: 0.5 }));
  }
};

/**
 * Multi-turn conversation for building documents
 * Maintains context across messages to refine document details
 */
export const chatForDocumentCreation = async (
  userMessage: string,
  docType: DocType,
  clientName: string,
  businessName: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  industry?: string
): Promise<{
  response: string;
  suggestedBlocks?: Array<{ name: string; items: any[] }>;
  ready: boolean;
}> => {
  try {
    const apiDocType = docTypeToAPI(docType);
    
    const result = await generateDocumentViaEdgeFunction(
      userMessage,
      apiDocType,
      clientName,
      businessName,
      industry,
      conversationHistory,
      ''
    );

    return {
      response: result?.items?.[0]?.description || 'I understood. Please continue with more details.',
      suggestedBlocks: result?.items?.slice(0, -1).map((item: any) => ({
        name: item.description.split(':')[0],
        items: [item],
      })),
      ready: result?.items?.some((item: any) => item.description.includes('ready')) || false,
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};
