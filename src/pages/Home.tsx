import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Mail, Phone, FileText } from 'lucide-react';

interface BookingFormData {
  full_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
}

export default function Home() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BookingFormData>();

  const onSubmit = async (data: BookingFormData) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            date: data.date,
            time: data.time,
            notes: data.notes,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success('¡Cita agendada con éxito! Te contactaremos pronto.');
      reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Hubo un error al agendar la cita.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reserva tu Cita</h1>
        <p className="text-gray-600 mt-2">Completa el formulario para agendar una visita.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <User className="w-4 h-4 mr-2" /> Nombre Completo
            </label>
            <input
              {...register('full_name', { required: 'Este campo es requerido' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Juan Pérez"
            />
            {errors.full_name && <span className="text-red-500 text-xs">{errors.full_name.message}</span>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 mr-2" /> Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Este campo es requerido' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="juan@ejemplo.com"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-2" /> Fecha
            </label>
            <input
              type="date"
              {...register('date', { required: 'Selecciona una fecha' })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 mr-2" /> Hora
            </label>
            <select
              {...register('time', { required: 'Selecciona una hora' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">Seleccionar...</option>
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
            </select>
            {errors.time && <span className="text-red-500 text-xs">{errors.time.message}</span>}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4 mr-2" /> Teléfono
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="+34 600 000 000"
            />
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4 mr-2" /> Notas Adicionales
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Motivo de la consulta..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Confirmar Cita'}
        </button>
      </form>
    </div>
  );
}