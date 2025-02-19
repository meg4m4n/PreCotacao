export interface Client {
  name: string;
  brand: string;
  email: string;
  ourRef: string;
  clientRef: string;
  description: string;
  sampleSize: string;
}

export interface Development {
  id: string;
  description: string;
  cost: number;
  isFromMOQ?: boolean;
  supplier?: string;
  moqQuantity?: number;
  includeInSubtotal?: boolean;
  showInPdf?: boolean;
}

export interface Component {
  id: string;
  description: string;
  supplier: string;
  unitPrice: number;
  consumption: number;
  hasMOQ: boolean;
  moqQuantity?: number;
  moqCost?: number;
}

export interface Quotation {
  id: string;
  code: string;
  date: string;
  client: Client;
  articleImage: string;
  components: Component[];
  developments: Development[];
  quantities: number[];
  margins: number[];
  language?: 'pt' | 'en' | 'fr' | 'es';
}

export interface PricingData {
  client: Client;
  articleImage: string;
  components: Component[];
  developments: Development[];
  quantities: number[];
  margins: number[];
  language?: 'pt' | 'en' | 'fr' | 'es';
}

export type Language = 'pt' | 'en' | 'fr' | 'es';

export interface Translations {
  title: string;
  preQuotation: string;
  code: string;
  clientInfo: string;
  name: string;
  brand: string;
  ourRef: string;
  clientRef: string;
  materialsList: string;
  description: string;
  pricesByQuantity: string;
  quantity: string;
  pricePerUnit: string;
  extraCosts: string;
  cost: string;
  margin: string;
  totalWithMargin: string;
  footer: string[];
}