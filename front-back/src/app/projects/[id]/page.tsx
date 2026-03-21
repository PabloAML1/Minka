import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, HardHat, Pickaxe, Calendar, User, FileText } from 'lucide-react';
import prisma from '@/lib/prisma';
import { Card, Badge, ProgressBar } from '@/components/ui';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      materials: true,
      laborItems: true,
      milestones: true,
    }
  });

  if (!project) return notFound();

  const materialsTotal = project.materials.reduce((acc: number, curr: any) => acc + Number(curr.totalPrice), 0);
  const laborTotal = project.laborItems.reduce((acc: number, curr: any) => acc + Number(curr.totalCost), 0);
  const totalSpent = materialsTotal + laborTotal;
  const budget = Number(project.totalBudget);

  return (
    <div className="container animate-in">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-4 mb-4 md:mb-0">
          <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.75rem', borderRadius: '50%' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-primary">{project.name}</h1>
              <Badge variant={project.status === 'COMPLETED' ? 'success' : project.status === 'IN_PROGRESS' ? 'info' : 'warning'}>
                {project.status === 'IN_PROGRESS' ? 'En Progreso' : project.status === 'COMPLETED' ? 'Completado' : 'Planificación'}
              </Badge>
            </div>
            <p className="text-muted font-medium flex items-center gap-2">
              <FileText size={16} /> {project.address || 'Ubicación no especificada'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12 delay-100 animate-in">
        <div className="card card-brutalist">
          <h3 className="font-display font-semibold text-primary uppercase text-xs tracking-wider mb-4">Apropiación Base</h3>
          <p className="text-4xl font-display font-bold mb-6 text-primary">${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div>
              <span className="text-muted block text-xs uppercase tracking-wider mb-1">Contratante</span>
              <span className="font-semibold flex items-center gap-2"><User size={14} className="text-primary"/> {project.clientName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted block text-xs uppercase tracking-wider mb-1">Responsable</span>
              <span className="font-semibold flex items-center gap-2"><HardHat size={14} className="text-primary"/> {project.maestroName || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <h3 className="font-display font-semibold text-success uppercase text-xs tracking-wider mb-4">Ejecutado (Materiales)</h3>
          <p className="text-4xl font-display font-bold mb-4 text-primary">${materialsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-sm font-medium text-muted">
            {project.materials.length} suministros registrados
          </p>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
          <h3 className="font-display font-semibold text-warning uppercase text-xs tracking-wider mb-4">Ejecutado (Mano de Obra)</h3>
          <p className="text-4xl font-display font-bold mb-4 text-primary">${laborTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-sm font-medium text-muted">
            {project.laborItems.length} registros de cuadrilla
          </p>
        </div>
      </div>

      <div className="card mb-12 delay-200 animate-in">
        <h3 className="font-display font-bold text-xl mb-6 text-primary">Margen de Desviación</h3>
        <ProgressBar 
          label={`Inversión actual: $${totalSpent.toLocaleString()} / $${budget.toLocaleString()}`} 
          current={totalSpent} 
          max={budget} 
        />
      </div>

      <div className="flex gap-8 border-b mb-8 delay-300 animate-in" style={{ borderColor: 'var(--border)' }}>
        <div className="pb-3 text-primary font-display font-bold uppercase tracking-wider text-sm border-b-2" style={{ borderColor: 'var(--primary)', cursor: 'pointer' }}>Inventario de Materiales</div>
        <div className="pb-3 text-muted font-display font-bold uppercase tracking-wider text-sm hover:text-primary transition-colors" style={{ cursor: 'pointer' }}>Gestión de Cuadrilla</div>
      </div>

      <div className="flex justify-between items-center mb-6 delay-300 animate-in">
        <h2 className="text-2xl font-display font-bold text-primary">Suministros Registrados</h2>
        <button className="btn btn-secondary shadow-md">
          + Agregar Suministro
        </button>
      </div>

      <div className="card p-0 overflow-x-auto delay-300 animate-in">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wider font-display">
            <tr>
              <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Ítem / Suministro</th>
              <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Volumen</th>
              <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Costo Unitario</th>
              <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Costo Total</th>
              <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {project.materials.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted font-medium">
                  No se han registrado suministros. El historial está vacío.
                </td>
              </tr>
            ) : (
              project.materials.map((mat: any) => (
                <tr key={mat.id} className="hover:bg-surface transition-colors border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-semibold text-primary">{mat.name}</td>
                  <td className="p-4 text-muted font-medium">{mat.quantity} {mat.unit}</td>
                  <td className="p-4 font-display font-semibold text-primary">${Number(mat.unitPrice).toFixed(2)}</td>
                  <td className="p-4 font-display font-bold text-primary">${Number(mat.totalPrice).toFixed(2)}</td>
                  <td className="p-4">
                    <Badge variant={mat.status === 'PURCHASED' ? 'success' : 'warning'}>
                      {mat.status === 'PURCHASED' ? 'Comprado' : 'Pendiente'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
