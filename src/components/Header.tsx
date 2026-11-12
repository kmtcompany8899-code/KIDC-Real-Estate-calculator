import React from 'react';
import { User } from 'firebase/auth';
import { 
  Calculator, 
  GitCompare, 
  FileText, 
  BookmarkCheck, 
  LogOut, 
  CloudCheck, 
  LogIn,
  ChevronDown
} from 'lucide-react';
import { CurrencyCode } from '../types';

interface HeaderProps {
  currentTab: 'calculator' | 'compare' | 'quotation' | 'saved';
  onTabChange: (tab: 'calculator' | 'compare' | 'quotation' | 'saved') => void;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  currency,
  onCurrencyChange,
  user,
  authLoading,
  onSignIn,
  onSignOut,
  savedCount
}) => {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white shadow-xl border-b border-amber-500/30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand, Currency & Auth Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3 border-b border-white/10">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 min-w-0">
            {/* Luxury Monogram Emblem */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-[1.5px] shadow-lg shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center">
                <span className="text-amber-400 font-extrabold text-base sm:text-lg tracking-tighter leading-none tabular-nums">
                  KIDC
                </span>
                <span className="text-[8px] text-amber-300 tracking-widest uppercase mt-0.5 font-bold">
                  ESTATE
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-xl font-extrabold tracking-wide text-white truncate">
                  KIDC <span className="text-amber-400">REAL ESTATE</span>
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                ລະບົບຄິດໄລ່ຄ່າຜ່ອນຊຳລະອະສັງຫາລິມະຊັບ • Firebase Cloud Sync
              </p>
            </div>
          </div>

          {/* Right Action Group: Currency Switcher & Gmail Auth */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3 shrink-0">
            {/* Multi-Currency Switcher */}
            <div
              className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/15 shadow-inner"
              role="group"
              aria-label="ເລືອກສະກຸນເງິນ"
            >
              <button
                type="button"
                onClick={() => onCurrencyChange('LAK')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  currency === 'LAK'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ₭ ກີບ
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange('THB')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  currency === 'THB'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ฿ ບາດ
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange('USD')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                $ ໂດລາ
              </button>
            </div>

            {/* Gmail Authentication Button / User Profile */}
            {authLoading ? (
              <div className="h-9 w-24 bg-white/10 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl px-2.5 py-1.5 transition text-left"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full border border-amber-400 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left max-w-[120px]">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-amber-300 flex items-center space-x-1 truncate">
                      <CloudCheck className="w-3 h-3 text-emerald-400 inline" />
                      <span>Firebase Live</span>
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-slate-400 text-[10px]">ເຂົ້າສູ່ລະບົບດ້ວຍ Gmail:</p>
                      <p className="font-bold text-white text-sm truncate mt-0.5">{user.email}</p>
                      <div className="flex items-center space-x-1.5 mt-1 text-emerald-400 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>ເຊື່ອມຕໍ່ Firebase ຮຽບຮ້ອຍ</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onTabChange('saved');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-slate-200 flex items-center space-x-2 transition"
                    >
                      <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      <span>ເບິ່ງລາຍການບັນທຶກທັງໝົດ ({savedCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-950/50 text-rose-300 flex items-center space-x-2 transition border-t border-slate-800"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ອອກຈາກລະບົບ (Sign Out)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold px-3 sm:px-4 py-2 rounded-xl shadow-lg transition text-xs sm:text-sm active:scale-95"
              >
                {/* Google G SVG */}
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
                <span className="whitespace-nowrap font-extrabold">ເຂົ້າສູ່ລະບົບດ້ວຍ Gmail</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          className="flex space-x-1 sm:space-x-2 pt-2.5 pb-2 overflow-x-auto no-scrollbar"
          aria-label="ເມນູຫຼັກ"
        >
          <button
            type="button"
            onClick={() => onTabChange('calculator')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              currentTab === 'calculator'
                ? 'bg-white text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calculator
              className={`w-4 h-4 shrink-0 ${
                currentTab === 'calculator' ? 'text-amber-600' : 'text-amber-400'
              }`}
            />
            <span>ຄິດໄລ່ຄ່າຜ່ອນ</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('compare')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              currentTab === 'compare'
                ? 'bg-white text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <GitCompare
              className={`w-4 h-4 shrink-0 ${
                currentTab === 'compare' ? 'text-amber-600' : 'text-amber-400'
              }`}
            />
            <span>ປຽບທຽບແຜນຜ່ອນ</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('quotation')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              currentTab === 'quotation'
                ? 'bg-white text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText
              className={`w-4 h-4 shrink-0 ${
                currentTab === 'quotation' ? 'text-amber-600' : 'text-amber-400'
              }`}
            />
            <span>ໃບສະເໜີລາຄາ</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('saved')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
              currentTab === 'saved'
                ? 'bg-white text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookmarkCheck
              className={`w-4 h-4 shrink-0 ${
                currentTab === 'saved' ? 'text-amber-600' : 'text-amber-400'
              }`}
            />
            <span>ລາຍການບັນທຶກໄວ້ (Firebase)</span>
            {savedCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                {savedCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
