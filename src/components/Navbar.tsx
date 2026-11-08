import React from 'react';
import {
  GraduationCap,
  PenTool,
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
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-inner font-bold border border-blue-400/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  DeutschSchreiben
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                  AI
                </span>
                <span className="hidden lg:inline-block text-[10px] font-semibold text-slate-400 ml-1">
                  B1–C1 CEFR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Academic German Writing Assessment Platform
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Writing Practice</span>
            </button>

            <button
              onClick={() => setActiveTab('learning')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'learning'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Grammar Lessons</span>
            </button>

            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'vocabulary'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Vocabulary Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                activeTab === 'history'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
              {submissionCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-blue-500 text-white rounded-full font-bold">
                  {submissionCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('rubric')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'rubric'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Rubric (100 Pkt.)</span>
            </button>
          </nav>

          {/* Right Action: Start Writing & Language Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
              <span className="text-emerald-400 font-semibold mr-1.5">●</span>
              <span>คำอธิบาย: ภาษาไทย</span>
            </div>

            <button
              onClick={onNewWriting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 hover:shadow-blue-500/25 active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Neuer Text</span>
              <span className="sm:hidden">Write</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-1.5 rounded flex flex-col items-center gap-1 ${
              activeTab === 'dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`p-1.5 rounded flex flex-col items-center gap-1 ${
              activeTab === 'editor' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Write</span>
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`p-1.5 rounded flex flex-col items-center gap-1 ${
              activeTab === 'learning' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Grammar</span>
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`p-1.5 rounded flex flex-col items-center gap-1 ${
              activeTab === 'vocabulary' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Vocab</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`p-1.5 rounded flex flex-col items-center gap-1 ${
              activeTab === 'history' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>
      </div>
    </header>
  );
};
