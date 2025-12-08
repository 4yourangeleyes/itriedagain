import { useEffect, useState } from 'react';
import supabaseClient from '../services/supabaseClient';
import { TemplateBlock, DocType } from '../types';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing template blocks with Supabase persistence
 * Handles loading, creating, updating, and deleting templates
 */
export const useTemplates = (initialTemplates: TemplateBlock[] = []) => {
  const { user, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<TemplateBlock[]>(initialTemplates);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from Supabase on user login
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Not logged in - use initial templates
      setIsLoading(false);
      return;
    }

    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[useTemplates] Loading templates for user:', user.id);

        const { data, error: fetchError } = await supabaseClient
          .from('templates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          console.log('[useTemplates] Loaded', data.length, 'templates from Supabase');
          
          // Transform Supabase data to TemplateBlock format
          const transformedTemplates: TemplateBlock[] = data.map(row => {
            // Parse clauses if it's a string
            let parsedClauses = row.clauses;
            if (typeof row.clauses === 'string') {
              try {
                parsedClauses = JSON.parse(row.clauses);
              } catch (e) {
                console.error('[useTemplates] Failed to parse clauses for template:', row.id);
                parsedClauses = [];
              }
            }

            return {
              id: row.id,
              name: row.name,
              type: row.doc_type as DocType,
              category: row.category || '',
              items: row.items || [],
              clauses: Array.isArray(parsedClauses) ? parsedClauses : [],
              contractType: row.contract_type || undefined,
            };
          });

          setTemplates(transformedTemplates);
        } else {
          console.log('[useTemplates] No templates found in database');
          setTemplates(initialTemplates);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('[useTemplates] Error loading templates:', err);
        setError(err.message);
        setIsLoading(false);
        // Fall back to initial templates on error
        setTemplates(initialTemplates);
      }
    };

    loadTemplates();
  }, [user, authLoading]);

  // Save template to Supabase
  const saveTemplate = async (template: TemplateBlock): Promise<any> => {
    if (!user) {
      console.error('[useTemplates] Cannot save template: No user logged in');
      return { error: 'Not authenticated' };
    }

    try {
      const templateData = {
        user_id: user.id,
        name: template.name,
        category: template.category || '',
        doc_type: template.type,
        contract_type: template.contractType || null,
        items: template.items || [],
        clauses: JSON.stringify(template.clauses || []),
        updated_at: new Date().toISOString(),
      };

      // Check if template already exists
      if (template.id) {
        // Update existing
        const { data, error } = await supabaseClient
          .from('templates')
          .update(templateData)
          .eq('id', template.id)
          .eq('user_id', user.id)
          .select();

        if (error) throw error;

        // Update local state
        setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
        
        return { data, error: null };
      } else {
        // Insert new
        const { data, error } = await supabaseClient
          .from('templates')
          .insert({
            ...templateData,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;

        if (data && data[0]) {
          // Add to local state with database-generated ID
          const newTemplate = { ...template, id: data[0].id };
          setTemplates(prev => [...prev, newTemplate]);
        }

        return { data, error: null };
      }
    } catch (err: any) {
      console.error('[useTemplates] Error saving template:', err);
      return { data: null, error: err };
    }
  };

  // Delete template from Supabase
  const deleteTemplate = async (id: string): Promise<void> => {
    if (!user) {
      console.error('[useTemplates] Cannot delete template: No user logged in');
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('[useTemplates] Error deleting template:', err);
      throw err;
    }
  };

  return {
    templates,
    setTemplates,
    saveTemplate,
    deleteTemplate,
    isLoading,
    error,
  };
};
