import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { Machine } from '../types';

interface DeleteMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine | null;
  onConfirmDelete: (machineId: string, reason: string) => void;
}

export const DeleteMachineModal: React.FC<DeleteMachineModalProps> = ({
  isOpen,
  onClose,
  machine,
  onConfirmDelete,
}) => {
  const [reason, setReason] = useState<string>('Baja por fin de ciclo operativo');
  const [customReason, setCustomReason] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen || !machine) return null;

  const presetReasons = [
    'Baja por fin de ciclo operativo / Obsolescencia',
    'Venta de activo o traslado de planta',
    'Daño irreparable o costo excesivo de reparación',
    'Reemplazo por equipo nuevo',
    'Error de registro / Duplicada',
    'Otro motivo (especificar)',
  ];

  const handleConfirm = () => {
    setIsDeleting(true);
    const finalReason = reason === 'Otro motivo (especificar)' ? customReason.trim() || 'Sin motivo detallado' : reason;
    onConfirmDelete(machine.id, finalReason);
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-tight">
                Dar de Baja / Borrar Máquina
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Confirmación de eliminación segura
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-rose-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Machine Summary Card */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex items-center gap-3.5">
            {machine.imageUrl ? (
              <img
                src={machine.imageUrl}
                alt={machine.name}
                className="w-14 h-14 rounded-xl object-cover border border-rose-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-rose-200/60 flex items-center justify-center text-rose-800 font-black text-xs shrink-0">
                {machine.code}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-rose-800 bg-rose-200/70 px-2 py-0.5 rounded text-xs">
                  {machine.code}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {machine.category}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                {machine.name}
              </h4>
              <p className="text-[11px] text-slate-500">
                {machine.brand} {machine.model} • {machine.location}
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Registro Permanente en Histórico:</strong>
              Al eliminar esta máquina, se removerá del inventario activo y se guardará automáticamente un registro inalterable en el <strong>Histórico de Auditoría</strong> con la fecha, usuario y motivo.
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Motivo de la baja / eliminación:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {presetReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === 'Otro motivo (especificar)' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Detalle del motivo:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Escribe el motivo detallado de la eliminación..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirmar y Borrar Máquina</span>
          </button>
        </div>
      </div>
    </div>
  );
};
