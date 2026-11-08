import React from 'react';
import {
  PenTool,
  CheckCircle2,
  BarChart3,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { WritingTask } from '../types';

interface LandingViewProps {
  onStartWriting: (task?: WritingTask) => void;
  tasks: WritingTask[];
  onOpenRubric: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartWriting,
  tasks,
  onOpenRubric,
}) => {
  const b1Tasks = tasks.filter((t) => t.cefr_level === 'B1');
  const b2Tasks = tasks.filter((t) => t.cefr_level === 'B2');
  const c1Tasks = tasks.filter((t) => t.cefr_level === 'C1');

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>CEFR Companion Volume 2020 Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            ระบบประเมินงานเขียนภาษาเยอรมัน{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              ระดับ B1, B2 และ C1
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            ฝึกเขียนข้อสอบภาษาเยอรมันด้วยเกณฑ์วิชาการแท้จริง 100 คะแนนเต็ม วิเคราะห์ข้อผิดพลาดทุกจุดอย่างแม่นยำ พร้อมคำอธิบายหลักไวยากรณ์เป็นภาษาไทย และพัฒนาการเขียนด้วยตัวอย่างระดับ B2 และ C1
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onStartWriting()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              <PenTool className="w-5 h-5" />
              <span>เริ่มฝึกเขียนทันที (Start Writing)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenRubric}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm px-5 py-3.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>ดูเกณฑ์ประเมิน 100 คะแนน</span>
            </button>
          </div>

          {/* Academic Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <span className="block text-white font-bold text-sm">100 คะแนนเต็ม</span>
              <span>7 หมวดการประเมินอิสระ</span>
            </div>
            <div>
              <span className="block text-white font-bold text-sm">Strict Academic</span>
              <span>ตรวจงานต้นฉบับของผู้เรียน</span>
            </div>
            <div>
              <span className="block text-white font-bold text-sm">คำอธิบายภาษาไทย</span>
              <span>เข้าใจเหตุผลและกฎที่ถูกต้อง</span>
            </div>
            <div>
              <span className="block text-white font-bold text-sm">3 โมเดลงานเขียน</span>
              <span>Corrected, B2, C1 Model</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Assessment Pipeline */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            กระบวนการประเมิน 4 ขั้นตอน (AI Assessment Pipeline)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            ระบบทำงานเป็นขั้นตอนทางวิชาการตาม Technical Specification โดยไม่รวมคำสั่งไว้ในขั้นตอนเดียว
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              Text Analysis
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              วิเคราะห์ความยาว จำนวนคำ โครงสร้างประโยค และความสอดคล้องกับข้อกำหนดของโจทย์
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              Error Detection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              จำแนกข้อผิดพลาดตาม Taxonomy (GRM, VOC, COH, MEC) พร้อมระบุตำแหน่งและคำอธิบาย
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              CEFR & Rubric
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              ให้คะแนน 7 หมวด 100 คะแนนเต็ม คำนวณเกรด A–F และประเมิน CEFR Profile รายทักษะ
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
              4
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              Teaching & Models
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              สอนกฎไวยากรณ์ แนะนำแบบฝึกหัด และสร้างข้อความปรับปรุง B2 และ C1 Model
            </p>
          </div>
        </div>
      </section>

      {/* Select Practice Task Directly */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              เลือกโจทย์ฝึกเขียนตามระดับ (Writing Tasks)
            </h2>
            <p className="text-xs text-slate-500">
              รองรับ 6 ประเภทข้อความ: E-Mail, Brief, Stellungnahme, Erörterung, Bericht, Beschwerde
            </p>
          </div>
          <button
            onClick={() => onStartWriting()}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* B1 Task Card */}
          {b1Tasks[0] && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Niveau B1
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{b1Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                  {b1Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {b1Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {b1Tasks[0].min_words}–{b1Tasks[0].max_words} Wörter • {b1Tasks[0].time_limit_minutes} Min.
                </span>
                <button
                  onClick={() => onStartWriting(b1Tasks[0])}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold transition-colors"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}

          {/* B2 Task Card */}
          {b2Tasks[0] && (
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/40 dark:border-blue-500/40 rounded-xl p-6 shadow-md hover:border-blue-500 transition-all flex flex-col justify-between relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                ยอดนิยม (Popular)
              </span>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    Niveau B2
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{b2Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                  {b2Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {b2Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {b2Tasks[0].min_words}–{b2Tasks[0].max_words} Wörter • {b2Tasks[0].time_limit_minutes} Min.
                </span>
                <button
                  onClick={() => onStartWriting(b2Tasks[0])}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}

          {/* C1 Task Card */}
          {c1Tasks[0] && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-purple-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                    Niveau C1
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{c1Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                  {c1Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {c1Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {c1Tasks[0].min_words}–{c1Tasks[0].max_words} Wörter • {c1Tasks[0].time_limit_minutes} Min.
                </span>
                <button
                  onClick={() => onStartWriting(c1Tasks[0])}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold transition-colors"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rubric Summary Banner */}
      <section className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              เกณฑ์การประเมิน 100 คะแนนเต็ม (Assessment Rubric)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Aufgabenbewältigung (20) • Inhalt & Entwicklung (15) • Wortschatz (20) • Grammatik (20) • Kohärenz & Kohäsion (15) • Register & Stil (5) • Rechtschreibung (5)
            </p>
          </div>
          <button
            onClick={onOpenRubric}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shrink-0"
          >
            ดูรายละเอียดเกณฑ์ทั้งหมด
          </button>
        </div>
      </section>
    </div>
  );
};
