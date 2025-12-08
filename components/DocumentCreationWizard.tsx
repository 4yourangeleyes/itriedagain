import React, { useState } from 'react';
import { 
  X, User, UserPlus, FileText, FileSignature, ArrowLeft, ArrowRight,
  FileCheck, Rocket, RefreshCw, Lock, Users, Briefcase, Lightbulb,
  Wrench, FileCode, Handshake, LifeBuoy
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Client, DocType, ContractType } from '../types';

interface DocumentCreationWizardProps {
  onClose: () => void;
  onComplete: (client: Client, docType: DocType, contractType?: ContractType) => void;
  existingClients: Client[];
  onAddClient: (client: Client) => void;
}

type Step = 'client' | 'docType' | 'contractType';

export const DocumentCreationWizard: React.FC<DocumentCreationWizardProps> = ({
  onClose,
  onComplete,
  existingClients,
  onAddClient
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('client');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);
  
  // New client form
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    registrationNumber: ''
  });

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentStep('docType');
  };

  const handleCreateNewClient = () => {
    if (!newClientData.businessName || !newClientData.email) {
      alert('Business name and email are required');
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      businessName: newClientData.businessName,
      email: newClientData.email,
      phone: newClientData.phone,
      address: newClientData.address,
      registrationNumber: newClientData.registrationNumber
    };

    onAddClient(newClient);
    setSelectedClient(newClient);
    setShowNewClientForm(false);
    setCurrentStep('docType');
  };

  const handleDocTypeSelect = (docType: DocType) => {
    setSelectedDocType(docType);
    
    if (docType === DocType.CONTRACT) {
      setCurrentStep('contractType');
    } else {
      // For invoices, complete immediately
      if (selectedClient) {
        onComplete(selectedClient, docType);
      }
    }
  };

  const handleContractTypeSelect = (contractType: ContractType) => {
    setSelectedContractType(contractType);
    
    if (selectedClient && selectedDocType) {
      onComplete(selectedClient, selectedDocType, contractType);
    }
  };

  const handleBack = () => {
    if (currentStep === 'contractType') {
      setCurrentStep('docType');
      setSelectedContractType(null);
    } else if (currentStep === 'docType') {
      setCurrentStep('client');
      setSelectedDocType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-grit-dark shadow-grit max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-grit-dark text-grit-primary p-6 flex items-center justify-between border-b-4 border-grit-dark">
          <div className="flex items-center gap-3">
            {currentStep !== 'client' && (
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-grit-primary hover:text-grit-dark border-2 border-grit-primary transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-bold">
              {currentStep === 'client' && 'Select Client'}
              {currentStep === 'docType' && 'Document Type'}
              {currentStep === 'contractType' && 'Contract Type'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-600 hover:text-white border-2 border-grit-primary transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-100 border-b-2 border-gray-300 p-4">
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <div className={`flex-1 h-2 rounded-full ${currentStep === 'client' ? 'bg-grit-primary' : selectedClient ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`flex-1 h-2 rounded-full ${currentStep === 'docType' ? 'bg-grit-primary' : selectedDocType ? 'bg-green-500' : 'bg-gray-300'}`} />
            {selectedDocType === DocType.CONTRACT && (
              <div className={`flex-1 h-2 rounded-full ${currentStep === 'contractType' ? 'bg-grit-primary' : selectedContractType ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs font-bold text-gray-600">
            <span className={selectedClient ? 'text-green-600' : ''}>1. CLIENT</span>
            <span className={selectedDocType ? 'text-green-600' : ''}>2. TYPE</span>
            {selectedDocType === DocType.CONTRACT && (
              <span className={selectedContractType ? 'text-green-600' : ''}>3. CONTRACT</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: Client Selection */}
          {currentStep === 'client' && (
            <div>
              {!showNewClientForm ? (
                <>
                  <div className="mb-6">
                    <Button onClick={() => setShowNewClientForm(true)} className="w-full mb-4 flex items-center justify-center gap-2">
                      <UserPlus size={20} />
                      Add New Client
                    </Button>
                  </div>

                  <h3 className="text-lg font-bold mb-4 text-gray-700">Or select existing client:</h3>
                  
                  {existingClients.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <User size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No clients yet. Add your first client above!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {existingClients.map(client => (
                        <button
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          className="text-left p-4 border-2 border-gray-300 hover:border-grit-primary hover:bg-grit-primary hover:bg-opacity-10 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg group-hover:text-grit-primary">{client.businessName}</h4>
                              <p className="text-sm text-gray-600 mt-1">{client.email}</p>
                              {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                            </div>
                            <ArrowRight size={20} className="text-gray-400 group-hover:text-grit-primary" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="max-w-lg mx-auto">
                  <h3 className="text-xl font-bold mb-6">New Client Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Business Name *</label>
                      <Input
                        value={newClientData.businessName}
                        onChange={(e) => setNewClientData({...newClientData, businessName: e.target.value})}
                        placeholder="ABC Company (Pty) Ltd"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Email *</label>
                      <Input
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                        placeholder="contact@abccompany.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Phone</label>
                      <Input
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                        placeholder="+27 12 345 6789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Address</label>
                      <Input
                        value={newClientData.address}
                        onChange={(e) => setNewClientData({...newClientData, address: e.target.value})}
                        placeholder="123 Main Street, Cape Town"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Registration Number</label>
                      <Input
                        value={newClientData.registrationNumber}
                        onChange={(e) => setNewClientData({...newClientData, registrationNumber: e.target.value})}
                        placeholder="2021/123456/07"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button onClick={() => setShowNewClientForm(false)} className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateNewClient} className="flex-1">
                      Create Client
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Document Type Selection */}
          {currentStep === 'docType' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-center text-gray-600 mb-8">
                Creating document for <span className="font-bold text-grit-primary">{selectedClient?.businessName}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invoice Card */}
                <button
                  onClick={() => handleDocTypeSelect(DocType.INVOICE)}
                  className="p-8 border-4 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all group text-left"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-100 border-4 border-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-green-600">Invoice</h3>
                    <p className="text-sm text-gray-600">Request payment for goods or services</p>
                    <div className="mt-4 text-xs text-gray-500">
                      • Line items<br />
                      • Pricing & totals<br />
                      • Tax calculations<br />
                      • Multiple themes
                    </div>
                  </div>
                </button>

                {/* Contract Card */}
                <button
                  onClick={() => handleDocTypeSelect(DocType.CONTRACT)}
                  className="p-8 border-4 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-purple-100 border-4 border-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileSignature size={40} className="text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-600">Contract</h3>
                    <p className="text-sm text-gray-600">Legal agreement with clauses & terms</p>
                    <div className="mt-4 text-xs text-gray-500">
                      • Professional clauses<br />
                      • SA-compliant<br />
                      • Multiple contract types<br />
                      • Signature ready
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Contract Type Selection */}
          {currentStep === 'contractType' && (
            <div>
              <h3 className="text-center text-gray-600 mb-8">
                Select contract type for <span className="font-bold text-grit-primary">{selectedClient?.businessName}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(ContractType).map(contractType => {
                  const typeInfo = getContractTypeInfo(contractType);
                  return (
                    <button
                      key={contractType}
                      onClick={() => handleContractTypeSelect(contractType)}
                      className="p-6 border-2 border-gray-300 hover:border-grit-primary hover:bg-grit-primary hover:bg-opacity-10 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{typeInfo.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1 group-hover:text-grit-primary">{contractType}</h4>
                          <p className="text-sm text-gray-600">{typeInfo.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for contract type information
function getContractTypeInfo(type: ContractType): { icon: React.ReactNode; description: string } {
  const iconSize = 28;
  const info: Record<ContractType, { icon: React.ReactNode; description: string }> = {
    [ContractType.SERVICE_AGREEMENT]: { 
      icon: <FileCheck size={iconSize} className="text-blue-600" />, 
      description: 'General professional services agreement' 
    },
    [ContractType.PROJECT_CONTRACT]: { 
      icon: <Rocket size={iconSize} className="text-purple-600" />, 
      description: 'Specific project with deliverables' 
    },
    [ContractType.RETAINER]: { 
      icon: <RefreshCw size={iconSize} className="text-green-600" />, 
      description: 'Ongoing monthly services' 
    },
    [ContractType.NDA]: { 
      icon: <Lock size={iconSize} className="text-red-600" />, 
      description: 'Non-disclosure agreement' 
    },
    [ContractType.SHAREHOLDER]: { 
      icon: <Users size={iconSize} className="text-indigo-600" />, 
      description: 'Shareholder agreement' 
    },
    [ContractType.EMPLOYMENT]: { 
      icon: <Briefcase size={iconSize} className="text-amber-600" />, 
      description: 'Employment contract' 
    },
    [ContractType.CONSULTING]: { 
      icon: <Lightbulb size={iconSize} className="text-yellow-600" />, 
      description: 'Consulting services' 
    },
    [ContractType.MAINTENANCE]: { 
      icon: <Wrench size={iconSize} className="text-orange-600" />, 
      description: 'Maintenance & support' 
    },
    [ContractType.LICENSE]: { 
      icon: <FileCode size={iconSize} className="text-cyan-600" />, 
      description: 'Software/IP licensing' 
    },
    [ContractType.PARTNERSHIP]: { 
      icon: <Handshake size={iconSize} className="text-pink-600" />, 
      description: 'Business partnership' 
    },
    [ContractType.SUPPORT]: { 
      icon: <LifeBuoy size={iconSize} className="text-teal-600" />, 
      description: 'Technical support agreement' 
    },
  };

  return info[type] || { 
    icon: <FileSignature size={iconSize} className="text-gray-600" />, 
    description: 'Contract agreement' 
  };
}
