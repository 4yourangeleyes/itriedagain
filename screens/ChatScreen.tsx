

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle2, Package, User, FileText, Sparkles, LayoutGrid, PenTool, Wrench, Zap, Box, ShoppingCart, Type } from 'lucide-react';
import { Button } from '../components/Button';
import { Client, DocType, DocumentData, UserProfile, IWindow, TemplateBlock, InvoiceItem } from '../types';
import { triggerHaptic } from '../App';
import { generateDocumentContent } from '../services/geminiService';

interface ChatScreenProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  profile: UserProfile;
  onDocGenerated: (doc: DocumentData) => void;
  templates: TemplateBlock[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateBlock[]>>;
}

const STEPS = [
    { id: 1, label: 'Client', icon: <User size={18}/> },
    { id: 2, label: 'Scope', icon: <Package size={18}/> },
    { id: 3, label: 'Review', icon: <FileText size={18}/> }
];

const UNIT_TYPES = [
    { value: 'hrs', label: 'Hours' },
    { value: 'ea', label: 'Each' },
    { value: 'm', label: 'Meters' },
    { value: 'sqm', label: 'm²' },
    { value: 'set', label: 'Set' },
];

const ChatScreen: React.FC<ChatScreenProps> = ({ clients, setClients, profile, onDocGenerated, templates, setTemplates }) => {
  const navigate = useNavigate();
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [scopeMode, setScopeMode] = useState<'manual' | 'napkin'>('manual');

  // Job Data
  const [clientName, setClientName] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [jobItems, setJobItems] = useState<InvoiceItem[]>([]);
  
  // Napkin Sketch State
  const [napkinText, setNapkinText] = useState('');
  const [isProcessingNapkin, setIsProcessingNapkin] = useState(false);

  // Manual Entry State
  const [tempItemDesc, setTempItemDesc] = useState('');
  const [tempItemPrice, setTempItemPrice] = useState('');
  const [tempItemQty, setTempItemQty] = useState('1');
  const [tempItemUnit, setTempItemUnit] = useState('ea');
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Template Block Selection State
  const [selectedTemplateItems, setSelectedTemplateItems] = useState<Set<string>>(new Set());

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Group Templates by Category
  const groupedTemplates = templates.reduce((acc, t) => {
      if (t.type !== DocType.INVOICE) return acc;
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
  }, {} as Record<string, TemplateBlock[]>);

  // Client Filter Logic
  useEffect(() => {
      if (clientName && step === 1) {
          const matches = clients.filter(c => c.businessName.toLowerCase().includes(clientName.toLowerCase()));
          setFilteredClients(matches);
      } else {
          setFilteredClients([]);
      }
  }, [clientName, clients, step]);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; recognition.interimResults = true; recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) finalTranscript += event.results[i][0].transcript;
        if (finalTranscript) {
           if (step === 2 && scopeMode === 'manual') setTempItemDesc(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
           if (step === 2 && scopeMode === 'napkin') setNapkinText(prev => prev + ' ' + finalTranscript);
           if (step === 1) setClientName(finalTranscript.replace(/\.$/, "")); 
        }
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [step, scopeMode]);

  const toggleRecording = () => {
    triggerHaptic('heavy');
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); } 
    else { recognitionRef.current?.start(); setIsRecording(true); }
  };

  const addItem = (desc?: string, price?: number, qty?: number, unit?: string, blockName?: string) => {
      const d = desc || tempItemDesc;
      if (!d) return;
      const newItem: InvoiceItem = {
          id: Date.now().toString() + Math.random(),
          description: d,
          price: price !== undefined ? price : (parseFloat(tempItemPrice) || 0),
          quantity: qty !== undefined ? qty : (parseFloat(tempItemQty) || 1),
          unitType: unit || tempItemUnit,
          templateBlockName: blockName // Add template block name
      };
      setJobItems(prev => [...prev, newItem]);
      
      // Reset manual fields
      setTempItemDesc(''); setTempItemPrice(''); setTempItemQty('1');
      triggerHaptic('success');
  };

  const processNapkinSketch = async () => {
      if (!napkinText) return;
      setIsProcessingNapkin(true);
      try {
          const result = await generateDocumentContent(napkinText, DocType.INVOICE, clientName, profile.companyName);
          if (result.items) {
              const newItems = result.items.map((i: any) => ({...i, id: Math.random().toString()}));
              setJobItems(prev => [...prev, ...newItems]);
              setNapkinText('');
              setScopeMode('manual');
              triggerHaptic('success');
          }
      } catch (e) {
          alert("Could not parse napkin sketch. Please try again.");
      } finally {
          setIsProcessingNapkin(false);
      }
  };

  const toggleTemplateItemSelection = (templateId: string, itemId: string) => {
      const key = `${templateId}-${itemId}`;
      setSelectedTemplateItems(prev => {
          const newSet = new Set(prev);
          if (newSet.has(key)) {
              newSet.delete(key);
          } else {
              newSet.add(key);
          }
          return newSet;
      });
  };

  const addSelectedTemplateItems = () => {
      const itemsToAdd: InvoiceItem[] = [];
      let idCounter = 0;
      
      selectedTemplateItems.forEach(key => {
          const [templateId, itemId] = key.split('-');
          const template = templates.find(t => t.id === templateId);
          if (template && template.items) {
              const item = template.items.find(i => i.id === itemId);
              if (item) {
                  itemsToAdd.push({
                      ...item,
                      id: `${Date.now()}-${idCounter++}`,
                      templateBlockName: template.name // Set the template block name!
                  });
              }
          }
      });
      
      if (itemsToAdd.length > 0) {
          setJobItems(prev => [...prev, ...itemsToAdd]);
          setSelectedTemplateItems(new Set()); // Clear selection
          triggerHaptic('success');
      }
  };

  const addAllItemsFromTemplate = (template: TemplateBlock) => {
      if (template.items && template.items.length > 0) {
          const itemsToAdd = template.items.map((item, index) => ({
              ...item,
              id: `${Date.now()}-${index}`,
              templateBlockName: template.name
          }));
          setJobItems(prev => [...prev, ...itemsToAdd]);
          triggerHaptic('success');
      }
  };

  const handleCreateInvoice = () => {
      if (!clientName) return;
      let client = clients.find(c => c.businessName.toLowerCase() === clientName.toLowerCase());
      if (!client) {
          client = { id: Date.now().toString(), businessName: clientName, email: '' };
          setClients(prev => [...prev, client!]);
      }
      const subtotal = jobItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      const taxAmount = profile.taxEnabled && profile.taxRate ? (subtotal * (profile.taxRate / 100)) : 0;
      
      const newDoc: DocumentData = {
          id: Date.now().toString(),
          type: DocType.INVOICE,
          status: 'Draft',
          title: `Invoice for ${clientName}`,
          client: client,
          date: new Date().toLocaleDateString(),
          currency: profile.currency,
          theme: 'swiss',
          items: jobItems,
          subtotal: subtotal,
          taxTotal: taxAmount,
          total: subtotal + taxAmount
      };
      onDocGenerated(newDoc);
      navigate('/canvas');
  };

  const createBlankDocument = (docType: DocType) => {
      const newDoc: DocumentData = {
          id: Date.now().toString(),
          type: docType,
          status: 'Draft',
          title: docType === DocType.INVOICE ? 'New Invoice' : 'New Contract',
          client: { id: 'temp', businessName: 'Client Name', email: '' },
          date: new Date().toLocaleDateString(),
          currency: profile.currency,
          theme: 'swiss',
          items: docType === DocType.INVOICE ? [] : undefined,
          subtotal: 0,
          taxTotal: 0,
          total: 0,
          clauses: docType === DocType.CONTRACT ? [] : undefined
      };
      onDocGenerated(newDoc);
      navigate('/canvas');
  };

  // --- Render Steps ---

  const renderStep1_Client = () => (
      <div className="animate-in slide-in-from-right-8 fade-in duration-300">
          <label className="block text-2xl font-bold mb-4 tracking-tight">Who is this for?</label>
          <div className="relative mb-6">
            <input 
                type="text" placeholder="Enter Client Name..." 
                className="w-full text-3xl font-bold bg-transparent border-b-4 border-grit-dark focus:border-grit-primary focus:outline-none py-4 placeholder-gray-300 font-draft"
                value={clientName} onChange={e => setClientName(e.target.value)} autoFocus
            />
             <button className={`absolute right-2 top-4 text-gray-400 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} onClick={toggleRecording}><Mic size={32} /></button>
          </div>
          {filteredClients.length > 0 && (
               <div className="bg-white border-2 border-grit-dark shadow-grit rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    {filteredClients.map(c => (
                        <button key={c.id} onClick={() => {setClientName(c.businessName); setFilteredClients([]);}} className="w-full text-left p-4 hover:bg-grit-bg font-bold border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-grit-secondary text-white rounded-full flex items-center justify-center text-xs">{c.businessName.charAt(0)}</div>
                            {c.businessName}
                        </button>
                    ))}
               </div>
          )}
      </div>
  );

  const renderStep2_Scope = () => (
      <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex flex-col h-full">
          <label className="block text-2xl font-bold mb-4 tracking-tight">Add Line Items</label>
          
          {/* Scope Mode Tabs */}
          <div className="flex gap-2 mb-4 border-b-2 border-gray-200 pb-1">
              <button onClick={() => setScopeMode('manual')} className={`px-3 py-1 font-bold rounded-t-lg transition-colors ${scopeMode === 'manual' ? 'bg-grit-dark text-white' : 'text-gray-400'}`}>Detailed</button>
              <button onClick={() => setScopeMode('napkin')} className={`px-3 py-1 font-bold rounded-t-lg transition-colors ${scopeMode === 'napkin' ? 'bg-grit-dark text-white' : 'text-gray-400'}`}>Napkin Sketch</button>
          </div>

          {/* MANUAL MODE */}
          {scopeMode === 'manual' && (
              <div className="mb-4">
                  <div className="bg-grit-white border-2 border-grit-dark p-4 shadow-sm mb-4 rounded-lg relative animate-in fade-in">
                      <div className="mb-4 relative">
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Description</label>
                          <input className="w-full p-2 text-lg font-bold border-b-2 border-gray-200 focus:border-grit-primary focus:outline-none bg-transparent" placeholder="e.g. Copper Pipe Installation" value={tempItemDesc} onChange={e => setTempItemDesc(e.target.value)} />
                          <button className={`absolute right-0 bottom-2 text-gray-400 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} onClick={toggleRecording}><Mic size={20} /></button>
                      </div>
                      <div className="flex gap-3 mb-4">
                          <div className="w-20"><label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Qty</label><input className="w-full p-2 font-mono text-lg border-b-2 border-gray-200 focus:border-grit-primary focus:outline-none bg-transparent" type="number" value={tempItemQty} onChange={e => setTempItemQty(e.target.value)} /></div>
                          <div className="flex-1"><label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Unit</label><select className="w-full p-2 text-lg border-b-2 border-gray-200 focus:border-grit-primary focus:outline-none bg-transparent" value={tempItemUnit} onChange={e => setTempItemUnit(e.target.value)}>{UNIT_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
                          <div className="w-32"><label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Price</label><input className="w-full p-2 font-mono text-lg border-b-2 border-gray-200 focus:border-grit-primary focus:outline-none bg-transparent text-right" type="number" value={tempItemPrice} onChange={e => setTempItemPrice(e.target.value)} /></div>
                      </div>
                      <Button size="md" onClick={() => addItem()} disabled={!tempItemDesc} icon={<Plus size={18}/>} className="w-full shadow-lg">Add Item</Button>
                  </div>

                   {/* Templates Toggle */}
                   <button onClick={() => setShowTemplates(!showTemplates)} className="text-sm font-bold text-grit-secondary underline mb-2">
                       {showTemplates ? 'Hide Templates' : 'Use Templates / Blocks'}
                   </button>

                   {showTemplates && (
                       <div className="space-y-4 overflow-y-auto max-h-96 pr-2 custom-scrollbar bg-gray-50 p-4 border-2 border-gray-200 rounded-lg">
                          {Object.keys(groupedTemplates).length > 0 ? (
                               <>
                                   {Object.entries(groupedTemplates).map(([category, temps]: [string, TemplateBlock[]]) => (
                                       <div key={category} className="mb-4">
                                           <div className="text-xs font-black uppercase text-gray-500 mb-3 tracking-wider bg-gray-200 px-2 py-1 rounded">{category}</div>
                                           {temps.map(t => (
                                               <div key={t.id} className="mb-4 bg-white border-2 border-grit-dark rounded-lg p-3 shadow-sm">
                                                   <div className="flex items-center justify-between mb-2">
                                                       <div className="font-bold text-sm text-grit-primary uppercase tracking-wide">{t.name}</div>
                                                       {t.items && t.items.length > 0 && (
                                                           <button
                                                               onClick={() => {
                                                                   // Select all items from this template
                                                                   const newSelected = new Set(selectedTemplateItems);
                                                                   t.items.forEach(item => {
                                                                       const key = `${t.id}-${item.id}`;
                                                                       newSelected.add(key);
                                                                   });
                                                                   setSelectedTemplateItems(newSelected);
                                                                   triggerHaptic('light');
                                                               }}
                                                               className="text-xs font-bold bg-grit-secondary text-white px-3 py-1 rounded hover:bg-grit-dark transition-colors"
                                                           >
                                                               Select All
                                                           </button>
                                                       )}
                                                   </div>
                                                   {t.items && t.items.length > 0 ? (
                                                       <div className="space-y-1">
                                                           {t.items.map(item => {
                                                               const itemKey = `${t.id}-${item.id}`;
                                                               const isSelected = selectedTemplateItems.has(itemKey);
                                                               return (
                                                                   <label 
                                                                       key={item.id} 
                                                                       className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-colors ${
                                                                           isSelected ? 'bg-grit-primary/20 border-l-4 border-grit-primary' : 'hover:bg-gray-50'
                                                                       }`}
                                                                   >
                                                                       <input 
                                                                           type="checkbox"
                                                                           checked={isSelected}
                                                                           onChange={() => toggleTemplateItemSelection(t.id, item.id)}
                                                                           className="mt-1 w-4 h-4 text-grit-primary border-2 border-gray-300 rounded focus:ring-grit-primary"
                                                                       />
                                                                       <div className="flex-1 text-xs">
                                                                           <div className="font-medium text-gray-900">{item.description}</div>
                                                                           <div className="text-gray-500 mt-0.5">
                                                                               {item.quantity} {item.unitType} × {profile.currency}{item.price.toFixed(2)} = {profile.currency}{(item.quantity * item.price).toFixed(2)}
                                                                           </div>
                                                                       </div>
                                                                   </label>
                                                               );
                                                           })}
                                                       </div>
                                                   ) : (
                                                       <p className="text-xs text-gray-400 italic">No items in this template</p>
                                                   )}
                                               </div>
                                           ))}
                                       </div>
                                   ))}
                                   
                                   {/* Add Selected Button */}
                                   {selectedTemplateItems.size > 0 && (
                                       <div className="sticky bottom-0 bg-white border-t-2 border-grit-dark pt-3 pb-2">
                                           <Button 
                                               onClick={addSelectedTemplateItems}
                                               className="w-full bg-grit-primary font-black"
                                               icon={<CheckCircle2 size={18} />}
                                           >
                                               Add {selectedTemplateItems.size} Selected Item{selectedTemplateItems.size > 1 ? 's' : ''}
                                           </Button>
                                       </div>
                                   )}
                               </>
                          ) : (
                              <p className="text-gray-400 text-sm italic">No templates available. Create them in Settings.</p>
                          )}
                      </div>
                   )}
              </div>
          )}

          {/* NAPKIN SKETCH MODE */}
          {scopeMode === 'napkin' && (
              <div className="mb-6 animate-in fade-in">
                  <p className="text-xs text-gray-500 mb-2 font-bold">Type or speak messily. AI will fix it.</p>
                  <div className="relative">
                      <textarea 
                        className="w-full h-32 p-4 font-draft text-xl border-2 border-grit-dark rounded focus:ring-2 focus:ring-grit-primary resize-none bg-yellow-50"
                        placeholder="e.g. Fixed toilet valve $50, 2 hours labor at 80/hr, and drove 20km..."
                        value={napkinText}
                        onChange={e => setNapkinText(e.target.value)}
                      />
                      <button className={`absolute right-2 bottom-2 text-gray-400 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} onClick={toggleRecording}><Mic size={24} /></button>
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    onClick={processNapkinSketch} 
                    disabled={!napkinText || isProcessingNapkin} 
                    icon={isProcessingNapkin ? <Sparkles className="animate-spin"/> : <Sparkles />}
                  >
                      {isProcessingNapkin ? 'Magic Working...' : 'Convert to Invoice'}
                  </Button>
              </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {jobItems.length === 0 && <div className="text-center text-gray-400 mt-8 italic">No items added yet.</div>}
              {jobItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded shadow-sm hover:border-grit-dark transition-colors">
                      <div className="flex-1">
                          <p className="font-bold text-lg leading-tight">{item.description}</p>
                          <div className="text-xs text-gray-500 font-mono mt-1 flex gap-2">
                              <span className="bg-gray-100 px-1 rounded">{item.quantity} {item.unitType}</span>
                              <span>x</span>
                              <span>{profile.currency}{item.price}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-4 pl-4">
                          <span className="font-mono font-bold text-lg">{profile.currency}{(item.price * item.quantity).toFixed(2)}</span>
                          <button onClick={() => setJobItems(prev => prev.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderStep3_Review = () => {
      const subtotal = jobItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      return (
        <div className="animate-in slide-in-from-right-8 fade-in duration-300 text-center flex flex-col items-center justify-center h-full">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl animate-bounce"><Sparkles size={40} className="text-green-600"/></div>
             <h2 className="text-3xl font-bold mb-2">Ready?</h2>
             <p className="text-gray-500 mb-8 max-w-xs">Create draft for <span className="font-bold text-grit-dark">{clientName}</span>.</p>
             <div className="bg-white border-2 border-grit-dark p-6 w-full max-w-sm shadow-grit mb-8 text-left relative transform rotate-1 hover:rotate-0 transition-transform duration-300">
                 <div className="flex justify-between items-end border-b-2 border-dashed border-gray-200 pb-4 mb-4">
                     <div><p className="text-xs uppercase text-gray-400 font-bold">Client</p><p className="font-bold text-xl">{clientName}</p></div>
                     <div className="text-right"><p className="text-xs uppercase text-gray-400 font-bold">Items</p><p className="font-bold text-xl">{jobItems.length}</p></div>
                 </div>
                 <div className="flex justify-between items-center"><p className="font-bold text-gray-500">Total</p><p className="font-bold text-3xl font-mono">{profile.currency}{subtotal.toFixed(2)}</p></div>
             </div>
             <Button size="lg" className="w-full max-w-sm py-4 text-xl shadow-xl" onClick={handleCreateInvoice} icon={<CheckCircle2 />}>Create Invoice</Button>
        </div>
      );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-grit-bg">
      {/* Header / Progress */}
      <div className="bg-white border-b-2 border-grit-dark p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex gap-2">
              {STEPS.map(s => (
                  <div key={s.id} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold transition-colors ${step === s.id ? 'bg-grit-dark text-white' : step > s.id ? 'bg-green-100 text-green-700 border border-green-200' : 'text-gray-300'}`}>
                      {step > s.id ? <CheckCircle2 size={14}/> : s.icon}
                      <span className="hidden md:inline">{s.label}</span>
                  </div>
              ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => createBlankDocument(DocType.CONTRACT)} className="text-grit-secondary hover:text-grit-dark font-bold text-sm underline mr-4">New Contract</button>
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-grit-dark font-bold text-sm">Cancel</button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
          {step === 1 && renderStep1_Client()}
          {step === 2 && renderStep2_Scope()}
          {step === 3 && renderStep3_Review()}
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t-2 border-grit-dark p-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} icon={<ArrowLeft size={18}/>}>Back</Button>
          ) : (
              <div className="text-xs text-gray-400 font-bold max-w-[150px]">
                  Start a new job by adding a client.
              </div>
          )}

          {step < 3 ? (
              <Button 
                  onClick={() => setStep(s => s + 1)} 
                  disabled={(step === 1 && !clientName) || (step === 2 && jobItems.length === 0)}
                  icon={<ArrowRight size={18}/>}
                  className="shadow-grit"
              >
                  Next: {STEPS[step].label}
              </Button>
          ) : (
              <div className="text-xs text-gray-400 font-bold">
                  Review and create.
              </div>
          )}
      </div>
    </div>
  );
};

export default ChatScreen;
