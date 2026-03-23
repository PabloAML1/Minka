"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";

interface ProjectTabsProps {
  project: any;
  budget: number;
  totalSpent: number;
}

// ==================== CONFIRM MODAL ====================
function ConfirmModal({ title, message, variant = "danger", confirmLabel = "Confirmar", onConfirm, onCancel }: {
  title: string; message: string; variant?: "danger" | "warning" | "success";
  confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  const colorMap = { danger: 'var(--danger)', warning: 'var(--warning)', success: 'var(--success)' };
  const bgMap = { danger: 'var(--danger-bg)', warning: 'var(--warning-bg)', success: 'var(--success-bg)' };
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content card animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '24rem' }}>
        <div className="p-4 rounded-lg mb-4" style={{ background: bgMap[variant], borderLeft: `4px solid ${colorMap[variant]}` }}>
          <h3 className="font-display font-bold text-lg mb-1" style={{ color: colorMap[variant] }}>{title}</h3>
          <p className="text-sm" style={{ color: colorMap[variant], opacity: 0.85 }}>{message}</p>
        </div>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="btn btn-outline">Cancelar</button>
          <button onClick={onConfirm} className="btn" style={{ background: colorMap[variant], color: 'white' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectTabsClient({ project, budget, totalSpent }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "labor">("materials");
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; variant: "danger" | "warning" | "success"; confirmLabel: string; onConfirm: () => void } | null>(null);

  // Material Form
  const [matName, setMatName] = useState("");
  const [matQuantity, setMatQuantity] = useState(1);
  const [matUnit, setMatUnit] = useState("unidad");
  const [matPrice, setMatPrice] = useState(0);
  const [matStatus, setMatStatus] = useState("PENDING");
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

  // Labor Form
  const [labWorker, setLabWorker] = useState("");
  const [labRole, setLabRole] = useState("");
  const [labRate, setLabRate] = useState(0);
  const [labDays, setLabDays] = useState(1);
  const [editingLaborId, setEditingLaborId] = useState<string | null>(null);

  // Budget Form
  const [additionalBudget, setAdditionalBudget] = useState(0);

  const remaining = budget - totalSpent;
  const isCompleted = project.status === "COMPLETED";

  // ==================== HELPER: show confirm ====================
  const showConfirm = (title: string, message: string, onConfirm: () => void, variant: "danger" | "warning" | "success" = "danger", confirmLabel = "Confirmar") => {
    setConfirmModal({ title, message, variant, confirmLabel, onConfirm });
  };

  // ==================== MATERIAL ACTIONS ====================
  const openEditMaterial = (mat: any) => {
    setEditingMaterialId(mat.id);
    setMatName(mat.name); setMatQuantity(mat.quantity); setMatUnit(mat.unit);
    setMatPrice(Number(mat.unitPrice)); setMatStatus(mat.status);
    setShowMaterialModal(true); setError("");
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const itemCost = matQuantity * matPrice;

    const doSave = async () => {
      setLoading(true);
      try {
        const url = editingMaterialId ? `/api/materials/${editingMaterialId}` : "/api/materials";
        const method = editingMaterialId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: matName, quantity: matQuantity, unit: matUnit, unitPrice: matPrice, status: matStatus, ...(editingMaterialId ? {} : { projectId: project.id }) })
        });
        if (!res.ok) throw new Error((await res.json()).error || "Error");
        closeMaterialModal(); window.location.reload();
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    if (!editingMaterialId && (totalSpent + itemCost) > budget) {
      showConfirm("⚠ Alerta de Presupuesto",
        `Este suministro ($${itemCost.toFixed(2)}) ${remaining > 0 ? `supera los $${remaining.toFixed(2)} disponibles` : 'incrementará la desviación presupuestaria'}. ¿Desea registrarlo?`,
        doSave, "warning", "Registrar Igualmente");
    } else {
      doSave();
    }
  };

  const handleToggleMaterialStatus = async (mat: any) => {
    const newStatus = mat.status === "PURCHASED" ? "PENDING" : "PURCHASED";
    const label = newStatus === "PURCHASED" ? "Comprado" : "Pendiente";
    try {
      const res = await fetch(`/api/materials/${mat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error("Error");
      window.location.reload();
    } catch { alert("Error al cambiar el estado"); }
  };

  const handleDeleteMaterial = (id: string, name: string) => {
    showConfirm("Eliminar Suministro", `¿Eliminar "${name}" del inventario? Esta acción no se puede deshacer.`, async () => {
      try {
        const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error");
        setConfirmModal(null); window.location.reload();
      } catch { alert("Error al eliminar"); }
    }, "danger", "Sí, Eliminar");
  };

  const closeMaterialModal = () => {
    setShowMaterialModal(false); setEditingMaterialId(null);
    setMatName(""); setMatQuantity(1); setMatUnit("unidad"); setMatPrice(0); setMatStatus("PENDING"); setError("");
  };

  // ==================== LABOR ACTIONS ====================
  const openEditLabor = (lab: any) => {
    setEditingLaborId(lab.id);
    setLabWorker(lab.workerName); setLabRole(lab.role);
    setLabRate(Number(lab.dailyRate)); setLabDays(lab.daysWorked);
    setShowLaborModal(true); setError("");
  };

  const handleSaveLabor = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const itemCost = labRate * labDays;

    const doSave = async () => {
      setLoading(true);
      try {
        const url = editingLaborId ? `/api/labor/${editingLaborId}` : "/api/labor";
        const method = editingLaborId ? "PATCH" : "POST";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerName: labWorker, role: labRole, dailyRate: labRate, daysWorked: labDays, ...(editingLaborId ? {} : { projectId: project.id }) })
        });
        if (!res.ok) throw new Error((await res.json()).error || "Error");
        closeLaborModal(); window.location.reload();
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    if (!editingLaborId && (totalSpent + itemCost) > budget) {
      showConfirm("⚠ Alerta de Presupuesto",
        `Este jornal ($${itemCost.toFixed(2)}) ${remaining > 0 ? `supera los $${remaining.toFixed(2)} disponibles` : 'incrementará la desviación presupuestaria'}. ¿Desea registrarlo?`,
        doSave, "warning", "Registrar Igualmente");
    } else {
      doSave();
    }
  };

  const handleDeleteLabor = (id: string, name: string) => {
    showConfirm("Eliminar Registro", `¿Eliminar el registro de "${name}"? Esta acción no se puede deshacer.`, async () => {
      try {
        const res = await fetch(`/api/labor/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error");
        setConfirmModal(null); window.location.reload();
      } catch { alert("Error al eliminar"); }
    }, "danger", "Sí, Eliminar");
  };

  const closeLaborModal = () => {
    setShowLaborModal(false); setEditingLaborId(null);
    setLabWorker(""); setLabRole(""); setLabRate(0); setLabDays(1); setError("");
  };

  // ==================== BUDGET ADJUSTMENT ====================
  const handleAdjustBudget = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (additionalBudget <= 0) { setError("Ingrese un monto válido"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalBudget: budget + additionalBudget }) });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      setShowBudgetModal(false); setAdditionalBudget(0); window.location.reload();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // ==================== FINALIZE PROJECT ====================
  const handleFinalizeProject = () => {
    showConfirm("🏗️ Finalizar esta Obra",
      `Al marcar como finalizada, la obra quedará en modo lectura y no se podrán agregar más gastos. El presupuesto ${remaining >= 0 ? `sobrante es de $${remaining.toFixed(2)}` : `fue excedido por $${Math.abs(remaining).toFixed(2)}`}.`,
      async () => {
        try {
          const res = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "COMPLETED" }) });
          if (!res.ok) throw new Error("Error");
          setConfirmModal(null); window.location.reload();
        } catch { alert("Error al finalizar"); }
      }, remaining >= 0 ? "success" : "warning", "Sí, Finalizar Obra");
  };

  const matItemCost = matQuantity * (matPrice || 0);
  const labItemCost = labDays * (labRate || 0);
  const matWillExceed = !editingMaterialId && (totalSpent + matItemCost) > budget;
  const labWillExceed = !editingLaborId && (totalSpent + labItemCost) > budget;

  const materialsTotal = project.materials.reduce((acc: number, m: any) => acc + Number(m.totalPrice), 0);
  const laborTotal = project.laborItems.reduce((acc: number, l: any) => acc + Number(l.totalCost), 0);

  // ==================== COMPLETED VIEW (Read-Only) ====================
  if (isCompleted) {
    return (
      <>
        {/* Completion Banner */}
        <div className="mb-8 p-6 rounded-lg text-center animate-in" style={{ background: 'var(--success-bg)', border: '2px solid var(--success)' }}>
          <p className="font-display font-black text-2xl mb-1" style={{ color: 'var(--success)' }}>✅ OBRA FINALIZADA</p>
          <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
            Esta obra fue completada. A continuación se muestra el resumen financiero final.
          </p>
        </div>

        {/* Financial Summary */}
        <div className="card mb-8 animate-in delay-100">
          <h3 className="font-display font-bold text-xl text-primary mb-6">📊 Resumen Financiero Final</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 rounded-lg bg-surface">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider">Presupuesto Asignado</span>
              <span className="font-display font-bold text-xl text-primary">${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-surface">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider">Total Materiales</span>
              <span className="font-display font-bold text-lg text-primary">${materialsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-surface">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider">Total Mano de Obra</span>
              <span className="font-display font-bold text-lg text-primary">${laborTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-surface" style={{ borderTop: '3px solid var(--primary)' }}>
              <span className="text-sm font-semibold text-muted uppercase tracking-wider">Total Ejecutado</span>
              <span className="font-display font-bold text-xl text-secondary">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-6 rounded-lg" style={{ background: remaining >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', border: `2px solid ${remaining >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
              <span className="font-display font-bold text-sm uppercase tracking-wider" style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {remaining >= 0 ? '💰 Presupuesto Sobrante' : '⚠ Desviación Presupuestaria'}
              </span>
              <span className={`font-display font-black text-2xl ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
                {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Materials Detail (Read-only) */}
        <h3 className="font-display font-bold text-lg text-primary mb-4 animate-in delay-200">Detalle de Materiales ({project.materials.length})</h3>
        <div className="card p-0 overflow-x-auto mb-8 animate-in delay-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface text-muted text-xs uppercase tracking-wider font-display">
              <tr>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Suministro</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Cant.</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>P. Unit.</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Total</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {project.materials.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted">Sin registros</td></tr>
              ) : project.materials.map((mat: any) => (
                <tr key={mat.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-semibold text-primary">{mat.name}</td>
                  <td className="p-4 text-muted">{mat.quantity} {mat.unit}</td>
                  <td className="p-4 font-display">${Number(mat.unitPrice).toFixed(2)}</td>
                  <td className="p-4 font-display font-bold">${Number(mat.totalPrice).toFixed(2)}</td>
                  <td className="p-4"><Badge variant={mat.status === 'PURCHASED' ? 'success' : 'warning'}>{mat.status === 'PURCHASED' ? 'Comprado' : 'Pendiente'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Labor Detail (Read-only) */}
        <h3 className="font-display font-bold text-lg text-primary mb-4 animate-in delay-300">Detalle de Mano de Obra ({project.laborItems.length})</h3>
        <div className="card p-0 overflow-x-auto mb-12 animate-in delay-300">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface text-muted text-xs uppercase tracking-wider font-display">
              <tr>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Trabajador</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Rol</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Jornal</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Días</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {project.laborItems.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted">Sin registros</td></tr>
              ) : project.laborItems.map((lab: any) => (
                <tr key={lab.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-semibold text-primary">{lab.workerName}</td>
                  <td className="p-4 text-muted">{lab.role}</td>
                  <td className="p-4 font-display">${Number(lab.dailyRate).toFixed(2)}</td>
                  <td className="p-4 text-muted">{lab.daysWorked}</td>
                  <td className="p-4 font-display font-bold">${Number(lab.totalCost).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // ==================== ACTIVE VIEW (Editable) ====================
  return (
    <>
      {/* Budget + Finalize Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4 rounded-lg bg-surface animate-in delay-200">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-muted block mb-1">Presupuesto Actual</span>
          <span className="font-display font-bold text-2xl text-primary">${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => { setError(""); setShowBudgetModal(true); }} className="btn btn-outline" style={{ gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>+</span> Ampliar Presupuesto
          </button>
          <button onClick={handleFinalizeProject} className="btn" style={{ background: 'var(--success)', color: 'white', gap: '0.5rem' }}>
            ✓ Finalizar Obra
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b mb-8 delay-300 animate-in" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={() => setActiveTab('materials')}
          className={`pb-3 font-display font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${activeTab === 'materials' ? 'text-primary' : 'text-muted hover:text-primary'}`} 
          style={{ borderColor: activeTab === 'materials' ? 'var(--primary)' : 'transparent', background: 'none' }}
        >
          Materiales ({project.materials.length})
        </button>
        <button 
          onClick={() => setActiveTab('labor')}
          className={`pb-3 font-display font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${activeTab === 'labor' ? 'text-primary' : 'text-muted hover:text-primary'}`} 
          style={{ borderColor: activeTab === 'labor' ? 'var(--primary)' : 'transparent', background: 'none' }}
        >
          Mano de Obra ({project.laborItems.length})
        </button>
      </div>

      {/* Header + Add */}
      <div className="flex justify-between items-center mb-6 delay-300 animate-in">
        <h2 className="text-2xl font-display font-bold text-primary">
          {activeTab === 'materials' ? 'Suministros' : 'Cuadrilla'}
        </h2>
        <button onClick={() => { setError(""); activeTab === 'materials' ? setShowMaterialModal(true) : setShowLaborModal(true); }} className="btn btn-secondary shadow-md">
          + Agregar
        </button>
      </div>

      {/* ==================== MATERIALS TABLE ==================== */}
      {activeTab === 'materials' && (
        <div className="card p-0 overflow-x-auto delay-300 animate-in mb-12">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface text-muted text-xs uppercase tracking-wider font-display">
              <tr>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Suministro</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Cant.</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>P. Unit.</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Total</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Estado</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {project.materials.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted font-medium">No se han registrado suministros.</td></tr>
              ) : project.materials.map((mat: any) => (
                <tr key={mat.id} className="hover:bg-surface transition-colors border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-semibold text-primary">{mat.name}</td>
                  <td className="p-4 text-muted font-medium">{mat.quantity} {mat.unit}</td>
                  <td className="p-4 font-display font-semibold">${Number(mat.unitPrice).toFixed(2)}</td>
                  <td className="p-4 font-display font-bold text-primary">${Number(mat.totalPrice).toFixed(2)}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggleMaterialStatus(mat)} title="Clic para cambiar estado">
                      <Badge variant={mat.status === 'PURCHASED' ? 'success' : 'warning'}>
                        {mat.status === 'PURCHASED' ? '✓ Comprado' : '⏳ Pendiente'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditMaterial(mat)} title="Editar" style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '0.8rem', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDeleteMaterial(mat.id, mat.name)} title="Eliminar" style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'var(--danger-bg)', fontSize: '0.8rem', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== LABOR TABLE ==================== */}
      {activeTab === 'labor' && (
        <div className="card p-0 overflow-x-auto delay-300 animate-in mb-12">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface text-muted text-xs uppercase tracking-wider font-display">
              <tr>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Trabajador</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Rol</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Jornal</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Días</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Subtotal</th>
                <th className="p-4 border-b font-semibold" style={{ borderColor: 'var(--border)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {project.laborItems.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted font-medium">No se han registrado jornales.</td></tr>
              ) : project.laborItems.map((lab: any) => (
                <tr key={lab.id} className="hover:bg-surface transition-colors border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-semibold text-primary">{lab.workerName}</td>
                  <td className="p-4 text-muted font-medium">{lab.role}</td>
                  <td className="p-4 font-display font-semibold">${Number(lab.dailyRate).toFixed(2)}</td>
                  <td className="p-4 text-muted font-medium">{lab.daysWorked}</td>
                  <td className="p-4 font-display font-bold text-primary">${Number(lab.totalCost).toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditLabor(lab)} title="Editar" style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '0.8rem', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDeleteLabor(lab.id, lab.workerName)} title="Eliminar" style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'var(--danger-bg)', fontSize: '0.8rem', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== MATERIAL MODAL ========== */}
      {showMaterialModal && (
        <div className="modal-overlay" onClick={closeMaterialModal}>
          <div className="modal-content card animate-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-display font-bold text-primary mb-6">
              {editingMaterialId ? '✏️ Editar Suministro' : 'Agregar Suministro'}
            </h3>
            {error && <div className="mb-4 p-3 rounded-md text-sm font-semibold" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderLeft: '4px solid var(--danger)' }}>{error}</div>}
            <form onSubmit={handleSaveMaterial} className="flex flex-col gap-4">
              <div>
                <label className="input-label">Nombre *</label>
                <input required type="text" className="input-field" value={matName} onChange={e => setMatName(e.target.value)} placeholder="Ej. Cemento Portland" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Cantidad *</label>
                  <input required type="number" min="1" className="input-field" value={matQuantity} onChange={e => setMatQuantity(Number(e.target.value))} />
                </div>
                <div>
                  <label className="input-label">Unidad</label>
                  <select className="input-field" value={matUnit} onChange={e => setMatUnit(e.target.value)}>
                    <option value="unidad">Unidades</option><option value="saco">Sacos</option><option value="m">Metros</option>
                    <option value="m2">m²</option><option value="m3">m³</option><option value="kg">Kilos</option>
                    <option value="galon">Galones</option><option value="varilla">Varillas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Precio Unitario ($) *</label>
                <input required type="number" min="0" step="0.01" className="input-field font-display" value={matPrice || ''} onChange={e => setMatPrice(Number(e.target.value))} placeholder="0.00" />
              </div>
              <div>
                <label className="input-label">Estado</label>
                <select className="input-field" value={matStatus} onChange={e => setMatStatus(e.target.value)}>
                  <option value="PENDING">⏳ Pendiente</option><option value="PURCHASED">✓ Comprado</option>
                </select>
              </div>
              <div className="p-4 rounded-md mt-2" style={{ background: matWillExceed ? 'var(--danger-bg)' : 'var(--bg-surface)', border: matWillExceed ? '2px solid var(--danger)' : '1px dashed var(--border-focus)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted">Costo Total:</span>
                  <span className={`font-display font-bold text-xl ${matWillExceed ? 'text-danger' : 'text-primary'}`}>${matItemCost.toFixed(2)}</span>
                </div>
                {matWillExceed && <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--danger)' }}>⚠ Superará el presupuesto</p>}
              </div>
              <div className="flex gap-4 mt-4 justify-end">
                <button type="button" onClick={closeMaterialModal} className="btn btn-outline" disabled={loading}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : editingMaterialId ? 'Guardar Cambios' : 'Confirmar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== LABOR MODAL ========== */}
      {showLaborModal && (
        <div className="modal-overlay" onClick={closeLaborModal}>
          <div className="modal-content card animate-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-display font-bold text-primary mb-6">
              {editingLaborId ? '✏️ Editar Jornal' : 'Añadir Jornales'}
            </h3>
            {error && <div className="mb-4 p-3 rounded-md text-sm font-semibold" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderLeft: '4px solid var(--danger)' }}>{error}</div>}
            <form onSubmit={handleSaveLabor} className="flex flex-col gap-4">
              <div>
                <label className="input-label">Trabajador *</label>
                <input required type="text" className="input-field" value={labWorker} onChange={e => setLabWorker(e.target.value)} placeholder="Ej. Javier Flores" />
              </div>
              <div>
                <label className="input-label">Rol *</label>
                <select className="input-field" value={labRole} onChange={e => setLabRole(e.target.value)} required>
                  <option value="" disabled>Seleccione...</option>
                  <option value="Maestro">Maestro Mayor</option><option value="Albañil">Albañil</option><option value="Peón">Peón</option>
                  <option value="Plomero">Plomero</option><option value="Electricista">Electricista</option><option value="Pintor">Pintor</option>
                  <option value="Soldador">Soldador</option><option value="Otro">Otro</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Jornal ($) *</label>
                  <input required type="number" min="0" step="0.01" className="input-field font-display" value={labRate || ''} onChange={e => setLabRate(Number(e.target.value))} placeholder="25.00" />
                </div>
                <div>
                  <label className="input-label">Días *</label>
                  <input required type="number" min="1" step="0.5" className="input-field" value={labDays} onChange={e => setLabDays(Number(e.target.value))} />
                </div>
              </div>
              <div className="p-4 rounded-md mt-2" style={{ background: labWillExceed ? 'var(--danger-bg)' : 'var(--bg-surface)', border: labWillExceed ? '2px solid var(--danger)' : '1px dashed var(--border-focus)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted">Total Jornal:</span>
                  <span className={`font-display font-bold text-xl ${labWillExceed ? 'text-danger' : 'text-primary'}`}>${labItemCost.toFixed(2)}</span>
                </div>
                {labWillExceed && <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--danger)' }}>⚠ Superará el presupuesto</p>}
              </div>
              <div className="flex gap-4 mt-4 justify-end">
                <button type="button" onClick={closeLaborModal} className="btn btn-outline" disabled={loading}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : editingLaborId ? 'Guardar Cambios' : 'Adjudicar Jornal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== BUDGET MODAL ========== */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => { setShowBudgetModal(false); setAdditionalBudget(0); setError(""); }}>
          <div className="modal-content card animate-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-display font-bold text-primary mb-2">💰 Ampliar Presupuesto</h3>
            <p className="text-sm text-muted mb-6">Inyectar fondos adicionales a esta obra.</p>
            {error && <div className="mb-4 p-3 rounded-md text-sm font-semibold" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderLeft: '4px solid var(--danger)' }}>{error}</div>}
            <form onSubmit={handleAdjustBudget} className="flex flex-col gap-4">
              <div className="p-4 rounded-lg bg-surface">
                <div className="flex justify-between mb-2"><span className="text-xs uppercase tracking-wider font-semibold text-muted">Actual</span><span className="font-display font-bold text-primary">${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between mb-2"><span className="text-xs uppercase tracking-wider font-semibold text-muted">Gastado</span><span className="font-display font-bold text-secondary">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between pt-2 border-t"><span className="text-xs uppercase tracking-wider font-semibold" style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--success)' }}>{remaining < 0 ? 'Excedido' : 'Disponible'}</span><span className={`font-display font-bold ${remaining < 0 ? 'text-danger' : 'text-success'}`}>{remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              </div>
              <div>
                <label className="input-label text-secondary">Monto Adicional ($) *</label>
                <input required type="number" min="1" step="0.01" className="input-field font-display text-xl" value={additionalBudget || ''} onChange={e => setAdditionalBudget(Number(e.target.value))} placeholder="0.00" style={{ borderColor: 'var(--secondary)' }} />
              </div>
              {additionalBudget > 0 && (
                <div className="p-4 rounded-md" style={{ background: 'var(--success-bg)', border: '1px dashed var(--success)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted">Nuevo Presupuesto:</span>
                    <span className="font-display font-bold text-xl text-success">${(budget + additionalBudget).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-4 justify-end">
                <button type="button" onClick={() => { setShowBudgetModal(false); setAdditionalBudget(0); setError(""); }} className="btn btn-outline" disabled={loading}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Procesando...' : 'Confirmar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== CONFIRM MODAL ========== */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          variant={confirmModal.variant}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </>
  );
}
