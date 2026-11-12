import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  saveCalculation, 
  deleteCalculation, 
  updateCalculationStatus, 
  subscribeUserCalculations 
} from './firebase';
import { 
  CurrencyCode, 
  CalculationMethod, 
  DownPaymentMode, 
  TermUnit, 
  SavedCalculation, 
  QuoteStatus 
} from './types';
import { 
  CURRENCY_CONFIGS, 
  computeLoanPlan, 
  buildWhatsAppMessage, 
  formatNumber 
} from './utils/calculator';
import { Header } from './components/Header';
import { CalculatorTab } from './components/CalculatorTab';
import { CompareTab } from './components/CompareTab';
import { QuotationTab } from './components/QuotationTab';
import { SavedCalculationsTab } from './components/SavedCalculationsTab';
import { SaveCalculationModal } from './components/SaveCalculationModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'calculator' | 'compare' | 'quotation' | 'saved'>('calculator');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Authentication & Firestore State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);

  // Core Financial State
  const [currency, setCurrency] = useState<CurrencyCode>('LAK');
  const [propertyPrice, setPropertyPrice] = useState<number>(350000000);
  const [downMode, setDownMode] = useState<DownPaymentMode>('percent');
  const [downPercent, setDownPercent] = useState<number>(20);
  const [downAmount, setDownAmount] = useState<number>(70000000);
  const [annualRate, setAnnualRate] = useState<number>(8.5);
  const [termUnit, setTermUnit] = useState<TermUnit>('years');
  const [termValue, setTermValue] = useState<number>(10);
  const [method, setMethod] = useState<CalculationMethod>('reducing');

  // Quotation Metadata State
  const [customerName, setCustomerName] = useState<string>('ທ່ານ ສົມພອນ ວົງໄຊ');
  const [projectName, setProjectName] = useState<string>('ໂຄງການ KIDC ວຽງຈັນ (ຕອນ A12)');
  const [agentPhone, setAgentPhone] = useState<string>('020 9966 3414');

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Saved Quotes when user is authenticated
  useEffect(() => {
    if (!user) {
      setSavedCalculations([]);
      return;
    }

    const unsubscribe = subscribeUserCalculations(
      user.uid,
      (data) => {
        setSavedCalculations(data);
      },
      (error) => {
        console.error('Failed to listen to calculations:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: String(Date.now()), text, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Google Sign In Handler
  const handleSignIn = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      showToast(`ຍິນດີຕ້ອນຮັບ! ເຂົ້າສູ່ລະບົບສຳເລັດແລ້ວ (${loggedUser.email})`);
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast('ບໍ່ສາມາດເຂົ້າສູ່ລະບົບໄດ້ ກະລຸນາລອງໃໝ່', 'error');
      }
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast('ອອກຈາກລະບົບຮຽບຮ້ອຍແລ້ວ', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Switch Currency with smart defaults
  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    if (newCurr === currency) return;
    const cfg = CURRENCY_CONFIGS[newCurr];
    setCurrency(newCurr);
    setPropertyPrice(cfg.defaultPrice);
    if (downMode === 'percent') {
      setDownAmount(Math.round((cfg.defaultPrice * downPercent) / 100));
    } else {
      setDownAmount(Math.round(cfg.defaultPrice * 0.2));
      setDownPercent(20);
    }
    showToast(`ປ່ຽນສະກຸນເງິນເປັນ ${cfg.label} ສຳເລັດແລ້ວ`, 'info');
  };

  // Reset to default
  const handleReset = () => {
    const cfg = CURRENCY_CONFIGS[currency];
    setPropertyPrice(cfg.defaultPrice);
    setDownMode('percent');
    setDownPercent(20);
    setDownAmount(Math.round(cfg.defaultPrice * 0.2));
    setAnnualRate(8.5);
    setTermUnit('years');
    setTermValue(10);
    setMethod('reducing');
    showToast('ຣີເຊັດຄ່າເລີ່ມຕົ້ນຮຽບຮ້ອຍແລ້ວ');
  };

  // Calculate live results
  const totalMonths = termUnit === 'years' ? Math.max(1, termValue * 12) : Math.max(1, termValue);
  const calculationResult = computeLoanPlan({
    price: propertyPrice,
    downAmount,
    annualRate,
    totalMonths,
    method
  });

  const yearsFloat = totalMonths / 12;
  const yearsLabel = Number.isInteger(yearsFloat) ? `${yearsFloat} ປີ` : `${yearsFloat.toFixed(1)} ປີ`;

  // WhatsApp Clipboard Handler (safe for iframes)
  const handleCopyWhatsApp = () => {
    const sym = CURRENCY_CONFIGS[currency].symbol;
    const text = buildWhatsAppMessage({
      customerName,
      projectName,
      agentPhone,
      currency,
      symbol: sym,
      price: propertyPrice,
      downPercent,
      downAmount,
      principal: calculationResult.principal,
      yearsLabel,
      totalMonths,
      annualRate,
      method,
      monthlyPayment: calculationResult.monthlyPayment,
      totalInterest: calculationResult.totalInterest,
      totalPayment: calculationResult.totalPayment
    });

    copyTextToClipboard(text);
  };

  const handleCopyWhatsAppSingle = (item: SavedCalculation) => {
    const sym = CURRENCY_CONFIGS[item.currency]?.symbol || '₭';
    const yFloat = item.totalMonths / 12;
    const yLabel = Number.isInteger(yFloat) ? `${yFloat} ປີ` : `${yFloat.toFixed(1)} ປີ`;

    const text = buildWhatsAppMessage({
      customerName: item.customerName,
      projectName: item.projectName,
      agentPhone: item.agentPhone,
      currency: item.currency,
      symbol: sym,
      price: item.propertyPrice,
      downPercent: item.downPercent,
      downAmount: item.downAmount,
      principal: item.principal,
      yearsLabel: yLabel,
      totalMonths: item.totalMonths,
      annualRate: item.annualRate,
      method: item.method,
      monthlyPayment: item.monthlyPayment,
      totalInterest: item.totalInterest,
      totalPayment: item.totalPayment
    });

    copyTextToClipboard(text);
  };

  const copyTextToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      showToast('ຄັດລອກຂໍ້ຄວາມສຳລັບສົ່ງ WhatsApp ສຳເລັດແລ້ວ!');
    } catch {
      showToast('ບໍ່ສາມາດຄັດລອກໄດ້ ກະລຸນາລອງໃໝ່', 'error');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  // Load a saved calculation into the calculator
  const handleLoadCalculation = (item: SavedCalculation) => {
    setCurrency(item.currency);
    setPropertyPrice(item.propertyPrice);
    setDownMode(item.downMode || 'percent');
    setDownPercent(item.downPercent);
    setDownAmount(item.downAmount);
    setAnnualRate(item.annualRate);
    setTermUnit(item.termUnit || 'years');
    setTermValue(item.termValue);
    setMethod(item.method);
    if (item.customerName) setCustomerName(item.customerName);
    if (item.projectName) setProjectName(item.projectName);
    if (item.agentPhone) setAgentPhone(item.agentPhone);

    setActiveTab('calculator');
    showToast(`ໂຫຼດຂໍ້ມູນຂອງ "${item.customerName}" ໃສ່ເຄື່ອງຄິດໄລ່ແລ້ວ!`);
  };

  const handleSwitchToQuotationWithItem = (item: SavedCalculation) => {
    handleLoadCalculation(item);
    setActiveTab('quotation');
  };

  // Delete calculation
  const handleDeleteCalculation = async (id: string) => {
    try {
      await deleteCalculation(id);
      showToast('ລຶບລາຍການອອກຈາກ Firebase ສຳເລັດແລ້ວ');
    } catch (err: any) {
      console.error(err);
      showToast('ເກີດຂໍ້ຜິດພາດໃນການລຶບ', 'error');
    }
  };

  // Update status
  const handleUpdateStatus = async (id: string, newStatus: QuoteStatus) => {
    try {
      await updateCalculationStatus(id, newStatus);
      showToast('ອັບເດດສະຖານະຮຽບຮ້ອຍແລ້ວ');
    } catch (err) {
      console.error(err);
      showToast('ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Luxury Sticky Executive Header */}
      <Header
        currentTab={activeTab}
        onTabChange={setActiveTab}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        user={user}
        authLoading={authLoading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        savedCount={savedCalculations.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'calculator' && (
          <CalculatorTab
            currency={currency}
            propertyPrice={propertyPrice}
            setPropertyPrice={setPropertyPrice}
            downMode={downMode}
            setDownMode={setDownMode}
            downPercent={downPercent}
            setDownPercent={setDownPercent}
            downAmount={downAmount}
            setDownAmount={setDownAmount}
            annualRate={annualRate}
            setAnnualRate={setAnnualRate}
            termUnit={termUnit}
            setTermUnit={setTermUnit}
            termValue={termValue}
            setTermValue={setTermValue}
            method={method}
            setMethod={setMethod}
            result={calculationResult}
            onReset={handleReset}
            onCopyWhatsApp={handleCopyWhatsApp}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
            onSwitchToQuotation={() => setActiveTab('quotation')}
          />
        )}

        {activeTab === 'compare' && (
          <CompareTab
            currency={currency}
            propertyPrice={propertyPrice}
            downAmount={downAmount}
            downPercent={downPercent}
            annualRate={annualRate}
            method={method}
            onSelectPlan={(years) => {
              setTermUnit('years');
              setTermValue(years);
              setActiveTab('calculator');
              showToast(`ເລືອກແຜນຜ່ອນ ${years} ປີ (${years * 12} ງວດ) ຮຽບຮ້ອຍແລ້ວ`);
            }}
            onBackToCalculator={() => setActiveTab('calculator')}
          />
        )}

        {activeTab === 'quotation' && (
          <QuotationTab
            currency={currency}
            propertyPrice={propertyPrice}
            downPercent={downPercent}
            downAmount={downAmount}
            principal={calculationResult.principal}
            annualRate={annualRate}
            termUnit={termUnit}
            termValue={termValue}
            totalMonths={totalMonths}
            method={method}
            result={calculationResult}
            customerName={customerName}
            setCustomerName={setCustomerName}
            projectName={projectName}
            setProjectName={setProjectName}
            agentPhone={agentPhone}
            setAgentPhone={setAgentPhone}
            onCopyWhatsApp={handleCopyWhatsApp}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedCalculationsTab
            user={user}
            savedList={savedCalculations}
            onSignIn={handleSignIn}
            onLoadCalculation={handleLoadCalculation}
            onDeleteCalculation={handleDeleteCalculation}
            onUpdateStatus={handleUpdateStatus}
            onCopyWhatsAppSingle={handleCopyWhatsAppSingle}
            onSwitchToQuotationWithItem={handleSwitchToQuotationWithItem}
          />
        )}
      </main>

      {/* Save to Firebase Modal */}
      <SaveCalculationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        user={user}
        onSignIn={handleSignIn}
        currency={currency}
        symbol={CURRENCY_CONFIGS[currency].symbol}
        propertyPrice={propertyPrice}
        downMode={downMode}
        downPercent={downPercent}
        downAmount={downAmount}
        principal={calculationResult.principal}
        annualRate={annualRate}
        termUnit={termUnit}
        termValue={termValue}
        totalMonths={totalMonths}
        method={method}
        monthlyPayment={calculationResult.monthlyPayment}
        totalInterest={calculationResult.totalInterest}
        totalPayment={calculationResult.totalPayment}
        initialCustomerName={customerName}
        initialProjectName={projectName}
        initialAgentPhone={agentPhone}
        onSaveSuccess={(newId) => {
          showToast('ບັນທຶກຂໍ້ມູນລົງ Firebase Cloud ສຳເລັດແລ້ວ!');
        }}
        saveFn={saveCalculation}
      />

      {/* Executive Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-amber-500/30 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-center md:text-left">
            <p className="font-extrabold text-white text-sm">
              KIDC REAL ESTATE •{' '}
              <span className="text-amber-400">
                ບໍລິສັດ ແກ້ວມົນຕີ ລົງທຶນ ພັດທະນາ ແລະ ກໍ່ສ້າງ ຈຳກັດຜູ້ດຽວ
              </span>
            </p>
            <p className="text-slate-400 mt-1">
              ລະບົບຄິດໄລ່ຄ່າຜ່ອນຊຳລະອະສັງຫາລິມະຊັບ • ຮອງຮັບສະກຸນເງິນ ກີບ (LAK), ບາດ (THB) ແລະ ໂດລາ (USD)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Firebase Project: <span className="text-amber-300/80">KIDC Real Estate Calculator</span> (ID: gen-lang-client-0599065663)
            </p>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-amber-300 font-bold tabular-nums">
              <span>ສາຍດ່ວນທີ່ປຶກສາ: 020 9966 3414</span>
            </div>
            <p className="text-[10px] text-slate-500">
              © {new Date().getFullYear()} KIDC Real Estate Investment Development & Construction. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
