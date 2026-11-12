import React from 'react';
import { Printer, Share2, CloudUpload, Sparkles, Building, User, Phone } from 'lucide-react';
import { CurrencyCode, CalculationResult, CalculationMethod } from '../types';
import { CURRENCY_CONFIGS, formatNumber, aggregateYearlySchedule } from '../utils/calculator';

interface QuotationTabProps {
  currency: CurrencyCode;
  propertyPrice: number;
  downPercent: number;
  downAmount: number;
  principal: number;
  annualRate: number;
  termUnit: string;
  termValue: number;
  totalMonths: number;
  method: CalculationMethod;
  result: CalculationResult;
  customerName: string;
  setCustomerName: (name: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  agentPhone: string;
  setAgentPhone: (phone: string) => void;
  onCopyWhatsApp: () => void;
  onOpenSaveModal: () => void;
}

export const QuotationTab: React.FC<QuotationTabProps> = ({
  currency,
  propertyPrice,
  downPercent,
  downAmount,
  principal,
  annualRate,
  totalMonths,
  method,
  result,
  customerName,
  setCustomerName,
  projectName,
  setProjectName,
  agentPhone,
  setAgentPhone,
  onCopyWhatsApp,
  onOpenSaveModal
}) => {
  const cfg = CURRENCY_CONFIGS[currency];
  const sym = cfg.symbol;
  const yearsFloat = totalMonths / 12;
  const yearsLabel = Number.isInteger(yearsFloat) ? `${yearsFloat} ປີ` : `${yearsFloat.toFixed(1)} ປີ`;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const refNo = `KIDC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const yearlyRows = aggregateYearlySchedule(result.schedule);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Interactive Form Card (Hidden during print) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 inline-flex items-center space-x-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ໃບສະເໜີລາຄາ & ເອກະສານພິມ A4</span>
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              ຂໍ້ມູນສຳລັບອອກໃບສະເໜີລາຄາ (Quotation)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ປ້ອນຂໍ້ມູນລູກຄ້າ ແລະ ໂຄງການ ເພື່ອພິມເປັນເອກະສານ A4 ຫຼື ບັນທຶກ PDF
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onCopyWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center space-x-2 transition"
            >
              <Share2 className="w-4 h-4 text-amber-600" />
              <span>ຄັດລອກສົ່ງ WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onOpenSaveModal}
              className="px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center space-x-2 transition"
            >
              <CloudUpload className="w-4 h-4 text-blue-600" />
              <span>ບັນທຶກລົງ Firebase</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs sm:text-sm font-extrabold shadow-md flex items-center space-x-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>ພິມໃບສະເໜີລາຄາ / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>ຊື່ລູກຄ້າ (Customer Name)</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="ຕົວຢ່າງ: ທ່ານ ສົມພອນ ວົງໄຊ"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-amber-600" />
              <span>ຊື່ໂຄງການ / ລະຫັດຕອນດິນ (Project / Plot ID)</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="ຕົວຢ່າງ: ໂຄງການ KIDC ວຽງຈັນ - ຕອນ A12"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>ເບີໂທຕິດຕໍ່ພະນັກງານ (Sales Contact)</span>
            </label>
            <input
              type="text"
              value={agentPhone}
              onChange={(e) => setAgentPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-bold tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Official A4 Quotation Document Preview & Print Sheet */}
      <div className="print-only-sheet bg-white rounded-3xl shadow-md border border-slate-200 p-6 sm:p-10 max-w-4xl mx-auto">
        {/* Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-amber-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-amber-400 font-extrabold text-xl tracking-tight leading-none tabular-nums">
                KIDC
              </span>
              <span className="text-[8px] text-amber-300 tracking-widest uppercase mt-0.5 font-bold">
                ESTATE
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                ບໍລິສັດ ແກ້ວມົນຕີ ລົງທຶນ ພັດທະນາ ແລະ ກໍ່ສ້າງ ຈຳກັດຜູ້ດຽວ
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-800 tracking-wide">
                KIDC REAL ESTATE INVESTMENT DEVELOPMENT & CONSTRUCTION SOLE CO., LTD
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ • ໂທຕິດຕໍ່:{' '}
                <span className="font-bold text-slate-900 tabular-nums">{agentPhone}</span>
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 rounded-lg bg-slate-950 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
              ໃບສະເໜີລາຄາ & ແຜນຜ່ອນຊຳລະ
            </span>
            <p className="text-xs text-slate-500 mt-2 tabular-nums">ວັນທີ: {dateStr}</p>
            <p className="text-[11px] text-slate-400 tabular-nums">ເລກທີອ້າງອີງ: {refNo}</p>
          </div>
        </div>

        {/* Client & Property Info Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block text-xs">ຮຽນທ່ານ / ຊື່ລູກຄ້າ:</span>
            <span className="font-bold text-slate-900 text-sm sm:text-base mt-0.5 block">
              {customerName.trim() || 'ລູກຄ້າທົ່ວໄປ (Valued Client)'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">ໂຄງການ / ລະຫັດຕອນດິນ-ເຮືອນ:</span>
            <span className="font-bold text-slate-900 text-sm sm:text-base mt-0.5 block">
              {projectName.trim() || 'ໂຄງການອະສັງຫາລິມະຊັບ KIDC Real Estate'}
            </span>
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="bg-slate-900 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider flex justify-between">
            <span>ລາຍລະອຽດການຄິດໄລ່ສິນເຊື່ອ / ການຜ່ອນຊຳລະ</span>
            <span>ສະກຸນເງິນ: {cfg.label}</span>
          </div>
          <div className="divide-y divide-slate-200 text-xs sm:text-sm">
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-600">ມູນຄ່າຊັບສິນ / ລາຄາຂາຍລວມ</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatNumber(propertyPrice)} {sym}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3 bg-slate-50/60">
              <span className="text-slate-600">
                ເງິນຈ່າຍກ່ອນ / ເງິນດາວ (<span className="tabular-nums">{downPercent}%</span>)
              </span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatNumber(downAmount)} {sym}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-600">ຍອດຈັດສິນເຊື່ອ / ຍອດຄ້າງຜ່ອນຕົວຈິງ</span>
              <span className="font-extrabold text-slate-900 tabular-nums">
                {formatNumber(principal)} {sym}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3 bg-slate-50/60">
              <span className="text-slate-600">ໄລຍະເວລາຜ່ອນຊຳລະ</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {yearsLabel} ({totalMonths} ງວດ)
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-600">ອັດຕາດອກເບ້ຍ ແລະ ຮູບແບບ</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {annualRate}% ຕໍ່ປີ ({method === 'reducing' ? 'ຫຼຸດຕົ້ນຫຼຸດດອກ' : 'ດອກເບ້ຍຄົງທີ່'})
              </span>
            </div>
            <div className="flex justify-between px-5 py-4 bg-amber-50 border-t-2 border-amber-500">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                ຍອດຜ່ອນຊຳລະຕໍ່ເດືອນ (Monthly Payment)
              </span>
              <span className="font-extrabold text-amber-800 text-base sm:text-lg tabular-nums">
                {formatNumber(result.monthlyPayment)} {sym} / ເດືອນ
              </span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-slate-600">ດອກເບ້ຍລວມຕະຫຼອດສັນຍາ</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatNumber(result.totalInterest)} {sym}
              </span>
            </div>
            <div className="flex justify-between px-5 py-3 bg-slate-50/60">
              <span className="font-bold text-slate-800">
                ຍອດຊຳລະລວມທັງໝົດ (ເງິນຕົ້ນ + ດອກເບ້ຍ)
              </span>
              <span className="font-extrabold text-slate-900 tabular-nums">
                {formatNumber(result.totalPayment)} {sym}
              </span>
            </div>
          </div>
        </div>

        {/* Yearly Summary Snapshot inside Quotation */}
        <div className="mb-8">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2.5">
            ຕາຕະລາງສະຫຼຸບຍອດຜ່ອນຊຳລະລາຍປີ (Yearly Amortization Summary)
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">ປີທີ</th>
                  <th className="py-2 px-3 text-right">ຍອດຜ່ອນລາຍປີ</th>
                  <th className="py-2 px-3 text-right">ຕັດເງິນຕົ້ນ</th>
                  <th className="py-2 px-3 text-right">ດອກເບ້ຍ</th>
                  <th className="py-2 px-3 text-right">ຍອດຄົງເຫຼືອ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {yearlyRows.map((r) => (
                  <tr key={r.year}>
                    <td className="py-2 px-3 font-bold text-slate-900">ປີທີ {r.year}</td>
                    <td className="py-2 px-3 text-right">
                      {formatNumber(r.payment)} {sym}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {formatNumber(r.principal)} {sym}
                    </td>
                    <td className="py-2 px-3 text-right text-amber-800">
                      {formatNumber(r.interest)} {sym}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      {formatNumber(r.balance)} {sym}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Signature Blocks */}
        <div className="text-[11px] text-slate-500 mb-8 space-y-1">
          <p className="font-bold text-slate-700">ໝາຍເຫດ:</p>
          <p>
            1. ໃບສະເໜີລາຄາສະບັບນີ້ເປັນການຄິດໄລ່ປະມານການເບື້ອງຕົ້ນ
            ເງື່ອນໄຂຕົວຈິງອາດປ່ຽນແປງຕາມນະໂຍບາຍຂອງບໍລິສັດ ຫຼື ທະນາຄານຜູ້ໃຫ້ສິນເຊື່ອ.
          </p>
          <p>
            2. ສອບຖາມຂໍ້ມູນເພີ່ມເຕີມ ແລະ ນັດໝາຍເຂົ້າຊົມໂຄງການຕົວຈິງໄດ້ທີ່ ບໍລິສັດ ແກ້ວມົນຕີ ລົງທຶນ
            ພັດທະນາ ແລະ ກໍ່ສ້າງ ຈຳກັດຜູ້ດຽວ (KIDC Real Estate).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs">
          <div>
            <div className="h-14 border-b border-slate-400 w-4/5 mx-auto mb-2" />
            <p className="font-bold text-slate-900">ລາຍເຊັນລູກຄ້າ (Customer Signature)</p>
            <p className="text-slate-500 mt-1">ວັນທີ: ....... / ....... / ............</p>
          </div>
          <div>
            <div className="h-14 border-b border-slate-400 w-4/5 mx-auto mb-2" />
            <p className="font-bold text-slate-900">ທີ່ປຶກສາການຂາຍ KIDC Real Estate</p>
            <p className="text-slate-500 mt-1">
              ໂທ: <span className="tabular-nums font-bold">{agentPhone}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
