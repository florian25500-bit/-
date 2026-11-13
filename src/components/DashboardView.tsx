import React, { useState } from 'react';
import {
  PenLine,
  Trophy,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileQuestion,
  Trash2,
} from 'lucide-react';
import { AssessmentResult, WritingTask } from '../types';

interface DashboardViewProps {
  submissions: AssessmentResult[];
  onStartWriting: (task?: WritingTask) => void;
  onViewAssessment: (result: AssessmentResult) => void;
  onOpenLesson: (lessonId: string) => void;
  onDeleteSubmission: (id: string) => Promise<void> | void;
  tasks: WritingTask[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  submissions,
  onStartWriting,
  onViewAssessment,
  onOpenLesson,
  onDeleteSubmission,
  tasks,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteSubmission(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };
  const totalSubmissions = submissions.length;

  const averageScore =
    totalSubmissions > 0
      ? Math.round(
          (submissions.reduce((acc, curr) => acc + curr.total_score, 0) / totalSubmissions) * 10
        ) / 10
      : null;

  const latestSubmission = submissions[0];
  const currentCEFR = latestSubmission?.cefr_estimate || null;
  const confidence = latestSubmission?.cefr_confidence || null;
  const mainWeakness = latestSubmission?.main_weakness_th || null;

  // Compute actual category averages from user submissions
  const categoryKeys: { key: string; label: string; max: number }[] = [
    { key: 'task_fulfillment', label: 'Aufgabenbewältigung (ตอบตรงโจทย์)', max: 20 },
    { key: 'content_development', label: 'Inhalt & Entwicklung (เนื้อหาและการลำดับ)', max: 15 },
    { key: 'vocabulary', label: 'Wortschatz (คลังคำศัพท์วิชาการ)', max: 20 },
    { key: 'grammar', label: 'Grammatik (ความถูกต้องของไวยากรณ์)', max: 20 },
    { key: 'cohesion', label: 'Kohärenz & Kohäsion (การเชื่อมโยงความ)', max: 15 },
    { key: 'register', label: 'Register & Stil (ระดับภาษาและสไตล์)', max: 5 },
    { key: 'mechanics', label: 'Rechtschreibung (การสะกดและเครื่องหมาย)', max: 5 },
  ];

  const categoryAverages = categoryKeys.map((cat) => {
    if (totalSubmissions === 0) {
      return { label: cat.label, score: 0, max: cat.max, pct: 0 };
    }
    const totalCatScore = submissions.reduce((sum, sub) => {
      const match = sub.category_scores.find((c) => c.category === cat.key);
      return sum + (match ? match.score : 0);
    }, 0);
    const avg = Math.round((totalCatScore / totalSubmissions) * 10) / 10;
    const pct = Math.round((avg / cat.max) * 100);
    return { label: cat.label, score: avg, max: cat.max, pct };
  });

  // Determine weakest category from actual submissions
  const weakestCategory =
    totalSubmissions > 0
      ? [...categoryAverages].sort((a, b) => a.pct - b.pct)[0]
      : null;

  return (
    <div className="space-y-6 py-6">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Willkommen</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              แดชบอร์ดประเมินการเขียน (Writing Dashboard)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              ติดตามสถิติและผลการประเมินจากงานเขียนจริงของคุณตามเกณฑ์มาตรฐาน CEFR (A1–C1)
            </p>
          </div>

          <button
            onClick={() => onStartWriting()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            <span>เริ่มทำข้อสอบกลางแบบสุ่ม</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated CEFR Level */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>ระดับ CEFR ปัจจุบัน</span>
            {confidence ? (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                {confidence === 'high' ? 'มั่นใจสูง' : 'ระดับเริ่มต้น'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                รอประเมิน
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-blue-600">
              {currentCEFR || '—'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalSubmissions > 0 ? 'จากงานล่าสุด' : 'ยังไม่มีข้อมูล'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            {totalSubmissions > 0
              ? 'คำนวณตามเกณฑ์ Goethe & Telc จากงานเขียนล่าสุดของคุณ'
              : 'ส่งงานเขียนชิ้นแรกเพื่อเริ่มคำนวณระดับ CEFR'}
          </p>
        </div>

        {/* Average Score */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>คะแนนเฉลี่ย (100 Pkt.)</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-slate-900">
              {averageScore !== null ? averageScore : '—'}
            </span>
            {averageScore !== null && (
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                  averageScore >= 85
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : averageScore >= 70
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {averageScore >= 85 ? 'Grade A' : averageScore >= 70 ? 'Grade B' : 'Grade C'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            {totalSubmissions > 0
              ? `คำนวณจากงานเขียนจริงของคุณทั้งหมด ${totalSubmissions} ชิ้น`
              : 'ยังไม่มีคะแนนสะสม เริ่มเขียนงานแรกเพื่อบันทึกสถิติ'}
          </p>
        </div>

        {/* Total Submissions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>จำนวนงานที่ส่งประเมิน</span>
            <BarChart2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-slate-900">
              {totalSubmissions}
            </span>
            <span className="text-xs text-slate-500">บทความ</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            บันทึกในบัญชีของคุณอย่างปลอดภัย
          </p>
        </div>

        {/* Primary Focus Area */}
        <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>จุดสำคัญที่ควรพัฒนา</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-950 line-clamp-2 pt-1 leading-snug">
            {mainWeakness || (totalSubmissions === 0 ? 'รอวิเคราะห์หลังส่งงานเขียนแรก' : 'พัฒนาต่อยอดความสละสลวย')}
          </p>
          <button
            onClick={() => onOpenLesson('lesson-nebensaetze')}
            className="text-xs text-amber-800 font-bold hover:text-amber-950 flex items-center gap-1 pt-1 cursor-pointer transition-colors"
          >
            <span>เปิดบทเรียนแนะนำ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Category Performance + Recommended Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                สมรรถนะรายด้านตาม Rubric (Performance by Category)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalSubmissions > 0
                  ? `ประเมินเฉลี่ยจากงานเขียนจริง ${totalSubmissions} ชิ้น`
                  : 'แสดงผลเฉลี่ยเมื่อคุณส่งงานเขียนจริงเข้าระบบ'}
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">เกณฑ์เต็ม 100</span>
          </div>

          {totalSubmissions === 0 ? (
            <div className="py-8 px-6 text-center space-y-3 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
              <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">ยังไม่มีสถิติสมรรถนะ</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  ระบบไม่แสดงข้อมูลเท็จใดๆ เมื่อคุณเขียนและส่งบทความชิ้นแรก เกณฑ์คะแนนทั้ง 7 หมวด (Aufgabenbewältigung, Grammatik, Wortschatz ฯลฯ) จะถูกประมวลผลทันที
                </p>
              </div>
              <button
                onClick={() => onStartWriting()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>เขียนบทความแรกของคุณ</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryAverages.map((cat, idx) => {
                const isWeak = weakestCategory && weakestCategory.label === cat.label;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {isWeak && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                            ควรเน้น
                          </span>
                        )}
                        <span className="text-slate-500 font-medium">
                          <strong className="text-slate-900">{cat.score}</strong> / {cat.max} คะแนน ({cat.pct}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.pct >= 85
                            ? 'bg-blue-600'
                            : cat.pct >= 70
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(cat.pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-xs text-slate-600 flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>สรุปผลการวิเคราะห์:</strong>{' '}
                  {weakestCategory
                    ? `หมวดที่ควรเน้นฝึกฝนเพิ่มเติมคือ ${weakestCategory.label.split(' ')[0]} ซึ่งจะช่วยเพิ่มคะแนนรวมได้ชัดเจนที่สุด`
                    : 'ฝึกเขียนอย่างต่อเนื่องเพื่อรักษาระดับความแม่นยำทางไวยากรณ์'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Learning + Quick Tasks (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>บทเรียนแนะนำสำหรับคุณ</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/70 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Niveau B1/B2
              </span>
              <h3 className="font-bold text-sm text-slate-900">
                ตำแหน่งคำในอนุประโยค (Nebensätze)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                เรียนรู้กฎการย้ายกริยาไปท้ายประโยคหลัง weil, obwohl, dass เพื่อแก้ข้อผิดพลาดที่พบบ่อยที่สุด
              </p>
            </div>

            <button
              onClick={() => onOpenLesson('lesson-nebensaetze')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>เริ่มเรียนบทเรียนนี้</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick task suggestions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900">
              โจทย์ฝึกเขียนที่แนะนำ
            </h3>

            {tasks.slice(0, 2).map((task) => (
              <div
                key={task.id}
                onClick={() => onStartWriting(task)}
                className="p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-blue-600">
                    {task.cefr_level} • {task.category}
                  </span>
                  <span className="text-slate-400">{task.min_words}–{task.max_words} คำ</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {task.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ประวัติการส่งงานเขียนจริง (Actual Submissions)
            </h2>
            <p className="text-xs text-slate-500">
              บันทึกเฉพาะงานเขียนที่เกิดขึ้นจริงจากบัญชีของคุณเท่านั้น ไม่มีข้อมูลจำลอง
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <PenLine className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-semibold">ยังไม่มีประวัติการส่งงานเขียน</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              เมื่อคุณเขียนและส่งบทความ ระบบจะบันทึกผลการตรวจและสถิติคะแนนที่นี่
            </p>
            <button
              onClick={() => onStartWriting()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              เริ่มเขียนชิ้นแรก (Start Writing)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">หัวข้อโจทย์</th>
                  <th className="py-3 px-4">ระดับ</th>
                  <th className="py-3 px-4">จำนวนคำ</th>
                  <th className="py-3 px-4">คะแนน</th>
                  <th className="py-3 px-4">เกรด</th>
                  <th className="py-3 px-4">CEFR</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => onViewAssessment(sub)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {sub.task_title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200/60">
                        {sub.task_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {sub.word_count} คำ
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sub.total_score} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                          sub.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : sub.grade === 'B'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        Grade {sub.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">
                      {sub.cefr_estimate}
                    </td>
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onViewAssessment(sub)}
                          className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>ดูผลตรวจ</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteId === sub.id ? (
                          <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-1.5 py-0.5">
                            <button
                              type="button"
                              disabled={deletingId === sub.id}
                              onClick={() => handleConfirmDelete(sub.id)}
                              aria-label={`ยืนยันลบประวัติ ${sub.task_title}`}
                              className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-[11px] cursor-pointer"
                            >
                              {deletingId === sub.id ? 'กำลังลบ...' : 'ยืนยันลบ'}
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === sub.id}
                              onClick={() => setConfirmDeleteId(null)}
                              aria-label={`ยกเลิกการลบ ${sub.task_title}`}
                              className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 font-semibold text-[11px] border border-slate-200 cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(sub.id)}
                            aria-label={`ลบประวัติ ${sub.task_title}`}
                            title="ลบประวัติชิ้นนี้"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
