import React, { useState, useEffect } from 'react';
import { UserProfile, Client, TemplateBlock, DocType, InvoiceItem } from '../types';
import { Input, TextArea } from '../components/Input';
import { Button } from '../components/Button';
import { supabase as supabaseClient } from '../services/supabaseClient';
import { triggerHaptic } from '../App';
import { SystemDiagnostics } from '../components/SystemDiagnostics';
import { User, Briefcase, FileBox, Users, Edit2, Globe, Upload, Loader2, X, Plus, Trash2, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  templates: TemplateBlock[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateBlock[]>>;
  saveClient: (client: Client) => Promise<any>;
  deleteClient: (id: string) => Promise<void>;
}

const CURRENCIES = [
    { code: '$', label: 'Dollar ($)' },
    { code: '€', label: 'Euro (€)' },
    { code: '£', label: 'Pound (£)' },
    { code: 'R', label: 'Rand (R)' },
    { code: '¥', label: 'Yen (¥)' },
    { code: '₹', label: 'Rupee (₹)' },
];

const SettingsScreen: React.FC<SettingsProps> = ({ clients, setClients, templates, setTemplates, saveClient, deleteClient }) => {
  const { refreshProfile, isAuthenticated, profile: authProfile, user } = useAuth();
  
  // Local state for form inputs to make them editable
  const [localFullName, setLocalFullName] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [localCompanyName, setLocalCompanyName] = useState('');
  const [localRegistrationNumber, setLocalRegistrationNumber] = useState('');
  const [localVatNumber, setLocalVatNumber] = useState('');
  const [localBusinessType, setLocalBusinessType] = useState<1 | 2>(2);
  const [localPhone, setLocalPhone] = useState('');
  const [localAddress, setLocalAddress] = useState('');
  const [localJurisdiction, setLocalJurisdiction] = useState('');
  const [localWebsite, setLocalWebsite] = useState('');
  const [localCurrency, setLocalCurrency] = useState('$');
  const [localTaxEnabled, setLocalTaxEnabled] = useState(false);
  const [localTaxName, setLocalTaxName] = useState('Tax');
  const [localTaxRate, setLocalTaxRate] = useState(0);
  const [localLogoUrl, setLocalLogoUrl] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  // Function to create missing profile
  const createMissingProfile = async () => {
    if (!user) {
      alert('No user logged in');
      return;
    }
    
    setIsCreatingProfile(true);
    try {
      console.log('[SettingsScreen] Creating missing profile for user:', user.id);
      
      // Verify we have an active session
      const { data: sessionData } = await supabaseClient.auth.getSession();
      console.log('[SettingsScreen] Current session:', sessionData.session ? 'Active' : 'None');
      console.log('[SettingsScreen] Session user ID:', sessionData.session?.user?.id);
      
      if (!sessionData.session) {
        alert('No active session. Please sign in again.');
        return;
      }
      
      const { data: insertedData, error } = await supabaseClient
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email || localEmail,
          full_name: localFullName || '',
          company_name: localCompanyName || '',
          currency: localCurrency || 'R',
          tax_enabled: localTaxEnabled,
          tax_name: localTaxName || 'VAT',
          tax_rate: localTaxRate || 15,
        })
        .select(); // Return inserted data
      
      console.log('[SettingsScreen] Insert result - error:', error);
      console.log('[SettingsScreen] Insert result - data:', insertedData);
      
      if (error) {
        console.error('[SettingsScreen] Error creating profile:', error);
        alert('Failed to create profile: ' + error.message);
        return;
      }
      
      console.log('[SettingsScreen] Profile created successfully, refreshing...');
      
      // Wait a moment for database replication
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh profile from AuthContext
      await refreshProfile();
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Profile created successfully!');
      setIsLoadingProfile(false);
    } catch (err) {
      console.error('[SettingsScreen] Exception creating profile:', err);
      alert('Error creating profile');
    } finally {
      setIsCreatingProfile(false);
    }
  };
  
  // Force profile refresh when settings screen mounts
  useEffect(() => {
    console.log('[SettingsScreen] Component mounted - checking for profile');
    if (user && !authProfile) {
      console.log('[SettingsScreen] Triggering manual profile refresh');
      refreshProfile();
    }
  }, []);
  
  // Initialize local state from authProfile when it loads
  useEffect(() => {
    console.log('[SettingsScreen] ===== PROFILE SYNC EFFECT TRIGGERED =====');
    console.log('[SettingsScreen] Auth profile changed:', authProfile);
    console.log('[SettingsScreen] User:', user);
    console.log('[SettingsScreen] isAuthenticated:', isAuthenticated);
    
    if (authProfile) {
      console.log('[SettingsScreen] ✅ PROFILE EXISTS - Populating local state from authProfile...');
      console.log('[SettingsScreen] authProfile FULL OBJECT:', authProfile);
      console.log('[SettingsScreen] authProfile data:', {
        fullName: authProfile.fullName,
        email: authProfile.email,
        companyName: authProfile.companyName,
        phone: authProfile.phone,
        address: authProfile.address
      });
      
      setLocalFullName(authProfile.fullName || '');
      setLocalEmail(authProfile.email || '');
      setLocalCompanyName(authProfile.companyName || '');
      setLocalRegistrationNumber(authProfile.registrationNumber || '');
      setLocalVatNumber(authProfile.vatRegistrationNumber || '');
      setLocalBusinessType(authProfile.businessType || 2);
      setLocalPhone(authProfile.phone || '');
      setLocalAddress(authProfile.address || '');
      setLocalJurisdiction(authProfile.jurisdiction || '');
      setLocalWebsite(authProfile.website || '');
      setLocalCurrency(authProfile.currency || '$');
      setLocalTaxEnabled(authProfile.taxEnabled || false);
      setLocalTaxName(authProfile.taxName || 'Tax');
      setLocalTaxRate(authProfile.taxRate || 0);
      setLocalLogoUrl(authProfile.logoUrl || '');
      setIsLoadingProfile(false);
      
      console.log('[SettingsScreen] ✅ Local state updated - VALUES:', {
        localFullName,
        localEmail,
        localCompanyName,
        localPhone,
        localAddress
      });
    } else if (user) {
      // User exists but no profile yet
      console.log('[SettingsScreen] User authenticated but no profile found');
      console.log('[SettingsScreen] Stopping loading - user can create profile manually');
      
      // Don't wait - show the form immediately so they can create profile
      setIsLoadingProfile(false);
    } else {
      // No user at all
      console.log('[SettingsScreen] No user authenticated');
      setIsLoadingProfile(false);
    }
  }, [authProfile, user, isAuthenticated]);
  
  // Debug logging
  useEffect(() => {
    console.log('[SettingsScreen] Auth state:', { isAuthenticated, authProfile, user });
    console.log('[SettingsScreen] Local state values:', {
      localFullName,
      localEmail,
      localCompanyName,
      localPhone,
      localAddress
    });
  }, [isAuthenticated, authProfile, user, localFullName, localEmail, localCompanyName]);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'templates' | 'clients' | 'diagnostics'>('profile');

  // Form States
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [tempType, setTempType] = useState<DocType>(DocType.INVOICE);
  const [tempName, setTempName] = useState('');
  const [tempCategory, setTempCategory] = useState('');
  const [tempItems, setTempItems] = useState<InvoiceItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('ea');
  const [tempClauseContent, setTempClauseContent] = useState('');

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientReg, setNewClientReg] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Logo Scraper State
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);

  // Map TypeScript field names to database column names
  const fieldToColumnMap: Record<string, string> = {
    fullName: 'full_name',
    companyName: 'company_name',
    registrationNumber: 'registration_number',
    vatRegistrationNumber: 'vat_registration_number',
    businessType: 'business_type',
    logoUrl: 'logo_url',
    taxEnabled: 'tax_enabled',
    taxName: 'tax_name',
    taxRate: 'tax_rate',
    // These fields have same name in DB (already snake_case in schema)
    website: 'website',
    jurisdiction: 'jurisdiction',
    phone: 'phone',
    address: 'address',
  };

  const handleProfileUpdate = async (key: keyof UserProfile, value: string | boolean | number) => {
    // Save to Supabase
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        console.warn('[SettingsScreen] No user found, cannot save profile');
        return;
      }
      
      // Convert camelCase to snake_case for database
      const dbColumn = fieldToColumnMap[key as string] || key;
      
      console.log(`[SettingsScreen] Saving to database: ${dbColumn} = ${value}`);
      
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({ 
          [dbColumn]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('[SettingsScreen] Failed to save profile to Supabase:', error);
      } else {
        console.log('[SettingsScreen] Profile saved successfully');
        triggerHaptic('success');
        // Refresh profile from AuthContext to keep in sync
        if (isAuthenticated) {
          await refreshProfile();
        }
      }
    } catch (err) {
      console.error('[SettingsScreen] Supabase save error:', err);
    }
  };
  
  const handleLocalChange = (key: keyof UserProfile, value: string | boolean | number) => {
    console.log(`[SettingsScreen] Updating local state: ${key} = ${value}`);
    triggerHaptic('light');
    
    // Update local state immediately for responsive UI
    switch(key) {
      case 'fullName': setLocalFullName(value as string); break;
      case 'email': setLocalEmail(value as string); break;
      case 'companyName': setLocalCompanyName(value as string); break;
      case 'registrationNumber': setLocalRegistrationNumber(value as string); break;
      case 'vatRegistrationNumber': setLocalVatNumber(value as string); break;
      case 'businessType': setLocalBusinessType(value as 1 | 2); break;
      case 'phone': setLocalPhone(value as string); break;
      case 'address': setLocalAddress(value as string); break;
      case 'jurisdiction': setLocalJurisdiction(value as string); break;
      case 'website': setLocalWebsite(value as string); break;
      case 'currency': setLocalCurrency(value as string); break;
      case 'taxEnabled': setLocalTaxEnabled(value as boolean); break;
      case 'taxName': setLocalTaxName(value as string); break;
      case 'taxRate': setLocalTaxRate(value as number); break;
      case 'logoUrl': setLocalLogoUrl(value as string); break;
    }
  };

  const fetchLogoFromWeb = async () => {
      if (!localWebsite) return;
      setIsFetchingLogo(true);
      let domain = localWebsite.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      
      // Update local state and save
      handleLocalChange('logoUrl', logoUrl);
      handleLocalChange('website', localWebsite);
      
      // Simulate fetch delay
      setTimeout(async () => {
          await handleProfileUpdate('logoUrl', logoUrl);
          await handleProfileUpdate('website', localWebsite);
          setIsFetchingLogo(false);
          triggerHaptic('success');
      }, 1500);
  };

  const addItemToBlock = () => {
      if (!newItemDesc) return;
      setTempItems([...tempItems, { id: Date.now().toString() + Math.random(), description: newItemDesc, price: newItemPrice, quantity: newItemQty, unitType: newItemUnit }]);
      setNewItemDesc(''); setNewItemPrice(0); setNewItemQty(1);
      triggerHaptic('success');
  };

  const handleAddTemplate = () => {
    if (!tempName || !tempCategory) return;
    setTemplates([...templates, { id: Date.now().toString(), name: tempName, category: tempCategory, type: tempType, items: tempType === DocType.INVOICE ? tempItems : undefined, clause: tempType === DocType.CONTRACT ? { id: '1', title: tempName, content: tempClauseContent || 'Content' } : undefined }]);
    setIsAddingTemplate(false); setTempName(''); setTempCategory(''); setTempItems([]); setTempClauseContent('');
    triggerHaptic('success');
  };



  // Show loading state only briefly while profile is being fetched
  if (isLoadingProfile) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8">Business Settings</h1>
        <div className="bg-grit-white border-4 border-grit-dark shadow-grit p-8 min-h-[500px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-grit-primary" size={48} />
            <p className="text-grit-dark font-bold">Loading your profile...</p>
            <p className="text-sm text-gray-600">User: {user?.email || 'Unknown'}</p>
            <p className="text-sm text-gray-600">Profile loaded: {authProfile ? 'Yes' : 'No'}</p>
            <button 
              onClick={() => {
                console.log('[SettingsScreen] Force stop loading');
                setIsLoadingProfile(false);
              }}
              className="mt-4 px-4 py-2 bg-grit-dark text-grit-primary font-bold"
            >
              Show Form Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Business Settings</h1>
          {authProfile && (
            <p className="text-sm text-green-600 mt-1">✓ Profile loaded: {authProfile.email}</p>
          )}
          {!authProfile && user && (
            <p className="text-sm text-orange-600 mt-1">⚠ Profile not found - you can create it by filling the form below</p>
          )}
        </div>
        {user && (
          <Button 
            onClick={async () => {
              console.log('[SettingsScreen] Manual profile refresh triggered');
              setIsLoadingProfile(true);
              await refreshProfile();
              // Wait a moment for state to update
              setTimeout(() => setIsLoadingProfile(false), 1000);
            }}
            variant="outline"
            size="sm"
          >
            🔄 Refresh Profile
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
            {[{ id: 'profile', label: 'My Profile', icon: <User size={20}/> }, { id: 'business', label: 'Business Info', icon: <Briefcase size={20}/> }, { id: 'templates', label: 'Templates', icon: <FileBox size={20}/> }, { id: 'clients', label: 'Clients', icon: <Users size={20}/> }, { id: 'diagnostics', label: 'Diagnostics', icon: <Activity size={20}/> }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left px-6 py-4 flex items-center gap-4 font-bold border-2 transition-all text-lg ${activeTab === tab.id ? 'bg-grit-dark text-grit-primary border-grit-dark shadow-grit translate-x-1 translate-y-1' : 'bg-white border-transparent hover:border-gray-300'}`}>{tab.icon} {tab.label}</button>
            ))}
        </div>

        <div className="md:col-span-3 bg-grit-white border-4 border-grit-dark shadow-grit p-8 min-h-[500px]">
            {!authProfile && user && (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 mb-6 rounded">
                <p className="font-bold text-yellow-800">⚠️ No profile data found</p>
                <p className="text-sm text-yellow-700 mt-1">Fill in the form below and click "Create Profile" to save your information.</p>
                <p className="text-xs text-yellow-600 mt-2">Debug: User ID: {user.id}</p>
                <button
                  onClick={createMissingProfile}
                  disabled={isCreatingProfile}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white font-bold rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isCreatingProfile ? 'Creating...' : '✓ Create Profile Now'}
                </button>
              </div>
            )}
            {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in">
                    <h2 className="text-3xl font-bold border-b-4 border-grit-secondary pb-4 inline-block">Personal Profile</h2>
                    <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Edit2 size={18} className="text-blue-600" />
                            <p className="text-sm text-blue-700 font-bold">Click fields below to edit your profile</p>
                        </div>
                        <div className="grid gap-6 max-w-lg">
                            <div className="border-2 border-blue-300 bg-white p-3 rounded hover:border-blue-500 transition-colors cursor-text">
                                <Input 
                                  label="Full Name" 
                                  value={localFullName} 
                                  onChange={e => handleLocalChange('fullName', e.target.value)}
                                  onBlur={e => handleProfileUpdate('fullName', e.target.value)}
                                  placeholder="Enter your full name"
                                />
                            </div>
                            <div className="border-2 border-blue-300 bg-white p-3 rounded hover:border-blue-500 transition-colors cursor-text">
                                <Input 
                                  label="Email Address" 
                                  value={localEmail} 
                                  onChange={e => handleLocalChange('email', e.target.value)}
                                  onBlur={e => handleProfileUpdate('email', e.target.value)}
                                  placeholder="your.email@example.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'business' && (
                <div className="space-y-8 animate-in fade-in">
                    <h2 className="text-3xl font-bold border-b-4 border-grit-secondary pb-4 inline-block">Business Details</h2>
                    <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Edit2 size={18} className="text-green-600" />
                            <p className="text-sm text-green-700 font-bold">Click fields below to edit your business information</p>
                        </div>
                        <div className="grid gap-6 max-w-lg">
                            <div className="border-2 border-green-300 bg-white p-3 rounded hover:border-green-500 transition-colors cursor-text">
                                <Input 
                                  label="Company Name" 
                                  value={localCompanyName} 
                                  onChange={e => handleLocalChange('companyName', e.target.value)}
                                  onBlur={e => handleProfileUpdate('companyName', e.target.value)}
                                />
                            </div>
                            <div className="border-2 border-green-300 bg-white p-3 rounded hover:border-green-500 transition-colors cursor-text">
                                <Input 
                                  label="Registration Number" 
                                  value={localRegistrationNumber} 
                                  onChange={e => handleLocalChange('registrationNumber', e.target.value)}
                                  onBlur={e => handleProfileUpdate('registrationNumber', e.target.value)}
                                />
                            </div>
                            
                            {/* SA COMPLIANCE SECTION */}
                            <div className="border-2 border-orange-300 bg-orange-50 p-4 rounded-lg">
                                <p className="text-xs font-bold text-orange-700 mb-3 uppercase tracking-wide">South African Tax Compliance</p>
                                <div className="space-y-3">
                                    <div className="border-2 border-orange-200 bg-white p-2 rounded">
                                        <Input 
                                            label="VAT Registration Number" 
                                            value={localVatNumber} 
                                            onChange={e => handleLocalChange('vatRegistrationNumber', e.target.value)}
                                            onBlur={e => handleProfileUpdate('vatRegistrationNumber', e.target.value)}
                                            placeholder="e.g., 4123456789" 
                                        />
                                    </div>
                                    <div className="border-2 border-orange-200 bg-white p-2 rounded">
                                        <label className="block text-xs font-bold text-orange-700 mb-2">Business Type</label>
                                        <select 
                                            value={localBusinessType} 
                                            onChange={e => {
                                              const value = parseInt(e.target.value) as 1 | 2;
                                              handleLocalChange('businessType', value);
                                              handleProfileUpdate('businessType', value);
                                            }}
                                            className="w-full border-2 border-orange-300 p-2 font-bold focus:outline-none"
                                        >
                                            <option value={1}>Registered (Company/CC)</option>
                                            <option value={2}>Unregistered/Sole Proprietor</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-xs text-orange-600 mt-2">✓ This info auto-populates on invoices for compliance</p>
                            </div>
                            
                            <div className="border-2 border-green-300 bg-white p-3 rounded hover:border-green-500 transition-colors cursor-text">
                                <Input 
                                  label="Phone" 
                                  value={localPhone} 
                                  onChange={e => handleLocalChange('phone', e.target.value)}
                                  onBlur={e => handleProfileUpdate('phone', e.target.value)}
                                />
                            </div>
                            <div className="border-2 border-green-300 bg-white p-3 rounded hover:border-green-500 transition-colors cursor-text">
                                <TextArea 
                                  label="Address" 
                                  value={localAddress} 
                                  onChange={e => handleLocalChange('address', e.target.value)}
                                  onBlur={e => handleProfileUpdate('address', e.target.value)}
                                />
                            </div>
                            <div className="border-2 border-green-300 bg-white p-3 rounded hover:border-green-500 transition-colors cursor-text">
                                <Input 
                                  label="Jurisdiction" 
                                  value={localJurisdiction} 
                                  onChange={e => handleLocalChange('jurisdiction', e.target.value)}
                                  onBlur={e => handleProfileUpdate('jurisdiction', e.target.value)}
                                />
                            </div>
                            <div className="border-2 border-green-300 bg-white p-3 rounded hover:border-green-500 transition-colors cursor-text">
                                <Input 
                                  label="Website" 
                                  value={localWebsite} 
                                  onChange={e => handleLocalChange('website', e.target.value)}
                                  onBlur={e => handleProfileUpdate('website', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                         <label className="block text-grit-dark font-bold mb-2 text-sm uppercase tracking-wider">Tax Settings</label>
                             <div className="flex items-center gap-2 mb-4">
                                 <input 
                                   type="checkbox" 
                                   checked={localTaxEnabled} 
                                   onChange={e => {
                                     handleLocalChange('taxEnabled', e.target.checked);
                                     handleProfileUpdate('taxEnabled', e.target.checked);
                                   }} 
                                   className="w-4 h-4"
                                 />
                                 <span className="font-bold">Enable Tax</span>
                             </div>
                             {localTaxEnabled && (
                                 <div className="space-y-4">
                                     <Input 
                                       label="Tax Name" 
                                       value={localTaxName} 
                                       onChange={e => handleLocalChange('taxName', e.target.value)}
                                       onBlur={e => handleProfileUpdate('taxName', e.target.value)}
                                     />
                                     <Input 
                                       label="Tax Rate (%)" 
                                       type="number" 
                                       value={localTaxRate} 
                                       onChange={e => handleLocalChange('taxRate', parseFloat(e.target.value) || 0)}
                                       onBlur={e => handleProfileUpdate('taxRate', parseFloat(e.target.value) || 0)}
                                     />
                                 </div>
                             )}
                        </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                         <label className="block text-grit-dark font-bold mb-1 text-sm uppercase tracking-wider">Currency</label>
                             <div className="flex flex-wrap gap-2">
                                 {CURRENCIES.map(c => (
                                     <button
                                        key={c.code}
                                        onClick={() => {
                                          handleLocalChange('currency', c.code);
                                          handleProfileUpdate('currency', c.code);
                                        }}
                                        className={`px-4 py-2 border-2 font-bold transition-all ${localCurrency === c.code ? 'bg-grit-dark text-grit-primary border-grit-dark' : 'bg-white border-gray-300 hover:border-grit-dark'}`}
                                     >
                                         {c.label}
                                     </button>
                                 ))}
                             </div>
                        </div>

                    <div className="pt-4 border-t border-gray-200">
                         <label className="block text-grit-dark font-bold mb-2 text-sm uppercase tracking-wider">Logo & Branding</label>
                         <div className="space-y-3 mb-4">
                             <div className="flex gap-2">
                                 <Input placeholder="www.yourwebsite.com" value={localWebsite} onChange={e => setLocalWebsite(e.target.value)} className="flex-grow"/>
                                 <Button onClick={fetchLogoFromWeb} disabled={!localWebsite || isFetchingLogo} icon={isFetchingLogo ? <Loader2 className="animate-spin"/> : <Globe/>}>Auto-Fetch</Button>
                             </div>
                             <div className="relative">
                                 <input 
                                     type="file" 
                                     accept=".svg,.png,.jpg,.jpeg"
                                     onChange={(e) => {
                                         if (e.target.files?.[0]) {
                                             const file = e.target.files[0];
                                             const reader = new FileReader();
                                             reader.onload = (event) => {
                                                 if (event.target?.result) {
                                                     handleProfileUpdate('logoUrl', event.target.result as string);
                                                 }
                                             };
                                             reader.readAsDataURL(file);
                                         }
                                     }}
                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                 />
                                 <div className="border-2 border-dashed border-gray-300 p-3 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                     <Upload size={16} className="mx-auto mb-1 text-gray-500" />
                                     <span className="text-xs text-gray-600 font-medium">Upload SVG, PNG, or JPG</span>
                                 </div>
                             </div>
                         </div>
                             
                         {localLogoUrl ? (
                             <div className="border-4 border-dashed border-gray-300 h-40 flex items-center justify-center relative bg-white rounded">
                                 <img src={localLogoUrl} alt="Logo" className="max-h-32 object-contain" />
                                 <button onClick={() => handleProfileUpdate('logoUrl', '')} className="absolute top-2 right-2 bg-red-100 text-red-500 p-1 rounded-full hover:bg-red-200"><X size={16}/></button>
                             </div>
                         ) : (
                            <div className="border-4 border-dashed border-grit-dark h-40 flex flex-col items-center justify-center bg-gray-50 text-gray-400 rounded">
                                <Globe size={32} className="mb-2"/>
                                <span className="font-bold text-sm">No logo yet</span>
                            </div>
                         )}
                    </div>
                </div>
            )}
             {activeTab === 'templates' && (
                <div className="space-y-8 animate-in fade-in"><div className="flex justify-between items-center border-b-4 border-grit-secondary pb-4"><h2 className="text-3xl font-bold">Template Blocks</h2><Button size="sm" onClick={() => setIsAddingTemplate(true)} icon={<Plus size={18}/>}>New Block</Button></div>
                    {isAddingTemplate && <div className="bg-gray-100 p-6 border-2 border-grit-dark mb-6"><h3 className="font-bold text-xl mb-4">Create New Template</h3>
                        <div className="grid gap-4"><div className="flex gap-4"><button onClick={() => setTempType(DocType.INVOICE)} className={`px-4 py-2 border-2 border-grit-dark font-bold ${tempType === DocType.INVOICE ? 'bg-grit-primary' : 'bg-white'}`}>Invoice</button><button onClick={() => setTempType(DocType.CONTRACT)} className={`px-4 py-2 border-2 border-grit-dark font-bold ${tempType === DocType.CONTRACT ? 'bg-grit-primary' : 'bg-white'}`}>Contract</button></div>
                        <div className="grid grid-cols-2 gap-4"><Input label="Name" value={tempName} onChange={e => setTempName(e.target.value)} /><Input label="Category" value={tempCategory} onChange={e => setTempCategory(e.target.value)} /></div>
                        {tempType === DocType.INVOICE ? <div className="bg-white border p-4"><div className="space-y-2 mb-2">{tempItems.map(i => <div key={i.id} className="text-sm border p-1">{i.description}</div>)}</div><div className="flex gap-2"><Input placeholder="Item" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} /><Button onClick={addItemToBlock}>Add Item</Button></div></div> : <TextArea label="Clause" value={tempClauseContent} onChange={e => setTempClauseContent(e.target.value)} />}
                        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsAddingTemplate(false)}>Cancel</Button><Button onClick={handleAddTemplate}>Save</Button></div></div></div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{templates.map(t => <div key={t.id} className="bg-white border-2 border-gray-200 p-4 relative group hover:border-grit-dark"><button onClick={() => setTemplates(ts => ts.filter(x => x.id !== t.id))} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button><div className="flex justify-between"><span className="text-xs font-bold bg-blue-100 px-2 py-1">{t.type}</span><span className="text-xs uppercase text-gray-400">{t.category}</span></div><h3 className="font-bold text-lg">{t.name}</h3></div>)}</div></div>
            )}

            {activeTab === 'clients' && (
                <div className="space-y-8 animate-in fade-in">
                    <div className="flex justify-between items-center border-b-4 border-grit-secondary pb-4">
                        <h2 className="text-3xl font-bold">Clients</h2>
                        <Button size="sm" onClick={() => setIsAddingClient(true)} icon={<Plus size={18}/>}>Add Client</Button>
                    </div>
                    
                    {isAddingClient && (
                        <div className="bg-gray-100 p-6 border-2 border-grit-dark mb-6">
                            <h3 className="font-bold text-xl mb-4">{editingClientId ? 'Edit Client' : 'Add New Client'}</h3>
                            <div className="grid gap-4">
                                <Input 
                                    label="Client Name" 
                                    value={newClientName} 
                                    onChange={e => setNewClientName(e.target.value)} 
                                    placeholder="Company Name or Individual"
                                />
                                <Input 
                                    label="Registration Number" 
                                    value={newClientReg} 
                                    onChange={e => setNewClientReg(e.target.value)} 
                                    placeholder="Optional"
                                />
                                <Input 
                                    label="Email" 
                                    type="email"
                                    value={newClientEmail} 
                                    onChange={e => setNewClientEmail(e.target.value)} 
                                    placeholder="client@example.com"
                                />
                                <Input 
                                    label="Phone" 
                                    value={newClientPhone} 
                                    onChange={e => setNewClientPhone(e.target.value)} 
                                    placeholder="+27 12 345 6789"
                                />
                                <TextArea 
                                    label="Address" 
                                    value={newClientAddress} 
                                    onChange={e => setNewClientAddress(e.target.value)} 
                                    placeholder="Street address, city, postal code"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            setIsAddingClient(false);
                                            setEditingClientId(null);
                                            setNewClientName('');
                                            setNewClientReg('');
                                            setNewClientEmail('');
                                            setNewClientPhone('');
                                            setNewClientAddress('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={async () => {
                                            if (!newClientName.trim()) {
                                                alert('Client name is required');
                                                return;
                                            }
                                            
                                            const clientData: Client = {
                                                id: editingClientId || `client_${Date.now()}`,
                                                businessName: newClientName,
                                                registrationNumber: newClientReg,
                                                email: newClientEmail,
                                                phone: newClientPhone,
                                                address: newClientAddress,
                                            };
                                            
                                            try {
                                                await saveClient(clientData);
                                                
                                                // Update local state
                                                if (editingClientId) {
                                                    setClients(prev => prev.map(c => c.id === editingClientId ? clientData : c));
                                                } else {
                                                    setClients(prev => [...prev, clientData]);
                                                }
                                                
                                                // Reset form
                                                setIsAddingClient(false);
                                                setEditingClientId(null);
                                                setNewClientName('');
                                                setNewClientReg('');
                                                setNewClientEmail('');
                                                setNewClientPhone('');
                                                setNewClientAddress('');
                                                
                                                triggerHaptic('success');
                                            } catch (error) {
                                                console.error('Error saving client:', error);
                                                alert('Failed to save client. Please try again.');
                                            }
                                        }}
                                    >
                                        {editingClientId ? 'Update' : 'Save'} Client
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clients.map(client => (
                            <div key={client.id} className="bg-white border-2 border-gray-200 p-4 relative group hover:border-grit-dark transition-all">
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => {
                                            setEditingClientId(client.id);
                                            setNewClientName(client.businessName);
                                            setNewClientReg(client.registrationNumber || '');
                                            setNewClientEmail(client.email || '');
                                            setNewClientPhone(client.phone || '');
                                            setNewClientAddress(client.address || '');
                                            setIsAddingClient(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 p-1"
                                    >
                                        <Edit2 size={16}/>
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (confirm(`Delete client "${client.businessName}"?`)) {
                                                try {
                                                    await deleteClient(client.id);
                                                    setClients(prev => prev.filter(c => c.id !== client.id));
                                                    triggerHaptic('success');
                                                } catch (error) {
                                                    console.error('Error deleting client:', error);
                                                    alert('Failed to delete client.');
                                                }
                                            }
                                        }}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{client.businessName}</h3>
                                {client.registrationNumber && (
                                    <p className="text-xs text-gray-500 mb-1">Reg: {client.registrationNumber}</p>
                                )}
                                {client.email && (
                                    <p className="text-sm text-gray-700 mb-1">{client.email}</p>
                                )}
                                {client.phone && (
                                    <p className="text-sm text-gray-700 mb-1">{client.phone}</p>
                                )}
                                {client.address && (
                                    <p className="text-xs text-gray-500 mt-2">{client.address}</p>
                                )}
                            </div>
                        ))}
                        {clients.length === 0 && !isAddingClient && (
                            <div className="col-span-2 text-center py-12 text-gray-400">
                                <Users size={48} className="mx-auto mb-2 opacity-50"/>
                                <p className="font-bold">No clients yet</p>
                                <p className="text-sm">Click "Add Client" to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'diagnostics' && (
                <div className="space-y-8 animate-in fade-in">
                    <h2 className="text-3xl font-bold border-b-4 border-grit-secondary pb-4 inline-block">System Diagnostics</h2>
                    <p className="text-gray-600">Run these tests to verify that your Email, AI, and PDF services are correctly configured and operational.</p>
                    <SystemDiagnostics />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;