import { useEffect, useState } from 'react';
import supabaseClient from '../services/supabaseClient';
import { DocumentData } from '../types';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing documents with Supabase persistence
 * Handles sync, create, update, delete, and real-time updates
 */
export const useDocuments = (initialDocs: DocumentData[] = []) => {
  const { user, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentData[]>(initialDocs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents from Supabase on user login
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Not logged in - use localStorage fallback
      setIsLoading(false);
      return;
    }

    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabaseClient
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data) {
          // Transform Supabase data to DocumentData format
          const transformedDocs: DocumentData[] = data.map(doc => ({
            id: doc.id,
            type: doc.type,
            status: doc.status,
            title: doc.title,
            client: doc.client,
            date: doc.date,
            dueDate: doc.due_date,
            currency: doc.currency,
            theme: doc.theme,
            contractId: doc.contract_id,
            notes: doc.notes,
            shareableLink: doc.shareable_link,
            items: doc.items || [],
            subtotal: doc.subtotal,
            taxTotal: doc.tax_total,
            total: doc.total,
            vat_enabled: doc.vat_enabled,
            tax_rate: doc.tax_rate,
            clauses: doc.clauses || [],
            bodyText: doc.body_text,
          }));

          setDocuments(transformedDocs);
        }
      } catch (err: any) {
        console.error('Failed to load documents:', err);
        setError(err.message || 'Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();

    // Subscribe to real-time changes
    const channel = supabaseClient
      .channel(`documents-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Document update:', payload);
          loadDocuments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, authLoading]);

  const saveDocument = async (doc: DocumentData) => {
    if (!user) {
      // Fallback to localStorage if not authenticated
      const stored = localStorage.getItem('grit_documents');
      const docs = stored ? JSON.parse(stored) : [];
      const idx = docs.findIndex((d: DocumentData) => d.id === doc.id);
      if (idx >= 0) {
        docs[idx] = doc;
      } else {
        docs.unshift(doc);
      }
      localStorage.setItem('grit_documents', JSON.stringify(docs));
      setDocuments(docs);
      return doc;
    }

    try {
      const docToSave = {
        id: doc.id || crypto.randomUUID(),
        user_id: user.id,
        type: doc.type,
        status: doc.status,
        title: doc.title,
        client: doc.client,
        date: doc.date,
        due_date: doc.dueDate,
        currency: doc.currency,
        theme: doc.theme,
        contract_id: doc.contractId,
        notes: doc.notes,
        shareable_link: doc.shareableLink,
        items: doc.items || [],
        subtotal: doc.subtotal,
        tax_total: doc.taxTotal,
        total: doc.total,
        vat_enabled: doc.vat_enabled,
        tax_rate: doc.tax_rate,
        clauses: doc.clauses || [],
        body_text: doc.bodyText,
      };

      // Check if document exists
      const { data: existingDoc, error: checkError } = await supabaseClient
        .from('documents')
        .select('id')
        .eq('id', docToSave.id)
        .single();

      if (existingDoc) {
        // Update existing document
        const { error: updateError } = await supabaseClient
          .from('documents')
          .update(docToSave)
          .eq('id', docToSave.id);

        if (updateError) throw updateError;
      } else {
        // Insert new document
        const { error: insertError } = await supabaseClient
          .from('documents')
          .insert([docToSave]);

        if (insertError) throw insertError;
      }

      // Update local state
      setDocuments(prev => {
        const idx = prev.findIndex(d => d.id === doc.id);
        if (idx >= 0) {
          return prev.map((d, i) => (i === idx ? doc : d));
        }
        return [doc, ...prev];
      });

      return doc;
    } catch (err: any) {
      console.error('Failed to save document:', err);
      setError(err.message || 'Failed to save document');
      throw err;
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!user) {
      // Fallback to localStorage
      const stored = localStorage.getItem('grit_documents');
      const docs = stored ? JSON.parse(stored) : [];
      const filtered = docs.filter((d: DocumentData) => d.id !== docId);
      localStorage.setItem('grit_documents', JSON.stringify(filtered));
      setDocuments(filtered);
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('documents')
        .delete()
        .eq('id', docId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      setError(err.message || 'Failed to delete document');
      throw err;
    }
  };

  return {
    documents,
    setDocuments,
    isLoading,
    error,
    saveDocument,
    deleteDocument,
  };
};
