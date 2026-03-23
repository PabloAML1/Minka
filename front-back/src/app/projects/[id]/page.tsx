import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, HardHat, User, FileText, AlertTriangle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { Badge, ProgressBar } from '@/components/ui';
import ProjectTabsClient from '@/components/project/ProjectTabsClient';

// Helper: convert Prisma Decimal fields to plain numbers recursively
function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && typeof obj.toNumber === 'function') return obj.toNumber();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    const plain: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      plain[key] = serialize(obj[key]);
    }
    return plain;
  }
  return obj;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawProject = await prisma.project.findUnique({
    where: { id },
    include: {
      materials: true,
      laborItems: true,
      milestones: true,
    }
  });

  if (!rawProject) return notFound();

  // Serialize all Decimal/Date fields to plain JS primitives
  const project = serialize(rawProject);

  const materialsTotal = project.materials.reduce((acc: number, curr: any) => acc + Number(curr.totalPrice), 0);
  const laborTotal = project.laborItems.reduce((acc: number, curr: any) => acc + Number(curr.totalCost), 0);
  const totalSpent = materialsTotal + laborTotal;
  const budget = Number(project.totalBudget);
  const remaining = budget - totalSpent;
  const isOverBudget = totalSpent > budget;
  const percentUsed = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

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

      {/* Budget Alert Banner */}
      {isOverBudget && (
        <div className="mb-8 p-4 rounded-lg flex items-center gap-4 animate-in" style={{ background: 'var(--danger-bg)', border: '2px solid var(--danger)' }}>
          <AlertTriangle size={24} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div>
            <p className="font-display font-bold text-sm" style={{ color: 'var(--danger)' }}>
              ⚠ PRESUPUESTO EXCEDIDO — Desviación de ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({percentUsed}% del total asignado)
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
              Se ha superado el límite de apropiación presupuestaria. Revise urgentemente los rubros.
            </p>
          </div>
        </div>
      )}

      {/* Warning when close to budget (>80%) */}
      {!isOverBudget && percentUsed >= 80 && (
        <div className="mb-8 p-4 rounded-lg flex items-center gap-4 animate-in" style={{ background: 'var(--warning-bg)', border: '2px solid var(--warning)' }}>
          <AlertTriangle size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <div>
            <p className="font-display font-bold text-sm" style={{ color: 'var(--warning)' }}>
              ALERTA DE PRESUPUESTO — Se ha consumido el {percentUsed}% de los fondos asignados.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--warning)' }}>
              Quedan ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} disponibles del presupuesto original.
            </p>
          </div>
        </div>
      )}

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

      {/* Budget Remaining Card */}
      <div className="card mb-12 delay-200 animate-in" style={isOverBudget ? { borderColor: 'var(--danger)', borderWidth: '2px' } : {}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-xl text-primary">Margen de Desviación</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted font-medium">Disponible:</span>
            <span className={`font-display font-bold text-xl ${isOverBudget ? 'text-danger' : 'text-success'}`}>
              {isOverBudget ? '-' : ''}${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <ProgressBar 
          label={`Inversión actual: $${totalSpent.toLocaleString()} / $${budget.toLocaleString()}`} 
          current={totalSpent} 
          max={budget} 
        />
      </div>

      <ProjectTabsClient project={project} budget={budget} totalSpent={totalSpent} />
    </div>
  );
}
