import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  X,
  ChevronRight,
} from 'lucide-react';
import { AssessmentResult } from '../types';

interface HistoryViewProps {
  submissions: AssessmentResult[];
  onViewAssessment: (result: AssessmentResult) => void;
  onStartNewWriting: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  submissions,
  onViewAssessment,
  onStartNewWriting,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const filtered = submissions.filter((sub) => {
    const matchesLevel = selectedLevel === 'ALL' || sub.task_level === selectedLevel;
    const matchesSearch =
      sub.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.original_text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const subA = submissions.find((s) => s.id === compareIds[0]);
  const subB = submissions.find((s) => s.id === compareIds[1]);

  return (
    <div className="space-y-6 py-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Verlauf & Analyse
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              ประวัติการส่งงานเขียน (My Writing History)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              บันทึกทุก Submission และผลประเมินย้อนหลัง พร้อมเครื่องมือเปรียบเทียบพัฒนาการ 2 ชิ้นงาน
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {compareIds.length === 2 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>เปรียบเทียบ 2 ชิ้นงาน (Compare)</span>
              </button>
            )}

            <button
              onClick={onStartNewWriting}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              เขียนงานชิ้นใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อโจทย์หรือเนื้อหาในบทความ..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['ALL', 'B1', 'B2', 'C1'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {lvl === 'ALL' ? 'ทุกระดับ' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">
            ยังไม่มีงานเขียนที่ตรงกับเงื่อนไข
          </h3>
          <p className="text-xs text-slate-500">
            ลองเปลี่ยนคำค้นหา หรือเริ่มเขียนงานชิ้นใหม่เพื่อรับการประเมิน
          </p>
          <button
            onClick={onStartNewWriting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            เริ่มเขียนตอนนี้
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isComparing = compareIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                      Niveau {item.task_level}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.task_category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(item.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>

                  <h3
                    onClick={() => onViewAssessment(item)}
                    className="font-bold text-sm text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {item.task_title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    „{item.original_text.slice(0, 140)}...“
                  </p>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-between md:justify-end">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        {item.total_score}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block border ${
                        item.grade === 'A'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.grade === 'B'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      Grade {item.grade} • {item.cefr_estimate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCompare(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        isComparing
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isComparing ? '✓ เลือกเปรียบเทียบ' : '+ เปรียบเทียบ'}
                    </button>

                    <button
                      onClick={() => onViewAssessment(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>ดูผลตรวจ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Submissions Modal */}
      {showCompareModal && subA && subB && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>เปรียบเทียบงานเขียน 2 ชิ้น (Submission Comparison)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  วิเคราะห์การเปลี่ยนแปลงของคะแนนและพัฒนาการทางภาษา
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Submission A */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  ชิ้นที่ 1 ({new Date(subA.created_at).toLocaleDateString('th-TH')})
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {subA.task_title}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900">
                    {subA.total_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Grade {subA.grade} ({subA.cefr_estimate})
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                  <div>จำนวนคำ: {subA.word_count} คำ</div>
                  <div>ข้อผิดพลาดที่พบ: {subA.errors.length} จุด</div>
                  <div>จุดเด่น: {subA.strengths[0]}</div>
                </div>
              </div>

              {/* Submission B */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  ชิ้นที่ 2 ({new Date(subB.created_at).toLocaleDateString('th-TH')})
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {subB.task_title}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900">
                    {subB.total_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Grade {subB.grade} ({subB.cefr_estimate})
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                  <div>จำนวนคำ: {subB.word_count} คำ</div>
                  <div>ข้อผิดพลาดที่พบ: {subB.errors.length} จุด</div>
                  <div>จุดเด่น: {subB.strengths[0]}</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
              💡 <strong>สรุปพัฒนาการ:</strong> ผลต่างคะแนน {Math.abs(subB.total_score - subA.total_score)} คะแนน โดยรักษาความแม่นยำด้านโครงสร้างและคำศัพท์ได้อย่างต่อเนื่อง
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
