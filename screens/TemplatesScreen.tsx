import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, FileBox, Edit2, X, BarChart3, GripVertical } from 'lucide-react';
import { TemplateBlock, DocType, VisualComponent } from '../types';
import { Input, TextArea } from '../components/Input';
import { useOnboarding } from '../context/OnboardingContext';
import { OnboardingTooltip } from '../components/OnboardingTooltip';
import { TemplatePreloadDialog } from '../components/TemplatePreloadDialog';
import { useAuth } from '../context/AuthContext';
import { getIndustryTemplates } from '../services/industryData';

interface TemplatesScreenProps {
  templates: TemplateBlock[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateBlock[]>>;
  saveTemplate: (template: TemplateBlock) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

const TemplatesScreen: React.FC<TemplatesScreenProps> = ({ templates, setTemplates, saveTemplate, deleteTemplate }) => {
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateBlock | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'contract'>('all');
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempCategory, setTempCategory] = useState('My Templates');
  const [tempType, setTempType] = useState<DocType>(DocType.INVOICE);
  const [tempItems, setTempItems] = useState<any[]>([]);
  const [tempClauses, setTempClauses] = useState<any[]>([]);
  const [tempVisualComponents, setTempVisualComponents] = useState<VisualComponent[]>([]);
  const [showVisualMenu, setShowVisualMenu] = useState(false);
  const [draggedContentIndex, setDraggedContentIndex] = useState<number | null>(null);
  const [tempClauseContent, setTempClauseContent] = useState('');
  const [tempDefaultNotes, setTempDefaultNotes] = useState('');
  const [tempDefaultTaxEnabled, setTempDefaultTaxEnabled] = useState(false);
  const [tempDefaultTaxRate, setTempDefaultTaxRate] = useState(0);
  const [tempContractType, setTempContractType] = useState('');
  const [tempDefaultJurisdiction, setTempDefaultJurisdiction] = useState('Republic of South Africa');
  const [tempDefaultPaymentSchedule, setTempDefaultPaymentSchedule] = useState<'upfront' | 'milestone' | 'monthly' | 'completion' | 'custom'>('upfront');
  const { activeStep, showGuide, completeStep, userCreatedTemplatesCount, incrementUserTemplates, templatesPreloaded, setTemplatesPreloaded, showTemplatePreloadDialog, setShowTemplatePreloadDialog } = useOnboarding();
  const { profile } = useAuth();
  
  // Show preload dialog on first visit to templates screen
  useEffect(() => {
    if (activeStep === 'templates' && !templatesPreloaded && templates.length === 0) {
      setShowTemplatePreloadDialog(true);
    }
  }, [activeStep, templatesPreloaded, templates.length]);

  const handleAddTemplate = async () => {
    if (!tempName) return;
    
    const newTemplate: TemplateBlock = {
      id: Date.now().toString(),
      name: tempName,
      description: tempDescription,
      category: tempCategory,
      type: tempType,
      items: tempType === DocType.INVOICE ? tempItems : undefined,
      defaultNotes: tempType === DocType.INVOICE ? tempDefaultNotes : undefined,
      defaultTaxEnabled: tempType === DocType.INVOICE ? tempDefaultTaxEnabled : undefined,
      defaultTaxRate: tempType === DocType.INVOICE ? tempDefaultTaxRate : undefined,
      clauses: tempType === DocType.CONTRACT ? tempClauses : undefined,
      visualComponents: tempType === DocType.CONTRACT ? tempVisualComponents : undefined,
      contractType: tempType === DocType.CONTRACT ? (tempContractType as any) : undefined,
      defaultJurisdiction: tempType === DocType.CONTRACT ? tempDefaultJurisdiction : undefined,
      defaultPaymentSchedule: tempType === DocType.CONTRACT ? tempDefaultPaymentSchedule : undefined,
      clause: tempType === DocType.CONTRACT && tempClauses.length === 0 ? {
        id: '1',
        title: tempName,
        content: tempClauseContent || 'Template content'
      } : undefined
    };

    await saveTemplate(newTemplate);
    setTemplates([...templates, newTemplate]);
    
    // Increment user-created template counter
    incrementUserTemplates();
    
    // If user just hit 3 templates, complete the milestone
    if (userCreatedTemplatesCount + 1 >= 3 && activeStep === 'templates') {
      completeStep('templates');
    }
    
    // Reset form
    resetForm();
    setShowAddTemplate(false);
  };

  const handleEditTemplate = (template: TemplateBlock) => {
    setEditingTemplate(template);
    setTempName(template.name);
    setTempDescription(template.description || '');
    setTempCategory(template.category || 'My Templates');
    setTempType(template.type);
    setTempItems(template.items || []);
    setTempClauses(template.clauses || []);
    setTempVisualComponents(template.visualComponents || []);
    setTempClauseContent(template.clause?.content || '');
    setTempDefaultNotes(template.defaultNotes || '');
    setTempDefaultTaxEnabled(template.defaultTaxEnabled || false);
    setTempDefaultTaxRate(template.defaultTaxRate || 0);
    setTempContractType(template.contractType || '');
    setTempDefaultJurisdiction(template.defaultJurisdiction || 'Republic of South Africa');
    setTempDefaultPaymentSchedule(template.defaultPaymentSchedule || 'upfront');
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate || !tempName) return;
    
    const updatedTemplate: TemplateBlock = {
      ...editingTemplate,
      name: tempName,
      description: tempDescription,
      category: tempCategory,
      type: tempType,
      items: tempType === DocType.INVOICE ? tempItems : undefined,
      defaultNotes: tempType === DocType.INVOICE ? tempDefaultNotes : undefined,
      defaultTaxEnabled: tempType === DocType.INVOICE ? tempDefaultTaxEnabled : undefined,
      defaultTaxRate: tempType === DocType.INVOICE ? tempDefaultTaxRate : undefined,
      clauses: tempType === DocType.CONTRACT ? tempClauses : undefined,
      visualComponents: tempType === DocType.CONTRACT ? tempVisualComponents : undefined,
      contractType: tempType === DocType.CONTRACT ? (tempContractType as any) : undefined,
      defaultJurisdiction: tempType === DocType.CONTRACT ? tempDefaultJurisdiction : undefined,
      defaultPaymentSchedule: tempType === DocType.CONTRACT ? tempDefaultPaymentSchedule : undefined,
      clause: tempType === DocType.CONTRACT && tempClauses.length === 0 ? {
        id: editingTemplate.clause?.id || '1',
        title: tempName,
        content: tempClauseContent
      } : undefined
    };

    await saveTemplate(updatedTemplate);
    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    
    // Reset form
    resetForm();
    setEditingTemplate(null);
  };

