/**
 * Quickee - Quick Document Creation
 * 
 * Simple workflow:
 * 1. Choose client
 * 2. Choose document type
 * 3. Select template blocks OR describe what you want (AI generates blocks)
 * 4. Configure layout and visual components
 * 5. Create and open in Canvas
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, Plus, Trash2, Loader } from 'lucide-react';
import { Button } from '../components/Button';
import { Input, TextArea } from '../components/Input';
import { Client, DocType, DocumentData, UserProfile, TemplateBlock, InvoiceItem, ContractClause } from '../types';
import { triggerHaptic } from '../App';
import { chatForDocumentCreation } from '../services/geminiService';
import { assembleDocument } from '../utils/documentBuilder';
import { generateInvoiceItems, generateContractClauses } from '../utils/templateBlockGenerator';

interface QuickeeScreenProps {
  clients: Client[];
  profile: UserProfile;
  templates: TemplateBlock[];
  onDocumentCreated: (doc: DocumentData) => void;
  onNavigateToCanvas: (doc: DocumentData) => void;
}

type Step = 'client' | 'doctype' | 'content' | 'layout';

const QuickeeScreen: React.FC<QuickeeScreenProps> = ({
  clients,
  profile,
  templates,
  onDocumentCreated,
  onNavigateToCanvas,
}) => {
  const navigate = useNavigate();
  
  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('client');
  
  // Selected data
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [docType, setDocType] = useState<DocType>(DocType.INVOICE);
  const [selectedBlocks, setSelectedBlocks] = useState<TemplateBlock[]>([]);
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<InvoiceItem[]>([]);
  const [generatedClauses, setGeneratedClauses] = useState<ContractClause[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [theme, setTheme] = useState('swiss');

  // Filter templates by doc type
  const availableBlocks = templates.filter(t => t.type === docType);

  const handleGenerateFromAI = async () => {
    if (!aiDescription.trim() || !selectedClient || !profile) return;
    
    setIsGenerating(true);
    try {
      const result = await chatForDocumentCreation(
        aiDescription,
        docType,
        selectedClient.businessName,
        profile.companyName || 'Business',
        [],
        profile.industry
      );

      // Parse the AI response to extract items/clauses
      if (docType === DocType.INVOICE) {
        // Extract items from AI response (simplified parsing)
        const items = generateInvoiceItems([
          { description: aiDescription, quantity: 1, unitType: 'ea', price: 0 }
        ], 'AI Generated');
        setGeneratedItems(items);
      } else if (docType === DocType.CONTRACT) {
        const clauses = generateContractClauses([
          { title: 'AI Generated Clause', content: result.response, section: 'general' }
        ], 'AI Generated');
        setGeneratedClauses(clauses);
      }

      triggerHaptic('success');
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateDocument = () => {
    if (!selectedClient || !profile) {
      console.log('[Quickee] Cannot create - missing:', { selectedClient: !!selectedClient, profile: !!profile });
      return;
    }

    console.log('[Quickee] Creating document with:', { docType, selectedClient: selectedClient.businessName });
    setIsCreating(true);
    
    // Combine selected blocks + generated content
    const allItems = docType === DocType.INVOICE 
      ? [...selectedBlocks.flatMap(b => b.items || []), ...generatedItems]
      : [];
    
    const allClauses = docType === DocType.CONTRACT
      ? [...selectedBlocks.flatMap(b => b.clauses || []), ...generatedClauses]
      : [];

    const doc = assembleDocument({
      docType,
      title: documentTitle || `${docType} - ${selectedClient.businessName}`,
      client: selectedClient,
      profile,
      items: allItems,
      clauses: allClauses,
      theme,
    });

    console.log('[Quickee] Document assembled:', doc);
    
    // First set the document
    onDocumentCreated(doc);
    onNavigateToCanvas(doc);
    triggerHaptic('success');
    
    console.log('[Quickee] Navigating to canvas in 100ms...');
    
    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      setIsCreating(false);
      navigate('/canvas');
      console.log('[Quickee] Navigated to canvas');
    }, 100);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'client': return selectedClient !== null;
      case 'doctype': return true;
      case 'content': return selectedBlocks.length > 0 || generatedItems.length > 0 || generatedClauses.length > 0;
      case 'layout': return documentTitle.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-grit-bg p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-black/5 border-2 border-transparent hover:border-grit-dark transition-all">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">✨ Quickee</h1>
        </div>
        
        {/* Progress Steps */}
        <div className="flex gap-2 mb-6">
          {['client', 'doctype', 'content', 'layout'].map((step, idx) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded ${
                currentStep === step ? 'bg-grit-primary' :
                ['client', 'doctype', 'content', 'layout'].indexOf(currentStep) > idx ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto bg-white border-2 border-grit-dark p-6">
        {/* Step 1: Choose Client */}
        {currentStep === 'client' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose Client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setDocumentTitle(`${docType} - ${client.businessName}`);
                    triggerHaptic('light');
                  }}
                  className={`text-left p-4 border-2 rounded transition-all ${
                    selectedClient?.id === client.id
                      ? 'border-grit-primary bg-grit-primary/10'
                      : 'border-gray-300 hover:border-grit-primary'
                  }`}
                >
                  <div className="font-bold">{client.businessName}</div>
                  <div className="text-sm text-gray-600">{client.email}</div>
                </button>
              ))}
            </div>
            {clients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No clients yet. Add one from the Clients page.</p>
                <Button onClick={() => navigate('/clients')} className="mt-4">Go to Clients</Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Choose Document Type */}
        {currentStep === 'doctype' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose Document Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: DocType.INVOICE, label: 'Invoice', icon: '📄', desc: 'Bill for services or products' },
                { type: DocType.CONTRACT, label: 'Contract', icon: '📜', desc: 'Legal agreement or terms' },
                { type: DocType.HR_DOC, label: 'HR Document', icon: '📋', desc: 'Employee or HR related' },
              ].map(({ type, label, icon, desc }) => (
                <button
                  key={type}
                  onClick={() => {
                    setDocType(type);
                    setDocumentTitle(`${type} - ${selectedClient?.businessName}`);
                    triggerHaptic('light');
                  }}
                  className={`p-6 border-2 rounded transition-all ${
                    docType === type
                      ? 'border-grit-primary bg-grit-primary/10'
                      : 'border-gray-300 hover:border-grit-primary'
                  }`}
                >
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className="font-bold text-lg">{label}</div>
                  <div className="text-sm text-gray-600 mt-1">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Content - Template Blocks or AI */}
        {currentStep === 'content' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Add Content</h2>
            
            {/* AI Generation */}
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-blue-600" />
                <h3 className="font-bold">AI Generate</h3>
              </div>
              <TextArea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder={`Describe what you need... e.g., "Website development - 40 hours at $150/hr, hosting setup, 3 months maintenance"`}
                className="mb-2"
                rows={3}
              />
              <Button onClick={handleGenerateFromAI} disabled={!aiDescription.trim() || isGenerating || !profile}>
                {isGenerating && <Loader className="animate-spin mr-2" size={16} />}
                {!isGenerating && <Sparkles size={16} className="mr-2" />}
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>

            {/* Generated Content Preview */}
            {generatedItems.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  Generated {generatedItems.length} items
                </h4>
                {generatedItems.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-700">{item.description}</div>
                ))}
              </div>
            )}

            {generatedClauses.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  Generated {generatedClauses.length} clauses
                </h4>
                {generatedClauses.map((clause, idx) => (
                  <div key={idx} className="text-sm text-gray-700">{clause.title}</div>
                ))}
              </div>
            )}

            {/* Template Blocks */}
            <div className="border-t-2 pt-4">
              <h3 className="font-bold mb-3">Or Choose from Saved Templates</h3>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {availableBlocks.map(block => {
                  const isSelected = selectedBlocks.some(b => b.id === block.id);
                  return (
                    <button
                      key={block.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedBlocks(selectedBlocks.filter(b => b.id !== block.id));
                        } else {
                          setSelectedBlocks([...selectedBlocks, block]);
                        }
                        triggerHaptic('light');
                      }}
                      className={`text-left p-3 border-2 rounded flex items-center justify-between ${
                        isSelected ? 'border-grit-primary bg-grit-primary/10' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{block.name}</div>
                        <div className="text-xs text-gray-600">{block.category}</div>
                      </div>
                      {isSelected && <CheckCircle2 size={20} className="text-grit-primary" />}
                    </button>
                  );
                })}
                {availableBlocks.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No saved templates for {docType}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Layout & Theme */}
        {currentStep === 'layout' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Finalize Document</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Document Title</label>
                <Input
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="e.g., Website Development Invoice"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded"
                >
                  <option value="swiss">Swiss Grid (Clean)</option>
                  <option value="geometric">Geometric (Bold)</option>
                  <option value="minimal">Minimal (Simple)</option>
                  <option value="modern">Modern (Contemporary)</option>
                  <option value="corporate">Corporate (Professional)</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-300 rounded">
                <h3 className="font-bold mb-2">Summary</h3>
                <div className="text-sm space-y-1">
                  <div><strong>Client:</strong> {selectedClient?.businessName}</div>
                  <div><strong>Type:</strong> {docType}</div>
                  <div><strong>Template Blocks:</strong> {selectedBlocks.length}</div>
                  {docType === DocType.INVOICE && <div><strong>Items:</strong> {selectedBlocks.flatMap(b => b.items || []).length + generatedItems.length}</div>}
                  {docType === DocType.CONTRACT && <div><strong>Clauses:</strong> {selectedBlocks.flatMap(b => b.clauses || []).length + generatedClauses.length}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t-2">
          <Button
            onClick={() => {
              const steps: Step[] = ['client', 'doctype', 'content', 'layout'];
              const currentIdx = steps.indexOf(currentStep);
              if (currentIdx > 0) setCurrentStep(steps[currentIdx - 1]);
            }}
            disabled={currentStep === 'client'}
            variant="secondary"
          >
            <ArrowLeft size={16} /> Back
          </Button>

          {currentStep === 'layout' ? (
            <Button onClick={handleCreateDocument} disabled={!canProceed() || isCreating}>
              {isCreating && <Loader className="animate-spin mr-2" size={16} />}
              {isCreating ? 'Creating...' : 'Create Document'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const steps: Step[] = ['client', 'doctype', 'content', 'layout'];
                const currentIdx = steps.indexOf(currentStep);
                if (currentIdx < steps.length - 1) setCurrentStep(steps[currentIdx + 1]);
              }}
              disabled={!canProceed()}
            >
              Next <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickeeScreen;
