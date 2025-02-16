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
          components (*),
          developments (*)
        `)
        .order('created_at', { ascending: false });

      if (quotationsError) {
        console.error('Error fetching quotations:', quotationsError);
        return;
      }

      const formattedQuotations: Quotation[] = quotationsData.map(q => ({
        id: q.id,
        code: q.code,
        date: q.created_at,
        client: {
          name: q.client_name,
          brand: q.client_brand,
          email: q.client_email,
          ourRef: q.client_our_ref,
          clientRef: q.client_ref,
          description: q.client_description,
          sampleSize: q.client_sample_size,
        },
        articleImage: q.article_image,
        components: q.components,
        developments: q.developments,
        quantities: q.quantities,
        margins: q.margins,
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

  const saveQuotation = async (
    quotation: Omit<Quotation, 'id' | 'code' | 'date'>,
    existingId?: string
  ) => {
    const code = existingId 
      ? undefined 
      : generateQuotationCode(quotations.length + 1);

    const quotationData = {
      ...(existingId && { id: existingId }),
      ...(code && { code }),
      client_name: quotation.client.name,
      client_brand: quotation.client.brand,
      client_email: quotation.client.email,
      client_our_ref: quotation.client.ourRef,
      client_ref: quotation.client.clientRef,
      client_description: quotation.client.description,
      client_sample_size: quotation.client.sampleSize,
      article_image: quotation.articleImage,
      quantities: quotation.quantities,
      margins: quotation.margins,
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

    // Save components
    if (quotation.components.length > 0) {
      const componentsData = quotation.components.map(comp => ({
        quotation_id: savedQuotation.id,
        description: comp.description,
        supplier: comp.supplier,
        unit_price: comp.unitPrice,
        consumption: comp.consumption,
        has_moq: comp.hasMOQ,
      }));

      const { error: componentsError } = await supabase
        .from('components')
        .upsert(componentsData);

      if (componentsError) {
        console.error('Error saving components:', componentsError);
        throw componentsError;
      }
    }

    // Save developments
    if (quotation.developments.length > 0) {
      const developmentsData = quotation.developments.map(dev => ({
        quotation_id: savedQuotation.id,
        description: dev.description,
        supplier: dev.supplier,
        cost: dev.cost,
        is_from_moq: dev.isFromMOQ,
        moq_quantity: dev.moqQuantity,
        include_in_subtotal: dev.includeInSubtotal,
        show_in_pdf: dev.showInPdf,
      }));

      const { error: developmentsError } = await supabase
        .from('developments')
        .upsert(developmentsData);

      if (developmentsError) {
        console.error('Error saving developments:', developmentsError);
        throw developmentsError;
      }
    }

    return savedQuotation.id;
  };

  const generateQuotationCode = (sequence: number) => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `PC${year}${month}${sequence.toString().padStart(3, '0')}`;
  };

  return {
    quotations,
    loading,
    deleteQuotation,
    saveQuotation,
  };
}