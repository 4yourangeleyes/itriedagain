/**
 * PDF Export Service
 * Converts documents to PDF format and handles downloads/attachments
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentData, UserProfile } from '../types';

export interface PDFGenerationOptions {
  filename?: string;
  download?: boolean;
  returnBlob?: boolean;
}

/**
 * Generate PDF from an invoice HTML element
 * Captures the invoice preview and converts to PDF
 */
export const generateInvoicePDF = async (
  invoiceHtml: string,
  docData: DocumentData,
  profile: UserProfile,
  options: PDFGenerationOptions = {}
): Promise<Blob | null> => {
  try {
    const {
      filename = `Invoice_${docData.id.slice(-6)}_${new Date().toISOString().split('T')[0]}.pdf`,
      download = false,
      returnBlob = true,
    } = options;

    // Create a temporary container to render the invoice HTML
    const container = globalThis.document.createElement('div');
    container.innerHTML = invoiceHtml;
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.width = '210mm'; // Match preview page width exactly
    container.style.backgroundColor = 'white';
    globalThis.document.body.appendChild(container);

    // Wait for images to load
    await Promise.all(Array.from(container.querySelectorAll('img')).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Apply Pagination (Split tables and add headers)
    restructureForPagination(container, docData, profile);

    // Convert HTML to canvas (scale reduced to 2 to prevent memory issues)
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Remove temporary container and clean up
    globalThis.document.body.removeChild(container);
    
    // Force garbage collection hint
    if (globalThis.gc) {
      try { globalThis.gc(); } catch (e) { /* gc not available */ }
    }

    // Calculate PDF dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    let heightLeft = imgHeight;
    let position = 0;

    // Handle multi-page PDFs
    while (heightLeft >= 0) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm
      if (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
      }
    }

    // Get PDF as blob
    const blob = pdf.output('blob');

    // Download if requested
    if (download) {
      const url = URL.createObjectURL(blob);
      const link = globalThis.document.createElement('a');
      link.href = url;
      link.download = filename;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return returnBlob ? blob : null;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate PDF');
  }
};

/**
 * Generate PDF as base64 string (for email attachments)
 */
export const generateInvoicePDFBase64 = async (
  invoiceHtml: string,
  docData: DocumentData,
  profile: UserProfile
): Promise<string> => {
  try {
    const blob = await generateInvoicePDF(invoiceHtml, docData, profile, {
      download: false,
      returnBlob: true,
    });

    if (!blob) throw new Error('Failed to generate PDF blob');

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to convert PDF to base64'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('PDF to base64 conversion error:', error);
    throw error;
  }
};

/**
 * Get invoice HTML for PDF generation
 * Extracts the invoice display HTML from the canvas and cleans it up
 */
export const extractInvoiceHTML = (invoiceElement: HTMLElement | null): string => {
  if (!invoiceElement) {
    throw new Error('Invoice element not found');
  }

  // Clone the element to avoid modifying the original
  const clone = invoiceElement.cloneNode(true) as HTMLElement;

  // 1. Remove elements that shouldn't be in the PDF
  const toRemove = clone.querySelectorAll('button, .print\\:hidden, [role="dialog"]');
  toRemove.forEach(el => el.remove());

  // 2. Convert Inputs to Text
  const inputs = clone.querySelectorAll('input');
  inputs.forEach(input => {
    const span = globalThis.document.createElement('span');
    span.textContent = input.value;
    span.className = input.className; // Keep styling
    // Remove input-specific styles that look bad in print
    span.style.border = 'none';
    span.style.background = 'transparent';
    span.style.padding = '0';
    span.style.width = 'auto';
    if (input.parentElement) {
      input.parentElement.replaceChild(span, input);
    }
  });

  // 3. Convert TextAreas to Text (preserving newlines)
  const textareas = clone.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    const p = globalThis.document.createElement('p');
    p.textContent = textarea.value;
    p.className = textarea.className;
    p.style.whiteSpace = 'pre-wrap'; // Preserve newlines
    p.style.border = 'none';
    p.style.background = 'transparent';
    p.style.resize = 'none';
    p.style.height = 'auto';
    if (textarea.parentElement) {
      textarea.parentElement.replaceChild(p, textarea);
    }
  });

  // 4. Ensure whitespace-pre-wrap is applied as inline style (for html2canvas)
  const whitespaceElements = clone.querySelectorAll('.whitespace-pre-wrap');
  whitespaceElements.forEach(el => {
    (el as HTMLElement).style.whiteSpace = 'pre-wrap';
  });

  // 5. Remove preview container styling - make it look like the actual pages
  const previewContainer = clone.querySelector('.preview-page-container') as HTMLElement;
  if (previewContainer) {
    previewContainer.style.background = 'transparent';
    previewContainer.style.padding = '0';
    previewContainer.style.gap = '0';
  }

  // 6. Remove box shadow from preview pages for clean PDF
  const previewPages = clone.querySelectorAll('.preview-page');
  previewPages.forEach(page => {
    (page as HTMLElement).style.boxShadow = 'none';
    (page as HTMLElement).style.margin = '0';
  });

  // 7. Ensure Images are preserved
  const images = clone.querySelectorAll('img');
  images.forEach(img => {
    // Ensure crossOrigin is set if needed, though usually handled by html2canvas options
    if (!img.crossOrigin && img.src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
  });

  return clone.innerHTML;
};

