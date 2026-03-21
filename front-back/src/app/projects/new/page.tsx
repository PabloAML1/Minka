"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, Button } from '@/components/ui';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      address: formData.get('address'),
      totalBudget: Number(formData.get('totalBudget')),
      clientName: formData.get('clientName'),
      maestroName: formData.get('maestroName'),
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al crear la obra');

      const project = await res.json();
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
      setLoading(false);
    }
  };

  return (
    <div className="container animate-in flex-col items-center" style={{ maxWidth: '800px' }}>
      <div className="w-full flex items-center gap-6 mb-8 delay-100 animate-in">
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.75rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold mb-1 text-primary">Apertura de Obra</h1>
          <p className="text-muted font-medium">Define los parámetros estructurales del proyecto</p>
        </div>
      </div>

      <div className="card w-full delay-200 animate-in">
        {error && (
          <div className="mb-6 p-4 rounded-md border-l-4" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger)', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="input-label">Identificador de la obra *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              className="input-field"
              placeholder="Ej. Remodelación Estructural Fase 1"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="clientName" className="input-label">Contratante / Cliente</label>
              <input 
                type="text" 
                id="clientName" 
                name="clientName" 
                className="input-field"
                placeholder="Nombre o Razón Social"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="maestroName" className="input-label">Maestro Mayor a Cargo</label>
              <input 
                type="text" 
                id="maestroName" 
                name="maestroName" 
                className="input-field"
                placeholder="Responsable de obra"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="input-label">Ubicación / Coordenadas</label>
            <input 
              type="text" 
              id="address" 
              name="address" 
              className="input-field"
              placeholder="Dirección del sitio"
            />
          </div>

          <div className="flex flex-col gap-2 p-6 rounded-lg bg-surface border border-dashed" style={{ borderColor: 'var(--border-focus)' }}>
            <label htmlFor="totalBudget" className="input-label text-secondary">Apropiación Presupuestaria Total ($) *</label>
            <input 
              type="number" 
              id="totalBudget" 
              name="totalBudget" 
              required 
              min="0"
              step="0.01"
              placeholder="0.00"
              className="input-field font-display text-xl"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--secondary)', color: 'var(--primary)' }}
            />
            <span className="text-xs text-muted font-medium mt-1">Este valor servirá como límite estricto para calcular las desviaciones.</span>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="input-label">Especificaciones Técnicas (Opcional)</label>
            <textarea 
              id="description" 
              name="description" 
              rows={4}
              className="input-field"
              placeholder="Detalles, restricciones o notas sobre el proyecto..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="flex justify-end pt-6 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
             <button 
              type="submit" 
              disabled={loading}
              className={`btn ${loading ? 'btn-outline' : 'btn-primary'} w-full md:w-auto shadow-xl`}
            >
              {loading ? (
                <span className="animate-pulse">Sincronizando...</span>
              ) : (
                <>
                  <Save size={20} />
                  <span>Inicializar Proyecto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
