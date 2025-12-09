/**
 * DocType Conversion Utility
 * Centralizes conversion between front-end enum and Edge Function API format
 */

import { DocType } from '../types';

/**
 * Convert DocType enum to Edge Function API string format
 * @example
 * docTypeToAPI(DocType.INVOICE) // 'INVOICE'
 * docTypeToAPI(DocType.CONTRACT) // 'CONTRACT'
 * docTypeToAPI('Invoice') // 'INVOICE' (handles string form too)
 */
export const docTypeToAPI = (docType: DocType | string): 'INVOICE' | 'CONTRACT' | 'HRDOC' => {
  if (docType === DocType.CONTRACT || docType === 'Contract') {
    return 'CONTRACT';
  }
  if (docType === DocType.HR_DOC || docType === 'HR Document') {
    return 'HRDOC';
  }
  return 'INVOICE'; // Default
};

/**
 * Convert Edge Function API string to DocType enum
 * @example
 * apiToDocType('INVOICE') // DocType.INVOICE
 * apiToDocType('CONTRACT') // DocType.CONTRACT
 */
export const apiToDocType = (apiType: 'INVOICE' | 'CONTRACT' | 'HRDOC'): DocType => {
  if (apiType === 'CONTRACT') return DocType.CONTRACT;
  if (apiType === 'HRDOC') return DocType.HR_DOC;
  return DocType.INVOICE;
};

/**
 * Validate if string is a valid API DocType
 */
export const isValidAPIDocType = (value: string): value is 'INVOICE' | 'CONTRACT' | 'HRDOC' => {
  return ['INVOICE', 'CONTRACT', 'HRDOC'].includes(value);
};
