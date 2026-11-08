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
  FileText,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  PenLine,
} from 'lucide-react';
import { AssessmentResult, AssessmentError } from '../types';

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

  // Eye-friendly pastel color classes for error categories
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'GRAMMAR':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          badge: 'bg-rose-100 text-rose-800 border border-rose-200',
          highlight: 'bg-rose-100/70 border-b-2 border-rose-400 text-rose-950 cursor-pointer hover:bg-rose-200/80',
          indicator: 'bg-rose-500',
        };
      case 'VOCABULARY':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          badge: 'bg-amber-100 text-amber-800 border border-amber-200',
          highlight: 'bg-amber-100/70 border-b-2 border-amber-400 text-amber-950 cursor-pointer hover:bg-amber-200/80',
          indicator: 'bg-amber-500',
        };
      case 'COHESION':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          badge: 'bg-sky-100 text-sky-800 border border-sky-200',
          highlight: 'bg-sky-100/70 border-b-2 border-sky-400 text-sky-950 cursor-pointer hover:bg-sky-200/80',
          indicator: 'bg-sky-500',
        };
      case 'STYLE':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
          highlight: 'bg-indigo-100/70 border-b-2 border-indigo-400 text-indigo-950 cursor-pointer hover:bg-indigo-200/80',
          indicator: 'bg-indigo-500',
        };
      default: // MECHANICS
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          badge: 'bg-slate-100 text-slate-700 border border-slate-300',
          highlight: 'bg-slate-200/70 border-b-2 border-slate-400 text-slate-900 cursor-pointer hover:bg-slate-300/80',
          indicator: 'bg-slate-500',
        };
    }
  };

  // Render text with interactive highlighted spans
  const renderHighlightedText = () => {
    const raw = assessment.original_text;
    if (assessment.errors.length === 0) {
      return <p className="leading-relaxed whitespace-pre-wrap font-sans text-slate-800">{raw}</p>;
    }

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
            className={`px-1.5 py-0.5 rounded transition-all font-medium ${colors.highlight} ${
              isSelected ? 'ring-2 ring-blue-500 font-semibold shadow-xs' : ''
            }`}
            title={`คลิกเพื่อดูคำอธิบาย: ${err.explanation_th}`}
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
      <div className="leading-relaxed whitespace-pre-wrap font-sans text-base text-slate-800">
        {elements}
      </div>
    );
  };

  return (
    <div className="space-y-6 py-6">
      {/* Top Academic Report Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200/60">
                รายงานผลการประเมินวิชาการ (CEFR Assessment Report)
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {assessment.task_title}
            </h1>
            <p className="text-xs text-slate-500">
              ประเภท: {assessment.task_category} • ระดับเป้าหมาย: Niveau {assessment.task_level} • ความยาว: {assessment.word_count} คำ
            </p>
          </div>

          {/* Key Score Cards */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Total Score 100 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                คะแนนรวม (Rubric)
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {assessment.total_score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Grade Badge */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
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
            <div className="bg-blue-50 border border-blue-200/80 rounded-xl px-4 py-2.5 text-center min-w-[120px]">
              <span className="text-[10px] text-blue-700 uppercase tracking-wider font-bold block">
                CEFR Estimate
              </span>
              <span className="text-2xl font-black block mt-0.5 text-blue-700">
                {assessment.cefr_estimate}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold block">
                {assessment.cefr_confidence === 'high' ? 'High Confidence' : 'Developing'}
              </span>
            </div>
          </div>
        </div>

        {/* Action / Print Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-6 border-t border-slate-100 text-xs">
          <p className="text-slate-600 text-xs">
            {assessment.cefr_summary_th}
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>พิมพ์รายงาน</span>
            </button>
            <button
              onClick={onStartNewWriting}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>ฝึกเขียนโจทย์ถัดไป</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Scannable Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>ภาพรวมคะแนน (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('interactive')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'interactive'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ไฮไลต์ข้อความ (Interactive Text)</span>
          {assessment.errors.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'interactive' ? 'bg-white text-blue-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {assessment.errors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'errors'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>จำแนกข้อผิดพลาด (Taxonomy)</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'versions'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>โมเดลงานเขียน 3 ฉบับ (Writing Models)</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'lessons'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>บทเรียนแนะนำ (Grammar Lessons)</span>
        </button>

        <button
          onClick={() => setActiveTab('rubric')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'rubric'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>จุดแข็งของงานเขียน (Stärken)</span>
              </h3>
              <ul className="space-y-2 text-xs text-emerald-950">
                {assessment.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>จุดที่ควรพัฒนา (Schwächen)</span>
              </h3>
              <ul className="space-y-2 text-xs text-amber-950">
                {assessment.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span className="leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7 Category Scores Breakdown */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  รายละเอียดคะแนนทั้ง 7 หมวด (Kriterienbewertung)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ประเมินอย่างเป็นกลางตามเกณฑ์ Rubric 100 คะแนนเต็ม
                </p>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                คะแนนรวม: {assessment.total_score} / 100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.category_scores.map((cat, idx) => {
                const pct = Math.round((cat.score / cat.max_score) * 100);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {cat.label_de}
                        </span>
                        <span className="text-[10px] text-slate-500">{cat.label_en}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-slate-900">
                          {cat.score}
                        </span>
                        <span className="text-slate-400 text-xs"> / {cat.max_score}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 85 ? 'bg-blue-600' : pct >= 70 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-600 leading-snug">
                      {cat.feedback_th}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CEFR Profile Details by Skill */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              CEFR Skill Profile (สมรรถนะรายทักษะตามเกณฑ์ยุโรป)
            </h3>
            <p className="text-xs text-slate-500">
              ระบบวิเคราะห์ระดับย่อย B1, B1+, B2, B2+, C1 เพื่อสะท้อนระดับที่แท้จริงของผู้เรียน
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {Object.entries(assessment.cefr_profile).map(([skill, lvl], i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50 text-center"
                >
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase truncate">
                    {skill.replace('_', ' ')}
                  </span>
                  <span className="text-xl font-black text-blue-600 block mt-1">
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
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  ข้อความต้นฉบับพร้อมไฮไลต์ (Interactive Writing)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  คลิกที่คำหรือวลีที่มีสีไฮไลต์เพื่อดูคำอธิบาย กฎไวยากรณ์ และตัวอย่างในแถบด้านขวา
                </p>
              </div>
            </div>

            {/* Category Color Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-semibold">สัญลักษณ์สี:</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                ไวยากรณ์ (Grammatik)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                คำศัพท์ (Wortschatz)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                คำเชื่อม (Kohäsion)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                การสะกด/วรรคตอน
              </span>
            </div>

            {/* Highlighted text container */}
            <div className="bg-[#fcfcfd] p-5 rounded-xl border border-slate-200/70 leading-relaxed">
              {renderHighlightedText()}
            </div>
          </div>

          {/* Right Inspector Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedError ? (
              <div className="bg-white border border-blue-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getCategoryColor(selectedError.category).badge}`}>
                      {selectedError.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {selectedError.subcategory}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ความแม่นยำ {(selectedError.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Original vs Corrected comparison */}
                <div className="space-y-2">
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-xs">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                      ข้อความเดิม (Original):
                    </span>
                    <span className="text-sm font-semibold text-rose-900 line-through">
                      {selectedError.original_text}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      ข้อความที่ถูกต้อง (Korrektur):
                    </span>
                    <span className="text-sm font-bold text-emerald-900">
                      {selectedError.corrected_text}
                    </span>
                  </div>
                </div>

                {/* Detailed Thai Explanation */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>คำอธิบายเหตุผล (Erklärung auf Thai):</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    {selectedError.explanation_th}
                  </p>
                </div>

                {/* Relevant Grammar Rule */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    กฎไวยากรณ์ที่เกี่ยวข้อง (Regel):
                  </span>
                  <div className="text-xs font-semibold text-blue-700">
                    {selectedError.rule}
                  </div>
                </div>

                {/* Examples */}
                {selectedError.examples && selectedError.examples.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      ตัวอย่างประโยคที่ถูกต้อง (Beispiele):
                    </span>
                    {selectedError.examples.map((ex, i) => (
                      <div key={i} className="text-xs bg-slate-50 p-2.5 rounded-lg space-y-0.5 border border-slate-200/50">
                        <div className="font-semibold text-slate-900">
                          {ex.german}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ex.thai}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleSaveWord(selectedError)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{savedVocabId === selectedError.id ? 'บันทึกแล้ว ✓' : 'บันทึกลงคลังคำศัพท์'}</span>
                  </button>

                  <button
                    onClick={() => onOpenLesson('lesson-nebensaetze')}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>ดูบทเรียน</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
                <p>คลิกที่คำหรือประโยคที่มีไฮไลต์เพื่อดูการวิเคราะห์</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ERROR TAXONOMY TABLE */}
      {activeTab === 'errors' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                ตารางจำแนกข้อผิดพลาดตาม Taxonomy (Error Taxonomy)
              </h3>
              <p className="text-xs text-slate-500">
                พบข้อผิดพลาดทั้งหมด {assessment.errors.length} จุด (ไวยากรณ์, คำศัพท์, คำเชื่อม, วรรคตอน)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">ข้อความเดิม</th>
                  <th className="py-3 px-4">ข้อความที่ถูกต้อง</th>
                  <th className="py-3 px-4">คำอธิบายภาษาไทย</th>
                  <th className="py-3 px-4">กฎไวยากรณ์</th>
                  <th className="py-3 px-4">ระดับความสำคัญ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessment.errors.map((err) => (
                  <tr key={err.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getCategoryColor(err.category).badge}`}>
                        {err.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-rose-600 line-through">
                      {err.original_text}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {err.corrected_text}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs leading-relaxed">
                      {err.explanation_th}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-blue-700">
                      {err.rule}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        err.severity === 'major' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
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
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              โมเดลพัฒนาข้อความ 3 เวอร์ชัน (Three Writing Versions)
            </h3>
            <p className="text-xs text-slate-500">
              เรียนรู้วิธีการปรับปรุงข้อความจากงานเดิม โดยเปรียบเทียบระหว่างเวอร์ชันแก้ไข, เวอร์ชัน B2 และเวอร์ชัน C1 ขั้นสูง
            </p>
          </div>

          {/* Academic notice */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>ข้อกำหนดทางวิชาการ:</strong> เวอร์ชัน B2 และ C1 เป็นโมเดลตัวอย่างเพื่อการเรียนรู้ ไม่ใช่หลักฐานยืนยันคะแนนสอบจริงของผู้เรียน คะแนนของท่านได้รับการประเมินจากงานเขียนต้นฉบับเท่านั้น
            </span>
          </div>

          {/* Version sub-tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setVersionTab('corrected')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                versionTab === 'corrected'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. ฉบับแก้ไขข้อผิดพลาด (Corrected Version)
            </button>
            <button
              onClick={() => setVersionTab('b2_improved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                versionTab === 'b2_improved'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. ฉบับยกระดับคำเชื่อม (B2 Improved Version)
            </button>
            <button
              onClick={() => setVersionTab('c1_model')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                versionTab === 'c1_model'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. ฉบับวิชาการชั้นสูง (C1 Model Version)
            </button>
          </div>

          {/* Version Content */}
          <div className="relative bg-[#fcfcfd] p-6 rounded-2xl border border-slate-200/80">
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
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedText === versionTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedText === versionTab ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
              </button>
            </div>

            <p className="text-base font-sans leading-relaxed whitespace-pre-wrap text-slate-800">
              {versionTab === 'corrected' && assessment.writing_versions.corrected}
              {versionTab === 'b2_improved' && assessment.writing_versions.b2_improved}
              {versionTab === 'c1_model' && assessment.writing_versions.c1_model}
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: LESSONS & RECOMMENDATIONS */}
      {activeTab === 'lessons' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              บทเรียนที่แนะนำเฉพาะบุคคล (Personalized Learning Recommendations)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบคัดเลือกบทเรียนไวยากรณ์ภาษาเยอรมันที่ตรงกับข้อผิดพลาดที่เกิดขึ้นในงานเขียนชิ้นนี้
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {assessment.learning_recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      คำแนะนำที่ {idx + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        rec.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">
                    {rec.topic}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rec.reason_th}
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    → {rec.action_th}
                  </p>
                </div>

                <button
                  onClick={() => onOpenLesson(rec.lesson_id || 'lesson-nebensaetze')}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              เกณฑ์การประเมิน 100 คะแนนเต็ม (Assessment Rubric Specification)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              อ้างอิงกรอบ CEFR 2020 และแนวทางของ Goethe-Zertifikat / Cambridge Assessment
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">หมวดการประเมิน (Assessment Category)</th>
                  <th className="py-3 px-4 text-center">คะแนนเต็ม</th>
                  <th className="py-3 px-4">หัวข้อการประเมินย่อย (Subcategories)</th>
                  <th className="py-3 px-4 text-center">คะแนนที่ได้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">1. Aufgabenbewältigung (Task Fulfillment)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">20</td>
                  <td className="py-3.5 px-4 text-slate-500">ตอบครบทุกประเด็น, ทำตามข้อกำหนด, ประเภทข้อความถูกต้อง</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'task_fulfillment')?.score || 18}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">2. Inhalt & Entwicklung (Content Development)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">15</td>
                  <td className="py-3.5 px-4 text-slate-500">คุณภาพของเนื้อหา, ความสมเหตุสมผล, ตัวอย่างประกอบ</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'content_development')?.score || 13}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">3. Wortschatz (Vocabulary)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">20</td>
                  <td className="py-3.5 px-4 text-slate-500">Range, Accuracy, Collocations, Context, Paraphrasing</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'vocabulary')?.score || 16}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">4. Grammatik (Grammar)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">20</td>
                  <td className="py-3.5 px-4 text-slate-500">Verb Conjugation, Word Order, Cases, Sentence Structure</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'grammar')?.score || 14}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">5. Kohärenz & Kohäsion (Cohesion)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">15</td>
                  <td className="py-3.5 px-4 text-slate-500">Organisation, Paragraphs, Connectors, Flow</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'cohesion')?.score || 13}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">6. Register & Stil (Register & Style)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">5</td>
                  <td className="py-3.5 px-4 text-slate-500">Formality, ความเหมาะสมกับผู้อ่าน</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'register')?.score || 4}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">7. Rechtschreibung (Mechanics)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">5</td>
                  <td className="py-3.5 px-4 text-slate-500">Groß-/Kleinschreibung, Kommasetzung, Zeichen</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-blue-600">
                    {assessment.category_scores.find((c) => c.category === 'mechanics')?.score || 4}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td className="py-3.5 px-4 text-slate-900">รวมทั้งสิ้น (Total)</td>
                  <td className="py-3.5 px-4 text-center text-slate-900">100 คะแนน</td>
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
