import { CurrencyCode, CurrencyConfig, CalculationResult, ScheduleItem, CalculationMethod } from '../types';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  LAK: {
    code: 'LAK',
    label: 'LAK (ກີບ)',
    symbol: '₭',
    defaultPrice: 350000000,
    minPrice: 50000000,
    maxPrice: 5000000000,
    stepPrice: 10000000,
    presets: [
      { label: '150,000,000 ₭', value: 150000000 },
      { label: '350,000,000 ₭', value: 350000000 },
      { label: '800,000,000 ₭', value: 800000000 },
      { label: '1,500,000,000 ₭', value: 1500000000 }
    ]
  },
  THB: {
    code: 'THB',
    label: 'THB (ບາດ)',
    symbol: '฿',
    defaultPrice: 1500000,
    minPrice: 100000,
    maxPrice: 20000000,
    stepPrice: 50000,
    presets: [
      { label: '500,000 ฿', value: 500000 },
      { label: '1,500,000 ฿', value: 1500000 },
      { label: '3,000,000 ฿', value: 3000000 },
      { label: '5,000,000 ฿', value: 5000000 }
    ]
  },
  USD: {
    code: 'USD',
    label: 'USD (ໂດລາ)',
    symbol: '$',
    defaultPrice: 45000,
    minPrice: 5000,
    maxPrice: 1000000,
    stepPrice: 1000,
    presets: [
      { label: '$15,000', value: 15000 },
      { label: '$45,000', value: 45000 },
      { label: '$100,000', value: 100000 },
      { label: '$250,000', value: 250000 }
    ]
  }
};

export interface ComputePlanParams {
  price: number;
  downAmount: number;
  annualRate: number;
  totalMonths: number;
  method: CalculationMethod;
}

export function computeLoanPlan({
  price,
  downAmount,
  annualRate,
  totalMonths,
  method
}: ComputePlanParams): CalculationResult {
  const principal = Math.max(0, price - downAmount);
  const schedule: ScheduleItem[] = [];
  let monthlyPayment = 0;
  let totalInterest = 0;
  let totalPayment = 0;

  if (principal <= 0 || totalMonths <= 0) {
    return {
      principal: 0,
      monthlyPayment: 0,
      totalInterest: 0,
      totalPayment: 0,
      schedule: []
    };
  }

  if (method === 'reducing') {
    const monthlyRate = (annualRate / 100) / 12;
    if (monthlyRate === 0) {
      monthlyPayment = principal / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = principal * ((monthlyRate * factor) / (factor - 1));
    }

    let balance = principal;
    for (let m = 1; m <= totalMonths; m++) {
      const interestPaid = monthlyRate === 0 ? 0 : balance * monthlyRate;
      let principalPaid = monthlyPayment - interestPaid;

      if (m === totalMonths || balance - principalPaid < 0.01) {
        principalPaid = balance;
        balance = 0;
      } else {
        balance -= principalPaid;
      }

      const actualPayment = principalPaid + interestPaid;
      totalInterest += interestPaid;

      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        payment: actualPayment,
        principal: principalPaid,
        interest: interestPaid,
        balance: Math.max(0, balance)
      });
    }
    totalPayment = principal + totalInterest;
  } else {
    // Flat Rate
    const years = totalMonths / 12;
    totalInterest = principal * (annualRate / 100) * years;
    totalPayment = principal + totalInterest;
    monthlyPayment = totalPayment / totalMonths;

    const principalPerMonth = principal / totalMonths;
    const interestPerMonth = totalInterest / totalMonths;
    let balance = principal;

    for (let m = 1; m <= totalMonths; m++) {
      if (m === totalMonths || balance - principalPerMonth < 0.01) {
        balance = 0;
      } else {
        balance -= principalPerMonth;
      }

      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        payment: monthlyPayment,
        principal: principalPerMonth,
        interest: interestPerMonth,
        balance: Math.max(0, balance)
      });
    }
  }

  return {
    principal,
    monthlyPayment,
    totalInterest,
    totalPayment,
    schedule
  };
}

