'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Tag, Cpu, AlertTriangle, Plus, Pencil, Trash2, Check, X, RefreshCw, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api.service';
import { CategoryStats, CascadaRule, CascadaRuleCreate, CascadaRuleUpdate, SubcategoriaStats } from '@/types/api';
import BaseCard from '@/components/shared/BaseCard';
import LoadingImperial from '@/components/shared/LoadingImperial';
import { useToast } from '@/context/ToastContext';

type Tab = 'resumen' | 'motor' | 'sincategorizar';

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

// ── Subcategory Drill-down Row ─────────────────────────────────────────────

function SubcategoryDrilldown({ categoria, hasSubcats }: { categoria: string; hasSubcats: boolean }) {
  const [subs, setSubs] = useState<SubcategoriaStats[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasSubcats) return;
    setLoading(true);
    apiService.getSubcategoriaStats(categoria)
      .then(setSubs)
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, [categoria, hasSubcats]);

  if (!hasSubcats) return (
    <div className="border-t border-white/5 px-5 py-3 bg-black/20">
      <p className="text-[9px] text-imperial-text-muted/30 italic">Sin subcategorías definidas</p>
    </div>
  );

  if (loading) return (
    <div className="border-t border-white/5 px-5 py-3 bg-black/20 flex items-center gap-2">
      <Loader2 size={12} className="animate-spin text-imperial-bronze/40" />
      <span className="text-[9px] text-imperial-text-muted/30">Cargando subcategorías...</span>
    </div>
  );

  if (!subs || subs.length === 0) return (
    <div className="border-t border-white/5 px-5 py-3 bg-black/20">
      <p className="text-[9px] text-imperial-text-muted/30 italic">Sin datos de subcategorías</p>
    </div>
  );

  const maxGasto = Math.max(...subs.map(s => s.gasto), 1);

  return (
    <div className="border-t border-white/5 bg-black/20">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-white/[0.03]">
        <span className="text-[9px] font-black text-imperial-bronze/50 uppercase tracking-[0.3em]">Subcategoría</span>
        <div className="flex-1" />
        <span className="text-[9px] font-black text-imperial-bronze/50 uppercase tracking-[0.3em] hidden sm:block w-24 text-right">Movs</span>
        <span className="text-[9px] font-black text-imperial-bronze/50 uppercase tracking-[0.3em] hidden sm:block w-12 text-right">%Movs</span>
        <span className="text-[9px] font-black text-imperial-bronze/50 uppercase tracking-[0.3em] w-28 text-right">Gasto</span>
        <span className="text-[9px] font-black text-imperial-bronze/50 uppercase tracking-[0.3em] w-12 text-right">%$Cat</span>
      </div>

      {/* Rows */}
      {subs.map((sub, i) => (
        <div key={sub.subcategoria} className={`flex items-center gap-4 px-5 py-2.5 ${i < subs.length - 1 ? 'border-b border-white/[0.02]' : ''} hover:bg-white/[0.02] transition-colors`}>
          {/* Rank dot */}
          <div className="w-1 h-1 rounded-full bg-imperial-bronze/30 shrink-0" />

          {/* Name + bar */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className="text-[11px] font-black text-imperial-text-prime/80 uppercase tracking-tight truncate">
              {sub.subcategoria}
            </span>
            <div className="hidden md:block flex-1 max-w-[8rem] bg-white/5 h-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-imperial-bronze/50 rounded-full transition-all duration-700"
                style={{ width: `${(sub.gasto / maxGasto) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <span className="text-[11px] font-black text-imperial-text-muted/50 tabular-nums hidden sm:block w-24 text-right">{sub.n_movimientos.toLocaleString('es-AR')}</span>
          <span className="text-[11px] text-imperial-text-muted/30 tabular-nums hidden sm:block w-12 text-right">{sub.pct_movimientos}%</span>
          <span className="text-[11px] font-black text-error tabular-nums w-28 text-right">{fmt(sub.gasto)}</span>
          <span className="text-[11px] font-black text-imperial-bronze tabular-nums w-12 text-right">{sub.pct_gasto}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Resumen ───────────────────────────────────────────────────────────

function TabResumen({ categories }: { categories: CategoryStats[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const maxGasto = Math.max(...categories.map(c => c.gasto), 1);

  const toggle = useCallback((cat: string) => {
    setExpanded(prev => prev === cat ? null : cat);
  }, []);

  return (
    <div className="space-y-2">
      {categories.map(cat => (
        <div key={cat.categoria} className="rounded-xl border border-white/5 bg-imperial-surface/30 overflow-hidden">
          <button
            onClick={() => toggle(cat.categoria)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
          >
            <ChevronRight size={14} className={`text-imperial-bronze/40 transition-transform shrink-0 ${expanded === cat.categoria ? 'rotate-90' : ''}`} />

            {/* Nombre */}
            <span className="flex-1 text-[12px] font-black text-imperial-text-prime uppercase tracking-tight">
              {cat.categoria}
            </span>

            {/* Barra */}
            <div className="hidden md:block w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-imperial-bronze rounded-full"
                style={{ width: `${(cat.gasto / maxGasto) * 100}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] text-imperial-text-muted/40 uppercase tracking-widest">Movs</p>
                <p className="text-[11px] font-black text-imperial-text-prime tabular-nums">{cat.n_movimientos}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] text-imperial-text-muted/40 uppercase tracking-widest">%Movs</p>
                <p className="text-[11px] font-black text-imperial-text-muted/60 tabular-nums">{cat.pct_movimientos}%</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-imperial-text-muted/40 uppercase tracking-widest">Gasto</p>
                <p className="text-[11px] font-black text-error tabular-nums">{fmt(cat.gasto)}</p>
              </div>
              <div className="text-right w-14">
                <p className="text-[9px] text-imperial-text-muted/40 uppercase tracking-widest">%$</p>
                <p className="text-[11px] font-black text-imperial-bronze tabular-nums">{cat.pct_gasto}%</p>
              </div>
              <div className="text-right hidden md:block w-12">
                <p className="text-[9px] text-imperial-text-muted/40 uppercase tracking-widest">Reglas</p>
                <p className="text-[11px] font-black text-imperial-text-muted/50 tabular-nums">{cat.n_reglas}</p>
              </div>
              {/* Subcats badge */}
              {cat.subcategorias.length > 0 && (
                <div className="hidden md:flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-black text-imperial-bronze/40 bg-imperial-bronze/5 border border-imperial-bronze/10 px-1.5 py-0.5 rounded-full">
                    {cat.subcategorias.length} sub
                  </span>
                </div>
              )}
            </div>
          </button>

          {/* Drill-down: lazy-loaded per-subcategory stats */}
          {expanded === cat.categoria && (
            <SubcategoryDrilldown
              categoria={cat.categoria}
              hasSubcats={cat.subcategorias.length > 0}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab: Motor Cascada ─────────────────────────────────────────────────────

function TabMotor({
  rules,
  categories,
  onCreated,
  onUpdated,
  onDeleted,
  onRecategorize,
}: {
  rules: CascadaRule[];
  categories: CategoryStats[];
  onCreated: (r: CascadaRule) => void;
  onUpdated: (r: CascadaRule) => void;
  onDeleted: (id: number) => void;
  onRecategorize: () => void;
}) {
  const { showToast } = useToast();
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<CascadaRuleUpdate>({});
  const [newRule, setNewRule] = useState<CascadaRuleCreate>({ patron: '', categoria: '', subcategoria: '', peso: 0.85 });
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [recatLoading, setRecatLoading] = useState(false);

  const catNames = useMemo(() => [...new Set(categories.map(c => c.categoria))].sort(), [categories]);

  const filtered = useMemo(() =>
    rules.filter(r =>
      r.patron.toLowerCase().includes(search.toLowerCase()) ||
      r.categoria.toLowerCase().includes(search.toLowerCase())
    ), [rules, search]);

  const handleSaveEdit = async (id: number) => {
    try {
      // Sanitize: eliminar keys con null antes de enviar
      const payload: CascadaRuleUpdate = Object.fromEntries(
        Object.entries(editData).filter(([, v]) => v !== null)
      );
      const updated = await apiService.updateRule(id, payload);
      onUpdated(updated);
      setEditId(null);
      showToast('Regla actualizada', 'success');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteRule(id);
      onDeleted(id);
      showToast('Regla desactivada', 'success');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleCreate = async () => {
    if (!newRule.patron || !newRule.categoria) return showToast('Patrón y categoría son obligatorios', 'error');
    try {
      const created = await apiService.createRule(newRule);
      onCreated(created);
      setNewRule({ patron: '', categoria: '', subcategoria: '', peso: 0.85 });
      setShowNew(false);
      showToast('Regla creada', 'success');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleRecategorize = async () => {
    setRecatLoading(true);
    try {
      const res = await apiService.recategorizeAll();
      onRecategorize();
      showToast(`${res.recategorizados} movimientos recategorizados`, 'success');
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setRecatLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar patrón o categoría..."
          className="flex-1 bg-imperial-surface/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-imperial-text-prime placeholder:text-imperial-text-muted/20 outline-none focus:border-imperial-bronze/40 transition-colors"
        />
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 bg-imperial-bronze text-black text-[10px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest hover:bg-imperial-bronze/80 transition-colors"
        >
          <Plus size={14} /> Nueva Regla
        </button>
        <button
          onClick={handleRecategorize}
          disabled={recatLoading}
          className="flex items-center gap-2 bg-white/5 text-imperial-text-muted/60 text-[10px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest border border-white/10 hover:border-imperial-bronze/30 hover:text-imperial-text-prime transition-all disabled:opacity-40"
        >
          <RefreshCw size={14} className={recatLoading ? 'animate-spin' : ''} />
          Re-categorizar Todo
        </button>
      </div>

      {/* Formulario nueva regla */}
      {showNew && (
        <div className="p-4 rounded-xl border border-imperial-bronze/20 bg-imperial-bronze/5 space-y-3">
          <p className="text-[10px] font-black text-imperial-bronze uppercase tracking-widest">Nueva Regla</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input value={newRule.patron} onChange={e => setNewRule(p => ({ ...p, patron: e.target.value }))}
              placeholder="Patrón (ej: AFIP)" className="col-span-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-imperial-text-prime outline-none focus:border-imperial-bronze/50" />
            <select value={newRule.categoria} onChange={e => setNewRule(p => ({ ...p, categoria: e.target.value }))}
              className="col-span-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-imperial-text-prime outline-none focus:border-imperial-bronze/50">
              <option value="">Categoría...</option>
              {catNames.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__nueva__">+ Nueva categoría</option>
            </select>
            <input value={newRule.subcategoria ?? ''} onChange={e => setNewRule(p => ({ ...p, subcategoria: e.target.value }))}
              placeholder="Subcategoría (opcional)" className="col-span-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-imperial-text-prime outline-none focus:border-imperial-bronze/50" />
            <div className="flex gap-2">
              <input type="number" min={0.5} max={0.99} step={0.01} value={newRule.peso}
                onChange={e => setNewRule(p => ({ ...p, peso: parseFloat(e.target.value) }))}
                className="w-20 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-imperial-text-prime outline-none focus:border-imperial-bronze/50" />
              <button onClick={handleCreate} className="flex-1 bg-imperial-bronze text-black text-[10px] font-black rounded-lg px-3 py-2 uppercase tracking-widest hover:bg-imperial-bronze/80 transition-colors">
                Guardar
              </button>
            </div>
          </div>
          {newRule.categoria === '__nueva__' && (
            <input autoFocus onChange={e => setNewRule(p => ({ ...p, categoria: e.target.value }))}
              placeholder="Nombre de la nueva categoría"
              className="w-full bg-black/30 border border-imperial-bronze/30 rounded-lg px-3 py-2 text-sm text-imperial-text-prime outline-none" />
          )}
        </div>
      )}

      {/* Tabla de reglas */}
      <div className="rounded-xl border border-white/5 bg-imperial-surface/20 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {['Patrón', 'Categoría', 'Subcategoría', 'Peso', 'Usos', ''].map(h => (
                <th key={h} className="px-4 py-3 text-[9px] font-black text-imperial-bronze uppercase tracking-[0.3em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {filtered.filter(r => r.activo === 1).map(rule => (
              <tr key={rule.id} className="group hover:bg-white/[0.02] transition-colors">
                {editId === rule.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input value={editData.patron ?? rule.patron} onChange={e => setEditData(p => ({ ...p, patron: e.target.value }))}
                        className="w-full bg-black/30 border border-imperial-bronze/30 rounded px-2 py-1 text-xs text-imperial-text-prime outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <select value={editData.categoria ?? rule.categoria} onChange={e => setEditData(p => ({ ...p, categoria: e.target.value }))}
                        className="w-full bg-black/30 border border-imperial-bronze/30 rounded px-2 py-1 text-xs text-imperial-text-prime outline-none">
                        {catNames.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input value={editData.subcategoria ?? rule.subcategoria ?? ''} onChange={e => setEditData(p => ({ ...p, subcategoria: e.target.value }))}
                        className="w-full bg-black/30 border border-imperial-bronze/30 rounded px-2 py-1 text-xs text-imperial-text-prime outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" min={0.5} max={0.99} step={0.01} value={editData.peso ?? rule.peso}
                        onChange={e => setEditData(p => ({ ...p, peso: parseFloat(e.target.value) }))}
                        className="w-16 bg-black/30 border border-imperial-bronze/30 rounded px-2 py-1 text-xs text-imperial-text-prime outline-none" />
                    </td>
                    <td className="px-4 py-2 text-xs text-imperial-text-muted/40">{rule.veces_usada}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => handleSaveEdit(rule.id)} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><Check size={12} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg bg-white/5 text-imperial-text-muted/40 hover:bg-white/10 transition-colors"><X size={12} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-xs font-black text-imperial-text-prime font-mono">{rule.patron}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-black bg-imperial-bronze/10 text-imperial-bronze px-2 py-0.5 rounded-full border border-imperial-bronze/20 uppercase tracking-wider">
                        {rule.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-imperial-text-muted/40">{rule.subcategoria ?? '—'}</td>
                    <td className="px-4 py-3 text-[11px] font-black text-imperial-text-muted/60 tabular-nums">{rule.peso.toFixed(2)}</td>
                    <td className="px-4 py-3 text-[11px] text-imperial-text-muted/40 tabular-nums">{rule.veces_usada}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditId(rule.id); setEditData({}); }}
                          className="p-1.5 rounded-lg bg-white/5 text-imperial-text-muted/40 hover:bg-imperial-bronze/10 hover:text-imperial-bronze transition-colors"><Pencil size={12} /></button>
                        <button onClick={() => handleDelete(rule.id)}
                          className="p-1.5 rounded-lg bg-white/5 text-imperial-text-muted/40 hover:bg-error/10 hover:text-error transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-xs text-imperial-text-muted/30 italic">Sin reglas que coincidan</p>
        )}
      </div>
      <p className="text-[9px] text-imperial-text-muted/30 text-right">{filtered.filter(r => r.activo === 1).length} reglas activas</p>
    </div>
  );
}

// ── Tab: Sin Categorizar ───────────────────────────────────────────────────

function TabSinCategorizar({ categories }: { categories: CategoryStats[] }) {
  const { showToast } = useToast();
  const [movs, setMovs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<number, { categoria: string; subcategoria: string }>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const catNames = useMemo(() => [...new Set(categories.map(c => c.categoria))].sort(), [categories]);

  useEffect(() => {
    apiService.getMovements().then(data => {
      setMovs(data.filter(m => m.categoria === 'Sin categorizar'));
      setLoading(false);
    });
  }, []);

  const handleSave = async (id: number) => {
    const a = assignments[id];
    if (!a?.categoria) return showToast('Seleccioná una categoría', 'error');
    setSaving(id);
    try {
      await apiService.patchMovimientoCategoria(id, a.categoria, a.subcategoria);
      setMovs(prev => prev.filter(m => m.id !== id));
      showToast('Movimiento categorizado', 'success');
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSaving(null); }
  };

  if (loading) return <LoadingImperial message="Buscando sin categorizar..." />;

  if (movs.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
        <Check size={24} className="text-success" />
      </div>
      <p className="text-sm font-black text-imperial-text-prime uppercase tracking-widest">Todo categorizado</p>
      <p className="text-xs text-imperial-text-muted/40">No hay movimientos sin categoría</p>
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-imperial-text-muted/40 font-bold uppercase tracking-widest mb-4">
        {movs.length} movimiento{movs.length !== 1 ? 's' : ''} sin categorizar
      </p>
      {movs.map(m => (
        <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-white/5 bg-imperial-surface/30 hover:border-white/10 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-imperial-text-prime truncate">{m.descripcion}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-[10px] text-imperial-text-muted/40">{m.fecha}</span>
              <span className={`text-[11px] font-black tabular-nums ${m.monto < 0 ? 'text-error' : 'text-success'}`}>
                {m.monto < 0 ? '-' : '+'}{Math.abs(m.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <select
              value={assignments[m.id]?.categoria ?? ''}
              onChange={e => setAssignments(prev => ({ ...prev, [m.id]: { ...prev[m.id], categoria: e.target.value, subcategoria: '' } }))}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-imperial-text-prime outline-none focus:border-imperial-bronze/50 transition-colors"
            >
              <option value="">Categoría...</option>
              {catNames.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              value={assignments[m.id]?.subcategoria ?? ''}
              onChange={e => setAssignments(prev => ({ ...prev, [m.id]: { ...prev[m.id], subcategoria: e.target.value } }))}
              placeholder="Subcategoría"
              className="w-32 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-imperial-text-prime outline-none focus:border-imperial-bronze/50 transition-colors"
            />
            <button
              onClick={() => handleSave(m.id)}
              disabled={saving === m.id || !assignments[m.id]?.categoria}
              className="p-2 rounded-lg bg-imperial-bronze/10 text-imperial-bronze hover:bg-imperial-bronze/20 transition-colors disabled:opacity-30"
            >
              {saving === m.id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function CategoriasPage() {
  const [tab, setTab] = useState<Tab>('resumen');
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [rules, setRules] = useState<CascadaRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [cats, rls] = await Promise.all([apiService.getCategories(), apiService.getRules()]);
      setCategories(cats);
      setRules(rls);
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'resumen', label: 'Resumen', icon: <Tag size={13} />, count: categories.length },
    { id: 'motor', label: 'Motor Cascada', icon: <Cpu size={13} />, count: rules.filter(r => r.activo === 1).length },
    { id: 'sincategorizar', label: 'Sin Categorizar', icon: <AlertTriangle size={13} /> },
  ];

  if (loading) return <LoadingImperial message="Cargando sistema de categorías..." />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header className="flex flex-col gap-1 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-imperial-bronze">
          <Tag size={12} /> Sistema de Categorías
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-imperial-text-prime uppercase italic">
          Gestión de <span className="text-imperial-bronze not-italic">Categorías</span>
        </h1>
        <p className="text-xs text-imperial-text-muted/40 font-medium">
          Configurá el motor cascada, creá categorías y subcategorías sin tocar código.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-imperial-surface/40 rounded-2xl border border-white/5 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
              tab === t.id
                ? 'bg-imperial-bronze text-black shadow-[0_0_20px_rgba(192,152,145,0.3)]'
                : 'text-imperial-text-muted/40 hover:text-imperial-text-prime hover:bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/20' : 'bg-white/10'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <BaseCard className="bg-imperial-surface/20 border-white/5">
        {tab === 'resumen' && <TabResumen categories={categories} />}
        {tab === 'motor' && (
          <TabMotor
            rules={rules}
            categories={categories}
            onCreated={r => setRules(prev => [r, ...prev])}
            onUpdated={r => setRules(prev => prev.map(x => x.id === r.id ? r : x))}
            onDeleted={id => setRules(prev => prev.filter(x => x.id !== id))}
            onRecategorize={load}
          />
        )}
        {tab === 'sincategorizar' && <TabSinCategorizar categories={categories} />}
      </BaseCard>
    </div>
  );
}
