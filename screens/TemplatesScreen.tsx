import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, FileBox } from 'lucide-react';
import { TemplateBlock, DocType } from '../types';
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
  const [tempName, setTempName] = useState('');
  const [tempCategory, setTempCategory] = useState('My Templates');
  const [tempType, setTempType] = useState<DocType>(DocType.INVOICE);
  const [tempItems, setTempItems] = useState<any[]>([]);
  const [tempClauseContent, setTempClauseContent] = useState('');
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
      category: tempCategory,
      type: tempType,
      items: tempType === DocType.INVOICE ? tempItems : undefined,
      clause: tempType === DocType.CONTRACT ? {
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
    setTempName('');
    setTempCategory('My Templates');
    setTempType(DocType.INVOICE);
    setTempItems([]);
    setTempClauseContent('');
    setShowAddTemplate(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    setTemplates(templates.filter(t => t.id !== id));
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

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Templates</h1>
          <p className="text-gray-600">Create and manage reusable templates for invoices and contracts</p>
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
              <div>
                <label className="block font-bold mb-1">Template Name</label>
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

              <div>
                <label className="block font-bold mb-1">Type</label>
                <select
                  value={tempType}
                  onChange={(e) => setTempType(e.target.value as DocType)}
                  className="w-full border-2 border-gray-300 p-2 font-sans"
                >
                  <option value={DocType.INVOICE}>Invoice</option>
                  <option value={DocType.CONTRACT}>Contract</option>
                </select>
              </div>

              {tempType === DocType.CONTRACT && (
                <div>
                  <label className="block font-bold mb-1">Clause Content</label>
                  <TextArea
                    value={tempClauseContent}
                    onChange={(e) => setTempClauseContent(e.target.value)}
                    placeholder="Enter the clause text..."
                    rows={6}
                  />
                </div>
              )}

              {tempType === DocType.INVOICE && (
                <div>
                  <label className="block font-bold mb-2">Template Items</label>
                  <div className="space-y-2 mb-3">
                    {tempItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 border border-gray-300">
                        <span className="flex-1 text-sm font-medium truncate">{item.description}</span>
                        <span className="text-sm text-gray-600">{item.quantity} {item.unitType}</span>
                        <span className="text-sm font-bold">${item.price}</span>
                        <button
                          onClick={() => setTempItems(tempItems.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
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
                    <Plus size={14} /> Add Item
                  </button>
                </div>
              )}

              <button
                onClick={handleAddTemplate}
                disabled={!tempName}
                className="bg-grit-dark text-white font-bold px-6 py-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
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
                      className="bg-white border-2 border-gray-200 p-4 relative group hover:border-grit-dark transition-all"
                    >
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete template"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Type Badge */}
                      <div className="flex justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 ${
                          template.type === DocType.INVOICE 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {template.type}
                        </span>
                      </div>

                      {/* Template Name */}
                      <div className="flex items-start gap-2">
                        <FileText size={20} className="text-grit-dark mt-1 flex-shrink-0" />
                        <h3 className="font-bold text-lg">{template.name}</h3>
                      </div>

                      {/* Item Count / Clause Info */}
                      <p className="text-sm text-gray-500 mt-2">
                        {template.type === DocType.INVOICE && template.items
                          ? `${template.items.length} items`
                          : template.type === DocType.CONTRACT && template.clause
                          ? 'Contract clause'
                          : 'Template ready'}
                      </p>
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
