import React, { useState } from 'react';
import {
  GraduationCap,
  PenLine,
  LayoutDashboard,
  BookOpen,
  Bookmark,
  History,
  FileCheck2,
  LogIn,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import type { FirebaseUser, AppUser } from '../lib/firebase';
import type { AppLanguage } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewWriting: () => void;
  submissionCount: number;
  user: AppUser | FirebaseUser | null;
  publicId: string;
  isVerifiedAdmin: boolean;
  hasEnglishAccess: boolean;
  activeLanguage: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  onOpenAdminPanel: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewWriting,
  submissionCount,
  user,
  publicId,
  isVerifiedAdmin,
  hasEnglishAccess,
  activeLanguage,
  onChangeLanguage,
  onOpenAdminPanel,
  onOpenAuth,
  onSignOut,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const isEn = activeLanguage === 'en';

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'editor', label: isEn ? 'เขียนสอบ EN' : 'ทำข้อสอบกลาง', icon: PenLine },
    { id: 'learning', label: 'บทเรียนไวยากรณ์', icon: BookOpen },
    { id: 'vocabulary', label: 'คลังคำศัพท์', icon: Bookmark },
    { id: 'history', label: 'ประวัติการส่ง', icon: History, badge: submissionCount },
    { id: 'rubric', label: 'เกณฑ์คะแนน', icon: FileCheck2 },
  ];

  const userDisplayName =
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : user?.isAnonymous ? 'ผู้เรียนทั่วไป (Guest)' : 'ผู้เรียน');

  const handleCopyPublicId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!publicId) return;
    try {
      await navigator.clipboard.writeText(publicId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-2 xl:gap-3">
          {/* Brand Mark */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0 min-w-0"
            onClick={() => setActiveTab('landing')}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:shadow-md transition-all shrink-0 ${
                isEn
                  ? 'bg-gradient-to-br from-indigo-600 to-sky-700'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700'
              }`}
            >
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {isEn ? 'EnglishSchreiben' : 'DeutschSchreiben'}
                </span>
                <span
                  className={`px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md border shrink-0 ${
                    isEn
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200/70'
                      : 'bg-blue-50 text-blue-700 border-blue-200/60'
                  }`}
                >
                  {isEn ? 'EN' : 'AI'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden 2xl:block whitespace-nowrap">
                {isEn
                  ? 'ระบบประเมินงานเขียนภาษาอังกฤษ A1–C1 (CEFR)'
                  : 'ระบบประเมินงานเขียนภาษาเยอรมัน A1–C1 (CEFR)'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex flex-1 min-w-0 justify-center items-center gap-0.5 2xl:gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2 2xl:px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-blue-600 text-white rounded-full font-bold shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons: Language Switcher (Entitled Only), Start Writing & User Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {hasEnglishAccess && (
              <div
                className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 shrink-0 whitespace-nowrap"
                role="group"
                aria-label="สลับโหมดภาษาการเขียน"
              >
                <button
                  type="button"
                  onClick={() => onChangeLanguage('de')}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeLanguage === 'de'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  DE
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLanguage('en')}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeLanguage === 'en'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  EN
                </button>
              </div>
            )}

            <button
              onClick={onNewWriting}
              aria-label="สุ่มข้อสอบใหม่"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs p-2 sm:px-3 xl:px-3.5 sm:py-2 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <PenLine className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">สุ่มข้อสอบใหม่</span>
            </button>

            {/* Auth Button or User Profile */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  aria-label="เปิดเมนูโปรไฟล์ผู้ใช้"
                  className="flex items-center gap-1 sm:gap-2 py-1 px-1.5 sm:py-1.5 sm:px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer text-xs font-semibold text-slate-800 whitespace-nowrap"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={userDisplayName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                      {userDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[96px] truncate hidden sm:inline">
                    {userDisplayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu (matches attached screenshot + immutable ID + Admin Panel item) */}
                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 space-y-1.5">
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {userDisplayName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.isAnonymous ? 'บัญชีผู้ใช้งานชั่วคราว (Guest)' : user.email || 'ผู้เรียน'}
                        </p>
                      </div>

                      {/* Immutable Read-only Automatic User ID */}
                      {publicId && (
                        <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
                          <div className="flex items-center gap-1 min-w-0">
                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-[10px] font-semibold text-slate-500 shrink-0">ID:</span>
                            <span
                              data-testid="user-immutable-id"
                              className="text-[11px] font-mono font-bold text-slate-800 truncate select-all"
                              title="เลข User ID อัตโนมัติ (ไม่สามารถเปลี่ยนแปลงได้)"
                            >
                              {publicId}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyPublicId}
                            aria-label="คัดลอก User ID"
                            title="คัดลอก User ID"
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                          >
                            {copiedId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveTab('history');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>ประวัติงานเขียน ({submissionCount})</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveTab('vocabulary');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        <span>คลังคำศัพท์ที่บันทึก</span>
                      </button>

                      {/* Special Admin Control Panel Item (florian25500@gmail.com after DB passcode verified) */}
                      {isVerifiedAdmin && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenAdminPanel();
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-amber-800 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/70 flex items-center gap-2 cursor-pointer font-bold transition-colors mt-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>แผงควบคุมพิเศษ</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 transition-all text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet / Compact Laptop Horizontal Navigation */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1 rounded-full text-[9px] ${isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