/**
 * Generate PDF and get dimensions for preview
 */
export const getInvoicePDFDimensions = async (
  invoiceHtml: string
): Promise<{ width: number; height: number }> => {
  try {
    const container = document.createElement('div');
    container.innerHTML = invoiceHtml;
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.width = '800px';
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    document.body.removeChild(container);

    return {
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error('Error getting PDF dimensions:', error);
    return { width: 800, height: 1100 }; // Default A4 size
  }
};

/**
 * Validate PDF generation capability
 */
export const canGeneratePDF = (): boolean => {
  try {
    // Check if required APIs are available
    return typeof jsPDF !== 'undefined' && typeof html2canvas !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Export invoice as PDF with all metadata
 */
export const exportInvoiceComplete = async (
  invoiceHtml: string,
  docData: DocumentData,
  profile: UserProfile,
  includeMetadata: boolean = true
): Promise<Blob> => {
  try {
    const blob = await generateInvoicePDF(invoiceHtml, docData, profile, {
      download: false,
      returnBlob: true,
    });

    if (!blob) throw new Error('Failed to generate PDF');

    // Add metadata if requested (optional, for future use)
    if (includeMetadata) {
      console.log('PDF generated with metadata:', {
        documentId: docData.id,
        clientName: docData.client.businessName,
        total: docData.total,
        generatedAt: new Date().toISOString(),
      });
    }

    return blob;
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};

/**
 * Restructure the invoice HTML to handle pagination with repeating headers
 */
const restructureForPagination = (container: HTMLElement, doc: DocumentData, profile: UserProfile) => {
  // A4 Height in pixels at 800px width (210mm width) -> 297/210 * 800 = 1131.4px
  // We use a slightly smaller value to ensure safety margins
  const PAGE_HEIGHT = 1125; 
  const PAGE_PADDING_BOTTOM = 50; // Breathing room at bottom of page

  const tables = container.querySelectorAll('table');
  if (tables.length === 0) return;

  // Assume the main invoice table is the first one found
  const table = tables[0] as HTMLTableElement;
  const tbody = table.querySelector('tbody');
  const thead = table.querySelector('thead');

  if (!tbody || !thead) return;

  // Get all rows
  const rows = Array.from(tbody.querySelectorAll('tr'));
  if (rows.length === 0) return;

  const parent = table.parentNode as HTMLElement;
  const containerRect = container.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  
  // Calculate where the table starts relative to the container top
  const tableStartRelativeY = tableRect.top - containerRect.top;
  
  // Initial cursor position (Y) is at the start of the first row
  // which is table top + header height
  let currentY = tableStartRelativeY + (thead as HTMLElement).offsetHeight;
  let pageNum = 1;

  // Detach all rows from the DOM to re-insert them intelligently
  rows.forEach(row => row.remove());

  // Start with the original table and tbody
  let currentTable = table;
  let currentTbody = tbody;

  for (const row of rows) {
    // Temporarily append to measure height
    currentTbody.appendChild(row);
    const rowHeight = row.offsetHeight;
    
    // Calculate where this row would end
    const rowBottom = currentY + rowHeight;
    const pageBoundary = pageNum * PAGE_HEIGHT;
    
    // Check if row crosses the page boundary (minus padding)
    if (rowBottom > (pageBoundary - PAGE_PADDING_BOTTOM)) {
      // Row doesn't fit! Remove it from current table
      currentTbody.removeChild(row);

      // 1. Add Spacer to fill the rest of the current page
      const spacerHeight = pageBoundary - currentY;
      if (spacerHeight > 0) {
        const spacer = document.createElement('div');
        spacer.style.height = `${spacerHeight}px`;
        spacer.style.width = '100%';
        // Insert spacer after current table
        if (currentTable.nextSibling) {
          parent.insertBefore(spacer, currentTable.nextSibling);
        } else {
          parent.appendChild(spacer);
        }
      }

      // 2. Create Page Header for the next page
      pageNum++;
      const header = document.createElement('div');
      header.className = 'pdf-page-header';
      // Styling for the page header
      header.style.padding = '30px 0 10px 0';
      header.style.borderBottom = '2px solid #e5e7eb'; // gray-200
      header.style.marginBottom = '20px';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
      header.style.fontSize = '12px';
      header.style.color = '#6b7280'; // gray-500
      header.style.fontWeight = 'bold';
      header.style.textTransform = 'uppercase';
      header.style.letterSpacing = '0.05em';
      
      header.innerHTML = `
        <span>${profile.companyName || 'Invoice'}</span>
        <span>Page ${pageNum}</span>
        <span>${doc.id ? `INV-${doc.id.slice(-6)}` : ''}</span>
      `;

      // 3. Create New Table for next page
      const newTable = table.cloneNode(false) as HTMLTableElement; // Shallow clone to keep classes/styles
      newTable.style.marginTop = '0';
      
      // Clone the header into the new table
      const newThead = thead.cloneNode(true);
      newTable.appendChild(newThead);
      
      const newTbody = document.createElement('tbody');
      newTable.appendChild(newTbody);

      // Insert Header and New Table into DOM
      // We need to find where to insert. It should be after the spacer (or currentTable if spacer failed)
      // The spacer was inserted after currentTable. So we insert after spacer.
      // Actually, let's just append to parent if it's the last thing, or insertBefore next sibling
      
      // Helper to insert after reference
      const insertAfter = (newNode: Node, referenceNode: Node) => {
        referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
      };

      // We just inserted spacer after currentTable.
      // So spacer is currentTable.nextSibling
      const spacer = currentTable.nextSibling;
      if (spacer) {
        insertAfter(header, spacer);
        insertAfter(newTable, header);
      } else {
        parent.appendChild(header);
        parent.appendChild(newTable);
      }

      // Update references
      currentTable = newTable;
      currentTbody = newTbody;

      // Add the row to the new table
      currentTbody.appendChild(row);

      // Update Y cursor
      // We are now at the start of a new page boundary
      // + Header Height (approx 60px with padding/margin)
      // + Table Header Height
      // + Row Height
      const headerHeight = 60; // Estimated based on styles
      const theadHeight = (newThead as HTMLElement).offsetHeight;
      
      currentY = pageBoundary + headerHeight + theadHeight + rowHeight;
    } else {
      // Row fits, update Y
      currentY += rowHeight;
    }
  }
};
