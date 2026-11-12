export type CurrencyCode = 'LAK' | 'THB' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  label: string;
  symbol: string;
  defaultPrice: number;
  minPrice: number;
  maxPrice: number;
  stepPrice: number;
  presets: { label: string; value: number }[];
}

export type DownPaymentMode = 'percent' | 'amount';
export type TermUnit = 'years' | 'months';
export type CalculationMethod = 'reducing' | 'flat';
export type ScheduleViewMode = 'yearly' | 'monthly';

export interface ScheduleItem {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface CalculationResult {
  principal: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: ScheduleItem[];
}

export type QuoteStatus = 'draft' | 'presented' | 'negotiation' | 'approved' | 'completed';

export interface SavedCalculation {
  id: string;
  userId: string;
  userEmail?: string;
  customerName: string;
  projectName: string;
  agentPhone: string;
  currency: CurrencyCode;
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
  status?: QuoteStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  lastLoginAt?: string;
}
