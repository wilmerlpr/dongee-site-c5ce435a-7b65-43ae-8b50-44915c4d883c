import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { Loader2, ArrowLeft, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast.error('No se pudo cargar la factura');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-indigo-600" /></div>;
  if (!invoice) return <div className="text-center p-20 text-gray-500">Factura no encontrada</div>;

  // Handle Supabase joining data structure
  const items = invoice.invoice_items || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Actions Header */}
      <div className="flex justify-between items-center print:hidden">
        <Link to="/" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al listado
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          {/* Example button for download logic later */}
          <button 
             className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium opacity-50 cursor-not-allowed"
             disabled
             title="Próximamente"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Invoice View - Printable Area */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 print:shadow-none print:border-none p-8 sm:p-12">
        
        {/* Header: Brand & Invoice Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-12">
          <div>
             <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                 F
               </div>
               <span className="text-2xl font-bold text-gray-900">FacturaFacil</span>
             </div>
             <p className="text-gray-500 text-sm mt-1">Tu Empresa S.A.</p>
             <p className="text-gray-500 text-sm">calle Falsa 123, Madrid</p>
             <p className="text-gray-500 text-sm">info@facturafacil.com</p>
          </div>

          <div className="mt-6 sm:mt-0 text-right">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">FACTURA</h1>
            <p className="text-gray-600 font-medium">#{invoice.id.slice(0, 8).toUpperCase()}</p>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mt-2 ${getStatusColor(invoice.status)}`}>
              {invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Borrador'}
            </div>
          </div>
        </div>

        {/* Dates & Client Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 border-t border-b border-gray-100 py-8">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3">Facturar a:</h3>
            <p className="text-gray-900 font-bold text-lg">{invoice.client_name}</p>
            <p className="text-gray-600">{invoice.client_email}</p>
            <p className="text-gray-600">{invoice.client_address || 'Dirección no registrada'}</p>
          </div>
          <div className="sm:text-right">
            <div className="mb-3">
              <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider block">Fecha de Emisión:</span>
              <span className="text-gray-900 font-medium">{invoice.invoice_date}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider block">Fecha de Vencimiento:</span>
              <span className="text-gray-900 font-medium">{invoice.due_date}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-10">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="text-left py-3 text-gray-500 font-semibold text-sm uppercase">Descripción</th>
                <th className="text-right py-3 text-gray-500 font-semibold text-sm uppercase">Cant.</th>
                <th className="text-right py-3 text-gray-500 font-semibold text-sm uppercase">Precio</th>
                <th className="text-right py-3 text-gray-500 font-semibold text-sm uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-50">
                  <td className="py-4 text-left font-medium">{item.description}</td>
                  <td className="py-4 text-right">{item.quantity}</td>
                  <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-4 text-right font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Impuestos (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-gray-900 text-xl font-bold border-t border-gray-200 pt-3">
              <span>Total</span>
              <span className="text-indigo-600">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Print Only Footer */}
        <div className="hidden print:block mt-20 text-center text-gray-500 text-sm">
          <p>Gracias por su compra.</p>
        </div>
      </div>
    </div>
  );
}