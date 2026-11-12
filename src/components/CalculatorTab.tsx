import React, { useState } from 'react';
import { 
  RotateCcw, 
  Share2, 
  FileText, 
  Download, 
  CloudUpload, 
  PieChart as PieChartIcon, 
  Info,
  Check
} from 'lucide-react';
import { 
  CurrencyCode, 
  CalculationMethod, 
  DownPaymentMode, 
  TermUnit, 
  ScheduleViewMode, 
  CalculationResult 
} from '../types';
import { 
  CURRENCY_CONFIGS, 
  formatNumber, 
  parseNumber, 
  aggregateYearlySchedule, 
  exportScheduleCSV 
} from '../utils/calculator';

interface CalculatorTabProps {
  currency: CurrencyCode;
  propertyPrice: number;
  setPropertyPrice: (val: number) => void;
  downMode: DownPaymentMode;
  setDownMode: (mode: DownPaymentMode) => void;
  downPercent: number;
  setDownPercent: (pct: number) => void;
  downAmount: number;
  setDownAmount: (amt: number) => void;
  annualRate: number;
  setAnnualRate: (rate: number) => void;
  termUnit: TermUnit;
  setTermUnit: (unit: TermUnit) => void;
  termValue: number;
  setTermValue: (val: number) => void;
  method: CalculationMethod;
  setMethod: (method: CalculationMethod) => void;
  result: CalculationResult;
  onReset: () => void;
  onCopyWhatsApp: () => void;
  onOpenSaveModal: () => void;
  onSwitchToQuotation: () => void;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  currency,
  propertyPrice,
  setPropertyPrice,
  downMode,
  setDownMode,
  downPercent,
  setDownPercent,
  downAmount,
  setDownAmount,
  annualRate,
  setAnnualRate,
  termUnit,
  setTermUnit,
  termValue,
  setTermValue,
  method,
  setMethod,
  result,
  onReset,
  onCopyWhatsApp,
  onOpenSaveModal,
  onSwitchToQuotation
}) => {
  const cfg = CURRENCY_CONFIGS[currency];
  const sym = cfg.symbol;
  const [scheduleView, setScheduleView] = useState<ScheduleViewMode>('yearly');
  const [hoveredSegment, setHoveredSegment] = useState<'principal' | 'interest' | null>(null);

  const totalMonths = termUnit === 'years' ? Math.max(1, termValue * 12) : Math.max(1, termValue);
  const yearsFloat = totalMonths / 12;
  const yearsLabel = Number.isInteger(yearsFloat) ? `${yearsFloat} ປີ` : `${yearsFloat.toFixed(1)} ປີ`;

  // Donut chart calculations
  const total = result.principal + result.totalInterest;
  const circumference = 2 * Math.PI * 46; // ~289.03
  const principalRatio = total > 0 ? result.principal / total : 1;
  const interestRatio = total > 0 ? result.totalInterest / total : 0;
  const principalPct = (principalRatio * 100).toFixed(1);
  const interestPct = (interestRatio * 100).toFixed(1);
  const principalArc = principalRatio * circumference;

  // Handlers
  const handlePriceChange = (val: number) => {
    const p = Math.max(0, val);
    setPropertyPrice(p);
    if (downMode === 'percent') {
      setDownAmount(Math.round((p * downPercent) / 100));
    } else {
      const clamped = Math.min(downAmount, p);
      setDownAmount(clamped);
      setDownPercent(p > 0 ? Number(((clamped / p) * 100).toFixed(2)) : 0);
    }
  };

  const handleDownPercentChange = (pct: number) => {
    const clamped = Math.max(0, Math.min(95, pct));
    setDownPercent(clamped);
    setDownAmount(Math.round((propertyPrice * clamped) / 100));
  };

  const handleDownAmountChange = (amt: number) => {
    const clamped = Math.max(0, Math.min(propertyPrice, amt));
    setDownAmount(clamped);
    setDownPercent(propertyPrice > 0 ? Number(((clamped / propertyPrice) * 100).toFixed(2)) : 0);
  };

  const yearlyRows = aggregateYearlySchedule(result.schedule);

  return (
    <div className="space-y-8">
      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Interactive Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">ປ້ອນຂໍ້ມູນການຄິດໄລ່</h2>
              <p className="text-xs text-slate-500 mt-0.5">ປັບປ່ຽນຕົວເລກ ຫຼື ເລື່ອນແຖບເພື່ອເບິ່ງຄ່າງວດທັນທີ</p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ຄ່າເລີ່ມຕົ້ນ</span>
            </button>
          </div>

          {/* 1. Property Price */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="input-price" className="text-sm font-bold text-slate-900">
                1. ມູນຄ່າຊັບສິນ / ລາຄາທີ່ດິນ-ເຮືອນ
              </label>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                {cfg.label}
              </span>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg font-extrabold text-amber-600 pointer-events-none tabular-nums">
                {sym}
              </span>
              <input
                id="input-price"
                type="text"
                inputMode="numeric"
                value={formatNumber(propertyPrice)}
                onChange={(e) => handlePriceChange(parseNumber(e.target.value))}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums transition bg-slate-50/50 focus:bg-white"
              />
            </div>

            <input
              type="range"
              min={cfg.minPrice}
              max={cfg.maxPrice}
              step={cfg.stepPrice}
              value={Math.min(cfg.maxPrice, propertyPrice)}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
            />

            {/* Price Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {cfg.presets.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePriceChange(item.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition tabular-nums border ${
                    propertyPrice === item.value
                      ? 'bg-amber-50 text-amber-900 border-amber-500'
                      : 'bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Down Payment */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-900">
                2. ເງິນຈ່າຍກ່ອນ / ເງິນດາວ
              </label>

              {/* Mode Switcher */}
              <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDownMode('percent')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    downMode === 'percent'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ເປີເຊັນ (%)
                </button>
                <button
                  type="button"
                  onClick={() => setDownMode('amount')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    downMode === 'amount'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ຈຳນວນເງິນ ({sym})
                </button>
              </div>
            </div>

            {/* Inputs & Live Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {downMode === 'percent' ? (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="95"
                    step="1"
                    value={downPercent}
                    onChange={(e) => handleDownPercentChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-lg font-extrabold text-slate-900 tabular-nums bg-white"
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-bold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-base font-bold text-amber-600 pointer-events-none">
                    {sym}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(downAmount)}
                    onChange={(e) => handleDownAmountChange(parseNumber(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-lg font-extrabold text-slate-900 tabular-nums bg-white"
                  />
                </div>
              )}

              {/* Calculated Readout Pill */}
              <div className="bg-white rounded-xl px-3.5 py-2.5 border border-slate-200 flex flex-col justify-center">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    ເງິນດາວ (<span className="font-bold text-amber-700 tabular-nums">{downPercent}%</span>):
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatNumber(downAmount)} {sym}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1 pt-1 border-t border-slate-100">
                  <span className="text-slate-500">ຍອດຄ້າງຜ່ອນ:</span>
                  <span className="font-extrabold text-blue-950 tabular-nums">
                    {formatNumber(result.principal)} {sym}
                  </span>
                </div>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={downPercent}
              onChange={(e) => handleDownPercentChange(Number(e.target.value))}
            />

            {/* Quick Down Payment % Chips */}
            <div className="flex flex-wrap gap-2">
              {[0, 10, 20, 30, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleDownPercentChange(pct)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition tabular-nums ${
                    downPercent === pct
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 hover:border-amber-500 text-slate-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interest Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="input-rate" className="text-sm font-bold text-slate-900">
                3. ອັດຕາດອກເບ້ຍຕໍ່ປີ (%)
              </label>
              <span className="text-xs font-semibold text-slate-500">
                {annualRate === 0 ? '0% = ບໍ່ມີດອກເບ້ຍ' : `ດອກເບ້ຍ ${annualRate}% ຕໍ່ປີ`}
              </span>
            </div>

            <div className="relative">
              <input
                id="input-rate"
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                className="w-full pl-4 pr-16 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-lg font-extrabold text-slate-900 tabular-nums bg-slate-50/50 focus:bg-white"
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                % / ປີ
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
            />

            {/* Quick Interest Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAnnualRate(0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  annualRate === 0
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
              >
                0% ຜ່ອນກັບໂຄງການ
              </button>
              {[6.5, 8.5, 10, 12].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAnnualRate(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition tabular-nums border ${
                    annualRate === r
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* 4. Loan Term */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="input-term" className="text-sm font-bold text-slate-900">
                4. ໄລຍະເວລາຜ່ອນຊຳລະ
              </label>

              {/* Unit Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (termUnit !== 'years') {
                      setTermUnit('years');
                      setTermValue(Math.max(1, Math.min(25, Math.round(termValue / 12))));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    termUnit === 'years'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ປີ (Years)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (termUnit !== 'months') {
                      setTermUnit('months');
                      setTermValue(Math.max(6, Math.min(300, termValue * 12)));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    termUnit === 'months'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ເດືອນ (Months)
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                id="input-term"
                type="number"
                min={termUnit === 'years' ? 1 : 6}
                max={termUnit === 'years' ? 25 : 300}
                value={termValue}
                onChange={(e) => setTermValue(parseInt(e.target.value, 10) || 1)}
                className="w-full pl-4 pr-32 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none text-lg font-extrabold text-slate-900 tabular-nums bg-slate-50/50 focus:bg-white"
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-amber-700 pointer-events-none tabular-nums">
                {yearsLabel} ({totalMonths} ງວດ)
              </span>
            </div>

            <input
              type="range"
              min={termUnit === 'years' ? 1 : 6}
              max={termUnit === 'years' ? 25 : 300}
              step={termUnit === 'years' ? 1 : 6}
              value={termValue}
              onChange={(e) => setTermValue(Number(e.target.value))}
            />

            {/* Quick Term Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { v: 12, u: 'months', l: '12 ເດືອນ' },
                { v: 24, u: 'months', l: '24 ເດືອນ' },
                { v: 36, u: 'months', l: '36 ເດືອນ' },
                { v: 60, u: 'months', l: '60 ເດືອນ' },
                { v: 10, u: 'years', l: '10 ປີ' },
                { v: 15, u: 'years', l: '15 ປີ' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTermUnit(item.u as TermUnit);
                    setTermValue(item.v);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    termUnit === item.u && termValue === item.v
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.l}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Calculation Method */}
          <div className="space-y-2.5 pt-1">
            <label className="block text-sm font-bold text-slate-900">
              5. ຮູບແບບການຄິດໄລ່ດອກເບ້ຍ
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('reducing')}
                className={`p-3.5 rounded-2xl border-2 text-left transition ${
                  method === 'reducing'
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">ຫຼຸດຕົ້ນຫຼຸດດອກ</span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      method === 'reducing' ? 'bg-amber-600' : 'border-2 border-slate-300'
                    }`}
                  >
                    {method === 'reducing' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Reducing Balance (ມາດຕະຖານທະນາຄານ)</p>
              </button>

              <button
                type="button"
                onClick={() => setMethod('flat')}
                className={`p-3.5 rounded-2xl border-2 text-left transition ${
                  method === 'flat'
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">ດອກເບ້ຍຄົງທີ່</span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      method === 'flat' ? 'bg-amber-600' : 'border-2 border-slate-300'
                    }`}
                  >
                    {method === 'flat' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Flat Rate (ຜ່ອນກັບໂຄງການ / ຄົງທີ່)</p>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Dashboard & SVG Donut (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Hero Monthly Installment Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-6 sm:p-7 shadow-2xl border border-amber-500/40 relative overflow-hidden">
            {/* Ambient decorative glowing accents */}
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  ຍອດຜ່ອນຊຳລະຕໍ່ເດືອນ
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {method === 'reducing' ? 'ຫຼຸດຕົ້ນຫຼຸດດອກ' : 'ດອກເບ້ຍຄົງທີ່'}
                </span>
              </div>

              {/* Big Monthly Payment Number */}
              <div className="my-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight tabular-nums leading-tight">
                  {formatNumber(result.monthlyPayment)}
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-400">
                  {sym} / ເດືອນ
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-5">
                ໄລຍະຜ່ອນ {totalMonths} ງວດ ({yearsLabel}) • ດອກເບ້ຍ {annualRate}% ຕໍ່ປີ
              </p>

              {/* 3 Metric Breakdown Cards */}
              <div className="space-y-2.5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                  <span className="text-xs text-slate-300">ຍອດຈັດສິນເຊື່ອ / ຍອດຄ້າງຜ່ອນ</span>
                  <span className="text-sm sm:text-base font-extrabold text-white tabular-nums">
                    {formatNumber(result.principal)} {sym}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                  <span className="text-xs text-amber-300">ດອກເບ້ຍລວມທັງໝົດ</span>
                  <span className="text-sm sm:text-base font-extrabold text-amber-400 tabular-nums">
                    {formatNumber(result.totalInterest)} {sym}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-gradient-to-r from-amber-600/30 to-amber-500/15 rounded-2xl px-4 py-3 border border-amber-400/40">
                  <span className="text-xs font-bold text-white">ຍອດຊຳລະລວມທັງໝົດ</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-300 tabular-nums">
                    {formatNumber(result.totalPayment)} {sym}
                  </span>
                </div>
              </div>

              {/* 3 Primary Action Buttons */}
              <div className="space-y-2.5 mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={onCopyWhatsApp}
                    className="w-full py-3 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center space-x-2 transition active:scale-98"
                  >
                    <Share2 className="w-4 h-4 shrink-0" />
                    <span>ຄັດລອກສົ່ງ WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenSaveModal}
                    className="w-full py-3 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-98"
                  >
                    <CloudUpload className="w-4 h-4 shrink-0" />
                    <span>ບັນທຶກລົງ Firebase</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onSwitchToQuotation}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 flex items-center justify-center space-x-2 transition"
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>ອອກໃບສະເໜີລາຄາ (Quotation / Print PDF)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pure SVG Donut Breakdown Chart */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PieChartIcon className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">ອັດຕາສ່ວນເງິນຕົ້ນ ແລະ ດອກເບ້ຍ</h3>
              </div>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {hoveredSegment === 'interest'
                  ? `ດອກເບ້ຍ: ${formatNumber(result.totalInterest)} ${sym}`
                  : hoveredSegment === 'principal'
                  ? `ເງິນຕົ້ນ: ${formatNumber(result.principal)} ${sym}`
                  : 'ແຕະເພື່ອເບິ່ງລາຍລະອຽດ'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Pure SVG Donut */}
              <div className="relative w-44 h-44 shrink-0">
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full -rotate-90 overflow-visible"
                  aria-label="ແຜນວາດອັດຕາສ່ວນ"
                >
                  {/* Background Track */}
                  <circle cx="60" cy="60" r="46" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                  {/* Interest Segment (Gold) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="transparent"
                    stroke="#d4af37"
                    strokeWidth={hoveredSegment === 'interest' ? '20' : '16'}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset="0"
                    className="donut-segment cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredSegment('interest')}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={() => setHoveredSegment('interest')}
                  />
                  {/* Principal Segment (Deep Navy) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="transparent"
                    stroke="#0f172a"
                    strokeWidth={hoveredSegment === 'principal' ? '20' : '16'}
                    strokeDasharray={`${principalArc.toFixed(2)} ${circumference.toFixed(2)}`}
                    strokeDashoffset="0"
                    className="donut-segment cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredSegment('principal')}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={() => setHoveredSegment('principal')}
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {hoveredSegment === 'interest' ? 'ດອກເບ້ຍ' : 'ເງິນຕົ້ນ'}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 tabular-nums leading-tight">
                    {hoveredSegment === 'interest' ? `${interestPct}%` : `${principalPct}%`}
                  </span>
                </div>
              </div>

              {/* Legend & Breakdown Cards */}
              <div className="w-full space-y-3">
                <div
                  onMouseEnter={() => setHoveredSegment('principal')}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    hoveredSegment === 'principal'
                      ? 'bg-slate-100 border-slate-900 ring-2 ring-slate-900/10'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-slate-900" />
                      <span className="text-xs font-bold text-slate-700">ເງິນຕົ້ນ (Principal)</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                      {principalPct}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 mt-1 pl-5 tabular-nums">
                    {formatNumber(result.principal)} {sym}
                  </div>
                </div>

                <div
                  onMouseEnter={() => setHoveredSegment('interest')}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    hoveredSegment === 'interest'
                      ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-500/20'
                      : 'bg-amber-50/60 hover:bg-amber-50 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-slate-700">ດອກເບ້ຍ (Interest)</span>
                    </div>
                    <span className="text-xs font-extrabold text-amber-800 tabular-nums">
                      {interestPct}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-amber-800 mt-1 pl-5 tabular-nums">
                    {formatNumber(result.totalInterest)} {sym}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AMORTIZATION SCHEDULE TABLE SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">ຕາຕະລາງການຜ່ອນຊຳລະ</h3>
            <p className="text-xs text-slate-500 mt-0.5">ສະແດງລາຍລະອຽດການຕັດເງິນຕົ້ນ, ດອກເບ້ຍ ແລະ ຍອດຄົງເຫຼືອແຕ່ລະງວດ</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Yearly vs Monthly Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setScheduleView('yearly')}
                className={`px-3.5 py-2 rounded-lg transition ${
                  scheduleView === 'yearly'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ສະຫຼຸບລາຍປີ
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={`px-3.5 py-2 rounded-lg transition ${
                  scheduleView === 'monthly'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ລາຍເດືອນ
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={() =>
                exportScheduleCSV(
                  currency,
                  result.schedule,
                  propertyPrice,
                  downPercent,
                  downAmount,
                  result.principal
                )
              }
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>ດາວໂຫຼດ Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="mt-5 overflow-x-auto max-h-[480px] rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-900 text-white sticky top-0 z-10 text-[11px] sm:text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {scheduleView === 'yearly' ? 'ປີທີ' : 'ງວດທີ'}
                </th>
                <th className="py-3.5 px-4 text-right font-bold whitespace-nowrap">ຍອດຜ່ອນຕໍ່ງວດ</th>
                <th className="py-3.5 px-4 text-right font-bold whitespace-nowrap">ຕັດເງິນຕົ້ນ</th>
                <th className="py-3.5 px-4 text-right font-bold text-amber-400 whitespace-nowrap">
                  ດອກເບ້ຍ
                </th>
                <th className="py-3.5 px-4 text-right font-bold whitespace-nowrap">ຍອດຄົງເຫຼືອ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {scheduleView === 'yearly' ? (
                yearlyRows.map((row) => (
                  <tr key={row.year} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ປີທີ {row.year}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                      {formatNumber(row.payment)} {sym}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatNumber(row.principal)} {sym}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-amber-800 whitespace-nowrap">
                      {formatNumber(row.interest)} {sym}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {formatNumber(row.balance)} {sym}
                    </td>
                  </tr>
                ))
              ) : (
                result.schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-amber-50/40 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ງວດທີ {row.month}{' '}
                      <span className="text-[11px] font-normal text-slate-400">(ປີ {row.year})</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                      {formatNumber(row.payment)} {sym}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatNumber(row.principal)} {sym}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-amber-800 whitespace-nowrap">
                      {formatNumber(row.interest)} {sym}
                    </td>
                    <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {formatNumber(row.balance)} {sym}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {scheduleView === 'yearly'
              ? `ສະແດງສະຫຼຸບ ${yearlyRows.length} ປີ (ທັງໝົດ ${result.schedule.length} ງວດ)`
              : `ສະແດງລາຍລະອຽດທັງໝົດ ${result.schedule.length} ງວດ`}
          </span>
          <span className="flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>* ຕົວເລກຄຳນວນເບື້ອງຕົ້ນເພື່ອໃຊ້ປະກອບການຕັດສິນໃຈ</span>
          </span>
        </div>
      </div>
    </div>
  );
};