export interface YearlyScheduleRow {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function aggregateYearlySchedule(schedule: ScheduleItem[]): YearlyScheduleRow[] {
  const map = new Map<number, YearlyScheduleRow>();
  schedule.forEach((item) => {
    if (!map.has(item.year)) {
      map.set(item.year, {
        year: item.year,
        payment: 0,
        principal: 0,
        interest: 0,
        balance: 0
      });
    }
    const entry = map.get(item.year)!;
    entry.payment += item.payment;
    entry.principal += item.principal;
    entry.interest += item.interest;
    entry.balance = item.balance;
  });
  return Array.from(map.values());
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-US');
}

export function parseNumber(val: string | number): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function exportScheduleCSV(
  currency: CurrencyCode,
  schedule: ScheduleItem[],
  price: number,
  downPercent: number,
  downAmount: number,
  principal: number
): void {
  if (!schedule || schedule.length === 0) return;

  // UTF-8 BOM for Lao character support in Excel
  let csv = '\uFEFF';
  csv += `KIDC REAL ESTATE - ຕາຕະລາງການຜ່ອນຊຳລະ (${currency})\n`;
  csv += `ມູນຄ່າຊັບສິນ,${Math.round(price)},ເງິນດາວ (${downPercent}%),${Math.round(downAmount)},ຍອດຄ້າງຜ່ອນ,${Math.round(principal)}\n\n`;
  csv += `ງວດທີ,ປີທີ,ຍອດຜ່ອນຕໍ່ງວດ (${currency}),ຕັດເງິນຕົ້ນ (${currency}),ດອກເບ້ຍ (${currency}),ຍອດຄົງເຫຼືອ (${currency})\n`;

  schedule.forEach((row) => {
    csv += `${row.month},${row.year},${Math.round(row.payment)},${Math.round(row.principal)},${Math.round(row.interest)},${Math.round(row.balance)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KIDC_RealEstate_Schedule_${currency}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildWhatsAppMessage(params: {
  customerName?: string;
  projectName?: string;
  agentPhone?: string;
  currency: CurrencyCode;
  symbol: string;
  price: number;
  downPercent: number;
  downAmount: number;
  principal: number;
  yearsLabel: string;
  totalMonths: number;
  annualRate: number;
  method: CalculationMethod;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}): string {
  const {
    customerName,
    projectName,
    agentPhone = '020 9966 3414',
    symbol,
    price,
    downPercent,
    downAmount,
    principal,
    yearsLabel,
    totalMonths,
    annualRate,
    method,
    monthlyPayment,
    totalInterest,
    totalPayment
  } = params;

  let msg = `🏢 *KIDC REAL ESTATE*\n`;
  msg += `ບໍລິສັດ ແກ້ວມົນຕີ ລົງທຶນ ພັດທະນາ ແລະ ກໍ່ສ້າງ ຈຳກັດຜູ້ດຽວ\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  if (customerName) msg += `👤 ລູກຄ້າ: ${customerName}\n`;
  if (projectName) msg += `🏡 ໂຄງການ/ຕອນດິນ: ${projectName}\n`;
  msg += `💰 ມູນຄ່າຊັບສິນ: *${formatNumber(price)} ${symbol}*\n`;
  msg += `💵 ເງິນຈ່າຍກ່ອນ (${downPercent}%): *${formatNumber(downAmount)} ${symbol}*\n`;
  msg += `🏦 ຍອດຄ້າງຜ່ອນ: *${formatNumber(principal)} ${symbol}*\n`;
  msg += `📅 ໄລຍະເວລາຜ່ອນ: *${yearsLabel} (${totalMonths} ງວດ)*\n`;
  msg += `📈 ອັດຕາດອກເບ້ຍ: *${annualRate}% ຕໍ່ປີ* (${method === 'reducing' ? 'ຫຼຸດຕົ້ນຫຼຸດດອກ' : 'ຄົງທີ່'})\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✅ *ຍອດຜ່ອນຕໍ່ເດືອນ: ${formatNumber(monthlyPayment)} ${symbol}/ເດືອນ*\n`;
  msg += `• ດອກເບ້ຍລວມ: ${formatNumber(totalInterest)} ${symbol}\n`;
  msg += `• ຍອດຊຳລະລວມ: ${formatNumber(totalPayment)} ${symbol}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📞 ສອບຖາມຂໍ້ມູນເພີ່ມເຕີມ: ${agentPhone}`;
  return msg;
}
