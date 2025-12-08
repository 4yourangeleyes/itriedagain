import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DocumentData, UserProfile, DocType, TemplateBlock, InvoiceItem, DocStatus, InvoiceTheme, ContractTheme, ContractClause } from '../types';
import { Plus, Minus, Save, Share2, X, Grid, Trash2, Box, CheckSquare, Square, DollarSign, GripVertical, Palette, Zap, Aperture, Layout, Feather, Building, Leaf, PenTool, Wind, Download, Mail, Edit3, Eye, Check, Loader, Send } from 'lucide-react';
import { Button } from '../components/Button';
import { Input, TextArea } from '../components/Input';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../App';
import { generateInvoicePDF, generateInvoicePDFBase64, extractInvoiceHTML } from '../services/pdfService';
import { sendInvoiceEmail, isValidEmail } from '../services/emailService';
import { InvoiceThemeRenderer } from '../components/InvoiceThemeRenderer';
import { ContractThemeRenderer } from '../components/ContractThemeRenderer';
import { Client } from '../types';

interface CanvasScreenProps {
  doc: DocumentData | null;
  profile: UserProfile;
  updateDoc: (doc: DocumentData | null) => void;
  templates: TemplateBlock[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateBlock[]>>;
  onSave: (doc: DocumentData) => void;
  itemUsage: Record<string, number>;
  onTrackItemUsage: (desc: string) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const UNIT_TYPES = ['ea', 'hrs', 'days', 'm', 'ft', 'sqm', 'set', 'pts'];

const INVOICE_THEMES: { id: InvoiceTheme; name: string; description: string; el: React.ReactNode }[] = [
    { id: 'swiss', name: 'Swiss Grid', description: 'Clean & Systematic', el: <div className="border border-gray-400 p-1"><div className="w-full h-1 bg-black"></div><div className="flex gap-1 mt-1"><div className="w-1/3 h-2 bg-gray-300"></div><div className="w-2/3 h-2 bg-gray-200"></div></div></div> },
    { id: 'geometric', name: 'Geometric', description: 'Bold & Structured', el: <div className="border border-gray-400 p-1 flex items-end gap-1 h-full"><div className="w-2 h-full bg-red-600"></div><div className="flex-1 h-2 bg-gray-300"></div><div className="w-2 h-3 bg-yellow-500"></div></div> },
    { id: 'blueprint', name: 'Blueprint', description: 'Technical & Precise', el: <div className="border border-cyan-300 bg-blue-900 p-1 h-full"><div className="w-full h-1 bg-cyan-200 opacity-50"></div><div className="w-2/3 h-1 mt-1 bg-cyan-200 opacity-50"></div></div> },
    { id: 'modernist', name: 'Modernist', description: 'Form & Function', el: <div className="border border-gray-400 p-1 text-center font-sans text-gray-600 text-sm h-full flex items-center justify-center font-bold">M</div> },
    { id: 'minimal', name: 'Minimal', description: 'Essential & Pure', el: <div className="border border-gray-400 p-1 h-full flex items-center"><div className="w-1/2 h-0.5 bg-gray-400"></div></div> },
    { id: 'artisan', name: 'Artisan', description: 'Refined & Warm', el: <div className="border border-orange-200 bg-amber-50 p-1 h-full"><div className="w-full h-1 bg-orange-300"></div></div> },
    { id: 'corporate', name: 'Corporate', description: 'Authority & Trust', el: <div className="border border-gray-400 p-1 h-full"><div className="w-full h-2 bg-blue-900"></div></div> },
    { id: 'brutalist', name: 'Brutalist', description: 'Raw & Honest', el: <div className="border-2 border-black p-1 h-full bg-gray-100 flex items-end"><div className="w-full h-1/2 bg-black"></div></div> },
    { id: 'asymmetric', name: 'Asymmetric', description: 'Dynamic & Modern', el: <div className="border border-gray-400 p-1 flex gap-1 h-full"><div className="w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600"></div><div className="flex-1 h-2 bg-gray-300 mt-auto"></div></div> },
    { id: 'bauhaus', name: 'Bauhaus', description: 'Primary Colors & Grid', el: <div className="border border-black p-1 h-full bg-white grid grid-cols-3 gap-0.5"><div className="bg-red-600"></div><div className="bg-blue-600"></div><div className="bg-yellow-400"></div><div className="col-span-2 bg-black"></div><div className="bg-white border border-black"></div></div> },
    { id: 'constructivist', name: 'Constructivist', description: 'Diagonal & Bold', el: <div className="border-2 border-black p-1 h-full bg-white relative overflow-hidden"><div className="absolute -rotate-45 w-full h-0.5 bg-red-600 top-1/2"></div><div className="absolute rotate-45 w-full h-0.5 bg-black top-1/2"></div><div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400"></div></div> },
    { id: 'international', name: 'International', description: 'Swiss Typographic', el: <div className="border border-gray-400 p-1 h-full bg-white"><div className="grid grid-cols-12 gap-px h-full"><div className="col-span-3 bg-black"></div><div className="col-span-9 grid grid-rows-3 gap-px"><div className="bg-gray-800"></div><div className="bg-gray-400"></div><div className="bg-gray-200"></div></div></div></div> },
];

const CONTRACT_THEMES: { id: ContractTheme; name: string; description: string; el: React.ReactNode }[] = [
    { id: 'legal', name: 'Legal', description: 'Professional & Formal', el: <div className="border-2 border-gray-800 p-1 h-full bg-white"><div className="text-[4px] font-serif leading-tight">§1. Whereas...<br/>§2. Therefore...</div></div> },
    { id: 'modern', name: 'Modern', description: 'Clean & Contemporary', el: <div className="border border-gray-400 p-1 h-full"><div className="w-full h-1 bg-blue-600 mb-1"></div><div className="space-y-0.5"><div className="w-3/4 h-0.5 bg-gray-300"></div><div className="w-full h-0.5 bg-gray-200"></div></div></div> },
    { id: 'executive', name: 'Executive', description: 'Premium & Authoritative', el: <div className="border-2 border-gray-900 p-1 h-full bg-gradient-to-b from-gray-50 to-white"><div className="w-full h-1 bg-gray-900"></div></div> },
    { id: 'minimal', name: 'Minimal', description: 'Simple & Clear', el: <div className="border border-gray-300 p-1 h-full flex flex-col gap-1"><div className="w-1/2 h-0.5 bg-gray-800"></div><div className="w-full h-0.5 bg-gray-300"></div><div className="w-3/4 h-0.5 bg-gray-300"></div></div> },
    { id: 'bauhaus', name: 'Bauhaus', description: 'Primary Colors & Grid', el: <div className="border border-black p-1 h-full bg-white grid grid-cols-3 gap-0.5"><div className="bg-red-600"></div><div className="bg-blue-600"></div><div className="bg-yellow-400"></div><div className="col-span-2 bg-black"></div><div className="bg-white border border-black"></div></div> },
    { id: 'constructivist', name: 'Constructivist', description: 'Diagonal & Bold', el: <div className="border-2 border-black p-1 h-full bg-white relative overflow-hidden"><div className="absolute -rotate-45 w-full h-0.5 bg-red-600 top-1/2"></div><div className="absolute rotate-45 w-full h-0.5 bg-black top-1/2"></div><div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400"></div></div> },
    { id: 'international', name: 'International', description: 'Swiss Typographic', el: <div className="border border-gray-400 p-1 h-full bg-white"><div className="grid grid-cols-12 gap-px h-full"><div className="col-span-3 bg-black"></div><div className="col-span-9 grid grid-rows-3 gap-px"><div className="bg-gray-800"></div><div className="bg-gray-400"></div><div className="bg-gray-200"></div></div></div></div> },
];


const CanvasScreen: React.FC<CanvasScreenProps> = ({ doc, profile, updateDoc, templates, setTemplates, onSave, itemUsage, onTrackItemUsage, clients, setClients }) => {
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5); 
  const [viewMode, setViewMode] = useState<'Draft' | 'Final'>('Draft');
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchBlockName, setBatchBlockName] = useState('');
  
  const [showKaChing, setShowKaChing] = useState(false);
  const [suggestDeposit, setSuggestDeposit] = useState(false);

  const [potentialTemplate, setPotentialTemplate] = useState<string | null>(null);
  const [selectedTemplateItems, setSelectedTemplateItems] = useState<Set<string>>(new Set());

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  // PDF export states
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showPDFMenu, setShowPDFMenu] = useState(false);
  
  // Email sending states
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const calculateTotals = (items: InvoiceItem[]) => {
      const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      const taxAmount = profile.taxEnabled && profile.taxRate ? (subtotal * (profile.taxRate / 100)) : 0;
      return { subtotal, taxTotal: taxAmount, total: subtotal + taxAmount };
  };

  useEffect(() => {
    if (!doc) {
        const blankDoc: DocumentData = {
            id: Date.now().toString(), type: DocType.INVOICE, status: 'Draft', title: 'New Invoice',
            client: { id: 'temp', businessName: 'Client Name', email: '' },
            date: new Date().toLocaleDateString(), items: [], currency: profile.currency || '$',
            subtotal: 0, taxTotal: 0, total: 0, theme: 'swiss'
        };
        updateDoc(blankDoc);
    } else {
        if (doc.status !== 'Draft' && viewMode === 'Draft') setViewMode('Final');
        if ((doc.total || 0) > 1000 && !doc.items?.some(i => i.description.toLowerCase().includes('deposit')) && !suggestDeposit) {
            setSuggestDeposit(true);
        }
    }
  }, [doc, profile]);

  const groupedTemplates = useMemo((): Record<string, TemplateBlock[]> => {
      if (!doc) return {};
      return templates
          .filter(t => t.type === doc.type)
          .reduce((acc: Record<string, TemplateBlock[]>, t) => {
              const cat = t.category || 'General';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(t);
              return acc;
          }, {} as Record<string, TemplateBlock[]>);
  }, [templates, doc]);

  if (!doc) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedItems);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      setSelectedItems(newSet);
      if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleDeleteItem = (id: string) => {
      if (!doc.items) return;
      const newItems = doc.items.filter(i => i.id !== id);
      const totals = calculateTotals(newItems);
      updateDoc({ ...doc, items: newItems, ...totals });
      triggerHaptic('heavy');
  };

