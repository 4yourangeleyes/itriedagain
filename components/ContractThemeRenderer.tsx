/**
 * Contract Theme Renderer - Professional Multi-Page Contracts
 * Supports 4 themes with proper pagination and readability
 * All pages are print-ready and legally formatted
 */

import React, { useState } from 'react';
import { DocumentData, UserProfile, ContractClause, ContractTheme, ContractSignature, VisualComponent } from '../types';
import { Input, TextArea } from './Input';
import { Trash2, Plus, GripVertical, BarChart3, PieChart as PieChartIcon, Clock, Code, DollarSign } from 'lucide-react';
import { PieChart, Timeline, TechStack, CostBreakdown, BarChart } from './VisualComponents';

interface ContractThemeRendererProps {
  doc: DocumentData;
  profile: UserProfile;
  viewMode: 'Draft' | 'Final';
  updateDoc: (doc: DocumentData) => void;
  onAddClause: (section?: 'terms' | 'scope' | 'general') => void;
  onDeleteClause: (id: string) => void;
}

export const ContractThemeRenderer: React.FC<ContractThemeRendererProps> = ({
  doc,
  profile,
  viewMode,
  updateDoc,
  onAddClause,
  onDeleteClause,
}) => {

  const [showVisualMenu, setShowVisualMenu] = useState(false);

  // Add page numbering on mount for print
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const addPageNumbers = () => {
        const pageNumbers = document.querySelectorAll('.page-number');
        pageNumbers.forEach((el, index) => {
          el.textContent = String(index + 1);
        });
      };
      
      // Run on mount and before print
      addPageNumbers();
      window.addEventListener('beforeprint', addPageNumbers);
      
      return () => {
        window.removeEventListener('beforeprint', addPageNumbers);
      };
    }
  }, []);

  const updateClause = (id: string, field: keyof ContractClause, value: string | ContractClause[keyof ContractClause]) => {
    if (!doc.clauses) return;
    const newClauses = doc.clauses.map(clause => 
      clause.id === id ? { ...clause, [field]: value } : clause
    );
    updateDoc({ ...doc, clauses: newClauses });
  };

  const updateDocField = (field: keyof DocumentData, value: string | number | DocumentData[keyof DocumentData]) => {
    updateDoc({ ...doc, [field]: value });
  };

  const updateClient = (field: keyof typeof doc.client, value: string) => {
    updateDoc({ ...doc, client: { ...doc.client, [field]: value } });
  };

  const updateTerms = (field: string, value: string) => {
    updateDoc({ 
      ...doc, 
      contractTerms: { 
        ...(doc.contractTerms || { startDate: '', paymentSchedule: 'upfront' as const }), 
        [field]: value 
      } 
    });
  };

  const addVisualComponent = (type: VisualComponent['type']) => {
    const defaultData: Record<VisualComponent['type'], any> = {
      'pie-chart': [
        { label: 'Section 1', percentage: 40, color: '#3B82F6' },
        { label: 'Section 2', percentage: 30, color: '#10B981' },
        { label: 'Section 3', percentage: 30, color: '#F59E0B' },
      ],
      'timeline': [
        { phase: 'Phase 1', duration: '2 weeks', description: 'Initial setup' },
        { phase: 'Phase 2', duration: '4 weeks', description: 'Development' },
        { phase: 'Phase 3', duration: '1 week', description: 'Testing & Launch' },
      ],
      'tech-stack': [
        { name: 'React', category: 'Frontend' },
        { name: 'Node.js', category: 'Backend' },
        { name: 'PostgreSQL', category: 'Database' },
      ],
      'cost-breakdown': [
        { item: 'Development', quantity: 40, rate: 500, total: 20000 },
        { item: 'Design', quantity: 20, rate: 400, total: 8000 },
      ],
      'bar-chart': [
        { label: 'Item 1', value: 75, color: '#3B82F6' },
        { label: 'Item 2', value: 50, color: '#10B981' },
        { label: 'Item 3', value: 90, color: '#F59E0B' },
      ],
      'site-architecture': [],
      'project-phases': [],
      'pipe-diagram': [],
      'feature-matrix': [],
    };

    const newComponent: VisualComponent = {
      id: Date.now().toString(),
      type,
      title: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      data: defaultData[type],
      position: (doc.visualComponents?.length || 0) + 1,
    };

    updateDoc({
      ...doc,
      visualComponents: [...(doc.visualComponents || []), newComponent],
    });
    setShowVisualMenu(false);
  };

  const updateVisualComponent = (id: string, data: Record<string, unknown>) => {
    const updated = (doc.visualComponents || []).map(vc =>
      vc.id === id ? { ...vc, data } : vc
    );
    updateDoc({ ...doc, visualComponents: updated });
  };

  const deleteVisualComponent = (id: string) => {
    const updated = (doc.visualComponents || []).filter(vc => vc.id !== id);
    updateDoc({ ...doc, visualComponents: updated });
  };

  // Filter clauses for Terms and Conditions (exclude scope clauses)
  const sortedClauses = doc.clauses
    ?.filter(c => !c.section || c.section === 'terms' || c.section === 'general')
    .sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  // Calculate total clause pages dynamically
  const calculateClausePages = (clauses: typeof sortedClauses) => {
    const LONG_CLAUSE_THRESHOLD = 800;
    const MAX_CLAUSES_PER_PAGE = 3;
    let pageCount = 0;
    let currentPageClauses = 0;
    
    clauses.forEach((clause) => {
      const isLongClause = clause.content.length > LONG_CLAUSE_THRESHOLD;
      
      if (isLongClause && currentPageClauses > 0) {
        pageCount++;
        currentPageClauses = 0;
      }
      
      currentPageClauses++;
      
      if (isLongClause || currentPageClauses >= MAX_CLAUSES_PER_PAGE) {
        pageCount++;
        currentPageClauses = 0;
      }
    });
    
    if (currentPageClauses > 0) {
      pageCount++;
    }
    
    return pageCount;
  };

  const totalClausePages = calculateClausePages(sortedClauses);

  const theme = doc.contractTheme || 'modern';

  // Theme-specific styles with print optimizations
  const themeStyles = {
    legal: {
      container: 'font-serif',
      page: 'p-12 bg-white print:p-8',
      header: 'text-center border-b-4 border-double border-black pb-6 mb-8 print:break-after-avoid section-title',
      title: 'text-3xl font-bold uppercase tracking-wide',
      subtitle: 'text-sm mt-2 italic',
      sectionTitle: 'text-xl font-bold uppercase mt-10 mb-4 border-b-2 border-black pb-2 print:break-after-avoid section-title',
      clauseTitle: 'font-bold uppercase text-sm mb-2',
      clauseContent: 'text-justify leading-relaxed mb-4 indent-8 print:orphans-3 print:widows-3',
      partySection: 'border-2 border-black p-6 mb-6 print:break-inside-avoid party-section',
      signatureBox: 'border-t-2 border-black pt-8 mt-16 print:break-inside-avoid signature-section',
      pageBreak: 'print:break-before-page'
    },
    modern: {
      container: 'font-sans',
      page: 'p-12 bg-white print:p-8',
      header: 'bg-gradient-to-r from-gray-900 to-gray-700 text-white p-8 mb-8 print:bg-gray-900 print:break-after-avoid section-title',
      title: 'text-4xl font-bold',
      subtitle: 'text-sm mt-2 opacity-90',
      sectionTitle: 'text-2xl font-bold mt-10 mb-4 text-gray-900 border-l-4 border-blue-600 pl-4 print:break-after-avoid section-title',
      clauseTitle: 'font-bold text-lg mb-2 text-gray-800',
      clauseContent: 'text-gray-700 leading-relaxed mb-4 pl-4 print:orphans-3 print:widows-3',
      partySection: 'bg-gray-50 border-l-4 border-blue-600 p-6 mb-6 print:bg-gray-100 print:break-inside-avoid party-section',
      signatureBox: 'border-t border-gray-300 pt-8 mt-12 print:break-inside-avoid signature-section',
      pageBreak: 'print:break-before-page'
    },
    executive: {
      container: 'font-sans',
      page: 'p-12 bg-white print:p-8',
      header: 'border-b-4 border-gray-800 pb-6 mb-8 print:break-after-avoid section-title',
      title: 'text-4xl font-light text-gray-900',
      subtitle: 'text-sm mt-3 text-gray-600 font-light',
      sectionTitle: 'text-xl font-semibold mt-10 mb-4 text-gray-800 print:break-after-avoid section-title',
      clauseTitle: 'font-semibold text-base mb-2 text-gray-900',
      clauseContent: 'text-gray-700 leading-loose mb-4 print:orphans-3 print:widows-3',
      partySection: 'border border-gray-300 bg-gray-50 p-6 mb-6 rounded print:break-inside-avoid party-section',
      signatureBox: 'border-t-2 border-gray-400 pt-8 mt-16 print:break-inside-avoid signature-section',
      pageBreak: 'print:break-before-page'
    },
    minimal: {
      container: 'font-sans',
      page: 'p-12 bg-white print:p-8',
      header: 'mb-12 print:break-after-avoid section-title',
      title: 'text-3xl font-bold text-gray-900',
      subtitle: 'text-xs mt-2 text-gray-500 uppercase tracking-widest',
      sectionTitle: 'text-lg font-bold mt-10 mb-3 text-gray-900 print:break-after-avoid section-title',
      clauseTitle: 'font-bold text-sm mb-2 text-gray-800',
      clauseContent: 'text-gray-700 leading-relaxed mb-4 text-sm print:orphans-3 print:widows-3',
      partySection: 'border-l-2 border-gray-300 pl-6 mb-6 print:break-inside-avoid party-section',
      signatureBox: 'border-t border-gray-200 pt-8 mt-12 print:break-inside-avoid signature-section',
      pageBreak: 'print:break-before-page'
    },
    bauhaus: {
      container: 'font-sans bg-white',
      page: 'p-12 bg-white relative print:p-8',
      header: 'mb-12 pb-8 border-b-8 border-black print:break-after-avoid relative section-title',
      title: 'text-5xl font-black uppercase tracking-[-0.02em] text-black leading-none',
      subtitle: 'text-sm mt-4 text-red-600 uppercase tracking-[0.3em] font-black',
      sectionTitle: 'text-2xl font-black uppercase mt-12 mb-6 text-black bg-yellow-400 inline-block px-6 py-3 print:break-after-avoid section-title',
      clauseTitle: 'font-black uppercase text-base mb-3 text-black bg-blue-600 text-white inline-block px-4 py-2',
      clauseContent: 'text-gray-900 leading-loose mb-6 pl-8 border-l-4 border-red-600 print:orphans-3 print:widows-3',
      partySection: 'border-4 border-black p-6 mb-8 bg-gradient-to-br from-yellow-50 to-blue-50 print:break-inside-avoid party-section',
      signatureBox: 'border-t-8 border-black pt-12 mt-16 bg-gray-50 p-8 print:break-inside-avoid signature-section',
      pageBreak: 'print:break-before-page'
    },
    constructivist: {
      container: 'font-sans bg-white',
      page: 'p-12 bg-white relative overflow-hidden print:p-8',
      header: 'mb-12 pb-8 relative print:break-after-avoid section-title',
      title: 'text-5xl font-black uppercase tracking-tight text-black leading-tight relative z-10',
      subtitle: 'text-sm mt-4 text-gray-700 uppercase tracking-[0.4em] font-bold relative z-10',
      sectionTitle: 'text-2xl font-black uppercase mt-12 mb-6 text-white bg-black px-8 py-4 inline-block transform -skew-x-6 print:break-after-avoid section-title',
      clauseTitle: 'font-black uppercase text-base mb-4 text-red-600 border-l-8 border-red-600 pl-4 bg-gray-100 py-2',
      clauseContent: 'text-gray-900 leading-loose mb-6 pl-12 print:orphans-3 print:widows-3',
      partySection: 'border-l-8 border-red-600 bg-gray-900 text-white p-6 mb-8 relative print:break-inside-avoid party-section',
      signatureBox: 'border-t-4 border-red-600 pt-12 mt-16 relative print:break-inside-avoid signature-section',
      pageBreak: 'print:break-before-page'
    },
    international: {
      container: 'font-sans bg-white',
      page: 'p-16 bg-white print:p-8',
      header: 'mb-16 pb-10 border-b border-gray-300 print:break-after-avoid section-title',
      title: 'text-5xl font-light text-gray-900 leading-tight tracking-tight mb-6',
      subtitle: 'text-xs text-gray-500 uppercase tracking-[0.4em] font-normal',
      sectionTitle: 'text-3xl font-light mt-16 mb-8 text-gray-900 tracking-tight border-l-2 border-gray-900 pl-6 print:break-after-avoid section-title',
      clauseTitle: 'font-normal text-lg mb-4 text-gray-900 tracking-wide',
      clauseContent: 'text-gray-700 leading-loose mb-8 text-justify print:orphans-3 print:widows-3',
      partySection: 'border border-gray-300 p-8 mb-10 bg-white print:break-inside-avoid party-section',
      signatureBox: 'border-t border-gray-300 pt-16 mt-20 print:break-inside-avoid signature-section',
      pageBreak: 'print:break-before-page'
    }
  };

  const styles = themeStyles[theme];

  // Print styles for professional contracts with proper pagination
  const printStyles = `
    @media print {
      @page {
        size: A4;
        margin: 15mm 20mm 20mm 20mm;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      /* Page header on every page */
      @page {
        @top-center {
          content: "${profile.companyName} | ${doc.contractType || 'Contract'} | Page " counter(page);
          font-size: 9pt;
          color: #666;
          border-bottom: 0.5pt solid #ccc;
          padding-bottom: 3mm;
        }
      }
      
      /* Alternative page header using running headers */
      .page-header-content {
        display: block;
        position: running(header);
        text-align: center;
        font-size: 9pt;
        color: #666;
        border-bottom: 0.5pt solid #ccc;
        padding-bottom: 3mm;
        margin-bottom: 5mm;
      }
      
      /* Prevent clause splitting across pages */
      .clause-item {
        break-inside: avoid;
        page-break-inside: avoid;
        orphans: 3;
        widows: 3;
        margin-bottom: 15mm;
      }
      
      /* Section titles should not break from content */
      .section-title {
        break-after: avoid;
        page-break-after: avoid;
        orphans: 3;
      }
      
      /* Party sections should not break */
      .party-section {
        break-inside: avoid;
        page-break-inside: avoid;
        margin-bottom: 10mm;
      }
      
      /* Terms section starts on new page */
      .terms-section {
        break-before: page;
        page-break-before: always;
      }
      
      /* Signature section positioning */
      .signature-section {
        break-inside: avoid;
        page-break-inside: avoid;
        margin-top: 20mm;
      }
      
      /* Footer with page numbers */
      .page-footer {
        position: fixed;
        bottom: 10mm;
        left: 20mm;
        right: 20mm;
        text-align: center;
        font-size: 9pt;
        color: #666;
      }
      
      .print\\:break-before-page {
        break-before: page;
      }
      
      .print\\:break-after-avoid {
        break-after: avoid;
      }
      
      .print\\:break-inside-avoid {
        break-inside: avoid;
      }
      
      .print\\:orphans-3 {
        orphans: 3;
      }
      
      .print\\:widows-3 {
        widows: 3;
      }
      
      /* Hide edit controls when printing */
      button, input:not([readonly]), textarea:not([readonly]), select, .print\\:hidden {
        display: none !important;
      }
      
      /* Show readonly inputs as text */
      input[readonly], textarea[readonly] {
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
      }
      
      /* Ensure content has proper spacing */
      .contract-content {
        padding-top: 10mm;
      }
    }
    
    @media screen {
      .page-footer {
        display: none;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      
      {/* Preview mode multi-page layout styling */}
      {viewMode === 'Final' && (
        <style dangerouslySetInnerHTML={{ __html: `
          .preview-page-container {
            display: flex;
            flex-direction: column;
            gap: 30px;
            padding: 40px 0;
            background: #f5f5f5;
          }
          
          .preview-page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 10mm 20mm 20mm 20mm;
            position: relative;
            page-break-after: always;
            overflow: hidden;
            box-sizing: border-box;
          }
          
          .preview-page-header {
            position: absolute;
            top: 10mm;
            left: 20mm;
            right: 20mm;
            padding-bottom: 3mm;
            border-bottom: 1px solid #e0e0e0;
            font-size: 9pt;
            color: #666;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .preview-page-footer {
            position: absolute;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            font-size: 9pt;
            color: #666;
          }
          
          .preview-page-content {
            padding-top: 0;
          }
          
          @media screen {
            .page-footer {
              display: none;
            }
          }
        ` }} />
      )}
      
      {/* Page header content for running headers */}
      <div className="page-header-content hidden print:block">
        {profile.companyName} | {doc.contractType || 'Contract'}
      </div>
      
      {/* Page footer with page numbers */}
      <div className="page-footer">
        <div className="text-xs text-gray-600">
          Page <span id="pageNumber"></span>
        </div>
      </div>
      
      {viewMode === 'Final' ? (
        // Multi-page preview layout with proper pagination
        <div className="preview-page-container">
          {/* Page 1 - Header, Parties, Terms, Scope */}
          <div className="preview-page">
            <div className="preview-page-header">
              <span className="font-bold">{profile.companyName}</span>
              <span>{doc.contractType || 'Contract'}</span>
              <span>Page 1</span>
            </div>
            
            <div style={{ paddingTop: '18mm' }}>
              <div className={`${styles.header}`}>
                <h1 className={styles.title}>{doc.title}</h1>
                {doc.contractType && <p className={styles.subtitle}>{doc.contractType}</p>}
              </div>

              <div className="mb-6 text-sm text-gray-600">
                <p><strong>Jurisdiction:</strong> {doc.contractTerms?.jurisdiction || profile.jurisdiction || 'Republic of South Africa'}</p>
                <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <h2 className={`${styles.sectionTitle} mb-4`}>PARTIES TO THIS AGREEMENT</h2>
              
              <div className={`${styles.partySection} mb-6`}>
                <h3 className="font-bold text-base mb-2">SERVICE PROVIDER</h3>
                <p className="font-bold">{profile.companyName}</p>
                {profile.registrationNumber && <p className="text-sm">Reg: {profile.registrationNumber}</p>}
                {profile.vatRegistrationNumber && <p className="text-sm">VAT: {profile.vatRegistrationNumber}</p>}
                {profile.address && <p className="text-sm">{profile.address}</p>}
                {profile.phone && <p className="text-sm">{profile.phone}</p>}
                <p className="text-sm">{profile.email}</p>
                {profile.website && <p className="text-sm">{profile.website}</p>}
              </div>

              <div className={`${styles.partySection} mb-6`}>
                <h3 className="font-bold text-base mb-2">CLIENT</h3>
                <p className="font-bold">{doc.client.businessName}</p>
                {doc.client.registrationNumber && <p className="text-sm">Reg: {doc.client.registrationNumber}</p>}
                {doc.client.address && <p className="text-sm">{doc.client.address}</p>}
                {doc.client.phone && <p className="text-sm">{doc.client.phone}</p>}
                <p className="text-sm">{doc.client.email}</p>
              </div>

              {doc.contractTerms && (
                <>
                  <h2 className={`${styles.sectionTitle} mb-4`}>CONTRACT TERMS</h2>
                  <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
                    <p><strong>Start Date:</strong> {new Date(doc.contractTerms.startDate).toLocaleDateString()}</p>
                    {doc.contractTerms.endDate && <p><strong>End Date:</strong> {new Date(doc.contractTerms.endDate).toLocaleDateString()}</p>}
                    <p><strong>Payment Schedule:</strong> {doc.contractTerms.paymentSchedule}</p>
                    <p><strong>Payment Terms:</strong> {doc.contractTerms.paymentTermsDays || 7} days</p>
                  </div>
                </>
              )}

              {doc.scopeOfWork && (
                <>
                  <h2 className={`${styles.sectionTitle} mb-3`}>SCOPE OF WORK</h2>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{doc.scopeOfWork}</p>
                </>
              )}
            </div>
          </div>

          {/* Page 2+ - Terms and Conditions - Smart clause pagination */}
          {(() => {
            const pages = [];
            let currentPageClauses: typeof sortedClauses = [];
            let pageNumber = 2;
            let globalClauseIndex = 0;
            
            // Character thresholds for determining clause length
            const LONG_CLAUSE_THRESHOLD = 800; // ~half page
            const MAX_CLAUSES_PER_PAGE = 3;
            
            sortedClauses.forEach((clause, index) => {
              const isLongClause = clause.content.length > LONG_CLAUSE_THRESHOLD;
              const hasClausesOnCurrentPage = currentPageClauses.length > 0;
              
              // Long clause gets its own page OR we've hit max clauses per page
              if (isLongClause && hasClausesOnCurrentPage) {
                // Flush current page first
                pages.push(
                  <div key={`clause-page-${pageNumber - 2}`} className="preview-page">
                    <div className="preview-page-header">
                      <span className="font-bold">{profile.companyName}</span>
                      <span>{doc.contractType || 'Contract'}</span>
                      <span>Page {pageNumber}</span>
                    </div>
                    
                    <div style={{ paddingTop: '18mm' }}>
                      {pageNumber === 2 && (
                        <h2 className={`${styles.sectionTitle} mb-6`}>TERMS AND CONDITIONS</h2>
                      )}
                      
                      {currentPageClauses.map((c, idx) => (
                        <div key={c.id} className="mb-6">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-bold text-gray-500 text-sm">{globalClauseIndex - currentPageClauses.length + idx + 1}.</span>
                            <h3 className={`${styles.clauseTitle} font-bold`}>{c.title}</h3>
                          </div>
                          <p className={`${styles.clauseContent} text-sm leading-relaxed ml-6 whitespace-pre-wrap`}>{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
                pageNumber++;
                currentPageClauses = [];
              }
              
              // Add clause to current page
              currentPageClauses.push(clause);
              globalClauseIndex++;
              
              // Start new page if: long clause is alone OR hit max clauses
              if (isLongClause || currentPageClauses.length >= MAX_CLAUSES_PER_PAGE) {
                const startIndex = globalClauseIndex - currentPageClauses.length;
                pages.push(
                  <div key={`clause-page-${pageNumber - 2}`} className="preview-page">
                    <div className="preview-page-header">
                      <span className="font-bold">{profile.companyName}</span>
                      <span>{doc.contractType || 'Contract'}</span>
                      <span>Page {pageNumber}</span>
                    </div>
                    
                    <div style={{ paddingTop: '18mm' }}>
                      {pageNumber === 2 && (
                        <h2 className={`${styles.sectionTitle} mb-6`}>TERMS AND CONDITIONS</h2>
                      )}
                      
                      {currentPageClauses.map((c, idx) => (
                        <div key={c.id} className="mb-6">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-bold text-gray-500 text-sm">{startIndex + idx + 1}.</span>
                            <h3 className={`${styles.clauseTitle} font-bold`}>{c.title}</h3>
                          </div>
                          <p className={`${styles.clauseContent} text-sm leading-relaxed ml-6 whitespace-pre-wrap`}>{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
                pageNumber++;
                currentPageClauses = [];
              }
            });
            
            // Flush any remaining clauses
            if (currentPageClauses.length > 0) {
              const startIndex = globalClauseIndex - currentPageClauses.length;
              pages.push(
                <div key={`clause-page-${pageNumber - 2}`} className="preview-page">
                  <div className="preview-page-header">
                    <span className="font-bold">{profile.companyName}</span>
                    <span>{doc.contractType || 'Contract'}</span>
                    <span>Page {pageNumber}</span>
                  </div>
                  
                  <div style={{ paddingTop: '18mm' }}>
                    {pageNumber === 2 && (
                      <h2 className={`${styles.sectionTitle} mb-6`}>TERMS AND CONDITIONS</h2>
                    )}
                    
                    {currentPageClauses.map((c, idx) => (
                      <div key={c.id} className="mb-6">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-bold text-gray-500 text-sm">{startIndex + idx + 1}.</span>
                          <h3 className={`${styles.clauseTitle} font-bold`}>{c.title}</h3>
                        </div>
                        <p className={`${styles.clauseContent} text-sm leading-relaxed ml-6 whitespace-pre-wrap`}>{c.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            return pages;
          })()}

          {/* Visual Components Pages - Before Signatures */}
          {doc.visualComponents && doc.visualComponents.length > 0 && (
            <div className="preview-page">
              <div className="preview-page-header">
                <span className="font-bold">{profile.companyName}</span>
                <span>{doc.contractType || 'Contract'}</span>
                <span>Page {totalClausePages + 2}</span>
              </div>
              
              <div style={{ paddingTop: '18mm' }}>
                {doc.visualComponents.map(component => (
                  <div key={component.id} className="mb-8">
                    {component.type === 'pie-chart' && (
                      <PieChart
                        title={component.title}
                        data={component.data}
                        editable={false}
                        onUpdate={() => {}}
                      />
                    )}
                    
                    {component.type === 'timeline' && (
                      <Timeline
                        title={component.title}
                        items={component.data}
                        editable={false}
                        onUpdate={() => {}}
                      />
                    )}
                    
                    {component.type === 'tech-stack' && (
                      <TechStack
                        title={component.title}
                        stack={component.data}
                        editable={false}
                        onUpdate={() => {}}
                      />
                    )}
                    
                    {component.type === 'cost-breakdown' && (
                      <CostBreakdown
                        title={component.title}
                        items={component.data}
                        currency={profile.currency}
                        editable={false}
                        onUpdate={() => {}}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Page - Signatures */}
          <div className="preview-page">
            <div className="preview-page-header">
              <span className="font-bold">{profile.companyName}</span>
              <span>{doc.contractType || 'Contract'}</span>
              <span>Page {totalClausePages + (doc.visualComponents?.length ? 3 : 2)}</span>
            </div>
            
            <div style={{ paddingTop: '18mm' }}>
              <h2 className={`${styles.sectionTitle} mb-8`}>SIGNATURES</h2>
              
              <div className="grid grid-cols-2 gap-12 mt-12">
                <div>
                  <p className="font-bold mb-2">SERVICE PROVIDER</p>
                  <p className="text-sm text-gray-600 mb-6">{profile.companyName}</p>
                  <div className="border-b-2 border-black h-16 mb-2"></div>
                  <p className="text-xs text-gray-500">Signature</p>
                  <div className="border-b border-gray-300 mt-6 mb-2"></div>
                  <p className="text-xs text-gray-500">Date</p>
                </div>

                <div>
                  <p className="font-bold mb-2">CLIENT</p>
                  <p className="text-sm text-gray-600 mb-6">{doc.client.businessName}</p>
                  <div className="border-b-2 border-black h-16 mb-2"></div>
                  <p className="text-xs text-gray-500">Signature</p>
                  <div className="border-b border-gray-300 mt-6 mb-2"></div>
                  <p className="text-xs text-gray-500">Date</p>
                </div>
              </div>

              <div className="mt-auto pt-12 text-xs text-gray-500 text-center border-t border-gray-200">
                <p>This contract is governed by the laws of {doc.contractTerms?.jurisdiction || 'Republic of South Africa'}</p>
                <p className="mt-2">Generated by {profile.companyName} | {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Draft mode - single scrollable view
      <div className={`${styles.container} max-w-4xl mx-auto contract-content`}>
      <div className={`${styles.page}`}>
      {/* HEADER */}
      <div className={`${styles.header} section-title`}>
        {viewMode === 'Draft' ? (
          <>
            <Input
              value={doc.title}
              onChange={e => updateDocField('title', e.target.value)}
              className="text-3xl font-bold mb-2 w-full bg-transparent border-none text-center"
              placeholder="Contract Title"
            />
            <select
              value={doc.contractType || ''}
              onChange={e => updateDocField('contractType', e.target.value)}
              className="w-full text-center text-sm bg-transparent border border-dashed border-gray-400 p-2 mt-2"
            >
              <option value="">Select Contract Type</option>
              <option value="Service Agreement">Service Agreement</option>
              <option value="Project Contract">Project Contract</option>
              <option value="Retainer Agreement">Retainer Agreement</option>
              <option value="Non-Disclosure Agreement">NDA</option>
              <option value="Shareholder Agreement">Shareholder Agreement</option>
              <option value="Employment Contract">Employment Contract</option>
              <option value="Consulting Agreement">Consulting Agreement</option>
              <option value="Maintenance Agreement">Maintenance Agreement</option>
            </select>
          </>
        ) : (
          <>
            <h1 className={styles.title}>{doc.title}</h1>
            {doc.contractType && <p className={styles.subtitle}>{doc.contractType}</p>}
          </>
        )}
      </div>

      {/* JURISDICTION & DATE */}
      <div className="mb-8 text-sm text-gray-600">
        {viewMode === 'Draft' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Jurisdiction</label>
              <Input
                value={doc.contractTerms?.jurisdiction || profile.jurisdiction || 'Republic of South Africa'}
                onChange={e => updateTerms('jurisdiction', e.target.value)}
                placeholder="Jurisdiction"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Contract Date</label>
              <Input
                type="date"
                value={doc.date || ''}
                onChange={e => updateDocField('date', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            <p><strong>Jurisdiction:</strong> {doc.contractTerms?.jurisdiction || profile.jurisdiction || 'Republic of South Africa'}</p>
            <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </>
        )}
      </div>

      {/* PARTIES SECTION */}
      <h2 className={`${styles.sectionTitle} section-title`}>PARTIES TO THIS AGREEMENT</h2>
      
      <div className={`${styles.partySection} party-section`}>
        <h3 className="font-bold text-lg mb-3">SERVICE PROVIDER</h3>
        {viewMode === 'Draft' ? (
          <>
            <Input value={profile.companyName} disabled className="mb-2 bg-gray-100" />
            <Input value={profile.registrationNumber || ''} placeholder="Registration Number" disabled className="mb-2 bg-gray-100" />
            <Input value={profile.vatRegistrationNumber || ''} placeholder="VAT Number" disabled className="mb-2 bg-gray-100" />
            <Input value={profile.address || ''} placeholder="Address" disabled className="mb-2 bg-gray-100" />
            <Input value={profile.phone || ''} placeholder="Phone" disabled className="mb-2 bg-gray-100" />
            <Input value={profile.email} disabled className="mb-2 bg-gray-100" />
            <Input value={profile.website || ''} placeholder="Website" disabled className="bg-gray-100" />
          </>
        ) : (
          <>
            <p className="font-bold">{profile.companyName}</p>
            {profile.registrationNumber && <p>Registration: {profile.registrationNumber}</p>}
            {profile.vatRegistrationNumber && <p>VAT: {profile.vatRegistrationNumber}</p>}
            {profile.address && <p>{profile.address}</p>}
            {profile.phone && <p>{profile.phone}</p>}
            <p>{profile.email}</p>
            {profile.website && <p>{profile.website}</p>}
          </>
        )}
      </div>

      <div className={`${styles.partySection} party-section`}>
        <h3 className="font-bold text-lg mb-3">CLIENT</h3>
        {viewMode === 'Draft' ? (
          <>
            <Input 
              value={doc.client.businessName} 
              onChange={e => updateClient('businessName', e.target.value)} 
              placeholder="Client Name"
              className="mb-2"
            />
            <Input 
              value={doc.client.registrationNumber || ''} 
              onChange={e => updateClient('registrationNumber', e.target.value)} 
              placeholder="Registration Number (Optional)"
              className="mb-2"
            />
            <Input 
              value={doc.client.address || ''} 
              onChange={e => updateClient('address', e.target.value)} 
              placeholder="Address"
              className="mb-2"
            />
            <Input 
              value={doc.client.email} 
              onChange={e => updateClient('email', e.target.value)} 
              placeholder="Email"
            />
          </>
        ) : (
          <>
            <p className="font-bold">{doc.client.businessName}</p>
            {doc.client.registrationNumber && <p>Registration: {doc.client.registrationNumber}</p>}
            {doc.client.address && <p>{doc.client.address}</p>}
            <p>{doc.client.email}</p>
          </>
        )}
      </div>

      {/* CONTRACT TERMS */}
      {doc.contractTerms && (
        <>
          <h2 className={`${styles.sectionTitle} section-title`}>CONTRACT TERMS</h2>
          <div className="mb-6 grid grid-cols-2 gap-4">
            {viewMode === 'Draft' ? (
              <>
                <div>
                  <label className="block font-bold text-sm mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={doc.contractTerms.startDate || ''}
                    onChange={e => updateTerms('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1">End Date (Optional)</label>
                  <Input
                    type="date"
                    value={doc.contractTerms.endDate || ''}
                    onChange={e => updateTerms('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1">Payment Schedule</label>
                  <select
                    value={doc.contractTerms.paymentSchedule}
                    onChange={e => updateTerms('paymentSchedule', e.target.value)}
                    className="w-full border-2 border-gray-300 p-2"
                  >
                    <option value="upfront">Upfront Payment</option>
                    <option value="milestone">Milestone-Based</option>
                    <option value="monthly">Monthly</option>
                    <option value="completion">Upon Completion</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1">Payment Terms (Days)</label>
                  <Input
                    type="number"
                    value={doc.contractTerms.paymentTermsDays || 7}
                    onChange={e => updateTerms('paymentTermsDays', parseInt(e.target.value))}
                  />
                </div>
              </>
            ) : (
              <>
                <p><strong>Start Date:</strong> {new Date(doc.contractTerms.startDate).toLocaleDateString()}</p>
                {doc.contractTerms.endDate && <p><strong>End Date:</strong> {new Date(doc.contractTerms.endDate).toLocaleDateString()}</p>}
                <p><strong>Payment Schedule:</strong> {doc.contractTerms.paymentSchedule}</p>
                <p><strong>Payment Terms:</strong> {doc.contractTerms.paymentTermsDays || 7} days</p>
              </>
            )}
          </div>
        </>
      )}

      {/* SCOPE OF WORK (if provided) */}
      {(doc.scopeOfWork || viewMode === 'Draft' || doc.clauses?.some(c => c.section === 'scope')) && (
        <>
          <h2 className={`${styles.sectionTitle} section-title`}>SCOPE OF WORK</h2>
          {viewMode === 'Draft' ? (
            <TextArea
              value={doc.scopeOfWork || ''}
              onChange={e => updateDocField('scopeOfWork', e.target.value)}
              placeholder="Describe the work to be performed..."
              rows={4}
              className="w-full mb-6 p-3 border-2 border-gray-300"
            />
          ) : (
            <p className="mb-6 whitespace-pre-wrap">{doc.scopeOfWork}</p>
          )}
          
          {/* Scope of Work Clauses */}
          {doc.clauses?.filter(c => c.section === 'scope').map((clause, index) => (
            <div key={clause.id} className="clause-item mb-6 relative group">
              {viewMode === 'Draft' && (
                <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                  <button 
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => onDeleteClause(clause.id)}
                    title="Delete Scope Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-gray-500 text-sm">•</span>
                {viewMode === 'Draft' ? (
                  <Input
                    value={clause.title}
                    onChange={e => updateClause(clause.id, 'title', e.target.value)}
                    className={`flex-1 ${styles.clauseTitle} bg-transparent border-b border-dashed border-gray-400`}
                    placeholder="Scope item"
                  />
                ) : (
                  <h3 className={styles.clauseTitle}>{clause.title}</h3>
                )}
              </div>
              
              {viewMode === 'Draft' ? (
                <TextArea
                  value={clause.content}
                  onChange={e => updateClause(clause.id, 'content', e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded"
                  rows={3}
                  placeholder="Scope details..."
                />
              ) : (
                <p className={`${styles.clauseContent} whitespace-pre-wrap ml-4`}>{clause.content}</p>
              )}
            </div>
          ))}
          
          {/* Add Scope Clause Button */}
          {viewMode === 'Draft' && (
            <button
              onClick={() => onAddClause('scope')}
              className="w-full py-2 border-2 border-dashed border-purple-400 hover:border-purple-600 hover:bg-purple-50 transition-colors font-bold text-purple-600 hover:text-purple-700 text-xs flex items-center justify-center gap-1 mb-6 print:hidden"
              title="Add clause to Scope of Work"
            >
              <Plus size={16} /> Add Scope Item
            </button>
          )}
        </>
      )}

      {/* CONTRACT CLAUSES - STARTS ON NEW PAGE */}
      <div className="terms-section">
        <h2 className={`${styles.sectionTitle} section-title`}>TERMS AND CONDITIONS</h2>
        
        {sortedClauses.map((clause, index) => (
          <div key={clause.id} className="clause-item mb-8 relative group">
          {viewMode === 'Draft' && (
            <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
              <button 
                className="text-gray-400 hover:text-red-600"
                onClick={() => onDeleteClause(clause.id)}
                title="Delete Clause"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-bold text-gray-500 text-sm">{index + 1}.</span>
            {viewMode === 'Draft' ? (
              <Input
                value={clause.title}
                onChange={e => updateClause(clause.id, 'title', e.target.value)}
                className={`flex-1 ${styles.clauseTitle} bg-transparent border-b border-dashed border-gray-400`}
                placeholder="Clause Title"
              />
            ) : (
              <h3 className={styles.clauseTitle}>{clause.title}</h3>
            )}
          </div>
          
          {viewMode === 'Draft' ? (
            <TextArea
              value={clause.content}
              onChange={e => updateClause(clause.id, 'content', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded"
              rows={4}
              placeholder="Clause content..."
            />
            ) : (
              <p className={`${styles.clauseContent} whitespace-pre-wrap`}>{clause.content}</p>
            )}
          </div>
        ))}
        
        {/* Add Terms/Clause Buttons */}
        {viewMode === 'Draft' && (
          <div className="grid grid-cols-2 gap-2 mb-6 print:hidden">
            <button
              onClick={() => onAddClause('terms')}
              className="py-2 border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50 transition-colors font-bold text-blue-600 hover:text-blue-700 text-xs flex items-center justify-center gap-1"
              title="Add clause to Terms and Conditions"
            >
              <Plus size={16} /> Add Term
            </button>
            <button
              onClick={() => onAddClause('general')}
              className="py-2 border-2 border-dashed border-gray-400 hover:border-gray-600 hover:bg-gray-50 transition-colors font-bold text-gray-600 hover:text-gray-700 text-xs flex items-center justify-center gap-1"
              title="Add general clause"
            >
              <Plus size={16} /> Add Clause
            </button>
          </div>
        )}      {viewMode === 'Draft' && (
        <>
          <div className="relative print:hidden">
            <button
              onClick={() => setShowVisualMenu(!showVisualMenu)}
              className="w-full py-3 border-2 border-dashed border-green-400 hover:border-green-600 hover:bg-green-50 transition-colors font-bold text-green-600 hover:text-green-700 flex items-center justify-center gap-2"
            >
              <BarChart3 size={20} /> Add Visual Component
            </button>
            
            {showVisualMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-green-600 rounded shadow-lg z-10 p-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { addVisualComponent('pie-chart'); setShowVisualMenu(false); }}
                  className="p-3 hover:bg-green-50 border border-gray-300 rounded text-left"
                >
                  <PieChartIcon size={16} className="inline mr-2" />
                  Pie Chart
                </button>
                <button
                  onClick={() => { addVisualComponent('bar-chart'); setShowVisualMenu(false); }}
                  className="p-3 hover:bg-green-50 border border-gray-300 rounded text-left"
                >
                  <BarChart3 size={16} className="inline mr-2" />
                  Bar Chart
                </button>
                <button
                  onClick={() => { addVisualComponent('timeline'); setShowVisualMenu(false); }}
                  className="p-3 hover:bg-green-50 border border-gray-300 rounded text-left"
                >
                  <Clock size={16} className="inline mr-2" />
                  Timeline
                </button>
                <button
                  onClick={() => { addVisualComponent('tech-stack'); setShowVisualMenu(false); }}
                  className="p-3 hover:bg-green-50 border border-gray-300 rounded text-left"
                >
                  <Code size={16} className="inline mr-2" />
                  Tech Stack
                </button>
                <button
                  onClick={() => { addVisualComponent('cost-breakdown'); setShowVisualMenu(false); }}
                  className="p-3 hover:bg-green-50 border border-gray-300 rounded text-left"
                >
                  <DollarSign size={16} className="inline mr-2" />
                  Cost Breakdown
                </button>
              </div>
            )}
          </div>
        </>
      )}
      </div>

      {/* VISUAL COMPONENTS SECTION */}
      {doc.visualComponents && doc.visualComponents.length > 0 && (
        <div className="my-8">
          {doc.visualComponents.map(component => {
            const editable = viewMode === 'Draft';
            
            return (
              <div key={component.id} className="relative group">
                {editable && (
                  <button
                    onClick={() => deleteVisualComponent(component.id)}
                    className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity print:hidden z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                {component.type === 'pie-chart' && (
                  <PieChart
                    title={component.title}
                    data={component.data}
                    editable={editable}
                    onUpdate={(data) => updateVisualComponent(component.id, data)}
                  />
                )}
                
                {component.type === 'timeline' && (
                  <Timeline
                    title={component.title}
                    items={component.data}
                    editable={editable}
                    onUpdate={(data) => updateVisualComponent(component.id, data)}
                  />
                )}
                
                {component.type === 'tech-stack' && (
                  <TechStack
                    title={component.title}
                    stack={component.data}
                    editable={editable}
                    onUpdate={(data) => updateVisualComponent(component.id, data)}
                  />
                )}
                
                {component.type === 'cost-breakdown' && (
                  <CostBreakdown
                    title={component.title}
                    items={component.data}
                    currency={profile.currency}
                    editable={editable}
                    onUpdate={(data) => updateVisualComponent(component.id, data)}
                  />
                )}
                
                {component.type === 'bar-chart' && (
                  <BarChart
                    title={component.title}
                    items={component.data}
                    unit=""
                    editable={editable}
                    onUpdate={(data) => updateVisualComponent(component.id, data)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SIGNATURE SECTION */}
      <div className={`${styles.signatureBox} signature-section`}>
        <h2 className={`${styles.sectionTitle} section-title`}>SIGNATURES</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <p className="font-bold mb-2">SERVICE PROVIDER</p>
            <p className="text-sm text-gray-600 mb-4">{profile.companyName}</p>
            <div className="border-b-2 border-black h-16 mb-2"></div>
            <p className="text-xs text-gray-500">Signature</p>
            <div className="border-b border-gray-300 mt-4 mb-2"></div>
            <p className="text-xs text-gray-500">Date</p>
          </div>

          <div>
            <p className="font-bold mb-2">CLIENT</p>
            <p className="text-sm text-gray-600 mb-4">{doc.client.businessName}</p>
            <div className="border-b-2 border-black h-16 mb-2"></div>
            <p className="text-xs text-gray-500">Signature</p>
            <div className="border-b border-gray-300 mt-4 mb-2"></div>
            <p className="text-xs text-gray-500">Date</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center print:hidden">
        <p>This contract is governed by the laws of {doc.contractTerms?.jurisdiction || 'Republic of South Africa'}</p>
        <p className="mt-2">Generated by {profile.companyName} | {new Date().toLocaleDateString()}</p>
      </div>
      </div>
      </div>
      )}
    </>
  );
};
