import React from 'react';
import {
  PenLine,
  Trophy,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { AssessmentResult, WritingTask } from '../types';

interface DashboardViewProps {
  submissions: AssessmentResult[];
  onStartWriting: (task?: WritingTask) => void;
  onViewAssessment: (result: AssessmentResult) => void;
  onOpenLesson: (lessonId: string) => void;
  tasks: WritingTask[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  submissions,
  onStartWriting,
  onViewAssessment,
  onOpenLesson,
  tasks,
}) => {
  const totalSubmissions = submissions.length;
  const averageScore =
    totalSubmissions > 0
      ? Math.round(
          (submissions.reduce((acc, curr) => acc + curr.total_score, 0) / totalSubmissions) * 10
        ) / 10
      : 82.0;

  const latestSubmission = submissions[0];
  const currentCEFR = latestSubmission?.cefr_estimate || 'B2';
  const confidence = latestSubmission?.cefr_confidence || 'high';
  const mainWeakness = latestSubmission?.main_weakness_th || 'Nebensätze (ตำแหน่งคำกริยาในอนุประโยค) และ Kasus';

  const categoryAverages = [
    { label: 'Aufgabenbewältigung (ตอบตรงโจทย์)', score: 18, max: 20, pct: 90 },
    { label: 'Inhalt & Entwicklung (เนื้อหาและการลำดับ)', score: 13, max: 15, pct: 86.6 },
    { label: 'Wortschatz (คลังคำศัพท์วิชาการ)', score: 16.5, max: 20, pct: 82.5 },
    { label: 'Grammatik (ความถูกต้องของไวยากรณ์)', score: 14, max: 20, pct: 70 },
    { label: 'Kohärenz & Kohäsion (การเชื่อมโยงความ)', score: 13, max: 15, pct: 86.6 },
    { label: 'Register & Stil (ระดับภาษาและสไตล์)', score: 4.2, max: 5, pct: 84 },
    { label: 'Rechtschreibung (การสะกดและเครื่องหมาย)', score: 3.8, max: 5, pct: 76 },
  ];

  return (
    <div className="space-y-6 py-6">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Willkommen zurück</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              แดชบอร์ดพัฒนาการเขียน (Writing Dashboard)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              ติดตามคะแนนตามเกณฑ์วิชาการ CEFR วิเคราะห์จุดแข็งและจุดที่ควรปรับปรุงเพื่อเตรียมพร้อมสำหรับการสอบ B1–C1
            </p>
          </div>

          <button
            onClick={() => onStartWriting()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            <span>เริ่มเขียนงานชิ้นใหม่</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated CEFR Level */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>ระดับ CEFR โดยประมาณ</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
              {confidence === 'high' ? 'มั่นใจสูง' : 'กำลังพัฒนา'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-blue-600">
              {currentCEFR}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Developing Stage
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            สื่อสารได้โครงสร้างชัดเจนตามโจทย์ และมีศักยภาพพัฒนาสู่ระดับถัดไป
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
              {averageScore}
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Grade B
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            ประเมินจากงานเขียนทั้งหมด ({totalSubmissions > 0 ? totalSubmissions : 1} ชิ้นงาน)
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
              {totalSubmissions > 0 ? totalSubmissions : 1}
            </span>
            <span className="text-xs text-slate-500">บทความ</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            ตรวจตามมาตรฐาน Goethe & Telc Rubrics
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
            {mainWeakness}
          </p>
          <button
            onClick={() => onOpenLesson('lesson-nebensaetze')}
            className="text-xs text-amber-800 font-bold hover:text-amber-950 flex items-center gap-1 pt-1 cursor-pointer transition-colors"
          >
            <span>เปิดบทเรียนทบทวนเรื่องนี้</span>
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
                การกระจายคะแนนทั้ง 7 หมวด เพื่อระบุจุดแข็งและจุดที่ต้องปรับปรุง
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">เกณฑ์เต็ม 100</span>
          </div>

          <div className="space-y-4">
            {categoryAverages.map((cat, idx) => {
              const isWeak = cat.label.includes('Grammatik') || cat.pct < 75;
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
                        <strong className="text-slate-900">{cat.score}</strong> / {cat.max} คะแนน ({Math.round(cat.pct)}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.pct >= 85
                          ? 'bg-blue-600'
                          : cat.pct >= 75
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-slate-600 flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>คำแนะนำจากระบบ:</strong> ไวยากรณ์ (Grammatik) คือจุดที่ทำให้คะแนนรวมดรอปมากที่สุด การแก้ไขตำแหน่งคำใน Nebensätze และเพศคำนามจะยกระดับคะแนนขึ้นสู่ระดับ A ได้อย่างรวดเร็ว
            </span>
          </div>
        </div>

        {/* Personalized Next Learning Step (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>บทเรียนแนะนำประจำสัปดาห์</span>
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
              โจทย์แนะนำสำหรับฝึกซ้อม
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
              ประวัติการส่งงานเขียนล่าสุด (Recent Submissions)
            </h2>
            <p className="text-xs text-slate-500">คลิกที่บทความเพื่อดูรายงานผลการประเมินและการแก้ไขอย่างละเอียด</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <PenLine className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">ยังไม่มีประวัติการส่งงานเขียน</p>
            <button
              onClick={() => onStartWriting()}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
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
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                        ดูผลตรวจ <ChevronRight className="w-3.5 h-3.5" />
                      </span>
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
