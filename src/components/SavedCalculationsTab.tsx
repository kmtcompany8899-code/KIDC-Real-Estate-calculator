import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  BookmarkCheck, 
  Trash2, 
  ArrowUpRight, 
  Search, 
  Share2, 
  FileText, 
  Sparkles, 
  Cloud, 
  Clock, 
  Building2, 
  User as UserIcon,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { SavedCalculation, QuoteStatus } from '../types';
import { CURRENCY_CONFIGS, formatNumber } from '../utils/calculator';

interface SavedTabProps {
  user: User | null;
  savedList: SavedCalculation[];
  onSignIn: () => void;
  onLoadCalculation: (calc: SavedCalculation) => void;
  onDeleteCalculation: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: QuoteStatus) => Promise<void>;
  onCopyWhatsAppSingle: (calc: SavedCalculation) => void;
  onSwitchToQuotationWithItem: (calc: SavedCalculation) => void;
}

export const SavedCalculationsTab: React.FC<SavedTabProps> = ({
  user,
  savedList,
  onSignIn,
  onLoadCalculation,
  onDeleteCalculation,
  onUpdateStatus,
  onCopyWhatsAppSingle,
  onSwitchToQuotationWithItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-8 sm:p-12 text-center max-w-xl mx-auto my-6 space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <BookmarkCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            ເຂົ້າສູ່ລະບົບດ້ວຍ Gmail ເພື່ອບັນທຶກ ແລະ ເອີ້ນເບິ່ງຂໍ້ມູນ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            ລະບົບຈະບັນທຶກປະຫວັດການຄິດໄລ່, ໃບສະເໜີລາຄາລູກຄ້າ ແລະ ຂໍ້ມູນຕອນດິນ-ເຮືອນໄວ້ໃນ Firebase Firestore ຂອງໂຄງການ{' '}
            <strong className="text-slate-900">KIDC Real Estate Calculator</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-xl transition active:scale-95 text-sm"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
    );
  }

  // Filter items
  const filteredItems = savedList.filter((item) => {
    const matchSearch =
      (item.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.agentPhone || '').includes(searchTerm);
    const matchStatus = statusFilter === 'all' || (item.status || 'draft') === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status?: QuoteStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'ສຳເລັດສັນຍາ', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'approved':
        return { label: 'ອະນຸມັດແລ້ວ', style: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'negotiation':
        return { label: 'ກຳລັງເຈລະຈາ', style: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'presented':
        return { label: 'ສົ່ງລູກຄ້າແລ້ວ', style: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'ຮ່າງ (Draft)', style: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 inline-flex items-center space-x-1.5">
                <Cloud className="w-3.5 h-3.5 text-amber-600" />
                <span>Firebase Firestore Cloud</span>
              </span>
              <span className="text-xs font-bold text-slate-500">
                ໂຄງການ: KIDC Real Estate Calculator
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              ລາຍການໃບສະເໜີລາຄາ ແລະ ຄ່າຜ່ອນທີ່ບັນທຶກໄວ້ ({savedList.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ບັນທຶກໃນບັນຊີ: <strong className="text-slate-800">{user.email}</strong> • Sync ແບບ Real-time
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ຄົ້ນຫາຊື່ລູກຄ້າ, ໂຄງການ, ເບີ..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-4">
          {[
            { id: 'all', label: `ທັງໝົດ (${savedList.length})` },
            { id: 'draft', label: 'ຮ່າງ (Draft)' },
            { id: 'presented', label: 'ສົ່ງລູກຄ້າແລ້ວ' },
            { id: 'negotiation', label: 'ກຳລັງເຈລະຈາ' },
            { id: 'approved', label: 'ອະນຸມັດ' },
            { id: 'completed', label: 'ສຳເລັດສັນຍາ' }
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === chip.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">ບໍ່ພົບລາຍການບັນທຶກ</h3>
          <p className="text-xs text-slate-500">
            {searchTerm || statusFilter !== 'all'
              ? 'ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ຕົວກອງສະຖານະ'
              : 'ທ່ານຍັງບໍ່ທັນໄດ້ບັນທຶກລາຍການໃດໆ. ກົດ "ບັນທຶກລົງ Firebase" ໃນໜ້າຄິດໄລ່ເພື່ອເລີ່ມຕົ້ນ.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const sym = CURRENCY_CONFIGS[item.currency]?.symbol || '₭';
            const badge = getStatusBadge(item.status);
            const dateDisplay = item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString('en-GB')
              : item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-GB')
              : '';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 flex flex-col justify-between hover:shadow-md transition space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Row: Customer & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                        <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold truncate">ລູກຄ້າ:</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 truncate mt-0.5">
                        {item.customerName || 'ລູກຄ້າທົ່ວໄປ'}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Project & Contact */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold truncate">
                        {item.projectName || 'ໂຄງການ KIDC'}
                      </span>
                    </div>
                    {item.agentPhone && (
                      <div className="flex items-center space-x-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="tabular-nums">{item.agentPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Highlights */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
                      <span className="text-[11px] text-amber-900 block font-semibold">
                        ຜ່ອນຕໍ່ເດືອນ:
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-amber-900 tabular-nums">
                        {formatNumber(item.monthlyPayment)} {sym}
                      </span>
                    </div>

                    <div className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-600 block font-semibold">
                        ມູນຄ່າຊັບສິນ:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                        {formatNumber(item.propertyPrice)} {sym}
                      </span>
                    </div>
                  </div>

                  {/* Param chips */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                      ດາວ {item.downPercent}%
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                      {item.annualRate}% ດອກເບ້ຍ
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                      {item.totalMonths} ງວດ
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                      {item.method === 'reducing' ? 'ຫຼຸດຕົ້ນຫຼຸດດອກ' : 'ຄົງທີ່'}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 bg-amber-50/40 p-2 rounded-lg italic line-clamp-2">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{dateDisplay}</span>
                    </span>

                    {/* Quick status selector */}
                    <select
                      value={item.status || 'draft'}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as QuoteStatus)}
                      className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                    >
                      <option value="draft">ຮ່າງ (Draft)</option>
                      <option value="presented">ສົ່ງລູກຄ້າແລ້ວ</option>
                      <option value="negotiation">ກຳລັງເຈລະຈາ</option>
                      <option value="approved">ອະນຸມັດ</option>
                      <option value="completed">ສຳເລັດສັນຍາ</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onLoadCalculation(item)}
                      className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold flex items-center justify-center space-x-1 transition"
                      title="ໂຫຼດໃສ່ເຄື່ອງຄິດໄລ່"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>ໂຫຼດຄິດໄລ່</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSwitchToQuotationWithItem(item)}
                      className="py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold flex items-center justify-center space-x-1 transition"
                      title="ເບິ່ງໃບສະເໜີລາຄາ"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>ໃບສະເໜີ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCopyWhatsAppSingle(item)}
                      className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center space-x-1 transition"
                      title="ຄັດລອກສົ່ງ WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`ທ່ານຕ້ອງການລຶບໃບສະເໜີລາຄາຂອງ "${item.customerName}" ແທ້ບໍ່?`)) {
                          onDeleteCalculation(item.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 text-[11px] font-medium flex items-center space-x-1 transition px-2 py-1 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ລຶບລາຍການ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
