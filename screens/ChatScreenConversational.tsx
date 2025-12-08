import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Send, Loader, CheckCircle2, Sparkles, Plus, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Client, DocType, DocumentData, UserProfile, IWindow, TemplateBlock, InvoiceItem } from '../types';
import { triggerHaptic } from '../App';
import { generateDocumentContent } from '../services/geminiService';
import supabaseClient from '../services/supabaseClient';

interface ChatScreenProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  profile: UserProfile;
  onDocGenerated: (doc: DocumentData) => void;
  templates: TemplateBlock[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateBlock[]>>;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  items?: InvoiceItem[];
  timestamp: string;
}

const ChatScreenConversational: React.FC<ChatScreenProps> = ({ clients, setClients, profile, onDocGenerated, templates }) => {
  const navigate = useNavigate();
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI document assistant. Tell me about the work you did, and I'll help you create a professional invoice or contract.\n\nFor example:\n• "I replaced a geyser and fixed bathroom tiles for John Smith"\n• "Create a contract for bathroom renovation at 123 Main St"\n• "Invoice for brake job on Mrs Johnson's car"`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Document State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [docType, setDocType] = useState<DocType>(DocType.INVOICE);
  const [accumulatedItems, setAccumulatedItems] = useState<InvoiceItem[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) {
          setInput(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
        }
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      triggerHaptic('light');
    }
  };

  const detectClientName = (text: string): string | null => {
    // Simple detection: "for [Name]" or client names from database
    const forMatch = text.match(/for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (forMatch) return forMatch[1];
    
    // Check against existing clients
    const lowerText = text.toLowerCase();
    const matchedClient = clients.find(c => 
      lowerText.includes(c.businessName.toLowerCase())
    );
    return matchedClient?.businessName || null;
  };

  const detectDocType = (text: string): DocType => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('contract') || lowerText.includes('agreement')) {
      return DocType.CONTRACT;
    }
    return DocType.INVOICE;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Detect client name and doc type from first message
      if (!clientName) {
        const detectedClient = detectClientName(userMessage.content);
        if (detectedClient) setClientName(detectedClient);
        
        const detectedDocType = detectDocType(userMessage.content);
        setDocType(detectedDocType);
      }

      // Build conversation history (last 5 messages for context)
      const conversationHistory = messages
        .slice(-5)
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Call AI with enhanced context
      const result = await generateDocumentContent(
        userMessage.content,
        docType,
        clientName || 'Client',
        profile.companyName,
        profile.industry,
        conversationHistory,
        templates
      );

      // Process AI response
      let assistantContent = '';
      let newItems: InvoiceItem[] = [];

      if (result.items && result.items.length > 0) {
        // AI generated line items
        newItems = result.items.map((item: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          description: item.description,
          quantity: item.quantity,
          unitType: item.unitType,
          price: item.price
        }));

        setAccumulatedItems(prev => [...prev, ...newItems]);

        assistantContent = `Great! I've added ${newItems.length} item${newItems.length > 1 ? 's' : ''} to your ${docType.toLowerCase()}:\n\n${
          newItems.map(item => `• ${item.description} - R${item.price.toFixed(2)}`).join('\n')
        }\n\nTotal so far: R${[...accumulatedItems, ...newItems].reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}\n\nWant to add more items, adjust prices, or create the document?`;
      } else if (result.clauses && result.clauses.length > 0) {
        assistantContent = `I've prepared ${result.clauses.length} contract clauses. Would you like to review and create the contract?`;
      } else {
        // AI couldn't extract items - ask for clarification
        assistantContent = result.title || "I didn't quite catch that. Could you describe the work you did? For example: 'I installed a new toilet and retiled the bathroom floor'";
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantContent,
        items: newItems.length > 0 ? newItems : undefined,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      triggerHaptic('success');

    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Could you try rephrasing that?",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      triggerHaptic('heavy');
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleCreateDocument = () => {
    if (accumulatedItems.length === 0) {
      alert('Add some items first!');
      return;
    }

    // Find or create client
    let client = clients.find(c => c.businessName.toLowerCase() === clientName.toLowerCase());
    if (!client) {
      client = {
        id: crypto.randomUUID(),
        businessName: clientName || 'New Client',
        email: ''
      };
      setClients(prev => [...prev, client as Client]);
    }

    // Calculate totals
    const subtotal = accumulatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxTotal = profile.taxEnabled ? subtotal * (profile.taxRate || 15) / 100 : 0;
    const total = subtotal + taxTotal;

    // Create document
    const doc: DocumentData = {
      id: crypto.randomUUID(),
      type: docType,
      status: 'Draft',
      title: `${docType === DocType.INVOICE ? 'Invoice' : 'Contract'} - ${clientName}`,
      client: client,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: profile.currency || 'R',
      items: accumulatedItems,
      subtotal,
      taxTotal,
      total,
      vat_enabled: profile.taxEnabled || false,
      tax_rate: profile.taxRate || 15,
      theme: 'swiss'
    };

    onDocGenerated(doc);
    triggerHaptic('success');
    navigate('/canvas');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-grit-dark p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={24} className="text-grit-secondary" />
              AI Document Creator
            </h1>
            <p className="text-sm text-gray-500">
              {clientName ? `Creating ${docType.toLowerCase()} for ${clientName}` : 'Describe your work in plain language'}
            </p>
          </div>
          {accumulatedItems.length > 0 && (
            <Button onClick={handleCreateDocument} icon={<CheckCircle2 size={18} />}>
              Create Document ({accumulatedItems.length} items)
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-grit-primary text-grit-dark'
                    : 'bg-white border-2 border-grit-dark shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {/* Show items preview if present */}
                {msg.items && msg.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                    {msg.items.map(item => (
                      <div key={item.id} className="text-sm flex justify-between">
                        <span>{item.description}</span>
                        <span className="font-bold">R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs mt-2 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-grit-dark rounded-lg p-4 flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t-4 border-grit-dark p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Describe the work you did... (e.g., 'Fixed bathroom toilet and retiled floor for R5000')"
              className="flex-1 border-2 border-grit-dark p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-grit-secondary"
              rows={2}
              disabled={isProcessing}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-3 border-2 border-grit-dark rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
                disabled={isProcessing}
              >
                <Mic size={20} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                className="p-3 border-2 border-grit-dark rounded-lg bg-grit-secondary text-white hover:bg-grit-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{accumulatedItems.length} items • Total: R{accumulatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreenConversational;
