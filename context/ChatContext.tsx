import React, { createContext, useContext, useState, useCallback } from 'react';
import { Client, DocType, DocumentData, InvoiceItem, ContractClause } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedBlocks?: Array<{ name: string; category: string; items: any[] }>;
}

export interface ChatContextType {
  // Conversation state
  messages: ChatMessage[];
  addMessage: (role: 'user' | 'assistant', content: string, suggestedBlocks?: any[]) => void;
  clearMessages: () => void;

  // Document building state
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;

  documentType: DocType;
  setDocumentType: (type: DocType) => void;

  documentTitle: string;
  setDocumentTitle: (title: string) => void;

  currentItems: InvoiceItem[];
  addItem: (item: InvoiceItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<InvoiceItem>) => void;
  clearItems: () => void;

  currentClauses: ContractClause[];
  addClause: (clause: ContractClause) => void;
  removeClause: (id: string) => void;
  updateClause: (id: string, updates: Partial<ContractClause>) => void;
  clearClauses: () => void;

  // Document state
  assembledDocument: DocumentData | null;
  setAssembledDocument: (doc: DocumentData | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Session state
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [documentType, setDocumentType] = useState<DocType>(DocType.INVOICE);
  const [documentTitle, setDocumentTitle] = useState('');
  const [currentItems, setCurrentItems] = useState<InvoiceItem[]>([]);
  const [currentClauses, setCurrentClauses] = useState<ContractClause[]>([]);
  const [assembledDocument, setAssembledDocument] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string, suggestedBlocks?: any[]) => {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        role,
        content,
        timestamp: new Date(),
        suggestedBlocks,
      };
      setMessages(prev => [...prev, message]);
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addItem = useCallback((item: InvoiceItem) => {
    setCurrentItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setCurrentItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<InvoiceItem>) => {
    setCurrentItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const clearItems = useCallback(() => {
    setCurrentItems([]);
  }, []);

  const addClause = useCallback((clause: ContractClause) => {
    setCurrentClauses(prev => [...prev, clause]);
  }, []);

  const removeClause = useCallback((id: string) => {
    setCurrentClauses(prev => prev.filter(clause => clause.id !== id));
  }, []);

  const updateClause = useCallback((id: string, updates: Partial<ContractClause>) => {
    setCurrentClauses(prev =>
      prev.map(clause => (clause.id === id ? { ...clause, ...updates } : clause))
    );
  }, []);

  const clearClauses = useCallback(() => {
    setCurrentClauses([]);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setSelectedClient(null);
    setDocumentType(DocType.INVOICE);
    setDocumentTitle('');
    setCurrentItems([]);
    setCurrentClauses([]);
    setAssembledDocument(null);
    setError(null);
  }, []);

  const value: ChatContextType = {
    messages,
    addMessage,
    clearMessages,
    selectedClient,
    setSelectedClient,
    documentType,
    setDocumentType,
    documentTitle,
    setDocumentTitle,
    currentItems,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    currentClauses,
    addClause,
    removeClause,
    updateClause,
    clearClauses,
    assembledDocument,
    setAssembledDocument,
    isLoading,
    setIsLoading,
    error,
    setError,
    resetChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
