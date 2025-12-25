import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, Save, User, MapPin, Calendar, Mail } from 'lucide-react';

interface InvoiceFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid';
}

interface ItemRow {
  description: string;
  quantity: number;
  price: number;
}

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InvoiceFormData>();
  const [items, setItems] = useState<ItemRow[]>([{ description: '', quantity: 1, price: 0 }]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof ItemRow, value: string | number) => {
    const newItems = [...items];
    if (field === 'description') {
      newItems[index][field] = value as string;
    } else {
      newItems[index][field] = Number(value);
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const onSubmit = async (data: InvoiceFormData) => {
    const total = calculateTotal();
    if (total <= 0) {
      toast.error('El total de la factura debe ser mayor a 0');
      return;
    }

    try {
      // 1. Insert Invoice Header
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([
          { ...data, total }
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Insert Invoice Items
      const itemsToInsert = items.map(item => ({
        invoice_id: invoiceData.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        amount: item.quantity * item.price
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Factura creada exitosamente');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la factura');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Factura</h1>
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">Cancelar</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md overflow-hidden p-6 space-y-8">
        
        {/* Client Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos del Cliente</h3>
            
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-600">
                <User className="w-4 h-4 mr-2" /> Nombre Cliente
              </label>
              <input
                {...register('client_name', { required: 'Requerido' })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Empresa S.A."
              />
              {errors.client_name && <span className="text-red-500 text-xs">{errors.client_name.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-600">
                <Mail className="w-4 h-4 mr-2" /> Email
              </label>
              <input
                type="email"
                {...register('client_email', { required: 'Requerido' })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="contacto@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-600">
                <MapPin className="w-4 h-4 mr-2" /> Dirección
              </label>
              <input
                {...register('client_address')}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Calle Principal 123"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Detalles de Factura</h3>
            
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-600">
                <Calendar className="w-4 h-4 mr-2" /> Fecha Emisión
              </label>
              <input
                type="date"
                {...register('invoice_date', { required: 'Requerido' })}
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-600">
                <Calendar className="w-4 h-4 mr-2" /> Fecha Vencimiento
              </label>
              <input
                type="date"
                {...register('due_date', { required: 'Requerido' })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
               <label className="flex items-center text-sm font-medium text-gray-600">Estado</label>
               <select 
                 {...register('status')}
                 className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
               >
                 <option value="draft">Borrador</option>
                 <option value="pending">Pendiente</option>
                 <option value="paid">Pagada</option>
               </select>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Ítems</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-grow w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Servicio de consultoría..."
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-500 mb-1 block">Cant.</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs text-gray-500 mb-1 block">Precio</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="w-32 pb-2 text-right font-medium text-gray-700">
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  disabled={items.length === 1}
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addItem} 
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Plus className="w-4 h-4 mr-1" /> Agregar ítem
          </button>
        </div>

        {/* Footer Total */}
        <div className="border-t pt-4 flex justify-end items-center gap-4">
           <div className="text-xl font-bold text-gray-800">
             Total: ${calculateTotal().toFixed(2)}
           </div>
           <button
             type="submit"
             disabled={isSubmitting}
             className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium flex items-center"
           >
             <Save className="w-5 h-5 mr-2" />
             {isSubmitting ? 'Guardando...' : 'Guardar Factura'}
           </button>
        </div>
      </form>
    </div>
  );
}