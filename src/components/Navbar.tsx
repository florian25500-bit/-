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
  User,
  Shield,
  ChevronDown,
} from 'lucide-react';
import type { FirebaseUser, AppUser } from '../lib/firebase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewWriting: () => void;
  submissionCount: number;
  user: AppUser | FirebaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewWriting,
  submissionCount,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', subLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor', label: 'ทำข้อสอบกลาง', subLabel: 'Exam', icon: PenLine },
    { id: 'learning', label: 'บทเรียนไวยากรณ์', subLabel: 'Grammar', icon: BookOpen },
    { id: 'vocabulary', label: 'คลังคำศัพท์', subLabel: 'Vocab Bank', icon: Bookmark },
    { id: 'history', label: 'ประวัติการส่ง', subLabel: 'History', icon: History, badge: submissionCount },
    { id: 'rubric', label: 'เกณฑ์ 100 คะแนน', subLabel: 'Rubric', icon: FileCheck2 },
  ];

  const userDisplayName =
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : user?.isAnonymous ? 'ผู้เรียนทั่วไป (Guest)' : 'ผู้เรียน');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Mark */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs group-hover:shadow-md transition-all">
              <GraduationCap className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  DeutschSchreiben
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                ระบบประเมินงานเขียนภาษาเยอรมัน A1–C1 (CEFR)
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 relative cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-blue-600 text-white rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons: Start Writing & User Auth */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onNewWriting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">สุ่มข้อสอบใหม่</span>
            </button>

            {/* Auth Button or User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer text-xs font-semibold text-slate-800"
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
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {userDisplayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {userDisplayName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.isAnonymous ? 'บัญชีผู้ใช้งานชั่วคราว (Guest)' : user.email || 'ผู้เรียน'}
                      </p>
                    </div>

                    <div className="py-1">
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
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 transition-all text-xs font-bold cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
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
