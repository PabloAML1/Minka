import Link from 'next/link';
import { Plus, BarChart3, HardHat, TrendingUp } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  // Fetch projects and stats
  let projects: any[] = [];
  let stats = { totalActive: 0, totalBudget: 0, totalSpent: 0 };
  
  try {
    projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        materials: true,
        laborItems: true,
      }
    });

    stats.totalActive = projects.filter((p: any) => p.status === 'IN_PROGRESS').length;
    stats.totalBudget = projects.reduce((acc: number, curr: any) => acc + Number(curr.totalBudget), 0);
    
    // Calculate total spent (materials + labor) across all projects
    stats.totalSpent = projects.reduce((acc: number, curr: any) => {
      const materialsCost = curr.materials.reduce((mAcc: number, mCurr: any) => mAcc + Number(mCurr.totalPrice), 0);
      const laborCost = curr.laborItems.reduce((lAcc: number, lCurr: any) => lAcc + Number(lCurr.totalCost), 0);
      return acc + materialsCost + laborCost;
    }, 0);
  } catch (e) {
    console.error("Error fetching projects. Database might not be ready yet.", e);
  }

  return (
    <div className="container animate-in">
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1 text-primary">Resumen</h1>
          <p className="text-muted font-medium">Control estructural de obras activas</p>
        </div>
        <Link href="/projects/new" className="btn btn-primary shadow-xl">
          <Plus size={20} />
          <span>Nueva Obra</span>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 delay-100 animate-in">
        <div className="card card-brutalist flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-semibold text-primary uppercase text-xs tracking-wider">Planificación & Activas</h3>
            <div className="badge badge-info">
              <HardHat size={16} />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-primary">{stats.totalActive}</p>
        </div>

        <div className="card card-brutalist flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-semibold text-primary uppercase text-xs tracking-wider">Presupuesto Estimado</h3>
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
      </div>

      <div className="flex items-center justify-between mb-6 delay-200 animate-in">
        <h2 className="text-2xl font-display font-bold">Registro de Obras</h2>
      </div>
      
      {projects.length === 0 ? (
        <div className="card flex-col items-center justify-center py-16 text-center delay-300 animate-in" style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
          <div className="badge-info rounded-full p-4 mb-4">
            <HardHat size={32} />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">Terreno Limpio</h3>
          <p className="text-muted mb-8 max-w-sm mx-auto">No tienes proyectos activos. Inicia creando tu primera obra para comenzar el rastreo.</p>
          <Link href="/projects/new" className="btn btn-primary">
            Registrar Primera Obra
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 delay-300 animate-in">
          {projects.map((project, index) => (
            <Link 
              href={`/projects/${project.id}`} 
              key={project.id} 
              className={`card flex-col justify-between`}
              style={{ animationDelay: `${300 + (index * 100)}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-display font-bold text-xl text-primary leading-tight max-w-[70%]">{project.name}</h3>
                <span className={`badge badge-${getStatusColor(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </div>
              
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center bg-surface p-3 rounded-md">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Presupuesto</span> 
                  <span className="font-display font-bold text-primary">${Number(project.totalBudget).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex justify-between text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  <span>Avance</span>
                  <span className="text-secondary">75%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '75%' }}></div>
                </div>
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
    case 'PAUSED': return 'warning';
    case 'PLANNING': default: return 'info';
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
