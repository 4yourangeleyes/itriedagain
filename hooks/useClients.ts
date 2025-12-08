import { useEffect, useState } from 'react';
import supabaseClient from '../services/supabaseClient';
import { Client } from '../types';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing clients with Supabase persistence
 * Handles sync, create, update, delete, and real-time updates
 */
export const useClients = (initialClients: Client[] = []) => {
  const { user, isLoading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients from Supabase on user login
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Not logged in - use localStorage fallback
      setIsLoading(false);
      return;
    }

    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabaseClient
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data) {
          const transformedClients: Client[] = data.map(client => ({
            id: client.id,
            businessName: client.business_name,
            email: client.email,
            registrationNumber: client.registration_number,
            phone: client.phone,
            address: client.address,
          }));

          setClients(transformedClients);
        }
      } catch (err: any) {
        console.error('Failed to load clients:', err);
        setError(err.message || 'Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();

    // Subscribe to real-time changes
    const channel = supabaseClient
      .channel(`clients-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Client update:', payload);
          loadClients();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, authLoading]);

  const saveClient = async (client: Client) => {
    if (!user) {
      // Fallback to localStorage
      const stored = localStorage.getItem('grit_clients');
      const cls = stored ? JSON.parse(stored) : [];
      const idx = cls.findIndex((c: Client) => c.id === client.id);
      if (idx >= 0) {
        cls[idx] = client;
      } else {
        cls.unshift(client);
      }
      localStorage.setItem('grit_clients', JSON.stringify(cls));
      setClients(cls);
      return client;
    }

    try {
      const clientToSave = {
        id: client.id || `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        business_name: client.businessName,
        registration_number: client.registrationNumber,
        email: client.email,
        phone: client.phone,
        address: client.address,
      };

      // Check if client exists
      const { data: existingClient } = await supabaseClient
        .from('clients')
        .select('id')
        .eq('id', clientToSave.id)
        .single();

      if (existingClient) {
        // Update existing client
        const { error: updateError } = await supabaseClient
          .from('clients')
          .update(clientToSave)
          .eq('id', clientToSave.id);

        if (updateError) throw updateError;
      } else {
        // Insert new client
        const { error: insertError } = await supabaseClient
          .from('clients')
          .insert([clientToSave]);

        if (insertError) throw insertError;
      }

      // Update local state
      setClients(prev => {
        const idx = prev.findIndex(c => c.id === client.id);
        if (idx >= 0) {
          return prev.map((c, i) => (i === idx ? client : c));
        }
        return [client, ...prev];
      });

      return client;
    } catch (err: any) {
      console.error('Failed to save client:', err);
      setError(err.message || 'Failed to save client');
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!user) {
      // Fallback to localStorage
      const stored = localStorage.getItem('grit_clients');
      const cls = stored ? JSON.parse(stored) : [];
      const filtered = cls.filter((c: Client) => c.id !== clientId);
      localStorage.setItem('grit_clients', JSON.stringify(filtered));
      setClients(filtered);
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) throw error;

      setClients(prev => prev.filter(c => c.id !== clientId));
    } catch (err: any) {
      console.error('Failed to delete client:', err);
      setError(err.message || 'Failed to delete client');
      throw err;
    }
  };

  return {
    clients,
    setClients,
    isLoading,
    error,
    saveClient,
    deleteClient,
  };
};