  const handleBatchDelete = () => {
      if (!doc.items) return;
      const newItems = doc.items.filter(i => !selectedItems.has(i.id));
      const totals = calculateTotals(newItems);
      updateDoc({ ...doc, items: newItems, ...totals });
      setSelectedItems(new Set());
      triggerHaptic('heavy');
  };

  const handleBatchCreateBlock = () => {
      if (!batchBlockName || !doc.items) return;
      const itemsToSave = doc.items.filter(i => selectedItems.has(i.id));
      setTemplates(prev => [...prev, {
          id: Date.now().toString(), name: batchBlockName, category: 'Batch Save', type: DocType.INVOICE, items: itemsToSave
      }]);
      setBatchBlockName(''); setShowBatchModal(false); setSelectedItems(new Set()); triggerHaptic('success');
  };

  const handleStatusChange = (newStatus: DocStatus) => {
      const updated = { ...doc, status: newStatus };
      updateDoc(updated); onSave(updated);
      if (newStatus === 'Paid') { setShowKaChing(true); triggerHaptic('heavy'); setTimeout(() => setShowKaChing(false), 2000); }
  };

  const updateLineItem = (id: string, field: keyof InvoiceItem, value: any) => {
      if (!doc.items) return;
      const newItems = doc.items.map(item => item.id === id ? { ...item, [field]: value } : item);
      const totals = calculateTotals(newItems);
      updateDoc({ ...doc, items: newItems, ...totals });
  };
  
