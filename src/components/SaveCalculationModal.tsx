import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { X, CloudUpload, Sparkles, Building2, UserCircle, Phone, FileText } from 'lucide-react';
import { CurrencyCode, CalculationMethod, DownPaymentMode, TermUnit, QuoteStatus } from '../types';
import { formatNumber } from '../utils/calculator';
import confetti from 'canvas-confetti';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => void;
  currency: CurrencyCode;
  symbol: string;
  propertyPrice: number;
  downMode: DownPaymentMode;
  downPercent: number;
  downAmount: number;
  principal: number;
  annualRate: number;
  termUnit: TermUnit;
  termValue: number;
  totalMonths: number;
  method: CalculationMethod;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  initialCustomerName?: string;
  initialProjectName?: string;
  initialAgentPhone?: string;
  onSaveSuccess: (id: string) => void;
  saveFn: (data: any) => Promise<string>;
}

export const SaveCalculationModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignIn,
  currency,
  symbol,
  propertyPrice,
  downMode,
  downPercent,
  downAmount,
  principal,
  annualRate,
  termUnit,
  termValue,
  totalMonths,
  method,
  monthlyPayment,
  totalInterest,
  totalPayment,
  initialCustomerName = '',
  initialProjectName = '',
  initialAgentPhone = '020 9966 3414',
  onSaveSuccess,
  saveFn
}) => {
  const [customerName, setCustomerName] = useState(initialCustomerName || 'ທ່ານ ສົມພອນ ວົງໄຊ');
  const [projectName, setProjectName] = useState(initialProjectName || 'ໂຄງການ KIDC ວຽງຈັນ (ຕອນ A12)');
  const [agentPhone, setAgentPhone] = useState(initialAgentPhone || '020 9966 3414');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('draft');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('ກະລຸນາປ້ອນຊື່ລູກຄ້າ');
      return;
    }
    if (!projectName.trim()) {
      setErrorMsg('ກະລຸນາປ້ອນຊື່ໂຄງການ');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const id = await saveFn({
        customerName: customerName.trim(),
        projectName: projectName.trim(),
        agentPhone: agentPhone.trim(),
        currency,
        propertyPrice,
        downMode,
        downPercent,
        downAmount,
        principal,
        annualRate,
        termUnit,
        termValue,
        totalMonths,
        method,
        monthlyPayment,
        totalInterest,
        totalPayment,
        status,
        notes: notes.trim()
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      onSaveSuccess(id);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">ບັນທຶກລົງ Firebase Cloud</h3>
              <p className="text-xs text-slate-300">ໂຄງການ: KIDC Real Estate Calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Guard Banner if not signed in */}
        {!user ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍ Gmail ກ່ອນບັນທຶກ
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ຂໍ້ມູນການຄິດໄລ່ ແລະ ໃບສະເໜີລາຄາຈະຖືກບັນທຶກລົງໃນ Firebase Firestore ຂອງບັນຊີຂອງທ່ານຢ່າງປອດໄພ
            </p>
            <button
              type="button"
              onClick={() => {
                onSignIn();
              }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold px-5 py-3 rounded-2xl shadow-lg transition"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>ເຂົ້າສູ່ລະບົບດ້ວຍ Gmail ທັນທີ</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
            {/* Summary preview chip */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">ຍອດຜ່ອນຕໍ່ເດືອນ:</span>
                <span className="font-extrabold text-slate-900 text-base tabular-nums">
                  {formatNumber(monthlyPayment)} {symbol}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">ມູນຄ່າຊັບສິນ:</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {formatNumber(propertyPrice)} {symbol} ({totalMonths} ງວດ)
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <UserCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>ຊື່ລູກຄ້າ *</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ຕົວຢ່າງ: ທ່ານ ສົມພອນ ວົງໄຊ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-medium"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>ຊື່ໂຄງການ / ລະຫັດຕອນດິນ *</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ຕົວຢ່າງ: ໂຄງການ KIDC ວຽງຈັນ (ຕອນ A12)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sales Agent Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>ເບີໂທພະນັກງານ</span>
                </label>
                <input
                  type="text"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-bold tabular-nums"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ສະຖານະໃບສະເໜີລາຄາ
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-semibold bg-white"
                >
                  <option value="draft">ຮ່າງ (Draft)</option>
                  <option value="presented">ສົ່ງລູກຄ້າແລ້ວ (Presented)</option>
                  <option value="negotiation">ກຳລັງເຈລະຈາ (Negotiation)</option>
                  <option value="approved">ອະນຸມັດ (Approved)</option>
                  <option value="completed">ສຳເລັດສັນຍາ (Completed)</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>ບັນທຶກເພີ່ມເຕີມ / ໝາຍເຫດ</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ຕົວຢ່າງ: ລູກຄ້ານັດໝາຍເບິ່ງສະຖານທີ່ຈິງວັນເສົາ..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>ກຳລັງບັນທຶກ...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>ຢືນຢັນບັນທຶກລົງ Firebase</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