  const resetForm = () => {
    setTempName('');
    setTempDescription('');
    setTempCategory('My Templates');
    setTempType(DocType.INVOICE);
    setTempItems([]);
    setTempClauses([]);
    setTempVisualComponents([]);
    setTempClauseContent('');
    setTempDefaultNotes('');
    setTempDefaultTaxEnabled(false);
    setTempDefaultTaxRate(0);
    setTempContractType('');
    setTempDefaultJurisdiction('Republic of South Africa');
    setTempDefaultPaymentSchedule('upfront');
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    setTemplates(templates.filter(t => t.id !== id));
  };

  // Add visual component to template
  const addVisualComponent = (type: VisualComponent['type'], insertAfterIndex?: number) => {
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
      'multi-option-table': {
        headers: ['Option', 'Price', 'Equity Split'],
        rows: [
          { selected: false, label: 'Option 1', columns: ['R 6,000', '60% / 40%'] },
          { selected: false, label: 'Option 2', columns: ['R 12,000', '40% / 60%'] },
          { selected: false, label: 'Option 3', columns: ['R 21,000', '20% / 80%'] },
        ],
      },
      'visual-placeholder': {
        title: 'INSERT CHART/DIAGRAM HERE',
        description: 'A visual representation will be inserted here',
        placeholderType: 'custom',
      },
      'fill-in-field': {
        label: '',
        fieldType: 'bracket',
        placeholder: 'INSERT NAME',
        value: '',
      },
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
      position: tempVisualComponents.length + 1,
    };

