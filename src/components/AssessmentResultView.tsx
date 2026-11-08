import React, { useState } from 'react';
import {
  Award,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Printer,
  Copy,
  Check,
  BookmarkPlus,
  HelpCircle,
  FileText,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { AssessmentResult, AssessmentError, CategoryScoreItem } from '../types';

interface AssessmentResultViewProps {
  assessment: AssessmentResult;
  onOpenLesson: (lessonId: string) => void;
  onSaveToVocabulary: (word: string, meaning: string, example: string) => void;
  onStartNewWriting: () => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  assessment,
  onOpenLesson,
  onSaveToVocabulary,
  onStartNewWriting,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'interactive' | 'errors' | 'versions' | 'lessons' | 'rubric'>('overview');
  const [selectedError, setSelectedError] = useState<AssessmentError | null>(
    assessment.errors.length > 0 ? assessment.errors[0] : null
  );
  const [versionTab, setVersionTab] = useState<'corrected' | 'b2_improved' | 'c1_model'>('corrected');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [savedVocabId, setSavedVocabId] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveWord = (err: AssessmentError) => {
    const word = err.corrected_text.split(' ')[0] || err.corrected_text;
    onSaveToVocabulary(word, err.explanation_th, err.examples[0]?.german || err.corrected_text);
    setSavedVocabId(err.id);
    setTimeout(() => setSavedVocabId(null), 2500);
  };

  // Helper to get color classes for error categories
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'GRAMMAR':
        return {
          bg: 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800',
          badge: 'bg-red-500 text-white',
          highlight: 'bg-red-200/80 dark:bg-red-900/60 border-b-2 border-red-500 text-red-950 dark:text-red-100 cursor-pointer',
        };
      case 'VOCABULARY':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800',
          badge: 'bg-amber-500 text-white',
          highlight: 'bg-amber-200/80 dark:bg-amber-900/60 border-b-2 border-amber-500 text-amber-950 dark:text-amber-100 cursor-pointer',
        };
      case 'COHESION':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800',
          badge: 'bg-yellow-600 text-white',
          highlight: 'bg-yellow-200/80 dark:bg-yellow-900/60 border-b-2 border-yellow-500 text-yellow-950 dark:text-yellow-100 cursor-pointer',
        };
      case 'STYLE':
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800',
          badge: 'bg-blue-500 text-white',
          highlight: 'bg-blue-200/80 dark:bg-blue-900/60 border-b-2 border-blue-500 text-blue-950 dark:text-blue-100 cursor-pointer',
        };
      default: // MECHANICS
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          badge: 'bg-slate-600 text-white',
          highlight: 'bg-slate-200/90 dark:bg-slate-800 border-b-2 border-slate-500 text-slate-900 dark:text-slate-100 cursor-pointer',
        };
    }
  };

  // Render text with interactive highlighted spans
  const renderHighlightedText = () => {
    const raw = assessment.original_text;
    if (assessment.errors.length === 0) {
      return <p className="leading-relaxed whitespace-pre-wrap">{raw}</p>;
    }

    // Sort errors by start_offset or occurrence
    const sorted = [...assessment.errors]
      .filter((e) => e.original_text && raw.includes(e.original_text))
      .sort((a, b) => raw.indexOf(a.original_text) - raw.indexOf(b.original_text));

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((err, i) => {
      const idx = raw.indexOf(err.original_text, lastIndex);
      if (idx !== -1) {
        if (idx > lastIndex) {
          elements.push(
            <span key={`text-${i}`}>
              {raw.substring(lastIndex, idx)}
            </span>
          );
        }

        const colors = getCategoryColor(err.category);
        const isSelected = selectedError?.id === err.id;

        elements.push(
          <mark
            key={`err-${err.id}-${i}`}
            onClick={() => setSelectedError(err)}
            className={`px-1 py-0.5 rounded transition-all ${colors.highlight} ${
              isSelected ? 'ring-2 ring-blue-500 font-semibold shadow-sm' : ''
            }`}
            title={`คลิกเพื่อดูการแก้ไข: ${err.explanation_th}`}
          >
            {err.original_text}
          </mark>
        );

        lastIndex = idx + err.original_text.length;
      }
    });

    if (lastIndex < raw.length) {
      elements.push(<span key="text-end">{raw.substring(lastIndex)}</span>);
    }

    return (
      <div className="leading-relaxed whitespace-pre-wrap font-sans text-sm text-slate-900 dark:text-slate-100">
        {elements}
      </div>
    );
  };

  return (
    <div className="space-y-6 py-4">
      {/* Top Academic Report Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                รายงานผลการประเมิน (Assessment Report)
              </span>
              <span className="text-xs text-slate-400">
                {new Date(assessment.created_at).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {assessment.task_title}
            </h1>
            <p className="text-xs text-slate-500">
              ประเภท: {assessment.task_category} • ระดับเป้าหมาย: Niveau {assessment.task_level} • ความยาว: {assessment.word_count} คำ
            </p>
          </div>

          {/* Key Score Badges */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Total Score 100 */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                คะแนนรวม (Rubric)
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {assessment.total_score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Grade Badge */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                เกรด (Grade)
              </span>
              <span
                className={`text-2xl font-black block mt-0.5 ${
                  assessment.grade === 'A'
                    ? 'text-emerald-600'
                    : assessment.grade === 'B'
                    ? 'text-blue-600'
                    : 'text-amber-600'
                }`}
              >
                {assessment.grade}
              </span>
            </div>

            {/* Estimated CEFR Profile */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl px-5 py-2.5 text-center border border-blue-700 shadow-sm min-w-[130px]">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider font-bold block">
                CEFR Estimate
              </span>
              <span className="text-2xl font-black block mt-0.5 text-amber-300">
                {assessment.cefr_estimate}
              </span>
              <span className="text-[9px] text-blue-200 font-medium block">
                {assessment.cefr_confidence === 'high' ? 'High Confidence' : 'Developing'}
              </span>
            </div>
          </div>
        </div>

        {/* Print / Actions Bar */}
        <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <p className="text-slate-500 text-[11px]">
            {assessment.cefr_summary_th}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์รายงาน (Print)</span>
            </button>
            <button
              onClick={onStartNewWriting}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors"
            >
              ฝึกเขียนโจทย์อื่น
            </button>
          </div>
        </div>
      </div>

      {/* 6 Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>ภาพรวมคะแนน (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('interactive')}
          className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0 relative ${
            activeTab === 'interactive'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>ไฮไลต์ข้อผิดพลาด (Interactive Text)</span>
          {assessment.errors.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
              {assessment.errors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'errors'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>วิเคราะห์ข้อผิดพลาด (Error Taxonomy)</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'versions'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3 โมเดลงานเขียน (Writing Versions)</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'lessons'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>บทเรียนที่แนะนำ (Lessons)</span>
        </button>

        <button
          onClick={() => setActiveTab('rubric')}
          className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'rubric'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>เกณฑ์ Rubric 100 คะแนน</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Strengths & Weaknesses row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>จุดแข็งของงานเขียน (Stärken)</span>
              </h3>
              <ul className="space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
                {assessment.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>จุดที่ต้องปรับปรุง (Schwächen)</span>
              </h3>
              <ul className="space-y-2 text-xs text-amber-900 dark:text-amber-200">
                {assessment.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7 Category Scores Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  รายละเอียดคะแนนทั้ง 7 หมวด (Kriterienbewertung)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ประเมินอย่างเป็นกลางตามเกณฑ์ Rubric 100 คะแนนเต็ม
                </p>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                คะแนนรวม: {assessment.total_score} / 100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.category_scores.map((cat, idx) => {
                const pct = Math.round((cat.score / cat.max_score) * 100);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {cat.label_de}
                        </span>
                        <span className="text-[10px] text-slate-500">{cat.label_en}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {cat.score}
                        </span>
                        <span className="text-slate-400 text-xs"> / {cat.max_score}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {cat.feedback_th}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CEFR Profile Details by Skill */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              CEFR Skill Profile (สมรรถนะรายทักษะตามเกณฑ์ยุโรป)
            </h3>
            <p className="text-xs text-slate-500">
              ระบบวิเคราะห์ระดับย่อย B1, B1+, B2, B2+, C1 เพื่อสะท้อนระดับที่แท้จริงของผู้เรียน
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {Object.entries(assessment.cefr_profile).map(([skill, lvl], i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center"
                >
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase truncate">
                    {skill.replace('_', ' ')}
                  </span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400 block mt-1">
                    {lvl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE HIGHLIGHTS & ERROR INSPECTOR */}
      {activeTab === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Original Text with interactive color highlights (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  ข้อความต้นฉบับพร้อมไฮไลต์ (Original Writing)
                </h3>
                <p className="text-[11px] text-slate-500">
                  คลิกที่คำหรือวลีที่มีไฮไลต์เพื่อดูคำอธิบายและการแก้ไขในแถบด้านขวา
                </p>
              </div>
            </div>

            {/* Category Color Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">สัญลักษณ์สี:</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300">
                ■ แดง: ไวยากรณ์ (Grammatik)
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                ■ ส้ม: คำศัพท์ (Wortschatz)
              </span>
              <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border border-yellow-300">
                ■ เหลือง: คำเชื่อม (Kohäsion)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-400">
                ■ เทา: การสะกด/วรรคตอน
              </span>
            </div>

            {/* Highlighted text container */}
            <div className="bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed font-sans">
              {renderHighlightedText()}
            </div>
          </div>

          {/* Right Inspector Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedError ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/30 rounded-2xl p-5 shadow-md space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        getCategoryColor(selectedError.category).badge
                      }`}
                    >
                      {selectedError.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {selectedError.subcategory}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    ความเชื่อมั่น {(selectedError.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Original vs Corrected comparison */}
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60">
                    <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider block">
                      ข้อความเดิมที่ผิด (Original):
                    </span>
                    <span className="text-sm font-semibold text-red-900 dark:text-red-200 line-through">
                      {selectedError.original_text}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      ข้อความที่ถูกต้อง (Korrektur):
                    </span>
                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      {selectedError.corrected_text}
                    </span>
                  </div>
                </div>

                {/* Detailed Thai Explanation */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>คำอธิบายเหตุผล (Erklärung auf Thai):</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedError.explanation_th}
                  </p>
                </div>

                {/* Relevant Grammar Rule */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    กฎไวยากรณ์ที่เกี่ยวข้อง (Regel):
                  </span>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {selectedError.rule}
                  </div>
                </div>

                {/* Examples */}
                {selectedError.examples && selectedError.examples.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      ตัวอย่างประโยคที่ถูกต้อง (Beispiele):
                    </span>
                    {selectedError.examples.map((ex, i) => (
                      <div key={i} className="text-xs bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {ex.german}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ex.thai}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick actions for learner */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleSaveWord(selectedError)}
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{savedVocabId === selectedError.id ? 'บันทึกแล้ว ✓' : 'บันทึกลงคลังคำศัพท์'}</span>
                  </button>

                  <button
                    onClick={() => onOpenLesson('lesson-nebensaetze')}
                    className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>เรียนรู้กฎนี้</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                <p>คลิกที่คำหรือประโยคที่มีไฮไลต์เพื่อดูคำอธิบายที่นี่</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ERROR TAXONOMY TABLE */}
      {activeTab === 'errors' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                ตารางจำแนกข้อผิดพลาดตาม Taxonomy (Error Taxonomy)
              </h3>
              <p className="text-xs text-slate-500">
                พบข้อผิดพลาดทั้งหมด {assessment.errors.length} จุด (ไวยากรณ์, คำศัพท์, คำเชื่อม, วรรคตอน)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">ข้อความเดิม</th>
                  <th className="py-3 px-4">ข้อความที่ถูกต้อง</th>
                  <th className="py-3 px-4">คำอธิบาย (ภาษาไทย)</th>
                  <th className="py-3 px-4">กฎไวยากรณ์</th>
                  <th className="py-3 px-4">ระดับความสำคัญ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assessment.errors.map((err) => (
                  <tr key={err.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(err.category).badge}`}>
                        {err.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-red-600 dark:text-red-400">
                      {err.original_text}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {err.corrected_text}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs">
                      {err.explanation_th}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                      {err.rule}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        err.severity === 'major' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {err.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WRITING VERSIONS (Prompt D) */}
      {activeTab === 'versions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              โมเดลพัฒนาข้อความ 3 เวอร์ชัน (Three Writing Versions)
            </h3>
            <p className="text-xs text-slate-500">
              เรียนรู้วิธีการปรับปรุงข้อความจากงานเดิม โดยเปรียบเทียบระหว่างเวอร์ชันแก้ไข, เวอร์ชัน B2 และเวอร์ชัน C1 ขั้นสูง
            </p>
          </div>

          {/* Academic notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>ข้อกำหนดทางวิชาการ:</strong> เวอร์ชัน B2 และ C1 เป็นโมเดลตัวอย่างเพื่อการเรียนรู้ ไม่ใช่หลักฐานยืนยันคะแนนสอบจริงของผู้เรียน คะแนนของท่านได้รับการประเมินจากงานเขียนต้นฉบับเท่านั้น
            </span>
          </div>

          {/* Version sub-tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setVersionTab('corrected')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                versionTab === 'corrected'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              1. ฉบับแก้ไขข้อผิดพลาด (Corrected Version)
            </button>
            <button
              onClick={() => setVersionTab('b2_improved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                versionTab === 'b2_improved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              2. ฉบับพัฒนาคำศัพท์และคำเชื่อม (B2 Improved Version)
            </button>
            <button
              onClick={() => setVersionTab('c1_model')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                versionTab === 'c1_model'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              3. ฉบับเชิงวิชาการชั้นสูง (C1 Model Version)
            </button>
          </div>

          {/* Version Content */}
          <div className="relative bg-slate-50 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {versionTab === 'corrected' && 'เวอร์ชันแก้ไขไวยากรณ์โดยคงโครงสร้างเดิมของผู้เรียน'}
                {versionTab === 'b2_improved' && 'เวอร์ชันยกระดับคำเชื่อมและคำศัพท์ตามเกณฑ์ B2'}
                {versionTab === 'c1_model' && 'เวอร์ชันเชิงวิชาการระดับ C1 (Nominalstil & FVG)'}
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    versionTab === 'corrected'
                      ? assessment.writing_versions.corrected
                      : versionTab === 'b2_improved'
                      ? assessment.writing_versions.b2_improved
                      : assessment.writing_versions.c1_model,
                    versionTab
                  )
                }
                className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
              >
                {copiedText === versionTab ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === versionTab ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
              </button>
            </div>

            <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
              {versionTab === 'corrected' && assessment.writing_versions.corrected}
              {versionTab === 'b2_improved' && assessment.writing_versions.b2_improved}
              {versionTab === 'c1_model' && assessment.writing_versions.c1_model}
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: LESSONS & RECOMMENDATIONS */}
      {activeTab === 'lessons' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              บทเรียนที่แนะนำเฉพาะบุคคล (Personalized Learning Recommendations)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบคัดเลือกบทเรียนไวยากรณ์ภาษาเยอรมันที่ตรงกับข้อผิดพลาดที่เกิดขึ้นในงานเขียนชิ้นนี้
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessment.learning_recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Recommendation #{idx + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rec.topic}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.reason_th}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    → {rec.action_th}
                  </p>
                </div>

                <button
                  onClick={() => onOpenLesson(rec.lesson_id || 'lesson-nebensaetze')}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>เข้าสู่บทเรียนและทำแบบฝึกหัด</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ASSESSMENT RUBRIC REFERENCE */}
      {activeTab === 'rubric' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              เกณฑ์การประเมิน 100 คะแนนเต็ม (Assessment Rubric Specification)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              อ้างอิงกรอบ CEFR 2020 และแนวทางของ Goethe-Zertifikat / Cambridge Assessment
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">หมวดการประเมิน (Assessment Category)</th>
                  <th className="py-3 px-4 text-center">คะแนนเต็ม</th>
                  <th className="py-3 px-4">หัวข้อการประเมินย่อย (Subcategories)</th>
                  <th className="py-3 px-4 text-center">คะแนนของคุณ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3.5 px-4 font-semibold">1. Aufgabenbewältigung (Task Fulfillment)</td>
                  <td className="py-3.5 px-4 text-center font-bold">20</td>
                  <td className="py-3.5 px-4 text-slate-500">ตอบครบทุกประเด็น, ทำตามข้อกำหนด, ประเภทข้อความถูกต้อง, ไม่ออกนอกเรื่อง</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'task_fulfillment')?.score || 18}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">2. Inhalt & Entwicklung (Content Development)</td>
                  <td className="py-3.5 px-4 text-center font-bold">15</td>
                  <td className="py-3.5 px-4 text-slate-500">คุณภาพของเนื้อหา, ความสมเหตุสมผล, การอธิบายแนวคิด, ตัวอย่างประกอบ</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'content_development')?.score || 13}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">3. Wortschatz (Vocabulary)</td>
                  <td className="py-3.5 px-4 text-center font-bold">20</td>
                  <td className="py-3.5 px-4 text-slate-500">Vocabulary Range (5), Accuracy (5), Collocations (4), Context (3), Paraphrasing (3)</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'vocabulary')?.score || 16}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">4. Grammatik (Grammar)</td>
                  <td className="py-3.5 px-4 text-center font-bold">20</td>
                  <td className="py-3.5 px-4 text-slate-500">Verb Conjugation (4), Word Order (4), Cases & Articles (4), Sentence Structure (4), Accuracy (4)</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'grammar')?.score || 14}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">5. Kohärenz & Kohäsion (Cohesion)</td>
                  <td className="py-3.5 px-4 text-center font-bold">15</td>
                  <td className="py-3.5 px-4 text-slate-500">Logical Organisation (4), Paragraphs (3), Connectors (4), Transitions (2), Flow (2)</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'cohesion')?.score || 13}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">6. Register & Stil (Register & Style)</td>
                  <td className="py-3.5 px-4 text-center font-bold">5</td>
                  <td className="py-3.5 px-4 text-slate-500">Formality, ความเหมาะสมกับผู้อ่าน, ความสม่ำเสมอของรูปแบบภาษา</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'register')?.score || 4}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">7. Rechtschreibung & Zeichensetzung (Mechanics)</td>
                  <td className="py-3.5 px-4 text-center font-bold">5</td>
                  <td className="py-3.5 px-4 text-slate-500">Rechtschreibung, Groß- und Kleinschreibung, Kommasetzung, Satzzeichen</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'mechanics')?.score || 4}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td className="py-3.5 px-4">รวมทั้งสิ้น (Total)</td>
                  <td className="py-3.5 px-4 text-center">100 คะแนน</td>
                  <td className="py-3.5 px-4 text-slate-500">เกรด A: 90-100 • B: 80-89 • C: 70-79 • D: 60-69 • E: 50-59 • F: 0-49</td>
                  <td className="py-3.5 px-4 text-center text-lg text-blue-600 font-black">
                    {assessment.total_score}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
