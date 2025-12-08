import React from 'react';
import { DocumentData, UserProfile, InvoiceItem, InvoiceTheme } from '../types';
import { Input, TextArea } from './Input';
import { Trash2, CheckSquare, Square } from 'lucide-react';

interface InvoiceThemeRendererProps {
  doc: DocumentData;
  profile: UserProfile;
  viewMode: 'Draft' | 'Final';
  updateDoc: (doc: DocumentData) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  onToggleSelection: (id: string) => void;
  selectedItems: Set<string>;
  calculateTotals: (items: InvoiceItem[]) => { subtotal: number; taxTotal: number; total: number };
}

export const InvoiceThemeRenderer: React.FC<InvoiceThemeRendererProps> = ({
  doc,
  profile,
  viewMode,
  updateDoc,
  onAddItem,
  onDeleteItem,
  onToggleSelection,
  selectedItems,
  calculateTotals,
}) => {

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
    updateDoc({ ...doc, client: { ...doc.client, [field]: value } });
  };

  // Group items by template block name
  const groupedItems = (doc.items || []).reduce((acc, item) => {
    const blockName = item.templateBlockName || 'Items';
    if (!acc[blockName]) acc[blockName] = [];
    acc[blockName].push(item);
    return acc;
  }, {} as Record<string, InvoiceItem[]>);

  // Calculate total for a block
  const calculateBlockTotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const renderRowContent = (item: InvoiceItem, classNames: { td?: string, input?: string, tr?: string } = {}) => {
    return (
      <tr key={item.id} className={`${classNames.tr || ''} pdf-item-row`}>
        {viewMode === 'Draft' && (
          <td className={`w-12 print:hidden py-4 pr-2 align-top ${classNames.td || ''}`}>
            <div className="flex flex-col gap-2 items-center h-full pt-1">
              <button onClick={() => onToggleSelection(item.id)} className="text-gray-400 hover:text-grit-dark" title="Select">
                {selectedItems.has(item.id) ? <CheckSquare size={18} className="text-grit-primary" /> : <Square size={18} />}
              </button>
              <button 
                onClick={() => onDeleteItem(item.id)} 
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors" 
                title="Delete Line"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        )}
        {/* QUANTITY COLUMN - FIRST */}
        <td className={`py-4 text-center align-top w-20 ${classNames.td || ''}`}>
          {viewMode === 'Draft' ? (
            <Input type="number" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className={`w-full p-1 bg-transparent text-center focus:bg-yellow-100/50 border-none ${classNames.input || ''}`} />
          ) : (
            item.quantity
          )}
        </td>
        {/* UNIT COLUMN - SECOND */}
        <td className={`py-4 text-center align-top w-20 ${classNames.td || ''}`}>
          {viewMode === 'Draft' ? (
            <select
              value={item.unitType || 'ea'}
              onChange={e => updateLineItem(item.id, 'unitType', e.target.value)}
              className={`w-full p-1 bg-transparent text-center focus:bg-yellow-100/50 border-none ${classNames.input || ''}`}
            >
              <option value="ea">ea</option>
              <option value="hrs">hrs</option>
              <option value="days">days</option>
              <option value="m">m</option>
              <option value="ft">ft</option>
              <option value="sqm">m²</option>
              <option value="set">set</option>
              <option value="pts">pts</option>
            </select>
          ) : (
            item.unitType || 'ea'
          )}
        </td>
        {/* DESCRIPTION COLUMN - THIRD */}
        <td className={`py-4 align-top ${classNames.td || ''}`}>
          {viewMode === 'Draft' ? (
            <TextArea
              value={item.description}
              onChange={e => updateLineItem(item.id, 'description', e.target.value)}
              className={`w-full p-1 bg-transparent focus:bg-yellow-100/50 border-none resize-none leading-tight ${classNames.input || ''}`}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          ) : (
            <p className="font-bold text-base leading-tight whitespace-pre-wrap">{item.description}</p>
          )}
        </td>
        {/* UNIT PRICE COLUMN - FOURTH */}
        <td className={`py-4 text-right align-top w-32 ${classNames.td || ''}`}>
          {viewMode === 'Draft' ? (
            <Input type="number" value={item.price} onChange={e => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)} className={`w-full p-1 bg-transparent text-right focus:bg-yellow-100/50 border-none ${classNames.input || ''}`} />
          ) : (
            `${profile.currency}${item.price.toFixed(2)}`
          )}
        </td>
        {/* TOTAL COLUMN - FIFTH */}
        <td className={`py-4 text-right font-bold align-top w-32 ${classNames.td || ''}`}>
          {profile.currency}{(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    );
  };

  // --- THEMES ---
  // Changed h-full to min-h-full to allow growth

  const renderSwissTheme = () => (
    <div className="p-[20mm] min-h-full flex flex-col font-ui text-black bg-white">
      <header className="flex justify-between items-start mb-24 border-t-4 border-black pt-8">
        <div className="w-1/2 pr-12">
          {profile.logoUrl ? <img src={profile.logoUrl} alt="Logo" className="h-12 mb-8 object-contain" /> :
            (viewMode === 'Draft' ?
              <input value={profile.companyName} readOnly className="text-3xl font-bold tracking-tight mb-6 bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Company Name" />
              : <h1 className="text-3xl font-bold tracking-tight mb-6">{profile.companyName}</h1>
            )}
          <div className="text-sm space-y-1 font-medium text-gray-600">
            {viewMode === 'Draft' ? (
              <div className="space-y-1">
                <input value={profile.email} readOnly className="text-sm bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Email" />
                {profile.phone && <input value={profile.phone} readOnly className="text-sm bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Phone" />}
                {profile.address && <input value={profile.address} readOnly className="text-sm bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Address" />}
                {profile.registrationNumber && <input value={profile.registrationNumber} readOnly className="text-sm bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Registration Number" />}
                {profile.vatRegistrationNumber && <p className="text-sm text-gray-700">VAT: {profile.vatRegistrationNumber}</p>}
              </div>
            ) : (
              <>
                <p>{profile.email}</p>
                {profile.phone && <p>{profile.phone}</p>}
                {profile.address && <p>{profile.address}</p>}
                {profile.registrationNumber && <p>{profile.registrationNumber}</p>}
                {profile.vatRegistrationNumber && <p>VAT: {profile.vatRegistrationNumber}</p>}
              </>
            )}
          </div>
        </div>
        <div className="w-1/2 pl-12 border-l border-gray-100 min-h-[160px]">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-12 text-gray-400">Invoice {doc.id.slice(-6)}</h2>
          <div className="mb-8">
            <p className="text-xs uppercase font-bold text-gray-400 mb-2">Billed To</p>
            <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-xl font-bold mb-1 bg-transparent w-full focus:bg-yellow-50 p-1" />
            <div className="text-sm text-gray-600">
              {viewMode === 'Draft' ? (
                <div className="space-y-1 mt-1">
                  <input placeholder="Email" value={doc.client.email || ''} onChange={e => updateClient('email', e.target.value)} className="text-sm bg-transparent w-full focus:bg-yellow-50 p-1" />
                  <input placeholder="Phone" value={doc.client.phone || ''} onChange={e => updateClient('phone', e.target.value)} className="text-sm bg-transparent w-full focus:bg-yellow-50 p-1" />
                  <input placeholder="Address" value={doc.client.address || ''} onChange={e => updateClient('address', e.target.value)} className="text-sm bg-transparent w-full focus:bg-yellow-50 p-1" />
                </div>
              ) : <>{doc.client.email && <p>{doc.client.email}</p>}{doc.client.phone && <p>{doc.client.phone}</p>}{doc.client.address && <p>{doc.client.address}</p>}</>}
            </div>
          </div>
          <div className="flex justify-between items-end border-b border-gray-200 pb-2">
            <span className="text-xs font-bold uppercase text-gray-400">Date Issued</span>
            <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="font-mono text-sm bg-transparent text-right w-full focus:bg-yellow-50 p-1" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black">
              {viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}
              <th className="py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400 w-20">Qty</th>
              <th className="py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400 w-20">Unit</th>
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Description</th>
              <th className="py-4 text-right text-xs font-bold uppercase tracking-widest text-gray-400 w-32">Unit Price</th>
              <th className="py-4 text-right text-xs font-bold uppercase tracking-widest text-gray-400 w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
              <React.Fragment key={blockName}>
                {blockName !== 'Items' && (
                  <tr>
                    <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-6 pb-2">
                      <div className="font-bold text-sm uppercase tracking-wider bg-gray-100 px-3 py-2 border-l-4 border-grit-primary">
                        {blockName}
                      </div>
                    </td>
                  </tr>
                )}
                {items.map((item) => renderRowContent(item, { tr: 'border-b border-gray-100 group' }))}
                <tr className="border-t-2 border-gray-300">
                  <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Total {blockName}:</td>
                  <td className="py-3 text-right font-bold">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}
            {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-8 text-center"><button onClick={onAddItem} className="text-xs font-bold uppercase tracking-widest border border-gray-200 px-4 py-2 hover:bg-black hover:text-white transition-colors rounded-full">+ Add Line Item</button></td></tr>}
          </tbody>
        </table>
      </main>
      
      {/* Notes & Due Date - Integrated into flow */}
      <div className="mt-8 pt-4 border-t-2 border-gray-200 text-sm grid grid-cols-2 gap-8">
        <div>
          {doc.notes && (
            <>
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">Notes</p>
              <p className="whitespace-pre-wrap text-gray-700">{doc.notes}</p>
            </>
          )}
        </div>
        <div className="text-right">
          {doc.dueDate && (
            <>
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">Due Date</p>
              <p className="font-mono">{doc.dueDate}</p>
            </>
          )}
        </div>
      </div>

      <footer className="mt-16 pt-8 border-t-4 border-black flex justify-end">
        <div className="w-1/3 space-y-4">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
          {profile.taxEnabled && <div className="flex justify-between text-sm"><span>{profile.taxName} ({profile.taxRate}%)</span><span>{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
          <div className="flex justify-between text-4xl font-bold tracking-tight mt-6"><span>Total</span><span>{profile.currency}{doc.total?.toFixed(2)}</span></div>
        </div>
      </footer>
    </div>
  );

  // BAUHAUS-INSPIRED EDITORIAL THEME - Primary balance, geometric clarity, functional beauty
  const renderGeometricTheme = () => (
    <div className="p-[15mm] min-h-full flex flex-col font-sans bg-[#FDFBF6] text-black relative overflow-hidden">
      {/* Bauhaus geometric elements - primary colors, pure forms */}
      <div className="absolute top-[15mm] left-0 w-[10mm] h-[100mm] bg-[#E91E63]"></div>
      <div className="absolute bottom-[30mm] right-[30mm] w-[45mm] h-[45mm] bg-[#FFC107] rounded-full mix-blend-multiply opacity-70"></div>
      <div className="absolute top-[120mm] right-[15mm] w-[30mm] h-[30mm] border-4 border-[#2196F3] rotate-45"></div>
      
      <header className="flex justify-between items-start mb-24 relative z-10">
        <div className="pl-[20mm]">
          {viewMode === 'Draft' ?
            <input value={profile.companyName} readOnly className="text-4xl font-black uppercase tracking-tight bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Company Name" />
            : <h1 className="text-4xl font-black uppercase tracking-tight">{profile.companyName}</h1>
          }
          {viewMode === 'Draft' ?
            <input value={profile.email} readOnly className="text-sm text-gray-700 mt-2 bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Email" />
            : <p className="text-sm text-gray-700 mt-2">{profile.email}</p>
          }
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-black uppercase tracking-tight">Invoice</h2>
          <p className="font-mono text-sm mt-2 text-gray-800">No. {doc.id.slice(-6)}</p>
        </div>
      </header>
      
      <section className="grid grid-cols-2 gap-12 mb-16 relative z-10">
        <div className="border-t-4 border-black pt-4">
          <p className="font-bold uppercase tracking-widest text-xs mb-3">Bill To</p>
          <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-2xl font-bold bg-transparent w-full focus:bg-yellow-50 p-1" />
          {viewMode === 'Draft' ? <input placeholder="Email" value={doc.client.email || ''} onChange={e => updateClient('email', e.target.value)} className="bg-transparent w-full focus:bg-yellow-50 p-1 text-sm mt-2" /> : <p className="text-gray-700 text-sm mt-2">{doc.client.email}</p>}
        </div>
        <div className="border-t-4 border-black pt-4 text-right">
          <p className="font-bold uppercase tracking-widest text-xs mb-3">Invoice Date</p>
          <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="text-2xl font-bold bg-transparent w-full text-right focus:bg-yellow-50 p-1" />
          {doc.dueDate && <p className="text-sm mt-2 font-bold text-red-500">Due: {doc.dueDate}</p>}
        </div>
      </section>
      
      <main className="flex-1 relative z-10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-4 border-black">
              {viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}
              <th className="pb-3 font-bold uppercase tracking-wider text-sm text-center w-20">Qty</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-sm text-center w-20">Unit</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-sm">Description</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-sm text-right">Unit Price</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-sm text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
              <React.Fragment key={blockName}>
                {blockName !== 'Items' && (
                  <tr>
                    <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-8 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#E91E63]"></div>
                        <h3 className="font-black text-base uppercase tracking-widest">{blockName}</h3>
                        <div className="flex-1 h-[2px] bg-gradient-to-r from-black to-transparent"></div>
                      </div>
                    </td>
                  </tr>
                )}
                {items.map((item) => renderRowContent(item, { tr: 'border-b-2 border-gray-300' }))}
                <tr className="border-t-4 border-black">
                  <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-3 text-right font-bold uppercase tracking-wider text-sm">Total {blockName}:</td>
                  <td className="py-3 text-right font-black text-lg">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}
            {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-6 text-center"><button onClick={onAddItem} className="font-bold uppercase text-xs border-2 border-black px-6 py-2 hover:bg-black hover:text-white transition-colors">+ Add Item</button></td></tr>}
          </tbody>
        </table>
      </main>
      
      <footer className="mt-16 flex justify-end relative z-10 flex-wrap">
        {doc.notes && (
          <div className="w-full mb-8 p-4 bg-white border-2 border-gray-300">
            <p className="text-xs uppercase tracking-wider font-bold mb-2 text-gray-500">Notes</p>
            <p className="text-sm whitespace-pre-wrap text-gray-700">{doc.notes}</p>
          </div>
        )}
        <div className="w-1/2">
          <div className="bg-black text-white p-8">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-mono">{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
              {profile.taxEnabled && <div className="flex justify-between text-sm"><span>{profile.taxName} ({profile.taxRate}%)</span><span className="font-mono">{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
            </div>
            <div className="flex justify-between items-center border-t-2 border-white pt-4">
              <div>
                <p className="font-bold uppercase text-sm mb-1">Total Due</p>
                <p className="text-xs text-gray-400">Payment Required</p>
              </div>
              <span className="font-mono font-bold text-4xl">{profile.currency}{doc.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // EDITORIAL MAGAZINE THEME - Inspired by Kinfolk, Cereal, Monocle - sophisticated whitespace, editorial hierarchy
  const renderBlueprintTheme = () => (
    <div className="p-[20mm] min-h-full flex flex-col font-serif bg-[#FFFEF9] text-[#2C2C2C]">
      {/* Elegant serif system with generous spacing */}
      <header className="mb-32 border-b border-gray-200 pb-12">
        <div className="flex justify-between items-end">
          <div className="flex-1">
            {viewMode === 'Draft' ? 
              <input value={profile.companyName} readOnly className="text-2xl font-light tracking-wide bg-transparent w-full focus:bg-amber-50/30 p-1" placeholder="Company Name" />
              : <h1 className="text-2xl font-light tracking-wide">{profile.companyName}</h1>
            }
            {viewMode === 'Draft' ? 
              <input value={profile.email} readOnly className="text-xs text-gray-500 mt-3 tracking-widest uppercase bg-transparent w-full focus:bg-amber-50/30 p-1" placeholder="Email" />
              : <p className="text-xs text-gray-500 mt-3 tracking-widest uppercase">{profile.email}</p>
            }
          </div>
          <div className="text-right ml-16">
            <p className="text-6xl font-light text-gray-300 leading-none">Invoice</p>
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mt-2">No. {doc.id.slice(-6)}</p>
          </div>
        </div>
      </header>
      
      <section className="grid grid-cols-3 gap-16 mb-20 text-sm">
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">Invoiced To</p>
          <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-lg font-medium bg-transparent w-full focus:bg-amber-50/30 p-1" />
          {viewMode === 'Draft' ? <input placeholder="Email" value={doc.client.email || ''} onChange={e => updateClient('email', e.target.value)} className="bg-transparent w-full focus:bg-amber-50/30 p-1 text-gray-600 mt-2" /> : <p className="text-gray-600 mt-2">{doc.client.email}</p>}
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">Issue Date</p>
          <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="text-lg font-medium bg-transparent w-full focus:bg-amber-50/30 p-1" />
        </div>
        <div>
          {doc.dueDate && (
            <>
              <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">Payment Due</p>
              <p className="text-lg font-medium text-amber-700">{doc.dueDate}</p>
            </>
          )}
        </div>
      </section>
      
      <main className="flex-1 mb-16">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-900">
              {viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}
              <th className="py-4 text-xs tracking-widest uppercase text-gray-500 font-normal w-20">Qty</th>
              <th className="py-4 text-xs tracking-widest uppercase text-gray-500 font-normal w-20">Unit</th>
              <th className="py-4 text-xs tracking-widest uppercase text-gray-500 font-normal">Service Description</th>
              <th className="py-4 text-xs tracking-widest uppercase text-gray-500 font-normal text-right">Rate</th>
              <th className="py-4 text-xs tracking-widest uppercase text-gray-500 font-normal text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
              <React.Fragment key={blockName}>
                {blockName !== 'Items' && (
                  <tr>
                    <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-12 pb-4">
                      <div className="relative">
                        <h3 className="text-sm tracking-[0.2em] uppercase font-medium text-gray-600">{blockName}</h3>
                        <div className="absolute -bottom-2 left-0 w-12 h-[1px] bg-amber-600"></div>
                      </div>
                    </td>
                  </tr>
                )}
                {items.map((item) => renderRowContent(item, { tr: 'border-b border-gray-100 group hover:bg-amber-50/20', td: 'py-5', input: 'text-sm' }))}
                <tr className="border-t border-amber-600">
                  <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-4 text-right text-xs tracking-[0.15em] uppercase font-medium text-gray-600">Total {blockName}:</td>
                  <td className="py-4 text-right font-medium text-gray-900">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}
            {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-12 text-center"><button onClick={onAddItem} className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors">+ Add Line</button></td></tr>}
          </tbody>
        </table>
      </main>
      
      {doc.notes && (
        <div className="mb-12 p-6 bg-gray-50 border-l-2 border-gray-300">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">Notes</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{doc.notes}</p>
        </div>
      )}
      
      <footer className="border-t-2 border-gray-900 pt-8 flex justify-end">
        <div className="w-2/5 space-y-4 text-sm">
          <div className="flex justify-between text-gray-600"><span className="tracking-wider">Subtotal</span><span className="font-mono">{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
          {profile.taxEnabled && <div className="flex justify-between text-gray-600"><span className="tracking-wider">{profile.taxName} ({profile.taxRate}%)</span><span className="font-mono">{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
          <div className="flex justify-between text-2xl font-light pt-6 border-t border-gray-300"><span>Total</span><span className="font-mono">{profile.currency}{doc.total?.toFixed(2)}</span></div>
          <p className="text-xs text-gray-400 tracking-wider pt-4">Payment terms: Net 30 days</p>
        </div>
      </footer>
    </div>
  );

  // CREATIVE STUDIO THEME - Bold, confident design inspired by Pentagram, Studio Feixen, design agencies
  const renderModernistTheme = () => (
    <div className="min-h-full flex flex-col font-sans bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Diagonal color accent inspired by creative studios */}
      <div className="absolute top-0 left-0 w-full h-[120px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 -skew-y-2 origin-top-left"></div>
      
      <div className="relative z-10 p-[20mm] pt-[35mm] flex flex-col flex-1">
        <header className="mb-20">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {viewMode === 'Draft' ? 
                <input value={profile.companyName} readOnly className="text-5xl font-black tracking-tight bg-transparent w-full focus:bg-yellow-50 p-1 leading-none" placeholder="Company Name" />
                : <h1 className="text-5xl font-black tracking-tight leading-none">{profile.companyName}</h1>
              }
              {viewMode === 'Draft' ? 
                <input value={profile.email} readOnly className="text-sm text-gray-600 mt-4 bg-transparent w-full focus:bg-yellow-50 p-1" placeholder="Email" />
                : <p className="text-sm text-gray-600 mt-4">{profile.email}</p>
              }
            </div>
            <div className="ml-12">
              <div className="text-right bg-black text-white px-6 py-4 -rotate-2">
                <p className="text-xs tracking-[0.3em] uppercase mb-1">Invoice</p>
                <p className="font-mono font-bold text-xl">{doc.id.slice(-6)}</p>
              </div>
            </div>
          </div>
        </header>
        
        <section className="grid grid-cols-2 gap-20 mb-16">
          <div>
            <div className="inline-block bg-fuchsia-600 text-white px-3 py-1 text-xs tracking-widest uppercase mb-4">Client</div>
            <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-2xl font-bold bg-transparent w-full focus:bg-yellow-50 p-1 block" />
            {viewMode === 'Draft' ? <input placeholder="Email" value={doc.client.email || ''} onChange={e => updateClient('email', e.target.value)} className="bg-transparent w-full focus:bg-yellow-50 p-1 text-gray-600 mt-2" /> : <p className="text-gray-600 mt-2">{doc.client.email}</p>}
          </div>
          <div className="text-right">
            <div className="inline-block bg-violet-600 text-white px-3 py-1 text-xs tracking-widest uppercase mb-4">Date</div>
            <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="text-2xl font-bold bg-transparent w-full text-right focus:bg-yellow-50 p-1 block" />
            {doc.dueDate && <p className="text-sm mt-2 font-bold text-fuchsia-600">Due: {doc.dueDate}</p>}
          </div>
        </section>
        
        <main className="flex-1 mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-black">
                {viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}
                <th className="pb-4 font-black uppercase tracking-wider text-xs w-16">Qty</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs w-16">Unit</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs">Description</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs text-right">Rate</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
                <React.Fragment key={blockName}>
                  {blockName !== 'Items' && (
                    <tr>
                      <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-10 pb-3">
                        <div className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2">
                          <h3 className="text-xs tracking-[0.2em] uppercase font-black">{blockName}</h3>
                        </div>
                      </td>
                    </tr>
                  )}
                  {items.map((item) => renderRowContent(item, { tr: 'border-b border-gray-200 hover:bg-violet-50/30', td: 'py-4' }))}
                  <tr className="border-t-2 border-violet-600">
                    <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-3 text-right text-xs tracking-[0.2em] uppercase font-black">Total {blockName}:</td>
                    <td className="py-3 text-right font-black">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                  </tr>
                </React.Fragment>
              ))}
              {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-8 text-center"><button onClick={onAddItem} className="font-black text-xs border-2 border-black px-8 py-3 hover:bg-black hover:text-white transition-all hover:scale-105">+ ADD LINE</button></td></tr>}
            </tbody>
          </table>
        </main>
        
        {doc.notes && (
          <div className="mb-12 p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-l-4 border-fuchsia-600">
            <p className="text-xs uppercase tracking-widest font-black mb-2 text-gray-700">Notes</p>
            <p className="text-sm whitespace-pre-wrap text-gray-700">{doc.notes}</p>
          </div>
        )}
        
        <footer className="border-t-4 border-black pt-8">
          <div className="flex justify-end">
            <div className="w-2/5 space-y-3">
              <div className="flex justify-between text-sm font-bold"><span>Subtotal</span><span className="font-mono">{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
              {profile.taxEnabled && <div className="flex justify-between text-sm font-bold"><span>{profile.taxName} ({profile.taxRate}%)</span><span className="font-mono">{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black tracking-wider">TOTAL DUE</span>
                  <span className="text-4xl font-black font-mono">{profile.currency}{doc.total?.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center pt-4 tracking-wider">Thank you for your business</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  // LUXURY MINIMAL THEME - Inspired by luxury brand invoices (Hermès, Apple) - restraint, precision, quality
  const renderMinimalTheme = () => (
    <div className="p-[25mm] min-h-full flex flex-col font-sans bg-white text-black">
      {/* Subtle gold accent line - luxury detail */}
      <div className="absolute top-0 left-[25mm] right-[25mm] h-[0.5mm] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      
      <header className="flex justify-between items-start mb-32 pt-8">
        <div className="flex-1">
          {viewMode === 'Draft' ? 
            <input value={profile.companyName} readOnly className="text-xl font-medium tracking-[0.05em] bg-transparent w-full focus:bg-gray-50 p-1" placeholder="Company Name" />
            : <h1 className="text-xl font-medium tracking-[0.05em]">{profile.companyName}</h1>
          }
          {viewMode === 'Draft' ? 
            <input value={profile.email} readOnly className="text-xs text-gray-500 mt-3 bg-transparent w-full focus:bg-gray-50 p-1" placeholder="Email" />
            : <p className="text-xs text-gray-500 mt-3">{profile.email}</p>
          }
        </div>
        <div className="text-right ml-16">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">Invoice</p>
          <p className="font-mono text-sm text-gray-900">{doc.id.slice(-6)}</p>
        </div>
      </header>
      
      <section className="grid grid-cols-3 gap-16 mb-24 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-3 tracking-wider">Billed To</p>
          <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="font-medium text-base bg-transparent w-full focus:bg-gray-50 p-1" />
          {viewMode === 'Draft' ? <input placeholder="Email" value={doc.client.email || ''} onChange={e => updateClient('email', e.target.value)} className="bg-transparent w-full focus:bg-gray-50 p-1 text-gray-600 mt-2 text-sm" /> : <p className="text-gray-600 mt-2">{doc.client.email}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-3 tracking-wider">Invoice Date</p>
          <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="font-medium text-base bg-transparent w-full focus:bg-gray-50 p-1" />
        </div>
        <div>
          {doc.dueDate && (
            <>
              <p className="text-xs text-gray-400 mb-3 tracking-wider">Payment Due</p>
              <p className="font-medium text-base">{doc.dueDate}</p>
            </>
          )}
        </div>
      </section>
      
      <main className="flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}
              <th className="py-4 text-xs text-gray-400 font-normal tracking-wider w-16">Qty</th>
              <th className="py-4 text-xs text-gray-400 font-normal tracking-wider w-16">Unit</th>
              <th className="py-4 text-xs text-gray-400 font-normal tracking-wider">Description</th>
              <th className="py-4 text-xs text-gray-400 font-normal tracking-wider text-right">Rate</th>
              <th className="py-4 text-xs text-gray-400 font-normal tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
              <React.Fragment key={blockName}>
                {blockName !== 'Items' && (
                  <tr>
                    <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-10 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                        <h3 className="text-xs tracking-[0.15em] uppercase font-medium text-gray-700">{blockName}</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                      </div>
                    </td>
                  </tr>
                )}
                {items.map((item) => renderRowContent(item, { tr: 'border-b border-gray-50 hover:bg-gray-50/50', td: 'py-5', input: 'text-sm' }))}
                <tr className="border-t border-gray-200">
                  <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-4 text-right text-xs tracking-[0.15em] uppercase font-medium text-gray-700">Total {blockName}:</td>
                  <td className="py-4 text-right font-medium text-gray-900">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                </tr>
              </React.Fragment>
            ))}
            {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-12 text-center"><button onClick={onAddItem} className="text-xs text-gray-400 hover:text-black transition-colors tracking-wider">+ Add Line Item</button></td></tr>}
          </tbody>
        </table>
      </main>
      
      {doc.notes && (
        <div className="mt-16 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 tracking-wider">Additional Notes</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{doc.notes}</p>
        </div>
      )}
      
      <footer className="mt-24 pt-8 border-t border-gray-200 flex justify-end">
        <div className="w-2/5 space-y-3 text-sm">
          <div className="flex justify-between text-gray-600"><span className="tracking-wider">Subtotal</span><span className="font-mono">{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
          {profile.taxEnabled && <div className="flex justify-between text-gray-600"><span className="tracking-wider">{profile.taxName} ({profile.taxRate}%)</span><span className="font-mono">{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
          <div className="flex justify-between text-xl font-medium pt-6 border-t border-gray-200"><span className="tracking-wide">Total</span><span className="font-mono">{profile.currency}{doc.total?.toFixed(2)}</span></div>
          <p className="text-xs text-gray-400 pt-8 tracking-wider text-center">Thank you</p>
        </div>
      </footer>
      
      {/* Bottom gold accent */}
      <div className="absolute bottom-0 left-[25mm] right-[25mm] h-[0.5mm] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
    </div>
  );

  const renderArtisanTheme = () => (
    <div className="p-[18mm] min-h-full flex flex-col font-sans bg-[#FFF8F0] text-[#5D4037]">
      <header className="flex justify-between items-center mb-16 pb-4 border-b-2 border-dashed border-[#D7CCC8]">
          <div>
            {viewMode === 'Draft' ? 
                <input value={profile.companyName} readOnly className="text-3xl font-bold bg-transparent w-full focus:bg-orange-50 p-1" placeholder="Company Name" />
                : <h1 className="text-3xl font-bold">{profile.companyName}</h1>
            }
            {viewMode === 'Draft' ? 
                <input value={profile.email} readOnly className="text-sm text-[#A1887F] bg-transparent w-full focus:bg-orange-50 p-1" placeholder="Email" />
                : <p className="text-sm text-[#A1887F]">{profile.email}</p>
            }
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest">Invoice</p>
            <p className="font-mono">{doc.id.slice(-6)}</p>
          </div>
      </header>
      <section className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#A1887F] mb-2">Client</p>
          <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-xl font-bold bg-transparent w-full focus:bg-orange-50 p-1" />
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-[#A1887F] mb-2">Date</p>
          <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="text-xl font-bold bg-transparent w-full text-right focus:bg-orange-50 p-1" />
          {doc.dueDate && <p className="text-sm mt-1 text-[#A1887F]">Due: {doc.dueDate}</p>}
        </div>
      </section>
      <main className="flex-1">
          <table className="w-full text-left">
            <thead><tr className="border-b-2 border-[#A1887F]">{viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}<th className="pb-2 font-bold w-20 text-center">Qty</th><th className="pb-2 font-bold w-20 text-center">Unit</th><th className="pb-2 font-bold">Description</th><th className="pb-2 font-bold text-right">Unit Price</th><th className="pb-2 font-bold text-right">Total</th></tr></thead>
            <tbody>
                {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
                  <React.Fragment key={blockName}>
                    {blockName !== 'Items' && (
                      <tr>
                        <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-6 pb-2">
                          <div className="font-bold text-sm uppercase tracking-wider text-[#A1887F] border-b border-[#D7CCC8] pb-1">
                            {blockName}
                          </div>
                        </td>
                      </tr>
                    )}
                    {items.map((item) => renderRowContent(item, { tr: 'border-b border-[#EFEBE9]' }))}
                    <tr className="border-t-2 border-[#D7CCC8]">
                      <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-3 text-right text-xs uppercase tracking-widest text-[#A1887F] font-bold">Total {blockName}:</td>
                      <td className="py-3 text-right font-bold text-[#5D4037]">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                    </tr>
                  </React.Fragment>
                ))}
                {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-6 text-center"><button onClick={onAddItem} className="font-bold text-xs border-2 border-[#D7CCC8] px-4 py-2 hover:bg-[#5D4037] hover:text-white transition-colors rounded">+ Add Item</button></td></tr>}
            </tbody>
        </table>
      </main>
      {doc.notes && (
        <div className="mt-8 pt-4 border-t-2 border-[#D7CCC8]">
          <p className="text-sm whitespace-pre-wrap text-[#5D4037]">{doc.notes}</p>
        </div>
      )}
      <footer className="mt-12 flex justify-between items-end">
        <p className="font-draft text-2xl text-[#A1887F]">Thank you!</p>
        <div className="w-2/5 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
            {profile.taxEnabled && <div className="flex justify-between"><span>{profile.taxName}</span><span>{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
            <div className="flex justify-between text-2xl font-bold pt-2 border-t-2 border-[#A1887F]"><span>Total Due</span><span>{profile.currency}{doc.total?.toFixed(2)}</span></div>
        </div>
      </footer>
    </div>
  );

  const renderCorporateTheme = () => (
    <div className="p-[15mm] min-h-full flex flex-col font-ui bg-white text-gray-900">
      <header className="flex justify-between items-center mb-12 bg-gray-100 p-8">
        {profile.logoUrl ? <img src={profile.logoUrl} alt="Logo" className="h-12 object-contain" /> : 
        (viewMode === 'Draft' ? 
            <input value={profile.companyName} readOnly className="text-2xl font-bold bg-transparent w-1/2 focus:bg-gray-200 p-1" placeholder="Company Name" />
            : <h1 className="text-2xl font-bold">{profile.companyName}</h1>
        )}
        <h2 className="text-4xl font-bold text-gray-400 uppercase tracking-widest">Invoice</h2>
      </header>
      <section className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <p className="font-bold text-gray-500 mb-2">Billed To:</p>
          <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-lg font-bold bg-transparent w-full focus:bg-gray-100 p-1" />
          {viewMode === 'Draft' ? <input placeholder="Address" value={doc.client.address || ''} onChange={e => updateClient('address', e.target.value)} className="bg-transparent w-full focus:bg-gray-100 p-1 text-gray-600" /> : <p className="text-gray-600">{doc.client.address}</p>}
        </div>
        <div className="text-sm space-y-2">
          <div className="flex justify-between"><span className="font-bold text-gray-500">Invoice Number:</span><span>{doc.id.slice(-6)}</span></div>
          <div className="flex justify-between"><span className="font-bold text-gray-500">Date of Issue:</span><input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="bg-transparent text-right w-full focus:bg-gray-100 p-1" /></div>
          {doc.dueDate && <div className="flex justify-between"><span className="font-bold text-gray-500">Due Date:</span><span>{doc.dueDate}</span></div>}
          {profile.registrationNumber && <div className="flex justify-between"><span className="font-bold text-gray-500">Reg Number:</span><span className="font-mono text-xs">{profile.registrationNumber}</span></div>}
          {profile.vatRegistrationNumber && <div className="flex justify-between"><span className="font-bold text-gray-500">VAT Number:</span><span className="font-mono text-xs">{profile.vatRegistrationNumber}</span></div>}
        </div>
      </section>
      <main className="flex-1">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                {viewMode === 'Draft' && <th className="w-12 print:hidden p-3"></th>}
                <th className="p-3 uppercase tracking-wider w-16 text-center">Qty</th>
                <th className="p-3 uppercase tracking-wider w-16 text-center">Unit</th>
                <th className="p-3 uppercase tracking-wider">Description</th>
                <th className="p-3 uppercase tracking-wider text-right">Unit Price</th>
                <th className="p-3 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
                {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
                  <React.Fragment key={blockName}>
                    {blockName !== 'Items' && (
                      <tr>
                        <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-6 pb-3 bg-gray-800">
                          <div className="flex items-center gap-3 px-3">
                            <div className="w-1 h-4 bg-blue-500"></div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">{blockName}</h3>
                          </div>
                        </td>
                      </tr>
                    )}
                    {items.map((item) => renderRowContent(item, { tr: 'bg-gray-50 border-b-4 border-white', td: 'p-3' }))}
                    <tr className="border-t-2 border-blue-500 bg-gray-100">
                      <td colSpan={viewMode === 'Draft' ? 4 : 3} className="p-3 text-right text-sm font-black uppercase tracking-widest">Total {blockName}:</td>
                      <td className="p-3 text-right font-black">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                    </tr>
                  </React.Fragment>
                ))}
                {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-6 text-center bg-gray-50"><button onClick={onAddItem} className="text-xs font-bold uppercase border border-gray-300 px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">+ Add Item</button></td></tr>}
            </tbody>
        </table>
      </main>
      {doc.notes && (
        <div className="mt-8 pt-4 border-t-2 border-gray-300">
          <p className="text-sm whitespace-pre-wrap text-gray-700">{doc.notes}</p>
        </div>
      )}
      <footer className="mt-12 flex justify-end">
        <div className="w-2/5 space-y-2 text-sm bg-gray-100 p-6">
            <div className="flex justify-between"><span>Subtotal</span><span>{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
            {profile.taxEnabled && <div className="flex justify-between"><span>{profile.taxName} ({profile.taxRate}%)</span><span>{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
            <div className="flex justify-between text-xl font-bold pt-4 border-t-2 border-gray-300"><span>Total</span><span>{profile.currency}{doc.total?.toFixed(2)}</span></div>
        </div>
      </footer>
    </div>
  );

  const renderBrutalistTheme = () => (
    <div className="p-[20mm] min-h-full flex flex-col font-sans bg-gray-100 text-gray-900">
      <header className="mb-20 bg-gray-900 text-white p-8 -m-[20mm] mb-0 pb-12">
        {viewMode === 'Draft' ? 
            <input value={profile.companyName} readOnly className="text-4xl font-black uppercase tracking-tight bg-transparent w-full focus:bg-yellow-100 focus:text-gray-900 p-1" placeholder="Company Name" />
            : <h1 className="text-4xl font-black uppercase tracking-tight">{profile.companyName}</h1>
        }
        {viewMode === 'Draft' ? 
            <input value={profile.email} readOnly className="text-gray-400 text-sm mt-2 bg-transparent w-full focus:bg-yellow-100 focus:text-gray-900 p-1" placeholder="Email" />
            : <p className="text-gray-400 text-sm mt-2">{profile.email}</p>
        }
      </header>
      <section className="mt-12 grid grid-cols-2 gap-16 mb-16">
        <div>
          <div className="border-l-4 border-black pl-6 mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Invoice To</p>
            <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-2xl font-black bg-transparent w-full focus:bg-yellow-100 p-1" />
          </div>
          {viewMode === 'Draft' ? <input placeholder="Address" value={doc.client.address || ''} onChange={e => updateClient('address', e.target.value)} className="bg-transparent w-full focus:bg-yellow-100 p-1 text-sm" /> : <p className="text-gray-700 text-sm">{doc.client.address}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest mb-8">Invoice Number {doc.id.slice(-6)}</p>
          <div className="flex flex-col items-end gap-6">
            <p className="text-xs uppercase tracking-widest text-gray-500">Issue Date</p>
            <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="text-2xl font-black bg-transparent text-right focus:bg-yellow-100 p-1" />
            {doc.dueDate && <p className="text-sm font-bold text-red-600">DUE: {doc.dueDate}</p>}
          </div>
        </div>
      </section>
      <main className="flex-1 bg-white border-8 border-gray-900 p-8">
        <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-gray-900">
                {viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}
                <th className="pb-4 font-black uppercase tracking-wider text-xs w-16 text-center">QTY</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs w-16 text-center">UNIT</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs">Description</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs text-right">RATE</th>
                <th className="pb-4 font-black uppercase tracking-wider text-xs text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
                {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
                  <React.Fragment key={blockName}>
                    {blockName !== 'Items' && (
                      <tr>
                        <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-8 pb-4">
                          <div className="bg-gray-900 text-white px-4 py-3 -mx-8 border-l-8 border-yellow-400">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">{blockName}</h3>
                          </div>
                        </td>
                      </tr>
                    )}
                    {items.map((item) => renderRowContent(item, { tr: 'border-b-4 border-gray-200' }))}
                    <tr className="border-t-8 border-yellow-400 bg-gray-100">
                      <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-4 text-right text-sm font-black uppercase tracking-[0.2em]">Total {blockName}:</td>
                      <td className="py-4 text-right font-black text-lg">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                    </tr>
                  </React.Fragment>
                ))}
                {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-6 text-center"><button onClick={onAddItem} className="font-black text-xs border-4 border-gray-900 px-6 py-3 hover:bg-gray-900 hover:text-white transition-colors">+ ADD</button></td></tr>}
            </tbody>
        </table>
      </main>
      {doc.notes && (
        <div className="mt-8 pt-4 border-t-2 border-gray-300 bg-white p-8 border-8 border-t-2 border-gray-900">
          <p className="text-sm whitespace-pre-wrap text-gray-700 font-bold">{doc.notes}</p>
        </div>
      )}
      <footer className="mt-12 bg-gray-900 text-white p-8 -m-[20mm] mt-0 pt-12">
        <div className="flex justify-end">
          <div className="space-y-6">
              <div className="flex gap-16 font-bold text-lg"><span>SUBTOTAL</span><span className="font-mono w-32 text-right">{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
              {profile.taxEnabled && <div className="flex gap-16 font-bold text-lg"><span>{profile.taxName}</span><span className="font-mono w-32 text-right">{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
              <div className="flex gap-16 font-black text-3xl pt-4 border-t-4 border-white"><span>TOTAL</span><span className="font-mono w-32 text-right">{profile.currency}{doc.total?.toFixed(2)}</span></div>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderAsymmetricTheme = () => (
    <div className="min-h-full flex font-sans bg-white text-gray-900 relative">
      <div className="w-[12mm] min-h-full bg-gradient-to-b from-indigo-600 to-blue-700 absolute left-0 top-0 bottom-0"></div>
      <div className="p-[18mm] pl-[30mm] flex-1 flex flex-col">
          <header className="mb-16">
            {viewMode === 'Draft' ? 
                <input value={profile.companyName} readOnly className="text-4xl font-black uppercase tracking-tight bg-transparent w-full focus:bg-gray-100 p-1" placeholder="Company Name" />
                : <h1 className="text-4xl font-black uppercase tracking-tight">{profile.companyName}</h1>
            }
            {viewMode === 'Draft' ? 
                <input value={profile.email} readOnly className="text-xs uppercase tracking-widest text-gray-500 mt-2 bg-transparent w-full focus:bg-gray-100 p-1" placeholder="Email" />
                : <p className="text-xs uppercase tracking-widest text-gray-500 mt-2">{profile.email}</p>
            }
          </header>
          <div className="absolute top-[25mm] right-[20mm] w-[80px] h-[80px] border-4 border-indigo-600 rounded-full opacity-20"></div>
          <section className="grid grid-cols-2 gap-16 mb-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3">Bill To</p>
              <input value={doc.client.businessName} onChange={e => updateClient('businessName', e.target.value)} disabled={viewMode === 'Final'} className="text-2xl font-black bg-transparent w-full focus:bg-gray-100 p-1" />
              {viewMode === 'Draft' ? <input placeholder="Email" value={doc.client.email || ''} onChange={e => updateClient('email', e.target.value)} className="bg-transparent w-full focus:bg-gray-100 p-1 text-sm mt-3" /> : <p className="text-gray-600 text-sm mt-3">{doc.client.email}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest mb-3">Invoice Details</p>
              <p className="font-mono text-sm font-bold mb-3">INV-{doc.id.slice(-6)}</p>
              <input value={doc.date} onChange={e => updateDocField('date', e.target.value)} disabled={viewMode === 'Final'} className="font-bold bg-transparent w-full text-right focus:bg-gray-100 p-1" />
              {doc.dueDate && <p className="text-sm mt-2 font-bold text-indigo-600">Due: {doc.dueDate}</p>}
            </div>
          </section>
          <main className="flex-1 relative">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-4 border-indigo-600">
                  {viewMode === 'Draft' && <th className="w-12 print:hidden"></th>}
                  <th className="py-4 font-black uppercase text-xs tracking-widest w-16 text-center">Qty</th>
                  <th className="py-4 font-black uppercase text-xs tracking-widest w-16 text-center">Unit</th>
                  <th className="py-4 font-black uppercase text-xs tracking-widest">Description</th>
                  <th className="py-4 font-black uppercase text-xs tracking-widest text-right">Rate</th>
                  <th className="py-4 font-black uppercase text-xs tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                  {Object.entries(groupedItems).map(([blockName, items]: [string, InvoiceItem[]]) => (
                    <React.Fragment key={blockName}>
                      {blockName !== 'Items' && (
                        <tr>
                          <td colSpan={viewMode === 'Draft' ? 6 : 5} className="pt-10 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-1 bg-gradient-to-r from-indigo-600 to-blue-700"></div>
                              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600">{blockName}</h3>
                              <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent"></div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {items.map((item) => renderRowContent(item, { tr: 'border-b-2 border-gray-200' }))}
                      <tr className="border-t-4 border-indigo-600">
                        <td colSpan={viewMode === 'Draft' ? 4 : 3} className="py-3 text-right text-sm font-black uppercase tracking-[0.2em] text-indigo-600">Total {blockName}:</td>
                        <td className="py-3 text-right font-black text-indigo-900">{profile.currency}{calculateBlockTotal(items).toFixed(2)}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                  {viewMode === 'Draft' && <tr className="print:hidden"><td colSpan={6} className="py-6 text-center"><button onClick={onAddItem} className="text-xs font-bold uppercase border-2 border-indigo-600 px-6 py-2 hover:bg-indigo-600 hover:text-white transition-colors">+ Add Item</button></td></tr>}
              </tbody>
            </table>
          </main>
          {doc.notes && (
            <div className="mt-8 pt-4 border-t-2 border-indigo-200">
              <p className="text-sm whitespace-pre-wrap text-gray-700">{doc.notes}</p>
            </div>
          )}
          <footer className="mt-12 flex justify-end">
             <div className="w-1/2 space-y-3">
                <div className="flex justify-between text-sm font-bold"><span>SUBTOTAL</span><span className="font-mono">{profile.currency}{doc.subtotal?.toFixed(2)}</span></div>
                {profile.taxEnabled && <div className="flex justify-between text-sm font-bold"><span>{profile.taxName} ({profile.taxRate}%)</span><span className="font-mono">{profile.currency}{doc.taxTotal?.toFixed(2)}</span></div>}
                <div className="flex justify-between font-black text-3xl pt-4 border-t-4 border-indigo-600"><span>TOTAL</span><span className="font-mono">{profile.currency}{doc.total?.toFixed(2)}</span></div>
                <p className="text-xs text-gray-500 mt-6">Thank you for your business</p>
             </div>
          </footer>
      </div>
    </div>
  );

  const THEME_RENDERERS: Record<InvoiceTheme, () => React.ReactNode> = {
    swiss: renderSwissTheme,
    geometric: renderGeometricTheme,
    blueprint: renderBlueprintTheme,
    modernist: renderModernistTheme,
    minimal: renderMinimalTheme,
    artisan: renderArtisanTheme,
    corporate: renderCorporateTheme,
    brutalist: renderBrutalistTheme,
    asymmetric: renderAsymmetricTheme,
    bauhaus: renderGeometricTheme,
    constructivist: renderBrutalistTheme,
    international: renderSwissTheme,
  };

  return <>{THEME_RENDERERS[doc.theme || 'swiss']?.()}</>;
};
