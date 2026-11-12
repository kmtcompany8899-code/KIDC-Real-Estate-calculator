import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const bgStyle =
    toast.type === 'error'
      ? 'bg-rose-950 text-white border-rose-500/50'
      : toast.type === 'info'
      ? 'bg-navy-950 text-white border-blue-500/50'
      : 'bg-navy-950 text-white border-gold-500/50';

  const icon =
    toast.type === 'error' ? (
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
    ) : toast.type === 'info' ? (
      <Info className="w-5 h-5 text-blue-400 shrink-0" />
    ) : (
      <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
    );

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 px-4 py-3.5 rounded-2xl shadow-2xl border flex items-center space-x-3 transition-all transform duration-300 animate-in fade-in slide-in-from-top-4 no-print ${bgStyle}`}
    >
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-sm font-medium leading-snug flex-1">{toast.text}</span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg transition"
        aria-label="ປິດ"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