  const updateDocField = (field: keyof DocumentData, value: any) => {
    updateDoc({ ...doc, [field]: value });
  };

  const updateClient = (field: keyof typeof doc.client, value: string) => {
      const updatedClient = { ...doc.client, [field]: value };
      updateDoc({ ...doc, client: updatedClient });
      
      // Auto-save client to clients list in development
      if (updatedClient.businessName && updatedClient.email) {
        const existingClientIndex = clients.findIndex(c => c.id === updatedClient.id);
        const clientData: Client = {
          id: updatedClient.id,
          businessName: updatedClient.businessName,
          email: updatedClient.email,
          phone: updatedClient.phone || '',
          address: updatedClient.address || ''
        };
        
        if (existingClientIndex >= 0) {
          const newClients = [...clients];
          newClients[existingClientIndex] = clientData;
          setClients(newClients);
        } else {
          setClients([...clients, clientData]);
        }
      }
  };

  // PDF Export Handler
  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || !doc.items) return;
      const newItems = [...doc.items];
      const [draggedItem] = newItems.splice(draggedItemIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      updateDoc({ ...doc, items: newItems });
      setDraggedItemIndex(null);
  };

  const handleAddItem = (item?: Partial<InvoiceItem>) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: item?.description || 'New Item',
      quantity: item?.quantity || 1,
      unitType: item?.unitType || 'ea',
      price: item?.price || 0,
    };
    const newItems = [...(doc.items || []), newItem];
    const totals = calculateTotals(newItems);
    updateDoc({ ...doc, items: newItems, ...totals });
    setShowAddMenu(false); triggerHaptic('light');
  };

  const addDepositTerm = () => {
      const depositAmount = (doc.total || 0) * 0.5;
      handleAddItem({
        description: 'Deposit Due Now (50%)',
        price: depositAmount,
      });
      setSuggestDeposit(false);
  };

  const handleAddTemplate = (template: TemplateBlock) => {
      if (template.type === DocType.INVOICE && template.items) {
          // Add invoice items
          const newItems = [...(doc.items || [])];
          template.items.forEach((tItem, index) => {
              newItems.push({ 
                  ...tItem, 
                  id: `${Date.now()}-${index}`,
                  templateBlockName: template.name
              });
          });
          const totals = calculateTotals(newItems);
          updateDoc({ ...doc, items: newItems, ...totals });
      } else if (template.type === DocType.CONTRACT && template.clauses) {
          // Add contract clauses
          const existingClauses = doc.clauses || [];
          const newClauses = [...existingClauses];
          const timestamp = Date.now();
          
          template.clauses.forEach((clause, index) => {
              newClauses.push({
                  ...clause,
                  id: `${timestamp}-${index}`,
                  order: existingClauses.length + index + 1
              });
          });
          
          updateDoc({ ...doc, clauses: newClauses });
      }
      setShowAddMenu(false); triggerHaptic('success');
  };

  // Allow save directly
  const handleSave = () => { 
      onSave(doc); 
      triggerHaptic('success'); 
  };
  
  const handleShare = async () => {
         setShowSendEmailModal(true);
  };

  const handleExportPDF = async (download: boolean = false) => {
    setIsExportingPDF(true);
    setShowPDFMenu(false);
    try {
      // Use extractInvoiceHTML to clean up the content (convert inputs to text, remove buttons)
      const htmlContent = extractInvoiceHTML(invoiceRef.current);
      
      if (download) {
        // Generate and download PDF
        await generateInvoicePDF(htmlContent, doc, profile, { download: true });
      } else {
        // Email PDF - get blob for email service
        const pdfBlob = await generateInvoicePDF(htmlContent, doc, profile, { returnBlob: true });
        if (pdfBlob) {
          // PDF is ready to be sent via email
          setShowSendEmailModal(true);
        }
      }
      triggerHaptic('success');
    } catch (error) {
      console.error('PDF export error:', error);
      triggerHaptic('heavy');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSendInvoiceEmail = async () => {
    setEmailError(null);
    
    if (!doc.client.email) {
      setEmailError('Client email is required');
      return;
    }

    if (!isValidEmail(doc.client.email)) {
      setEmailError('Invalid email address');
      return;
    }

    if (!profile.email) {
      setEmailError('Your email is not configured. Please update your profile.');
      return;
    }

    setIsSendingEmail(true);
    try {
      // Use extractInvoiceHTML to clean up the content
      const htmlContent = extractInvoiceHTML(invoiceRef.current);

      // Generate PDF as base64
      const pdfBase64 = await generateInvoicePDFBase64(htmlContent, doc, profile);

      // Send email with PDF attachment
      const result = await sendInvoiceEmail(
        doc.client.email,
        doc.client.businessName || 'Client',
        profile.email,
        profile.companyName || 'Invoice Sender',
        doc.id.slice(-6),
        pdfBase64,
        emailMessage
      );

      if (result.success) {
        triggerHaptic('success');
        const updated = { 
          ...doc, 
          status: 'Sent' as DocStatus, 
          contractId: selectedContractId || undefined,
          shareableLink: `${window.location.origin}#/view/${doc.id}`
        };
        updateDoc(updated);
        onSave(updated);
        
        alert(`Invoice sent successfully to ${doc.client.email}!`);
        setShowSendEmailModal(false);
        setEmailMessage('');
        setSelectedContractId(null);
      } else {
        setEmailError(result.error || 'Failed to send email');
        triggerHaptic('heavy');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      setEmailError(error instanceof Error ? error.message : 'Failed to send email');
      triggerHaptic('heavy');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <React.Fragment>
    <div className="max-w-screen-lg mx-auto py-4 px-4">
      <div className="flex gap-4 mb-6 justify-between items-center print:hidden">
        <div className="flex gap-2 items-center flex-wrap">
          <button onClick={() => setZoom(Math.max(0.25, zoom - 0.1))} className="px-3 py-2 border-2 border-grit-dark hover:bg-black hover:text-white transition-colors font-bold">-</button>
          <span className="font-mono font-bold">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(1, zoom + 0.1))} className="px-3 py-2 border-2 border-grit-dark hover:bg-black hover:text-white transition-colors font-bold">+</button>
          <button onClick={() => setShowStyleMenu(!showStyleMenu)} className="px-4 py-2 border-2 border-grit-dark bg-grit-primary hover:bg-grit-dark hover:text-white transition-colors font-bold flex items-center gap-2"><Palette size={18}/>Styles</button>
          <div className="flex border-2 border-grit-dark rounded-lg overflow-hidden bg-white">
            <button 
              onClick={() => setViewMode('Draft')} 
              className={`px-4 py-2 font-bold transition-colors flex items-center gap-2 ${viewMode === 'Draft' ? 'bg-grit-dark text-white' : 'hover:bg-gray-100'}`}
            >
              <Edit3 size={16} /> Draft
            </button>
            <div className="w-px bg-grit-dark"></div>
            <button 
              onClick={() => setViewMode('Final')} 
              className={`px-4 py-2 font-bold transition-colors flex items-center gap-2 ${viewMode === 'Final' ? 'bg-grit-dark text-white' : 'hover:bg-gray-100'}`}
            >
              <Eye size={16} /> Preview
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddMenu(true)} className="px-4 py-2 border-2 border-grit-dark bg-grit-secondary hover:bg-grit-dark hover:text-white transition-colors font-bold flex items-center gap-2"><Plus size={18}/>Add Block</button>
          <button onClick={handleSave} className="px-4 py-2 border-2 border-grit-dark bg-grit-primary hover:bg-grit-dark hover:text-white transition-colors font-bold flex items-center gap-2"><Save size={18}/>Save</button>
          <button onClick={handleShare} className="px-4 py-2 border-2 border-grit-dark hover:bg-black hover:text-white transition-colors font-bold flex items-center gap-2"><Share2 size={18}/>Share</button>
          <div className="relative">
            <button 
              onClick={() => setShowPDFMenu(!showPDFMenu)} 
              disabled={isExportingPDF}
              className="px-4 py-2 border-2 border-grit-dark bg-grit-primary hover:bg-grit-dark hover:text-white transition-colors font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={18}/>{isExportingPDF ? 'Exporting...' : 'Export'}
            </button>
            {showPDFMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border-2 border-grit-dark shadow-grit z-20 min-w-48">
                <button 
                  onClick={() => handleExportPDF(true)}
                  className="w-full text-left px-4 py-2 hover:bg-grit-primary font-bold border-b border-gray-200 flex items-center gap-2"
                >
                  <Download size={16} /> Download PDF
                </button>
                <button 
                  onClick={() => {
                    setShowSendEmailModal(true);
                    setShowPDFMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-grit-primary font-bold flex items-center gap-2"
                >
                  <Mail size={16} /> Email as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showStyleMenu && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2 print:hidden bg-gray-50 p-4 border-2 border-grit-dark">
          {doc.type === DocType.INVOICE && INVOICE_THEMES.map(theme => (
            <button 
              key={theme.id} 
              onClick={() => { 
                updateDocField('theme', theme.id); 
                setShowStyleMenu(false); 
                triggerHaptic('light'); 
              }} 
              className={`p-3 border-2 flex flex-col items-center gap-2 text-center transition-all ${doc.theme === theme.id ? 'border-grit-primary bg-grit-primary' : 'border-gray-300 hover:border-grit-dark'}`}
            >
              <div className="w-full h-12">{theme.el}</div>
              <p className="text-xs font-bold">{theme.name}</p>
              <p className="text-xs text-gray-500">{theme.description}</p>
            </button>
          ))}
          {doc.type === DocType.CONTRACT && CONTRACT_THEMES.map(theme => (
            <button 
              key={theme.id} 
              onClick={() => { 
                updateDocField('contractTheme', theme.id); 
                setShowStyleMenu(false); 
                triggerHaptic('light'); 
              }} 
              className={`p-3 border-2 flex flex-col items-center gap-2 text-center transition-all ${doc.contractTheme === theme.id ? 'border-grit-primary bg-grit-primary' : 'border-gray-300 hover:border-grit-dark'}`}
            >
              <div className="w-full h-12">{theme.el}</div>
              <p className="text-xs font-bold">{theme.name}</p>
              <p className="text-xs text-gray-500">{theme.description}</p>
            </button>
          ))}
        </div>
      )}

      <div ref={invoiceRef} className={`bg-white print:border-0 print:shadow-none print:overflow-visible relative ${viewMode === 'Final' ? 'border-0 shadow-2xl' : 'border-4 border-grit-dark'}`} style={{ minHeight: '1123px', zoom: `${zoom}`, transformOrigin: 'top center' }}>
        {/* Preview mode styling - simulates print appearance */}
        {viewMode === 'Final' && (
          <style dangerouslySetInnerHTML={{ __html: `
            .preview-mode button,
            .preview-mode input:not([readonly]),
            .preview-mode textarea:not([readonly]),
            .preview-mode select,
            .preview-mode .print\\:hidden {
              display: none !important;
            }
            .preview-mode input[readonly],
            .preview-mode textarea[readonly] {
              border: none !important;
              background: transparent !important;
              padding: 0 !important;
            }
          ` }} />
        )}
        
        <div className={viewMode === 'Final' ? 'preview-mode' : ''}>
        {doc.type === DocType.CONTRACT ? (
          <ContractThemeRenderer
            doc={doc}
            profile={profile}
            viewMode={viewMode}
            updateDoc={updateDoc}
            onAddClause={() => {
              const newClause: ContractClause = {
                id: Date.now().toString(),
                title: 'New Clause',
                content: 'Enter clause content here...',
                order: (doc.clauses?.length || 0) + 1,
                required: false
              };
              updateDoc({ ...doc, clauses: [...(doc.clauses || []), newClause] });
              triggerHaptic('light');
            }}
            onDeleteClause={(id: string) => {
              if (doc.clauses) {
                const newClauses = doc.clauses.filter(c => c.id !== id);
                updateDoc({ ...doc, clauses: newClauses });
                triggerHaptic('heavy');
              }
            }}
          />
        ) : (
          <InvoiceThemeRenderer
            doc={doc}
            profile={profile}
            viewMode={viewMode}
            updateDoc={updateDoc}
            onAddItem={() => handleAddItem()}
            onDeleteItem={handleDeleteItem}
            onToggleSelection={toggleSelection}
            selectedItems={selectedItems}
            calculateTotals={calculateTotals}
          />
        )}
        </div>
        
        {/* Notes & Due Date Section - Integrated into the canvas flow */}
        {viewMode === 'Draft' && doc.type === DocType.INVOICE && (
          <div className="p-8 border-t-4 border-dashed border-gray-200 mt-auto print:hidden bg-gray-50 m-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-grit-dark font-bold mb-2 text-sm uppercase tracking-wider">Payment Due Date</label>
                <input 
                  type="date" 
                  value={doc.dueDate || ''} 
                  onChange={e => updateDocField('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-grit-primary focus:outline-none font-bold bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">You'll get notified when this date passes</p>
              </div>
              
              <div>
                <label className="block text-grit-dark font-bold mb-2 text-sm uppercase tracking-wider">Invoice Notes</label>
                <TextArea 
                  value={doc.notes || ''} 
                  onChange={e => updateDocField('notes', e.target.value)}
                  placeholder="Add payment terms, thanks message, or special instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-grit-primary focus:outline-none bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">Appears on final invoice</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Old Notes Section Removed */}
    </div>

    {viewMode === 'Draft' && (
      <div className="max-w-screen-lg mx-auto mt-6 flex gap-2 print:hidden flex-wrap px-4">
          {doc.status !== 'Paid' && <button onClick={() => handleStatusChange('Paid')} className="px-4 py-2 border-2 border-green-600 bg-green-100 hover:bg-green-600 hover:text-white transition-colors font-bold text-green-700">Mark as Paid</button>}
          {doc.items && doc.items.length > 0 && <button onClick={() => setShowBatchModal(true)} disabled={selectedItems.size === 0} className="px-4 py-2 border-2 border-grit-dark disabled:opacity-50 hover:bg-black hover:text-white transition-colors font-bold flex items-center gap-2"><Box size={18}/>Save as Block ({selectedItems.size})</button>}
          {doc.items && doc.items.length > 0 && <button onClick={handleBatchDelete} disabled={selectedItems.size === 0} className="px-4 py-2 border-2 border-red-500 text-red-500 disabled:opacity-50 hover:bg-red-500 hover:text-white transition-colors font-bold flex items-center gap-2"><Trash2 size={18}/>Delete ({selectedItems.size})</button>}
      </div>
    )}

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 border-4 border-grit-dark max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Save Selected Items as Block</h3>
            <input value={batchBlockName} onChange={e => setBatchBlockName(e.target.value)} placeholder="Block name (e.g., 'Standard Repairs')" className="w-full border-2 border-grit-dark p-2 mb-4 focus:outline-none focus:bg-yellow-50" />
            <div className="flex gap-2">
              <button onClick={handleBatchCreateBlock} disabled={!batchBlockName} className="flex-1 px-4 py-2 border-2 border-grit-dark bg-grit-primary disabled:opacity-50 hover:bg-grit-dark hover:text-white transition-colors font-bold">Create Block</button>
              <button onClick={() => setShowBatchModal(false)} className="flex-1 px-4 py-2 border-2 border-grit-dark hover:bg-black hover:text-white transition-colors font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showKaChing && <div className="fixed inset-0 flex items-center justify-center pointer-events-none"><DollarSign size={96} className="text-grit-primary animate-bounce font-black" /></div>}
      {suggestDeposit && <div className="fixed bottom-4 right-4 bg-grit-primary border-4 border-grit-dark p-4 max-w-xs print:hidden"><p className="font-bold mb-2">High invoice amount detected</p><button onClick={addDepositTerm} className="w-full px-3 py-2 border-2 border-grit-dark bg-grit-dark text-white hover:bg-white hover:text-grit-dark transition-colors font-bold">Add 50% Deposit Term</button></div>}

      {showAddMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center print:hidden">
          <div className="bg-white p-6 border-4 border-grit-dark max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {potentialTemplate 
                  ? `Select ${doc.type === DocType.CONTRACT ? 'Clauses' : 'Items'} to Add`
                  : `Add ${doc.type === DocType.CONTRACT ? 'Clauses' : 'Line Items'} or Template`
                }
              </h3>
              <button onClick={() => { setShowAddMenu(false); setPotentialTemplate(null); setSelectedTemplateItems(new Set()); }} className="text-2xl font-bold hover:text-red-500">×</button>
            </div>
            
            {potentialTemplate ? (
              <div>
                {templates.find(t => t.id === potentialTemplate) && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-bold text-gray-700">{templates.find(t => t.id === potentialTemplate)?.name}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const template = templates.find(t => t.id === potentialTemplate);
                            if (doc.type === DocType.CONTRACT && template?.clauses) {
                              setSelectedTemplateItems(new Set(template.clauses.map(c => c.id)));
                            } else if (template?.items) {
                              setSelectedTemplateItems(new Set(template.items.map(i => i.id)));
                            }
                          }}
                          className="text-xs px-3 py-1 border border-grit-dark hover:bg-grit-primary transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setSelectedTemplateItems(new Set())}
                          className="text-xs px-3 py-1 border border-grit-dark hover:bg-gray-200 transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    
                    {/* FOR CONTRACTS: Show Clauses */}
                    {doc.type === DocType.CONTRACT && (
                      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto border-2 border-gray-200 p-4">
                        {templates.find(t => t.id === potentialTemplate)?.clauses?.map(clause => (
                          <label key={clause.id} className="flex items-start gap-3 p-4 border-2 border-gray-300 hover:border-grit-primary hover:bg-gray-50 cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={selectedTemplateItems.has(clause.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedTemplateItems);
                                if (e.target.checked) newSet.add(clause.id);
                                else newSet.delete(clause.id);
                                setSelectedTemplateItems(newSet);
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-sm mb-1">{clause.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-2">{clause.content.substring(0, 150)}...</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{clause.category}</span>
                                {clause.required && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Required</span>}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {/* FOR INVOICES: Show Items */}
                    {doc.type === DocType.INVOICE && (
                      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto border-2 border-gray-200 p-4">
                        {templates.find(t => t.id === potentialTemplate)?.items?.map(item => (
                          <label key={item.id} className="flex items-start gap-3 p-3 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTemplateItems.has(item.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedTemplateItems);
                                if (e.target.checked) newSet.add(item.id);
                                else newSet.delete(item.id);
                                setSelectedTemplateItems(newSet);
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-sm">{item.description}</p>
                              <p className="text-xs text-gray-600">{item.quantity} {item.unitType} @ {item.price}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const template = templates.find(t => t.id === potentialTemplate);
                          
                          if (doc.type === DocType.CONTRACT && template?.clauses) {
                            // Add selected clauses to contract
                            const clausesToAdd = template.clauses.filter(c => selectedTemplateItems.has(c.id));
                            const existingClauses = doc.clauses || [];
                            const timestamp = Date.now();
                            
                            const newClauses = [...existingClauses];
                            clausesToAdd.forEach((clause, index) => {
                              newClauses.push({
                                ...clause,
                                id: `${timestamp}-${index}`,
                                order: existingClauses.length + index + 1
                              });
                            });
                            
                            updateDoc({ ...doc, clauses: newClauses });
                            triggerHaptic('success');
                          } else if (template?.items) {
                            // Add selected items to invoice
                            const itemsToAdd = template.items.filter(i => selectedTemplateItems.has(i.id));
                            const newItems = [...(doc.items || [])];
                            const timestamp = Date.now();
                            
                            itemsToAdd.forEach((item, index) => {
                              newItems.push({
                                ...item,
                                id: `${timestamp}-${index}`,
                                templateBlockName: template.name
                              });
                            });
                            
                            const totals = calculateTotals(newItems);
                            updateDoc({ ...doc, items: newItems, ...totals });
                            triggerHaptic('success');
                          }
                          
                          setShowAddMenu(false);
                          setPotentialTemplate(null);
                          setSelectedTemplateItems(new Set());
                        }}
                        disabled={selectedTemplateItems.size === 0}
                        className="flex-1 px-4 py-2 border-2 border-grit-dark bg-grit-primary disabled:opacity-50 hover:bg-grit-dark hover:text-white transition-colors font-bold"
                      >
                        Add {selectedTemplateItems.size} {doc.type === DocType.CONTRACT ? 'Clauses' : 'Items'}
                      </button>
                      <button
                        onClick={() => { setPotentialTemplate(null); setSelectedTemplateItems(new Set()); }}
                        className="flex-1 px-4 py-2 border-2 border-grit-dark hover:bg-black hover:text-white transition-colors font-bold"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {doc.type === DocType.INVOICE && (
                  <button onClick={() => handleAddItem()} className="w-full px-4 py-3 border-2 border-grit-dark bg-grit-primary hover:bg-grit-dark hover:text-white transition-colors font-bold text-left">+ Add Blank Line Item</button>
                )}
                {Object.entries(groupedTemplates).map(([category, templateList]: [string, TemplateBlock[]]) => {
                  // Filter templates to match current document type
                  const matchingTemplates = templateList.filter(t => t.type === doc.type);
                  if (matchingTemplates.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <p className="font-bold text-sm text-gray-500 uppercase mb-2 pl-2">{category}</p>
                      {matchingTemplates.map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => { 
                            setPotentialTemplate(t.id); 
                            if (doc.type === DocType.CONTRACT && t.clauses) {
                              setSelectedTemplateItems(new Set(t.clauses.map(c => c.id)));
                            } else {
                              setSelectedTemplateItems(new Set(t.items?.map(i => i.id) || []));
                            }
                          }} 
                          className="w-full text-left px-4 py-2 border border-gray-300 hover:bg-gray-100 transition-colors mb-2"
                        >
                          <p className="font-bold">{t.name}</p>
                          <p className="text-xs text-gray-600">
                            {doc.type === DocType.CONTRACT 
                              ? `${t.clauses?.length || 0} clauses`
                              : `${t.items?.length || 0} items`
                            }
                          </p>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Sending Modal */}
      {showSendEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-grit-dark shadow-grit max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Mail size={28} /> Send Invoice</h2>
              <button onClick={() => setShowSendEmailModal(false)} className="text-gray-400 hover:text-grit-dark"><X size={24} /></button>
            </div>

            {emailError && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded">
                <p className="text-sm text-red-800 font-bold">{emailError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">From (Your Email)</label>
                <div className="px-4 py-2 border-2 border-gray-300 bg-gray-50 rounded">
                  {profile.email || 'guest@gritdocs.com'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">To (Client Email) *</label>
                <Input 
                  value={doc.client.email} 
                  onChange={e => {
                    updateDoc({ ...doc, client: { ...doc.client, email: e.target.value } });
                    setEmailError(null);
                  }}
                  placeholder="client@example.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Invoice Number</label>
                <div className="px-4 py-2 border-2 border-gray-300 bg-gray-50 rounded">
                  #{doc.id.slice(-6)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Custom Message (Optional)</label>
                <TextArea 
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  placeholder="Add a personal message to your client..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:border-grit-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Attach Contract (Optional)</label>
                <select 
                  value={selectedContractId || ''} 
                  onChange={e => setSelectedContractId(e.target.value || null)} 
                  className="w-full px-4 py-2 border-2 border-gray-300"
                >
                  <option value="">No Contract</option>
                  {templates.filter(t => t.type === DocType.CONTRACT).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {selectedContractId && (
                <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded">
                  <p className="text-sm text-blue-900 flex items-center gap-2"><Check size={16} className="text-green-600" /> <strong>Contract selected:</strong> {templates.find(t => t.id === selectedContractId)?.name}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setShowSendEmailModal(false);
                    setEmailMessage('');
                    setEmailError(null);
                  }} 
                  className="flex-1 px-4 py-2 border-2 border-grit-dark hover:bg-black hover:text-white transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvoiceEmail}
                  disabled={!doc.client.email || isSendingEmail}
                  className="flex-1 px-4 py-2 border-2 border-grit-dark bg-grit-primary disabled:opacity-50 hover:bg-grit-dark hover:text-white transition-colors font-bold"
                >
                  {isSendingEmail ? (
                    <><Loader className="animate-spin" size={16} /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Invoice</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default CanvasScreen;
