import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Quotation } from '../types';

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          client:clients (*)
        `)
        .order('created_at', { ascending: false });

      if (quotationsError) {
        console.error('Error fetching quotations:', quotationsError);
        return;
      }

      const formattedQuotations: Quotation[] = quotationsData.map(q => ({
        id: q.id,
        code: q.code,
        ref: q.ref,
        date: q.created_at,
        client: {
          id: q.client.id,
          name: q.client.name,
          brand: q.client.brand,
          email: q.client.email,
          ourRef: q.client.our_ref,
          clientRef: q.client.client_ref,
          description: q.client.description,
          sampleSize: q.client.sample_size,
          createdAt: q.client.created_at,
          updatedAt: q.client.updated_at,
        },
        articleImage: q.article_image,
        components: q.components || [],
        developments: q.developments || [],
        quantities: q.quantities,
        margins: q.margins,
        language: q.language || 'pt',
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      }));

      setQuotations(formattedQuotations);
      setLoading(false);
    };

    fetchQuotations();

    // Subscribe to changes
    const quotationsSubscription = supabase
      .channel('quotations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotations',
        },
        () => {
          fetchQuotations();
        }
      )
      .subscribe();

    return () => {
      quotationsSubscription.unsubscribe();
    };
  }, []);

  const deleteQuotation = async (id: string) => {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  };

  const generateQuotationCode = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = (quotations.length + 1).toString().padStart(3, '0');
    return `PC${year}${month}${sequence}`;
  };

  const generateQuotationRef = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const sequence = (quotations.length + 1).toString().padStart(3, '0');
    return `${year}${month}${day}${sequence}`;
  };

  const saveQuotation = async (
    quotation: Omit<Quotation, 'id' | 'code' | 'ref' | 'date' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const code = existingId ? undefined : generateQuotationCode();
    const ref = existingId ? undefined : generateQuotationRef();

    const quotationData = {
      ...(existingId && { id: existingId }),
      ...(code && { code }),
      ...(ref && { ref }),
      client_id: quotation.client.id,
      article_image: quotation.articleImage,
      components: quotation.components,
      developments: quotation.developments,
      quantities: quotation.quantities,
      margins: quotation.margins,
      language: quotation.language,
    };

    const { data: savedQuotation, error: quotationError } = await supabase
      .from('quotations')
      .upsert(quotationData)
      .select()
      .single();

    if (quotationError) {
      console.error('Error saving quotation:', quotationError);
      throw quotationError;
    }

    return savedQuotation.id;
  };

  return {
    quotations,
    loading,
    deleteQuotation,
    saveQuotation,
  };
}