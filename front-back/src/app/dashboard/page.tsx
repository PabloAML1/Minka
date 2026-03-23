import Link from 'next/link';
import { Plus, BarChart3, HardHat, TrendingUp, AlertTriangle } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  let projects: any[] = [];
  let stats = { totalActive: 0, totalBudget: 0, totalSpent: 0, totalRemaining: 0, overBudgetCount: 0 };
  
  try {
    const rawProjects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        materials: true,
        laborItems: true,
      }
    });

    // Serialize Decimals to plain numbers
    projects = rawProjects.map((p: any) => {
      const materialsCost = p.materials.reduce((acc: number, m: any) => acc + Number(m.totalPrice), 0);
      const laborCost = p.laborItems.reduce((acc: number, l: any) => acc + Number(l.totalCost), 0);
      const totalSpent = materialsCost + laborCost;
      const budget = Number(p.totalBudget);
      const remaining = budget - totalSpent;
      const percentUsed = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        address: p.address,
        status: p.status,
        budget,
        totalSpent,
        remaining,
        percentUsed,
        isOverBudget: totalSpent > budget,
        materialsCount: p.materials.length,
        laborCount: p.laborItems.length,
      };
    });

    // Contar obras que NO estén completadas (Planificación + En Progreso + Pausadas)
    stats.totalActive = projects.filter((p) => p.status !== 'COMPLETED').length;
    stats.totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    stats.totalSpent = projects.reduce((acc, p) => acc + p.totalSpent, 0);
    stats.totalRemaining = stats.totalBudget - stats.totalSpent;
    stats.overBudgetCount = projects.filter((p) => p.isOverBudget).length;
  } catch (e) {
    console.error("Error fetching projects. Database might not be ready yet.", e);
  }

  return (
    <div className="container animate-in">
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1 text-primary">Mis Obras</h1>
          <p className="text-muted font-medium">Control de presupuesto y gastos en tiempo real</p>
        </div>
        <Link href="/projects/new" className="btn btn-primary shadow-xl">
          <Plus size={20} />
          <span>Nueva Obra</span>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 delay-100 animate-in">
        <div className="card card-brutalist flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-semibold text-primary uppercase text-xs tracking-wider">Obras Activas</h3>
            <div className="badge badge-info">
              <HardHat size={16} />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-primary">{stats.totalActive}</p>
        </div>

        <div className="card card-brutalist flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-semibold text-primary uppercase text-xs tracking-wider">Presupuesto Total</h3>
            <div className="badge badge-warning">
              <BarChart3 size={16} />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-primary">${stats.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="card card-brutalist flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-semibold text-primary uppercase text-xs tracking-wider">Capital Invertido</h3>
            <div className="badge badge-danger">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-secondary">${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="card card-brutalist flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-semibold text-primary uppercase text-xs tracking-wider">Disponible</h3>
            <div className={`badge ${stats.totalRemaining < 0 ? 'badge-danger' : 'badge-success'}`}>
              {stats.totalRemaining < 0 ? <AlertTriangle size={16} /> : <span>$</span>}
            </div>
          </div>
          <p className={`text-4xl font-display font-bold ${stats.totalRemaining < 0 ? 'text-danger' : 'text-success'}`}>
            {stats.totalRemaining < 0 ? '-' : ''}${Math.abs(stats.totalRemaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Over-budget alert */}
      {stats.overBudgetCount > 0 && (
        <div className="mb-8 p-4 rounded-lg flex items-center gap-4 animate-in" style={{ background: 'var(--danger-bg)', border: '2px solid var(--danger)' }}>
          <AlertTriangle size={24} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <p className="font-display font-bold text-sm" style={{ color: 'var(--danger)' }}>
            ⚠ {stats.overBudgetCount} obra{stats.overBudgetCount > 1 ? 's' : ''} ha{stats.overBudgetCount > 1 ? 'n' : ''} superado el presupuesto asignado. Revisa los detalles.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 delay-200 animate-in">
        <h2 className="text-2xl font-display font-bold">Registro de Obras</h2>
        <span className="text-sm text-muted font-medium">{projects.length} obra{projects.length !== 1 ? 's' : ''} registrada{projects.length !== 1 ? 's' : ''}</span>
      </div>
      
      {projects.length === 0 ? (
        <div className="card flex-col items-center justify-center py-16 text-center delay-300 animate-in" style={{ borderStyle: 'dashed', borderWidth: '2px', display: 'flex' }}>
          <div style={{ background: 'var(--info-bg)', borderRadius: '50%', padding: '1rem', marginBottom: '1rem' }}>
            <HardHat size={32} style={{ color: 'var(--info)' }} />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">Sin obras registradas</h3>
          <p className="text-muted mb-8 max-w-sm mx-auto">Registra tu primera obra para empezar a controlar gastos y presupuesto.</p>
          <Link href="/projects/new" className="btn btn-primary">
            Registrar Primera Obra
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 delay-300 animate-in">
          {projects.map((project, index) => (
            <Link 
              href={`/projects/${project.id}`} 
              key={project.id} 
              className="card flex-col justify-between"
              style={{ animationDelay: `${300 + (index * 100)}ms` }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div style={{ maxWidth: '70%' }}>
                  <h3 className="font-display font-bold text-xl text-primary leading-tight mb-1">{project.name}</h3>
                  {project.address && (
                    <p className="text-xs text-muted font-medium">{project.address}</p>
                  )}
                </div>
                <span className={`badge badge-${getStatusColor(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </div>
              
              {/* Budget Summary */}
              <div className="flex flex-col gap-2 mb-4 p-4 rounded-lg bg-surface">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Presupuesto</span> 
                  <span className="font-display font-bold text-primary">${project.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Gastado</span> 
                  <span className="font-display font-semibold text-secondary">${project.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: project.isOverBudget ? 'var(--danger)' : 'var(--success)' }}>
                    {project.isOverBudget ? 'Excedido' : 'Disponible'}
                  </span> 
                  <span className={`font-display font-bold ${project.isOverBudget ? 'text-danger' : 'text-success'}`}>
                    {project.isOverBudget ? '-' : ''}${Math.abs(project.remaining).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar - Real percentage */}
              <div className="mt-auto">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
                  <span className="text-muted">Gasto vs Presupuesto</span>
                  <span className={project.isOverBudget ? 'text-danger' : 'text-secondary'}>{project.percentUsed}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: '8px', background: 'var(--border)' }}>
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${Math.min(project.percentUsed, 100)}%`, 
                      background: project.isOverBudget ? 'var(--danger)' : project.percentUsed >= 80 ? 'var(--warning)' : 'var(--secondary)',
                      transition: 'width 0.5s ease-out'
                    }}
                  ></div>
                </div>
              </div>

              {/* Quick stats footer */}
              <div className="flex gap-4 mt-4 pt-3 border-t text-xs text-muted font-medium">
                <span>{project.materialsCount} materiales</span>
                <span>·</span>
                <span>{project.laborCount} jornales</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch(status) {
    case 'IN_PROGRESS': return 'info';
    case 'COMPLETED': return 'success';
    case 'PAUSED': return 'danger';
    case 'PLANNING': default: return 'warning';
  }
}

function formatStatus(status: string) {
  switch(status) {
    case 'IN_PROGRESS': return 'En Progreso';
    case 'COMPLETED': return 'Completado';
    case 'PAUSED': return 'Pausado';
    case 'PLANNING': default: return 'Planificación';
  }
}
