import React from 'react';
import {
  PenTool,
  Trophy,
  BarChart2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Calendar,
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

  // Derive latest profile from recent submission, or defaults for demo
  const latestSubmission = submissions[0];
  const currentCEFR = latestSubmission?.cefr_estimate || 'B2';
  const confidence = latestSubmission?.cefr_confidence || 'high';
  const mainWeakness = latestSubmission?.main_weakness_th || 'Nebensätze (ตำแหน่งกริยาในอนุประโยค) และ Kasus';

  // Category average scores
  const categoryAverages = [
    { label: 'Aufgabenbewältigung', score: 18, max: 20, pct: 90 },
    { label: 'Inhalt & Entwicklung', score: 13, max: 15, pct: 86.6 },
    { label: 'Wortschatz', score: 16.5, max: 20, pct: 82.5 },
    { label: 'Grammatik', score: 14, max: 20, pct: 70 },
    { label: 'Kohärenz & Kohäsion', score: 13, max: 15, pct: 86.6 },
    { label: 'Register & Stil', score: 4.2, max: 5, pct: 84 },
    { label: 'Rechtschreibung', score: 3.8, max: 5, pct: 76 },
  ];

  return (
    <div className="space-y-8 py-6">
      {/* Top Welcome & Launch Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Willkommen zurück
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            แดชบอร์ดพัฒนาการเขียน (Writing Dashboard)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามผลการประเมินตามมาตรฐาน CEFR และวิเคราะห์จุดอ่อนเพื่อยกระดับงานเขียน
          </p>
        </div>

        <button
          onClick={() => onStartWriting()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <PenTool className="w-4 h-4" />
          <span>เขียนงานชิ้นใหม่ (Start New Task)</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CEFR Profile */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Estimated CEFR Profile</span>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-semibold text-[10px]">
              {confidence === 'high' ? 'High Confidence' : 'Developing'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {currentCEFR}
            </span>
            <span className="text-xs text-slate-500 font-medium">Developing Stage</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            พร้อมสำหรับการสื่อสารที่ชัดเจนและมีโครงสร้าง มีจุดพัฒนาด้านไวยากรณ์ขั้นสูง
          </p>
        </div>

        {/* Average Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>คะแนนเฉลี่ย (100 Pkt.)</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {averageScore}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              Grade B
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            คำนวณจากงานเขียนที่ประเมินสำเร็จ ({totalSubmissions > 0 ? totalSubmissions : 1} ชิ้นงาน)
          </p>
        </div>

        {/* Total Submissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>จำนวนงานที่ส่ง (Submissions)</span>
            <BarChart2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalSubmissions > 0 ? totalSubmissions : 1}
            </span>
            <span className="text-xs text-slate-500">บทความ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            ประเมินตามเกณฑ์วิชาการ CEFR B1–C1
          </p>
        </div>

        {/* Primary Focus Area */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>จุดที่ต้องระวัง (Weakness)</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 line-clamp-2 mt-1">
            {mainWeakness}
          </p>
          <button
            onClick={() => onOpenLesson('lesson-nebensaetze')}
            className="text-[11px] text-amber-800 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 mt-3"
          >
            <span>ทบทวนบทเรียนนี้ทันที</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Category Performance + Recommended Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                สมรรถนะรายด้านตาม Rubric (Performance by Category)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                การกระจายคะแนนทั้ง 7 หมวด เพื่อระบุจุดแข็งและจุดที่ต้องพัฒนาอย่างตรงเป้า
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">เกณฑ์เต็ม 100</span>
          </div>

          <div className="space-y-4">
            {categoryAverages.map((cat, idx) => {
              const isWeak = cat.label === 'Grammatik' || cat.pct < 75;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {isWeak && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/40 px-1.5 py-0.2 rounded">
                          Focus
                        </span>
                      )}
                      <span className="text-slate-500 font-medium">
                        <strong className="text-slate-900 dark:text-white">{cat.score}</strong> / {cat.max} คะแนน ({Math.round(cat.pct)}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
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

          <div className="pt-2 text-xs text-slate-500 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>คำแนะนำจากระบบ:</strong> ไวยากรณ์ (Grammatik) คือจุดที่ทำให้คะแนนรวมดรอปมากที่สุด การแก้ไขตำแหน่งคำใน Nebensätze จะสามารถยกคะแนนขึ้นสู่เกรด A ได้ทันที
            </span>
          </div>
        </div>

        {/* Personalized Next Learning Step (1 col) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Recommended Next Step</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              บทเรียนแนะนำประจำสัปดาห์
            </h3>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-blue-200">Niveau B1/B2</span>
              <h4 className="font-bold text-sm text-white">
                ตำแหน่งคำในอนุประโยค (Nebensätze)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                เรียนรู้กฎการย้ายกริยาไปท้ายประโยคหลัง weil, obwohl, dass เพื่อแก้ข้อผิดพลาดที่พบบ่อยที่สุด
              </p>
            </div>

            <button
              onClick={() => onOpenLesson('lesson-nebensaetze')}
              className="w-full py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow"
            >
              <span>เริ่มเรียนและทำแบบฝึกหัด</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick task launch */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              โจทย์ที่แนะนำสำหรับฝึกซ้อม
            </h3>

            {tasks.slice(0, 2).map((task) => (
              <div
                key={task.id}
                onClick={() => onStartWriting(task)}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 group"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {task.cefr_level} • {task.category}
                  </span>
                  <span className="text-slate-400">{task.min_words}–{task.max_words} Wörter</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {task.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              งานเขียนล่าสุด (Recent Submissions)
            </h2>
            <p className="text-xs text-slate-500">คลิกที่บทความเพื่อดูผลการประเมินและการแก้ไขอย่างละเอียด</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <PenTool className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">ยังไม่มีประวัติการส่งงานเขียน</p>
            <button
              onClick={() => onStartWriting()}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              เริ่มเขียนชิ้นแรก (Start Writing)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">หัวข้อข้อสอบ</th>
                  <th className="py-3 px-4">ระดับ</th>
                  <th className="py-3 px-4">จำนวนคำ</th>
                  <th className="py-3 px-4">คะแนนรวม</th>
                  <th className="py-3 px-4">เกรด</th>
                  <th className="py-3 px-4">CEFR</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => onViewAssessment(sub)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {sub.task_title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {sub.task_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {sub.word_count} คำ
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {sub.total_score} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          sub.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.grade === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Grade {sub.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400">
                      {sub.cefr_estimate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        ดูผลตรวจ
                      </button>
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
