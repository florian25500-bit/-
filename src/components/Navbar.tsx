import React from 'react';
import {
  GraduationCap,
  PenLine,
  LayoutDashboard,
  BookOpen,
  Bookmark,
  History,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewWriting: () => void;
  submissionCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewWriting,
  submissionCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', subLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor', label: 'ฝึกเขียนงาน', subLabel: 'Writing', icon: PenLine },
    { id: 'learning', label: 'บทเรียนไวยากรณ์', subLabel: 'Grammar', icon: BookOpen },
    { id: 'vocabulary', label: 'คลังคำศัพท์', subLabel: 'Vocab Bank', icon: Bookmark },
    { id: 'history', label: 'ประวัติการส่ง', subLabel: 'History', icon: History, badge: submissionCount },
    { id: 'rubric', label: 'เกณฑ์ 100 คะแนน', subLabel: 'Rubric', icon: FileCheck2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Mark */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
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
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                ระบบประเมินงานเขียนภาษาเยอรมัน B1–C1 (CEFR)
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
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 relative ${
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

          {/* Right Action Button: Start Writing */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>คำอธิบายภาษาไทย</span>
            </div>

            <button
              onClick={onNewWriting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>เขียนงานใหม่</span>
            </button>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
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
