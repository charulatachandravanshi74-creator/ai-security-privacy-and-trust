import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Download, FileJson, FileSpreadsheet, X, CheckCircle, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(false);

    try {
      await api.audits.downloadExport(format);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-cyan-400" />
            <h3 className="font-bold text-white text-base">Export Audit Trails & Scans</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <p className="text-xs text-slate-400">
            Select the desired export schema format. Export contains all recorded security scan findings, PII incidents, and compliance assessments.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`p-4 rounded-xl border text-left transition-all ${
                format === 'json'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileJson size={24} className="mb-2 text-cyan-400" />
              <div className="font-bold text-sm text-white">JSON Archive</div>
              <div className="text-[11px] text-slate-400 mt-1">Full nested schema with remediation and control findings.</div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-xl border text-left transition-all ${
                format === 'csv'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileSpreadsheet size={24} className="mb-2 text-emerald-400" />
              <div className="font-bold text-sm text-white">CSV Spreadsheet</div>
              <div className="text-[11px] text-slate-400 mt-1">Tabular format for Excel, Google Sheets, and SIEM ingests.</div>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle size={15} />
              <span>Download initiated successfully!</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>Export {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
