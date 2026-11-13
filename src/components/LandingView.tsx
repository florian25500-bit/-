import React from 'react';
import {
  PenLine,
  CheckCircle2,
  BarChart3,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Award,
  Clock,
  FileCheck2,
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
  const a1Tasks = tasks.filter((t) => t.cefr_level === 'A1');
  const a2Tasks = tasks.filter((t) => t.cefr_level === 'A2');
  const b1Tasks = tasks.filter((t) => t.cefr_level === 'B1');
  const b2Tasks = tasks.filter((t) => t.cefr_level === 'B2');
  const c1Tasks = tasks.filter((t) => t.cefr_level === 'C1');

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section - Soft, Eye-Friendly Academic Canvas */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>CEFR Companion Volume 2020 Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            ระบบประเมินงานเขียนภาษาเยอรมัน{' '}
            <span className="text-blue-600">
              ระดับ A1 – C1
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
            ฝึกเขียนข้อสอบภาษาเยอรมันด้วยเกณฑ์วิชาการแท้จริง 100 คะแนนเต็ม ปรับความยากของโจทย์ตรงตามระดับที่สอบ (A1, A2, B1, B2 และ C1) พร้อมวิเคราะห์ข้อผิดพลาดและอธิบายหลักไวยากรณ์เป็นภาษาไทย
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => onStartWriting()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>เริ่มฝึกเขียนทันที (Start Writing)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenRubric}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>ดูเกณฑ์ประเมิน 100 คะแนน</span>
            </button>
          </div>

          {/* Academic Features Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-100 text-xs">
            <div>
              <span className="block text-slate-900 font-bold text-sm">100 คะแนนเต็ม</span>
              <span className="text-slate-500">7 หมวดการประเมินอิสระ</span>
            </div>
            <div>
              <span className="block text-slate-900 font-bold text-sm">Strict Academic</span>
              <span className="text-slate-500">ประเมินงานต้นฉบับจริง</span>
            </div>
            <div>
              <span className="block text-slate-900 font-bold text-sm">คำอธิบายภาษาไทย</span>
              <span className="text-slate-500">เข้าใจเหตุผลและกฎชัดเจน</span>
            </div>
            <div>
              <span className="block text-slate-900 font-bold text-sm">3 โมเดลงานเขียน</span>
              <span className="text-slate-500">Corrected, B2, C1 Model</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Assessment Pipeline */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            กระบวนการประเมิน 4 ขั้นตอน (AI Assessment Pipeline)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            วิเคราะห์อย่างเป็นขั้นตอนทางวิชาการตามมาตรฐานยุโรป ไม่รวบรัดตัดสิน
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-100">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Text Analysis
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              วิเคราะห์ความยาว จำนวนคำ โครงสร้างประโยค และความสอดคล้องกับข้อกำหนดของโจทย์
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center border border-amber-100">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Error Detection
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              จำแนกข้อผิดพลาดตาม Taxonomy (GRM, VOC, COH, MEC) พร้อมระบุตำแหน่งและคำอธิบาย
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center border border-emerald-100">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              CEFR & Rubric
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ให้คะแนน 7 หมวด 100 คะแนนเต็ม คำนวณเกรด A–F และประเมิน CEFR Profile รายทักษะ
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-100">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Teaching & Models
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              สอนกฎไวยากรณ์ แนะนำแบบฝึกหัด และสร้างข้อความปรับปรุง B2 และ C1 Model
            </p>
          </div>
        </div>
      </section>

      {/* Select Practice Task Directly */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              เลือกโจทย์ฝึกเขียนตามระดับ (Writing Tasks)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              รองรับ 6 รูปแบบ: E-Mail, Brief, Stellungnahme, Erörterung, Bericht, Beschwerde
            </p>
          </div>
          <button
            onClick={() => onStartWriting()}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* A1 Task Card */}
          {a1Tasks[0] && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Niveau A1
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{a1Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {a1Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {a1Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {a1Tasks[0].min_words}–{a1Tasks[0].max_words} คำ • {a1Tasks[0].time_limit_minutes} นาที
                </span>
                <button
                  onClick={() => onStartWriting(a1Tasks[0])}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}

          {/* A2 Task Card */}
          {a2Tasks[0] && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-cyan-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Niveau A2
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{a2Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {a2Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {a2Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {a2Tasks[0].min_words}–{a2Tasks[0].max_words} คำ • {a2Tasks[0].time_limit_minutes} นาที
                </span>
                <button
                  onClick={() => onStartWriting(a2Tasks[0])}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}

          {/* B1 Task Card */}
          {b1Tasks[0] && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Niveau B1
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{b1Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {b1Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {b1Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {b1Tasks[0].min_words}–{b1Tasks[0].max_words} คำ • {b1Tasks[0].time_limit_minutes} นาที
                </span>
                <button
                  onClick={() => onStartWriting(b1Tasks[0])}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}

          {/* B2 Task Card */}
          {b2Tasks[0] && (
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider shadow-2xs">
                ยอดนิยม (Popular)
              </span>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Niveau B2
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{b2Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {b2Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {b2Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {b2Tasks[0].min_words}–{b2Tasks[0].max_words} คำ • {b2Tasks[0].time_limit_minutes} นาที
                </span>
                <button
                  onClick={() => onStartWriting(b2Tasks[0])}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}

          {/* C1 Task Card */}
          {c1Tasks[0] && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Niveau C1
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{c1Tasks[0].category}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {c1Tasks[0].title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {c1Tasks[0].instructions}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {c1Tasks[0].min_words}–{c1Tasks[0].max_words} คำ • {c1Tasks[0].time_limit_minutes} นาที
                </span>
                <button
                  onClick={() => onStartWriting(c1Tasks[0])}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  เลือกข้อสอบ
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rubric Summary Callout */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              เกณฑ์การประเมิน 100 คะแนนเต็ม (Assessment Rubric)
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Aufgabenbewältigung (20) • Inhalt & Entwicklung (15) • Wortschatz (20) • Grammatik (20) • Kohärenz & Kohäsion (15) • Register & Stil (5) • Rechtschreibung (5)
            </p>
          </div>
          <button
            onClick={onOpenRubric}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            ดูรายละเอียดเกณฑ์ทั้งหมด
          </button>
        </div>
      </section>
    </div>
  );
};
