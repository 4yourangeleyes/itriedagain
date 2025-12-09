/**
 * NEW Conversational ChatScreen
 * 
 * True AI-driven document creation:
 * 1. User describes what they need in natural language
 * 2. AI identifies document type, client, line items/clauses
 * 3. User can refine through conversation
 * 4. AI assembles complete document
 * 5. Opens in Canvas for final editing
 * 6. Auto-saves to Supabase
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader, CheckCircle2, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { Client, DocType, DocumentData, UserProfile, TemplateBlock } from '../types';
import { triggerHaptic } from '../App';
import {
  chatForDocumentCreation,
  identifyDocumentType,
  suggestClientsFromMessage,
} from '../services/geminiService';
import { assembleDocument, validateAssembledDocument } from '../utils/documentBuilder';
import { useChat } from '../context/ChatContext';

interface ChatScreenProps {
  clients: Client[];
  profile: UserProfile;
  templates: TemplateBlock[];
  onDocumentCreated: (doc: DocumentData) => void;
  onNavigateToCanvas: (doc: DocumentData) => void;
}

const ChatScreenConversational: React.FC<ChatScreenProps> = ({
  clients,
  profile,
  templates,
  onDocumentCreated,
  onNavigateToCanvas,
}) => {
  const navigate = useNavigate();
  const {
    messages,
    addMessage,
    selectedClient,
    setSelectedClient,
    documentType,
    setDocumentType,
    documentTitle,
    setDocumentTitle,
    currentItems,
    currentClauses,
    assembledDocument,
    setAssembledDocument,
    isLoading,
    setIsLoading,
    error,
    setError,
    resetChat,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [suggestedType, setSuggestedType] = useState<DocType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setInputValue('');
    setError(null);
    setIsLoading(true);
    triggerHaptic('light');

    try {
      // User message
      addMessage('user', text);

      // First message: Identify document type and suggest client
      if (messages.length === 0) {
        const identifiedType = await identifyDocumentType(text);
        setDocumentType(identifiedType);
        setSuggestedType(identifiedType);

        const suggestions = await suggestClientsFromMessage(text, clients);
        setClientSuggestions(suggestions.slice(0, 3));

        const response = `I identified you want to create a **${identifiedType}**. 
        
Which client is this for? ${suggestions.length > 0 ? `I suggest: ${suggestions.map(s => s.businessName).join(', ')}` : 'Please select a client.'}

Tell me more details about what you need.`;
        addMessage('assistant', response);
      } else {
        // Subsequent messages: Refine document
        const conversation = messages.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const result = await chatForDocumentCreation(
          text,
          documentType,
          selectedClient?.businessName || 'Client',
          profile.companyName || 'Business',
          conversation,
          profile.industry
        );

        addMessage('assistant', result.response, result.suggestedBlocks);

        // If AI says we're ready, assemble document
        if (result.ready && selectedClient) {
          const doc = assembleDocument({
            docType: documentType,
            title: documentTitle || `${documentType} - ${selectedClient.businessName}`,
            client: selectedClient,
            profile,
            items: currentItems,
            clauses: currentClauses,
            theme: 'swiss',
          });

          const validationErrors = validateAssembledDocument(doc);
          if (validationErrors.length === 0) {
            setAssembledDocument(doc);
            addMessage('assistant', `✅ Document ready! Opening in Canvas for final editing...`);
            
            // Auto-open in Canvas
            setTimeout(() => {
              onNavigateToCanvas(doc);
            }, 1000);
          } else {
            addMessage(
              'assistant',
              `⚠️ Document needs: ${validationErrors.join(', ')}\n\nPlease add more details.`
            );
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process message';
      setError(errorMsg);
      addMessage('assistant', `❌ Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    addMessage('assistant', `Great! Let's create a **${documentType}** for **${client.businessName}**.\n\nTell me what should be included in this document.`);
    triggerHaptic('success');
  };

  const handleCreateDocument = async () => {
    if (!selectedClient || !documentTitle) {
      setError('Please select client and provide document title');
      return;
    }

    setIsLoading(true);
    try {
      const doc = assembleDocument({
        docType: documentType,
        title: documentTitle,
        client: selectedClient,
        profile,
        items: currentItems,
        clauses: currentClauses,
        theme: 'swiss',
      });

      const errors = validateAssembledDocument(doc);
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }

      onDocumentCreated(doc);
      onNavigateToCanvas(doc);
      resetChat();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-grit-light">
      {/* Header */}
      <div className="border-b border-grit-dark bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <ArrowLeft size={20} />
          </button>
          <Sparkles size={24} className="text-grit-primary" />
          <h1 className="text-xl font-bold">AI Document Creator</h1>
        </div>

        {documentType && (
          <div className="text-sm bg-grit-secondary px-3 py-1 rounded font-bold">
            {documentType}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">👋 Hi! Tell me what document you need to create.</p>
            <p className="text-sm mt-2">I'll help you identify the type, client, and details.</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-grit-primary text-white'
                  : 'bg-white border border-grit-dark'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

              {msg.suggestedBlocks && msg.suggestedBlocks.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-bold opacity-75">Suggested blocks:</p>
                  {msg.suggestedBlocks.map((block, idx) => (
                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                      📦 {block.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Client Selection Suggestions */}
        {messages.length === 1 && clientSuggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-bold mb-3">Select a client:</p>
            <div className="space-y-2">
              {clientSuggestions.map(client => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="w-full text-left p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition"
                >
                  <div className="font-bold">{client.businessName}</div>
                  <div className="text-xs text-gray-600">{client.email}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Document Preview */}
        {assembledDocument && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
              <div>
                <p className="font-bold text-green-900">Document Ready!</p>
                <p className="text-sm text-green-800">
                  {assembledDocument.title} for {assembledDocument.client.businessName}
                </p>
              </div>
            </div>
            <Button onClick={handleCreateDocument} className="w-full">
              Open in Canvas →
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 justify-center py-4">
            <Loader size={20} className="animate-spin text-grit-primary" />
            <p className="text-sm text-gray-600">Thinking...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-grit-dark bg-white p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage(inputValue);
              }
            }}
            placeholder="Describe what you need... (Ctrl+Enter to send)"
            className="flex-1 p-3 border border-grit-dark rounded resize-none focus:outline-none focus:ring-2 focus:ring-grit-primary"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="bg-grit-primary hover:bg-grit-dark text-white px-4 py-3 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Be specific about items, pricing, or contract terms for best results
        </p>
      </div>
    </div>
  );
};

export default ChatScreenConversational;
