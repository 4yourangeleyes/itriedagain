import React, { useState } from 'react';
import { Client, DocumentData } from '../types';
import { Search, FileText, Mail, MapPin, Phone, Trash2, Plus, X, Edit2 } from 'lucide-react';
import { Input, TextArea } from '../components/Input';
import { Button } from '../components/Button';
import { useOnboarding } from '../context/OnboardingContext';
import { OnboardingTooltip } from '../components/OnboardingTooltip';

interface ClientsScreenProps {
    clients: Client[];
    documents: DocumentData[];
    saveClient: (client: Client) => Promise<any>;
    deleteClient: (id: string) => Promise<void>;
}

const ClientsScreen: React.FC<ClientsScreenProps> = ({ clients, documents, saveClient, deleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientReg, setNewClientReg] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const { activeStep, showGuide, completeStep } = useOnboarding();

  const handleAddClient = async () => {
    if (!newClientName || !newClientEmail) {
      alert('Business name and email are required.');
      return;
    }

    const newClient: Client = {
      id: crypto.randomUUID(),
      businessName: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      registrationNumber: newClientReg,
      address: newClientAddress,
    };

    try {
      await saveClient(newClient);
      
      // Complete onboarding step immediately after saving
      if (activeStep === 'client') {
        completeStep('client');
      }
      
      setIsAddingClient(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientReg('');
      setNewClientAddress('');
    } catch (error) {
      console.error('Failed to create client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClientName(client.businessName);
    setNewClientEmail(client.email);
    setNewClientPhone(client.phone || '');
    setNewClientReg(client.registrationNumber || '');
    setNewClientAddress(client.address || '');
  };

  const handleSaveEdit = async () => {
    if (!editingClient || !newClientName || !newClientEmail) {
      alert('Business name and email are required.');
      return;
    }

    const updatedClient: Client = {
      ...editingClient,
      businessName: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      registrationNumber: newClientReg,
      address: newClientAddress,
    };

    try {
      await saveClient(updatedClient);
      setEditingClient(null);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientReg('');
      setNewClientAddress('');
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  const filteredClients = clients.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientDocs = (clientId: string) => {
      return documents.filter(d => d.client.id === clientId || d.client.businessName === clients.find(c => c.id === clientId)?.businessName).slice(0, 3);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-bold mb-2">Clients</h1>
                <p className="text-gray-500 font-medium">Manage your relationships and view history.</p>
            </div>
            <div className="flex gap-4 items-center">
                <div className="w-full md:w-auto relative">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20}/>
                    <Input 
                        placeholder="Search clients..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddingClient(true)} icon={<Plus size={18}/>} id="add-client-button">New Client</Button>
            </div>
        </div>

        {/* Client Creation Guide */}
        {activeStep === 'client' && showGuide && !isAddingClient && (
            <div className="relative mb-6">
                <OnboardingTooltip
                    title="Add Your First Client"
                    description="Click the 'New Client' button above to add your first client. You'll need their business name and email address. You can add more details like phone number and address later."
                    step="3"
                    totalSteps="5"
                    position="bottom"
                    onNext={() => setIsAddingClient(true)}
                    onSkip={() => completeStep('client')}
                />
            </div>
        )}

        {isAddingClient && (
            <div className="bg-gray-100 border-2 border-grit-dark p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">New Client</h3>
                    <button onClick={() => setIsAddingClient(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="grid gap-4">
                    <Input 
                        label="Business Name" 
                        value={newClientName} 
                        onChange={e => setNewClientName(e.target.value)} 
                        placeholder="Client business name" 
                    />
                    <Input 
                        label="Email" 
                        type="email"
                        value={newClientEmail} 
                        onChange={e => setNewClientEmail(e.target.value)} 
                        placeholder="client@email.com" 
                    />
                    <Input 
                        label="Phone" 
                        value={newClientPhone} 
                        onChange={e => setNewClientPhone(e.target.value)} 
                        placeholder="Phone number" 
                    />
                    <Input 
                        label="Registration Number" 
                        value={newClientReg} 
                        onChange={e => setNewClientReg(e.target.value)} 
                        placeholder="Reg or tax number" 
                    />
                    <TextArea 
                        label="Address" 
                        value={newClientAddress} 
                        onChange={e => setNewClientAddress(e.target.value)} 
                        placeholder="Full address" 
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingClient(false)}>Cancel</Button>
                        <Button onClick={handleAddClient}>Save Client</Button>
                    </div>
                </div>
            </div>
        )}

        {editingClient && (
            <div className="bg-blue-50 border-2 border-blue-500 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">Edit Client</h3>
                    <button onClick={() => {
                        setEditingClient(null);
                        setNewClientName('');
                        setNewClientEmail('');
                        setNewClientPhone('');
                        setNewClientReg('');
                        setNewClientAddress('');
                    }} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="grid gap-4">
                    <Input 
                        label="Business Name" 
                        value={newClientName} 
                        onChange={e => setNewClientName(e.target.value)} 
                        placeholder="Client business name" 
                    />
                    <Input 
                        label="Email" 
                        type="email"
                        value={newClientEmail} 
                        onChange={e => setNewClientEmail(e.target.value)} 
                        placeholder="client@email.com" 
                    />
                    <Input 
                        label="Phone" 
                        value={newClientPhone} 
                        onChange={e => setNewClientPhone(e.target.value)} 
                        placeholder="Phone number" 
                    />
                    <Input 
                        label="Registration Number" 
                        value={newClientReg} 
                        onChange={e => setNewClientReg(e.target.value)} 
                        placeholder="Reg or tax number" 
                    />
                    <TextArea 
                        label="Address" 
                        value={newClientAddress} 
                        onChange={e => setNewClientAddress(e.target.value)} 
                        placeholder="Full address" 
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                            setEditingClient(null);
                            setNewClientName('');
                            setNewClientEmail('');
                            setNewClientPhone('');
                            setNewClientReg('');
                            setNewClientAddress('');
                        }}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Update Client</Button>
                    </div>
                </div>
            </div>
        )}

        {filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-400 font-bold text-lg">No clients found.</p>
                <p className="text-gray-400">Add clients via the Settings page or by creating a new invoice.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => {
                    const clientDocs = getClientDocs(client.id);
                    return (
                        <div 
                            key={client.id} 
                            className="bg-white border-2 border-grit-dark shadow-grit p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
                            onClick={() => handleEditClient(client)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-grit-secondary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                    {client.businessName.charAt(0)}
                                </div>
                                <div className="flex gap-2 items-start">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClient(client);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                        title="Edit client"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                                        {clientDocs.length} Docs
                                    </span>
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if(window.confirm('Delete this client?')) {
                                                await deleteClient(client.id);
                                            }
                                        }}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-1 truncate" title={client.businessName}>{client.businessName}</h3>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail size={14} className="text-grit-primary" /> 
                                    <span className="truncate">{client.email}</span>
                                </div>
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="text-grit-primary" /> 
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="border-t-2 border-gray-100 pt-4">
                                <p className="text-xs uppercase font-bold text-gray-400 mb-3">Recent Activity</p>
                                {clientDocs.length > 0 ? (
                                    <div className="space-y-2">
                                        {clientDocs.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between text-sm group cursor-default">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={14} className="text-gray-400 group-hover:text-grit-dark"/> 
                                                    <span className="font-medium truncate max-w-[120px]">{doc.title}</span>
                                                </div>
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${doc.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No documents yet.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default ClientsScreen;