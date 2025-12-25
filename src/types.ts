export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
  total?: number;
  amount?: number;
}

export interface Invoice {
  id: string;
  created_at: string;
  client_name: string;
  client_email: string;
  client_address: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid';
  total: number;
  items?: InvoiceItem[];
  invoice_items?: InvoiceItem[];
}