    if (insertAfterIndex !== undefined) {
      // Insert at specific position
      const updated = [...tempVisualComponents];
      updated.splice(insertAfterIndex + 1, 0, newComponent);
      setTempVisualComponents(updated.map((c, i) => ({ ...c, position: i + 1 })));
    } else {
      setTempVisualComponents([...tempVisualComponents, newComponent]);
    }
  };

  // Create merged content items (clauses + visuals) for display
  const getContentItems = () => {
    const items: Array<{ type: 'clause' | 'visual'; data: any; index: number }> = [];
    
    tempClauses.forEach((clause, idx) => {
      items.push({ type: 'clause', data: clause, index: idx });
    });
    
    tempVisualComponents.forEach((visual, idx) => {
      items.push({ type: 'visual', data: visual, index: idx });
    });
    
    return items.sort((a, b) => {
      const posA = a.type === 'clause' ? (a.data.order || a.index) : (a.data.position || 999);
      const posB = b.type === 'clause' ? (b.data.order || b.index) : (b.data.position || 999);
      return posA - posB;
    });
  };

  // Unified drag & drop handlers
  const handleContentDragStart = (e: React.DragEvent, index: number) => {
    setDraggedContentIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleContentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleContentDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedContentIndex === null || draggedContentIndex === dropIndex) return;

    const items = getContentItems();
    const updated = [...items];
    const [removed] = updated.splice(draggedContentIndex, 1);
    updated.splice(dropIndex, 0, removed);
    
    // Separate back into clauses and visuals with updated positions
    const newClauses: any[] = [];
    const newVisuals: VisualComponent[] = [];
    
    updated.forEach((item, idx) => {
      if (item.type === 'clause') {
        newClauses.push({ ...item.data, order: idx + 1 });
      } else {
        newVisuals.push({ ...item.data, position: idx + 1 });
      }
    });
    
    setTempClauses(newClauses);
    setTempVisualComponents(newVisuals);
    setDraggedContentIndex(null);
  };
  
  const handleLoadIndustryTemplates = async () => {
    const industry = profile?.industry || 'Web Development';
    const industryTemplates = getIndustryTemplates(industry);
    
    // Save all industry templates
    for (const template of industryTemplates) {
      await saveTemplate(template);
    }
    
    setTemplates([...templates, ...industryTemplates]);
    setTemplatesPreloaded(true);
    setShowTemplatePreloadDialog(false);
  };
  
  const handleSkipPreload = () => {
    setTemplatesPreloaded(true); // Mark as handled so dialog doesn't show again
    setShowTemplatePreloadDialog(false);
  };

  // Filter templates by type
  const filteredTemplates = templates.filter(t => {
    if (filterType === 'all') return true;
    if (filterType === 'invoice') return t.type === DocType.INVOICE;
    if (filterType === 'contract') return t.type === DocType.CONTRACT;
    return true;
  });

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, TemplateBlock[]>);

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto">
      {/* Template Preload Dialog */}
      {showTemplatePreloadDialog && profile && (
        <TemplatePreloadDialog
          onLoadTemplates={handleLoadIndustryTemplates}
          onSkip={handleSkipPreload}
          industry={profile.industry || 'your industry'}
          templateCount={getIndustryTemplates(profile.industry || 'Web Development').length}
        />
      )}
      
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Your Templates</h1>
          <p className="text-gray-600">Create and manage reusable templates for invoices and contracts</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 font-bold border-2 transition-all ${
              filterType === 'all'
                ? 'bg-grit-dark text-white border-grit-dark'
                : 'bg-white text-gray-700 border-gray-300 hover:border-grit-dark'
            }`}
          >
            All Templates ({templates.length})
          </button>
          <button
            onClick={() => setFilterType('invoice')}
            className={`px-4 py-2 font-bold border-2 transition-all ${
              filterType === 'invoice'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
            }`}
          >
            Invoices ({templates.filter(t => t.type === DocType.INVOICE).length})
          </button>
          <button
            onClick={() => setFilterType('contract')}
            className={`px-4 py-2 font-bold border-2 transition-all ${
              filterType === 'contract'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-600'
            }`}
          >
            Contracts ({templates.filter(t => t.type === DocType.CONTRACT).length})
          </button>
        </div>

        {/* Add Template Button */}
        <button
          onClick={() => setShowAddTemplate(!showAddTemplate)}
          className="mb-6 bg-grit-primary text-grit-dark font-bold px-6 py-3 border-2 border-grit-dark shadow-grit hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all flex items-center gap-2"
          id="add-template-button"
        >
          <Plus size={20} />
          {showAddTemplate ? 'Cancel' : 'New Template'}
        </button>

        {/* Template Creation Guide */}
        {activeStep === 'templates' && showGuide && !showAddTemplate && userCreatedTemplatesCount < 3 && (
            <div className="relative mb-6">
                <OnboardingTooltip
                    title="Create Your Templates"
                    description={`Templates save you time! Click 'New Template' to create reusable invoice or contract templates. You've created ${userCreatedTemplatesCount} so far - create ${3 - userCreatedTemplatesCount} more to complete this step. Add line items, clauses, and pricing that you use frequently.`}
                    step="4"
                    totalSteps="5"
                    position="bottom"
                    onNext={() => setShowAddTemplate(true)}
                    onSkip={() => completeStep('templates')}
                />
            </div>
        )}

        {/* Add Template Form */}
        {showAddTemplate && (
          <div className="bg-white border-2 border-grit-dark p-6 mb-8 shadow-grit">
            <h3 className="font-bold text-xl mb-4">Create New Template</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Template Name *</label>
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g., Standard Invoice, Service Agreement"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <Input
                    value={tempCategory}
                    onChange={(e) => setTempCategory(e.target.value)}
                    placeholder="e.g., My Templates, Client Name"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <TextArea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Type *</label>
                <select
                  value={tempType}
                  onChange={(e) => setTempType(e.target.value as DocType)}
                  className="w-full border-2 border-gray-300 p-2 font-sans"
                >
                  <option value={DocType.INVOICE}>Invoice</option>
                  <option value={DocType.CONTRACT}>Contract</option>
                </select>
              </div>

              {/* INVOICE TEMPLATE FIELDS */}
              {tempType === DocType.INVOICE && (
                <>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <h4 className="font-bold text-lg mb-3">Invoice Settings</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold mb-1">Default Notes</label>
                        <TextArea
                          value={tempDefaultNotes}
                          onChange={(e) => setTempDefaultNotes(e.target.value)}
                          placeholder="Payment terms, thank you message, etc..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempDefaultTaxEnabled}
                            onChange={(e) => setTempDefaultTaxEnabled(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-bold">Enable Tax by Default</span>
                        </label>

                        {tempDefaultTaxEnabled && (
                          <div className="flex items-center gap-2">
                            <label className="font-bold">Tax Rate:</label>
                            <input
                              type="number"
                              value={tempDefaultTaxRate}
                              onChange={(e) => setTempDefaultTaxRate(parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border-2 border-gray-300"
                              placeholder="15"
                            />
                            <span>%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <label className="block font-bold mb-2">Template Line Items</label>
                    <div className="space-y-2 mb-3">
                      {tempItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 p-3 border border-gray-300 rounded">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].description = e.target.value;
                              setTempItems(updated);
                            }}
                            className="flex-1 text-sm font-medium px-2 py-1 border border-gray-300"
                            placeholder="Item description"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].quantity = parseFloat(e.target.value) || 0;
                              setTempItems(updated);
                            }}
                            className="w-16 text-sm px-2 py-1 border border-gray-300"
                            placeholder="Qty"
                          />
                          <input
                            type="text"
                            value={item.unitType}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].unitType = e.target.value;
                              setTempItems(updated);
                            }}
                            className="w-20 text-sm px-2 py-1 border border-gray-300"
                            placeholder="Unit"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setTempItems(updated);
                            }}
                            className="w-24 text-sm px-2 py-1 border border-gray-300"
                            placeholder="Price"
                          />
                          <button
                            onClick={() => setTempItems(tempItems.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const newItem = {
                          id: Date.now().toString(),
                          description: 'New Item',
                          quantity: 1,
                          unitType: 'ea',
                          price: 0
                        };
                        setTempItems([...tempItems, newItem]);
                      }}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Line Item
                    </button>
                  </div>
                </>
              )}

              {/* CONTRACT TEMPLATE FIELDS */}
              {tempType === DocType.CONTRACT && (
                <>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <h4 className="font-bold text-lg mb-3">Contract Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block font-bold mb-1">Contract Type</label>
                        <select
                          value={tempContractType}
                          onChange={(e) => setTempContractType(e.target.value)}
                          className="w-full border-2 border-gray-300 p-2"
                        >
                          <option value="">Select type...</option>
                          <option value="Service Agreement">Service Agreement</option>
                          <option value="Consulting Agreement">Consulting Agreement</option>
                          <option value="NDA">Non-Disclosure Agreement</option>
                          <option value="Partnership Agreement">Partnership Agreement</option>
                          <option value="Employment Contract">Employment Contract</option>
                          <option value="Freelance Contract">Freelance Contract</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Default Payment Schedule</label>
                        <select
                          value={tempDefaultPaymentSchedule}
                          onChange={(e) => setTempDefaultPaymentSchedule(e.target.value as any)}
                          className="w-full border-2 border-gray-300 p-2"
                        >
                          <option value="upfront">Upfront</option>
                          <option value="milestone">Milestone-based</option>
                          <option value="monthly">Monthly</option>
                          <option value="completion">On Completion</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block font-bold mb-1">Default Jurisdiction</label>
                      <Input
                        value={tempDefaultJurisdiction}
                        onChange={(e) => setTempDefaultJurisdiction(e.target.value)}
                        placeholder="e.g., Republic of South Africa, State of California"
                      />
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <label className="block font-bold mb-2">Contract Content (Clauses & Visual Components)</label>
                    <div className="space-y-3 mb-3">
                      {getContentItems().map((item, idx) => (
                        item.type === 'clause' ? (
                          // Clause Item
                          <div
                            key={`clause-${item.data.id || idx}`}
                            draggable
                            onDragStart={(e) => handleContentDragStart(e, idx)}
                            onDragOver={handleContentDragOver}
                            onDrop={(e) => handleContentDrop(e, idx)}
                            className={`bg-gray-50 p-3 border border-gray-300 rounded cursor-move hover:border-purple-400 transition-colors ${
                              draggedContentIndex === idx ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <GripVertical size={16} className="text-gray-400" />
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">CLAUSE</span>
                                <input
                                  type="text"
                                  value={item.data.title}
                                  onChange={(e) => {
                                    const updated = [...tempClauses];
                                    const clauseIdx = updated.findIndex(c => c.id === item.data.id);
                                    if (clauseIdx !== -1) {
                                      updated[clauseIdx].title = e.target.value;
                                      setTempClauses(updated);
                                    }
                                  }}
                                  className="flex-1 font-bold px-2 py-1 border border-gray-300"
                                  placeholder="Clause title"
                                />
                              </div>
                              <select
                                value={item.data.section || 'general'}
                                onChange={(e) => {
                                  const updated = [...tempClauses];
                                  const clauseIdx = updated.findIndex(c => c.id === item.data.id);
                                  if (clauseIdx !== -1) {
                                    updated[clauseIdx].section = e.target.value;
                                    setTempClauses(updated);
                                  }
                                }}
                                className="px-2 py-1 border border-gray-300 text-sm mr-2"
                              >
                                <option value="scope">Scope of Work</option>
                                <option value="terms">Terms & Conditions</option>
                                <option value="general">General</option>
                              </select>
                              <button
                                onClick={() => setTempClauses(tempClauses.filter(c => c.id !== item.data.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <TextArea
                              value={item.data.content}
                              onChange={(e) => {
                                const updated = [...tempClauses];
                                const clauseIdx = updated.findIndex(c => c.id === item.data.id);
                                if (clauseIdx !== -1) {
                                  updated[clauseIdx].content = e.target.value;
                                  setTempClauses(updated);
                                }
                              }}
                              placeholder="Clause content..."
                              rows={4}
                            />
                          </div>
                        ) : (
                          // Visual Component Item
                          <div
                            key={`visual-${item.data.id}`}
                            draggable
                            onDragStart={(e) => handleContentDragStart(e, idx)}
                            onDragOver={handleContentDragOver}
                            onDrop={(e) => handleContentDrop(e, idx)}
                            className={`bg-blue-50 p-3 border-2 border-blue-300 rounded cursor-move hover:border-blue-500 transition-colors ${
                              draggedContentIndex === idx ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical size={16} className="text-blue-400" />
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-bold">VISUAL</span>
                                <BarChart3 size={16} className="text-blue-600" />
                                <span className="font-medium text-blue-900">{item.data.title}</span>
                              </div>
                              <button
                                onClick={() => setTempVisualComponents(tempVisualComponents.filter(v => v.id !== item.data.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newClause = {
                            id: Date.now().toString(),
                            title: 'New Clause',
                            content: '',
                            section: 'general' as const,
                            order: tempClauses.length + tempVisualComponents.length + 1
                          };
                          setTempClauses([...tempClauses, newClause]);
                        }}
                        className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Clause
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowVisualMenu(!showVisualMenu)}
                          className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <BarChart3 size={14} /> Add Visual Component
                        </button>
                        {showVisualMenu && (
                          <div className="absolute left-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 z-10 p-2 w-56">
                            <button
                              onClick={() => { addVisualComponent('pie-chart'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              📊 Pie Chart
                            </button>
                            <button
                              onClick={() => { addVisualComponent('bar-chart'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              📈 Bar Chart
                            </button>
                            <button
                              onClick={() => { addVisualComponent('timeline'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              📅 Timeline
                            </button>
                            <button
                              onClick={() => { addVisualComponent('tech-stack'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              💻 Tech Stack
                            </button>
                            <button
                              onClick={() => { addVisualComponent('cost-breakdown'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              💰 Cost Breakdown
                            </button>
                            <button
                              onClick={() => { addVisualComponent('multi-option-table'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              ✅ Multi-Option Table
                            </button>
                            <button
                              onClick={() => { addVisualComponent('visual-placeholder'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              🖼️ Visual Placeholder
                            </button>
                            <button
                              onClick={() => { addVisualComponent('fill-in-field'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              ✏️ Fill-in Field
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleAddTemplate}
                disabled={!tempName}
                className="w-full bg-grit-dark text-white font-bold px-6 py-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </button>
            </div>
          </div>
        )}

        {/* Edit Template Form */}
        {editingTemplate && (
          <div className="bg-blue-50 border-2 border-blue-500 p-6 mb-8 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Edit Template</h3>
              <button 
                onClick={() => {
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Template Name *</label>
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g., Standard Invoice, Service Agreement"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <Input
                    value={tempCategory}
                    onChange={(e) => setTempCategory(e.target.value)}
                    placeholder="e.g., My Templates, Client Name"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <TextArea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Type</label>
                <select
                  value={tempType}
                  onChange={(e) => setTempType(e.target.value as DocType)}
                  className="w-full border-2 border-gray-300 p-2 font-sans"
                  disabled
                >
                  <option value={DocType.INVOICE}>Invoice</option>
                  <option value={DocType.CONTRACT}>Contract</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation</p>
              </div>

              {/* INVOICE TEMPLATE FIELDS */}
              {tempType === DocType.INVOICE && (
                <>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <h4 className="font-bold text-lg mb-3">Invoice Settings</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold mb-1">Default Notes</label>
                        <TextArea
                          value={tempDefaultNotes}
                          onChange={(e) => setTempDefaultNotes(e.target.value)}
                          placeholder="Payment terms, thank you message, etc..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempDefaultTaxEnabled}
                            onChange={(e) => setTempDefaultTaxEnabled(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-bold">Enable Tax by Default</span>
                        </label>

                        {tempDefaultTaxEnabled && (
                          <div className="flex items-center gap-2">
                            <label className="font-bold">Tax Rate:</label>
                            <input
                              type="number"
                              value={tempDefaultTaxRate}
                              onChange={(e) => setTempDefaultTaxRate(parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border-2 border-gray-300"
                              placeholder="15"
                            />
                            <span>%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <label className="block font-bold mb-2">Template Line Items</label>
                    <div className="space-y-2 mb-3">
                      {tempItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-3 border border-blue-300 rounded">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].description = e.target.value;
                              setTempItems(updated);
                            }}
                            className="flex-1 text-sm font-medium px-2 py-1 border border-gray-300 rounded"
                            placeholder="Item description"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].quantity = parseFloat(e.target.value) || 0;
                              setTempItems(updated);
                            }}
                            className="w-16 text-sm px-2 py-1 border border-gray-300 rounded"
                            placeholder="Qty"
                          />
                          <input
                            type="text"
                            value={item.unitType}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].unitType = e.target.value;
                              setTempItems(updated);
                            }}
                            className="w-20 text-sm px-2 py-1 border border-gray-300 rounded"
                            placeholder="Unit"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...tempItems];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setTempItems(updated);
                            }}
                            className="w-24 text-sm px-2 py-1 border border-gray-300 rounded"
                            placeholder="Price"
                          />
                          <button
                            onClick={() => setTempItems(tempItems.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const newItem = {
                          id: Date.now().toString(),
                          description: 'New Item',
                          quantity: 1,
                          unitType: 'ea',
                          price: 0
                        };
                        setTempItems([...tempItems, newItem]);
                      }}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Line Item
                    </button>
                  </div>
                </>
              )}

              {/* CONTRACT TEMPLATE FIELDS */}
              {tempType === DocType.CONTRACT && (
                <>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <h4 className="font-bold text-lg mb-3">Contract Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block font-bold mb-1">Contract Type</label>
                        <select
                          value={tempContractType}
                          onChange={(e) => setTempContractType(e.target.value)}
                          className="w-full border-2 border-gray-300 p-2"
                        >
                          <option value="">Select type...</option>
                          <option value="Service Agreement">Service Agreement</option>
                          <option value="Consulting Agreement">Consulting Agreement</option>
                          <option value="NDA">Non-Disclosure Agreement</option>
                          <option value="Partnership Agreement">Partnership Agreement</option>
                          <option value="Employment Contract">Employment Contract</option>
                          <option value="Freelance Contract">Freelance Contract</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Default Payment Schedule</label>
                        <select
                          value={tempDefaultPaymentSchedule}
                          onChange={(e) => setTempDefaultPaymentSchedule(e.target.value as any)}
                          className="w-full border-2 border-gray-300 p-2"
                        >
                          <option value="upfront">Upfront</option>
                          <option value="milestone">Milestone-based</option>
                          <option value="monthly">Monthly</option>
                          <option value="completion">On Completion</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block font-bold mb-1">Default Jurisdiction</label>
                      <Input
                        value={tempDefaultJurisdiction}
                        onChange={(e) => setTempDefaultJurisdiction(e.target.value)}
                        placeholder="e.g., Republic of South Africa, State of California"
                      />
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <label className="block font-bold mb-2">Contract Content (Clauses & Visual Components)</label>
                    <div className="space-y-3 mb-3">
                      {getContentItems().map((item, idx) => (
                        item.type === 'clause' ? (
                          // Clause Item
                          <div
                            key={`clause-${item.data.id || idx}`}
                            draggable
                            onDragStart={(e) => handleContentDragStart(e, idx)}
                            onDragOver={handleContentDragOver}
                            onDrop={(e) => handleContentDrop(e, idx)}
                            className={`bg-white p-3 border border-gray-300 rounded cursor-move hover:border-purple-400 transition-colors ${
                              draggedContentIndex === idx ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <GripVertical size={16} className="text-gray-400" />
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">CLAUSE</span>
                                <input
                                  type="text"
                                  value={item.data.title}
                                  onChange={(e) => {
                                    const updated = [...tempClauses];
                                    const clauseIdx = updated.findIndex(c => c.id === item.data.id);
                                    if (clauseIdx !== -1) {
                                      updated[clauseIdx].title = e.target.value;
                                      setTempClauses(updated);
                                    }
                                  }}
                                  className="flex-1 font-bold px-2 py-1 border border-gray-300"
                                  placeholder="Clause title"
                                />
                              </div>
                              <select
                                value={item.data.section || 'general'}
                                onChange={(e) => {
                                  const updated = [...tempClauses];
                                  const clauseIdx = updated.findIndex(c => c.id === item.data.id);
                                  if (clauseIdx !== -1) {
                                    updated[clauseIdx].section = e.target.value;
                                    setTempClauses(updated);
                                  }
                                }}
                                className="px-2 py-1 border border-gray-300 text-sm mr-2"
                              >
                                <option value="scope">Scope of Work</option>
                                <option value="terms">Terms & Conditions</option>
                                <option value="general">General</option>
                              </select>
                              <button
                                onClick={() => setTempClauses(tempClauses.filter(c => c.id !== item.data.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <TextArea
                              value={item.data.content}
                              onChange={(e) => {
                                const updated = [...tempClauses];
                                const clauseIdx = updated.findIndex(c => c.id === item.data.id);
                                if (clauseIdx !== -1) {
                                  updated[clauseIdx].content = e.target.value;
                                  setTempClauses(updated);
                                }
                              }}
                              placeholder="Clause content..."
                              rows={4}
                            />
                          </div>
                        ) : (
                          // Visual Component Item
                          <div
                            key={`visual-${item.data.id}`}
                            draggable
                            onDragStart={(e) => handleContentDragStart(e, idx)}
                            onDragOver={handleContentDragOver}
                            onDrop={(e) => handleContentDrop(e, idx)}
                            className={`bg-blue-50 p-3 border-2 border-blue-300 rounded cursor-move hover:border-blue-500 transition-colors ${
                              draggedContentIndex === idx ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical size={16} className="text-blue-400" />
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-bold">VISUAL</span>
                                <BarChart3 size={16} className="text-blue-600" />
                                <span className="font-medium text-blue-900">{item.data.title}</span>
                              </div>
                              <button
                                onClick={() => setTempVisualComponents(tempVisualComponents.filter(v => v.id !== item.data.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newClause = {
                            id: Date.now().toString(),
                            title: 'New Clause',
                            content: '',
                            section: 'general' as const,
                            order: tempClauses.length + tempVisualComponents.length + 1
                          };
                          setTempClauses([...tempClauses, newClause]);
                        }}
                        className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Clause
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowVisualMenu(!showVisualMenu)}
                          className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <BarChart3 size={14} /> Add Visual Component
                        </button>
                        {showVisualMenu && (
                          <div className="absolute left-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 z-10 p-2 w-56">
                            <button
                              onClick={() => { addVisualComponent('pie-chart'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              📊 Pie Chart
                            </button>
                            <button
                              onClick={() => { addVisualComponent('bar-chart'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              📈 Bar Chart
                            </button>
                            <button
                              onClick={() => { addVisualComponent('timeline'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              📅 Timeline
                            </button>
                            <button
                              onClick={() => { addVisualComponent('tech-stack'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              💻 Tech Stack
                            </button>
                            <button
                              onClick={() => { addVisualComponent('cost-breakdown'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              💰 Cost Breakdown
                            </button>
                            <button
                              onClick={() => { addVisualComponent('multi-option-table'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              ✅ Multi-Option Table
                            </button>
                            <button
                              onClick={() => { addVisualComponent('visual-placeholder'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              🖼️ Visual Placeholder
                            </button>
                            <button
                              onClick={() => { addVisualComponent('fill-in-field'); setShowVisualMenu(false); }}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded"
                            >
                              ✏️ Fill-in Field
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border-2 border-gray-300 font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!tempName}
                  className="bg-blue-600 text-white font-bold px-6 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid - Grouped by Category */}
        {Object.keys(groupedTemplates).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300">
            <FileBox size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 font-bold">No templates yet</p>
            <p className="text-sm text-gray-400">Create your first template to get started</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]: [string, TemplateBlock[]]) => (
              <div key={category}>
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-grit-dark">
                  {category}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({categoryTemplates.length})
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white border-2 border-gray-200 p-5 relative group hover:border-grit-dark transition-all cursor-pointer hover:shadow-lg"
                      onClick={() => handleEditTemplate(template)}
                    >
                      {/* Edit and Delete Buttons */}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template);
                          }}
                          className="text-blue-500 hover:text-blue-700 bg-white rounded p-1"
                          title="Edit template"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Delete this template?')) {
                              handleDeleteTemplate(template.id);
                            }
                          }}
                          className="text-gray-300 hover:text-red-500 bg-white rounded p-1"
                          title="Delete template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Type Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          template.type === DocType.INVOICE 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {template.type}
                        </span>
                      </div>

                      {/* Template Name */}
                      <div className="flex items-start gap-2 mb-2">
                        <FileText size={20} className="text-grit-dark mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg leading-tight">{template.name}</h3>
                          {template.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Template Details */}
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                        {template.type === DocType.INVOICE && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Line Items:</span>
                              <span className="font-bold">{template.items?.length || 0}</span>
                            </div>
                            {template.defaultTaxEnabled && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Default Tax:</span>
                                <span className="font-bold">{template.defaultTaxRate}%</span>
                              </div>
                            )}
                            {template.defaultNotes && (
                              <div className="text-xs text-gray-500 mt-2 italic line-clamp-2">
                                "{template.defaultNotes}"
                              </div>
                            )}
                          </>
                        )}
                        
                        {template.type === DocType.CONTRACT && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Clauses:</span>
                              <span className="font-bold">{template.clauses?.length || (template.clause ? 1 : 0)}</span>
                            </div>
                            {template.contractType && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Type:</span>
                                <span className="font-bold text-xs">{template.contractType}</span>
                              </div>
                            )}
                            {template.defaultJurisdiction && (
                              <div className="text-xs text-gray-500 mt-2">
                                {template.defaultJurisdiction}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesScreen;
