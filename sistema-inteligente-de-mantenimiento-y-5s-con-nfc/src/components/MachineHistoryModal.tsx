import React, { useState } from 'react';
import {
  History,
  X,
  Search,
  Filter,
  PlusCircle,
  Trash2,
  Download,
  AlertTriangle,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { MachineHistoryRecord } from '../types';
import { exportToExcel, exportToCsv } from '../utils/spreadsheetExport';

interface MachineHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MachineHistoryRecord[];
  onClearHistory: () => void;
}

export const MachineHistoryModal: React.FC<MachineHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  const [filterAction, setFilterAction] = useState<'ALL' | 'CREADA' | 'ELIMINADA'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState('');

  if (!isOpen) return null;

  // Filtered records
  const filteredHistory = history.filter((record) => {
    const matchesAction = filterAction === 'ALL' || record.action === filterAction;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      record.machineCode.toLowerCase().includes(q) ||
      record.machineName.toLowerCase().includes(q) ||
      record.user.toLowerCase().includes(q) ||
      (record.details && record.details.toLowerCase().includes(q)) ||
      (record.category && record.category.toLowerCase().includes(q));

    return matchesAction && matchesSearch;
  });

  const createdCount = history.filter((r) => r.action === 'CREADA').length;
  const deletedCount = history.filter((r) => r.action === 'ELIMINADA').length;

  // Export to native Microsoft Excel (.xlsx)
  const handleExportExcel = () => {
    if (history.length === 0) return;
    const headers = ['ID', 'Fecha y Hora', 'Acción', 'Código Máquina', 'Nombre Máquina', 'Categoría', 'Ubicación', 'Usuario Responsable', 'Detalles'];
    const rows = history.map((r) => [
      r.id,
      r.formattedDate || r.timestamp,
      r.action,
      r.machineCode,
      r.machineName || '',
      r.category || '',
      r.location || '',
      r.user || '',
      r.details || '',
    ]);
    exportToExcel(headers, rows, `tagops_historico_maquinas_${new Date().toISOString().split('T')[0]}.xlsx`, 'Histórico');
  };

  // Export to clean UTF-8 CSV with BOM and delimiter
  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['ID', 'Fecha y Hora', 'Acción', 'Código Máquina', 'Nombre Máquina', 'Categoría', 'Ubicación', 'Usuario Responsable', 'Detalles'];
    const rows = history.map((r) => [
      r.id,
      r.formattedDate || r.timestamp,
      r.action,
      r.machineCode,
      r.machineName || '',
      r.category || '',
      r.location || '',
      r.user || '',
      r.details || '',
    ]);
    exportToCsv(headers, rows, `tagops_historico_maquinas_${new Date().toISOString().split('T')[0]}.csv`, ';');
  };

  const handleExecuteClear = () => {
    if (confirmInputText.trim().toUpperCase() === 'CONFIRMAR') {
      onClearHistory();
      setShowConfirmClear(false);
      setConfirmInputText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Histórico de Auditoría de Máquinas
                </h3>
                <span className="bg-indigo-500/30 text-indigo-200 text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  {history.length} eventos
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Registro inalterable de altas, bajas y modificaciones de equipos en planta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={history.length === 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-xs"
              title="Descargar historial en formato nativo de Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={history.length === 0}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              title="Descargar historial en CSV compatible"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterAction('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterAction === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/60 text-slate-800">
                {history.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterAction('CREADA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterAction === 'CREADA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Altas / Creadas</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {createdCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterAction('ELIMINADA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterAction === 'ELIMINADA'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Bajas / Borradas</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold">
                {deletedCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, nombre o usuario..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Records Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <History className="w-7 h-7 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">
                No hay registros en este filtro
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Los eventos de creación y eliminación de máquinas se registrarán automáticamente aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((record) => {
                const isCreated = record.action === 'CREADA';
                const isDeleted = record.action === 'ELIMINADA';

                return (
                  <div
                    key={record.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCreated
                        ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                        : isDeleted
                        ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        {isCreated ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300/80 flex items-center gap-1.5">
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                            MÁQUINA CREADA
                          </span>
                        ) : isDeleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300/80 flex items-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            MÁQUINA ELIMINADA
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300/80">
                            MODIFICADA
                          </span>
                        )}

                        <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                          {record.machineCode}
                        </span>

                        <span className="font-bold text-slate-800 text-xs truncate max-w-[200px] sm:max-w-[320px]">
                          {record.machineName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium shrink-0">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{record.formattedDate || new Date(record.timestamp).toLocaleString('es-ES')}</span>
                      </div>
                    </div>

                    {/* Details and Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong>Por:</strong> {record.user || 'Sistema'}
                        </span>
                      </div>

                      {(record.location || record.stationId) && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {record.location || record.stationId}
                          </span>
                        </div>
                      )}

                      {record.category && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate uppercase font-semibold text-[11px]">
                            {record.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {record.details && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl">
                        <span className="font-bold text-slate-700">Detalles: </span>
                        {record.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Protected Reset */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            🔒 El histórico está protegido contra borrado accidental y se sincroniza con el servidor central.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              disabled={history.length === 0}
              className="px-3 py-2 text-rose-700 hover:bg-rose-100/70 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
            >
              Borrar Historial...
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Sub-Modal to Clear History */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">
                  Confirmar Eliminación del Historial
                </h4>
                <p className="text-xs text-slate-500">
                  Esta acción es irreversible
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para garantizar que el historial no se borre accidentalmente, escribe la palabra <strong className="text-rose-600 font-mono font-black">CONFIRMAR</strong> a continuación:
            </p>

            <input
              type="text"
              value={confirmInputText}
              onChange={(e) => setConfirmInputText(e.target.value)}
              placeholder="Escribe CONFIRMAR aquí"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmClear(false);
                  setConfirmInputText('');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteClear}
                disabled={confirmInputText.trim().toUpperCase() !== 'CONFIRMAR'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-sm disabled:opacity-40 cursor-pointer"
              >
                Sí, Borrar Historial Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
