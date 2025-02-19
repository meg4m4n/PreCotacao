import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return;
      }

      const formattedClients: Client[] = clientsData.map(c => ({
        id: c.id,
        name: c.name,
        brand: c.brand,
        email: c.email,
        ourRef: c.our_ref,
        clientRef: c.client_ref,
        description: c.description,
        sampleSize: c.sample_size,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      setClients(formattedClients);
      setLoading(false);
    };

    fetchClients();

    // Subscribe to changes
    const clientsSubscription = supabase
      .channel('clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        () => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      clientsSubscription.unsubscribe();
    };
  }, []);

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const saveClient = async (
    client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const clientData = {
      ...(existingId && { id: existingId }),
      name: client.name,
      brand: client.brand,
      email: client.email,
      our_ref: client.ourRef,
      client_ref: client.clientRef,
      description: client.description,
      sample_size: client.sampleSize,
    };

    const { data: savedClient, error: clientError } = await supabase
      .from('clients')
      .upsert(clientData)
      .select()
      .single();

    if (clientError) {
      console.error('Error saving client:', clientError);
      throw clientError;
    }

    return savedClient.id;
  };

  return {
    clients,
    loading,
    deleteClient,
    saveClient,
  };
}