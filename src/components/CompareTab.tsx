import React from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { CurrencyCode, CalculationMethod } from '../types';
import { CURRENCY_CONFIGS, computeLoanPlan, formatNumber } from '../utils/calculator';

interface CompareTabProps {
  currency: CurrencyCode;
  propertyPrice: number;
  downAmount: number;
  downPercent: number;
  annualRate: number;
  method: CalculationMethod;
  onSelectPlan: (years: number) => void;
  onBackToCalculator: () => void;
}

export const CompareTab: React.FC<CompareTabProps> = ({
  currency,
  propertyPrice,
  downAmount,
  downPercent,
  annualRate,
  method,
  onSelectPlan,
  onBackToCalculator
}) => {
  const cfg = CURRENCY_CONFIGS[currency];
  const sym = cfg.symbol;

  const plans = [
    { years: 3, months: 36, tag: 'ໄລຍະສັ້ນ • ປະຢັດດອກເບ້ຍ', highlight: false },
    { years: 5, months: 60, tag: 'ແຜນຍອດນິຍົມ • ສົມດຸນ', highlight: true },
    { years: 10, months: 120, tag: 'ຜ່ອນສະບາຍ • ຄ່າງວດຕ່ຳ', highlight: false }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 inline-flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ປຽບທຽບທາງເລືອກ • Loan Term Comparison</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              ປຽບທຽບແຜນຜ່ອນຊຳລະ 3 ໄລຍະເວລາ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ຄຳນວນຈາກມູນຄ່າຊັບສິນ{' '}
              <strong className="text-slate-900 tabular-nums">
                {formatNumber(propertyPrice)} {sym}
              </strong>
              , ເງິນດາວ{' '}
              <strong className="text-slate-900 tabular-nums">
                {downPercent}% ({formatNumber(downAmount)} {sym})
              </strong>
              , ດອກເບ້ຍ{' '}
              <strong className="text-slate-900 tabular-nums">{annualRate}% ຕໍ່ປີ</strong> (
              <span>{method === 'reducing' ? 'ຫຼຸດຕົ້ນຫຼຸດດອກ' : 'ດອກເບ້ຍຄົງທີ່'}</span>)
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToCalculator}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold self-start md:self-auto transition flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ກັບໄປແກ້ໄຂຂໍ້ມູນຫຼັກ</span>
          </button>
        </div>

        {/* 3 Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => {
            const res = computeLoanPlan({
              price: propertyPrice,
              downAmount,
              annualRate,
              totalMonths: plan.months,
              method
            });

            const tot = res.principal + res.totalInterest;
            const pPct = tot > 0 ? Math.round((res.principal / tot) * 100) : 100;
            const iPct = 100 - pPct;

            return (
              <div
                key={plan.years}
                className={
                  plan.highlight
                    ? 'rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-slate-900 to-blue-950 text-white p-6 shadow-2xl flex flex-col justify-between relative transform md:-translate-y-1'
                    : 'rounded-3xl border border-slate-200 bg-slate-50/70 text-slate-900 p-6 shadow-sm flex flex-col justify-between'
                }
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        plan.highlight
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-900 text-amber-300'
                      }`}
                    >
                      {plan.tag}
                    </span>
                  </div>

                  <h3
                    className={`text-2xl font-extrabold ${
                      plan.highlight ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {plan.years} ປີ{' '}
                    <span
                      className={`text-sm font-semibold ${
                        plan.highlight ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      ({plan.months} ເດືອນ)
                    </span>
                  </h3>

                  <div
                    className={`my-5 p-4 rounded-2xl ${
                      plan.highlight
                        ? 'bg-white/10 border border-amber-400/30'
                        : 'bg-white border border-slate-200 shadow-sm'
                    }`}
                  >
                    <span
                      className={`text-xs block ${
                        plan.highlight ? 'text-amber-300' : 'text-slate-500'
                      }`}
                    >
                      ຍອດຜ່ອນຊຳລະຕໍ່ເດືອນ
                    </span>
                    <div
                      className={`text-2xl sm:text-3xl font-extrabold mt-1 tabular-nums ${
                        plan.highlight ? 'text-amber-400' : 'text-slate-900'
                      }`}
                    >
                      {formatNumber(res.monthlyPayment)}{' '}
                      <span className="text-sm font-bold">{sym}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className={plan.highlight ? 'text-slate-300' : 'text-slate-500'}>
                        ຍອດຈັດສິນເຊື່ອ:
                      </span>
                      <span className="font-bold tabular-nums">
                        {formatNumber(res.principal)} {sym}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={plan.highlight ? 'text-slate-300' : 'text-slate-500'}>
                        ດອກເບ້ຍລວມ:
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          plan.highlight ? 'text-amber-300' : 'text-amber-800'
                        }`}
                      >
                        {formatNumber(res.totalInterest)} {sym}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between pt-2 border-t ${
                        plan.highlight ? 'border-white/15' : 'border-slate-200'
                      }`}
                    >
                      <span className="font-bold">ຍອດຊຳລະລວມ:</span>
                      <span className="font-extrabold tabular-nums">
                        {formatNumber(res.totalPayment)} {sym}
                      </span>
                    </div>
                  </div>

                  {/* Ratio Bar */}
                  <div className="mt-5">
                    <div
                      className={`flex justify-between text-[11px] mb-1 ${
                        plan.highlight ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <span>ເງິນຕົ້ນ {pPct}%</span>
                      <span>ດອກເບ້ຍ {iPct}%</span>
                    </div>
                    <div
                      className={`w-full h-2.5 rounded-full overflow-hidden flex ${
                        plan.highlight ? 'bg-white/15' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        style={{ width: `${pPct}%` }}
                        className={plan.highlight ? 'bg-white' : 'bg-slate-900'}
                      />
                      <div style={{ width: `${iPct}%` }} className="bg-amber-500" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.years)}
                  className={`mt-6 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>ເລືອກໃຊ້ແຜນ {plan.years} ປີ ນີ້</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
