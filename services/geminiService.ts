
/**
 * Gemini Service - Wrapper around Supabase Edge Function
 * 
 * This now calls a secure backend Edge Function instead of making
 * client-side API calls. The actual API key is stored securely on Supabase.
 */

import { generateDocumentViaEdgeFunction } from './supabaseClient';
import { DocType, TemplateBlock } from '../types';

export const generateDocumentContent = async (
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

    // Call the Supabase Edge Function (which securely uses GENAI_API_KEY)
    const result = await generateDocumentViaEdgeFunction(
      prompt,
      docType === DocType.INVOICE ? 'INVOICE' : docType === DocType.CONTRACT ? 'CONTRACT' : 'HRDOC',
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
