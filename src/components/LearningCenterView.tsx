import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  ChevronRight,
} from 'lucide-react';
import { GrammarLesson, CEFRLevel } from '../types';

interface LearningCenterViewProps {
  lessons: GrammarLesson[];
  activeLessonId?: string | null;
  onSelectLesson?: (id: string) => void;
  onStartWriting?: (level?: string) => void;
}

const getLevelBadgeStyle = (level: CEFRLevel) => {
  switch (level) {
    case 'C1':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'B2':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'B1':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'A2':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    default:
      return 'bg-teal-50 text-teal-700 border-teal-200';
  }
};

export const LearningCenterView: React.FC<LearningCenterViewProps> = ({
  lessons,
  activeLessonId,
  onStartWriting,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    activeLessonId || (lessons[0]?.id ?? 'lesson-nebensaetze')
  );
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    if (activeLessonId) {
      setSelectedId(activeLessonId);
      setUserAnswers({});
      setShowResults(false);
    }
  }, [activeLessonId]);

  const filteredLessons =
    levelFilter === 'ALL'
      ? lessons
      : lessons.filter((l) => l.cefr_level === levelFilter);

  const selectedLesson =
    lessons.find((l) => l.id === selectedId) || filteredLessons[0] || lessons[0];

  const handleSelectLesson = (id: string) => {
    setSelectedId(id);
    setUserAnswers({});
    setShowResults(false);
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleCheckQuiz = () => {
    setShowResults(true);
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Deutsches Grammatik- & Schreibzentrum
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
          คลังความรู้ไวยากรณ์และเทคนิคการเขียนภาษาเยอรมัน (Learning Center)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          บทเรียนไวยากรณ์ โครงสร้างย่อหน้า และชุดสำนวนการเขียนระดับ A1–C1 ที่เน้นจุดที่ผู้เรียนชาวไทยมักทำผิดบ่อย พร้อมตัวอย่างเปรียบเทียบถูก-ผิด และแบบฝึกหัดประเมินตนเอง
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Lessons List (4 cols) */}
        <aside className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="px-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              เลือกหัวข้อบทเรียน ({filteredLessons.length}/{lessons.length} บทเรียน)
            </span>
          </div>

          <div className="flex flex-wrap gap-1 px-1">
            {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => {
              const count =
                lvl === 'ALL'
                  ? lessons.length
                  : lessons.filter((l) => l.cefr_level === lvl).length;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setLevelFilter(lvl);
                    const nextPool =
                      lvl === 'ALL'
                        ? lessons
                        : lessons.filter((l) => l.cefr_level === lvl);
                    if (nextPool.length > 0 && !nextPool.some((l) => l.id === selectedId)) {
                      handleSelectLesson(nextPool[0].id);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    levelFilter === lvl
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {lvl === 'ALL' ? `ทั้งหมด (${count})` : `${lvl} (${count})`}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
            {filteredLessons.map((lesson) => {
              const isSelected = lesson.id === selectedLesson.id;
              return (
                <button
                  type="button"
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`w-full text-left p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 text-blue-950 shadow-2xs font-medium'
                      : 'border-transparent hover:bg-slate-50 text-slate-700 hover:border-slate-200/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`px-1.5 py-0.2 rounded-md font-bold text-[10px] border ${getLevelBadgeStyle(
                        lesson.cefr_level
                      )}`}
                    >
                      {lesson.cefr_level}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {lesson.topic}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1">{lesson.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {lesson.german_title}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Lesson Details & Interactive Quiz (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            {/* Title & Badge */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getLevelBadgeStyle(
                      selectedLesson.cefr_level
                    )}`}
                  >
                    Niveau {selectedLesson.cefr_level}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedLesson.german_title}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {selectedLesson.title}
                </h2>
              </div>

              {onStartWriting && (
                <button
                  onClick={() => onStartWriting(selectedLesson.cefr_level)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                  title={`ทำข้อสอบระดับ ${selectedLesson.cefr_level}`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>ฝึกทำข้อสอบระดับ {selectedLesson.cefr_level}</span>
                </button>
              )}
            </div>

            {/* Thai Detailed Explanation */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                คำอธิบายหลักการ (Erklärung):
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 font-sans">
                {selectedLesson.explanation_th}
              </p>
            </div>

            {/* Core Rules Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                กฎสำคัญที่ต้องจำ (Wichtige Regeln):
              </h3>
              <div className="space-y-2">
                {selectedLesson.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples: Correct vs Incorrect side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Correct examples */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ตัวอย่างที่ถูกต้อง (Richtig)</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedLesson.correct_examples.map((ex, i) => (
                    <div key={i} className="text-xs space-y-0.5 border-b border-emerald-100 pb-2 last:border-none">
                      <div className="font-semibold text-emerald-950">
                        {ex.german}
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        {ex.thai}
                      </div>
                      {ex.note && (
                        <div className="text-[10px] text-emerald-700 italic pt-0.5">
                          💡 {ex.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Incorrect examples with reasons */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>ข้อผิดพลาดที่พบบ่อย (Falsch & Korrektur)</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedLesson.incorrect_examples.map((ex, i) => (
                    <div key={i} className="text-xs space-y-1 border-b border-rose-100 pb-2 last:border-none">
                      <div className="font-semibold text-rose-950 line-through">
                        {ex.german}
                      </div>
                      <div className="text-emerald-700 font-bold">
                        → {ex.correction}
                      </div>
                      <div className="text-[10px] text-rose-800 leading-snug">
                        เหตุผล: {ex.why_wrong_th}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Mini-Quiz */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>แบบฝึกหัดทดสอบความเข้าใจ (Übungsaufgaben)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ตอบคำถามด้านล่างเพื่อวัดความเข้าใจในหลักการของบทเรียนนี้
                  </p>
                </div>

                {showResults && (
                  <button
                    onClick={handleResetQuiz}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ทำใหม่อีกครั้ง</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {selectedLesson.quiz.map((q, qIdx) => {
                  const selectedOpt = userAnswers[qIdx];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-slate-900">
                        ข้อที่ {qIdx + 1}: {q.question}
                      </h4>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

                          if (showResults) {
                            if (optIdx === q.correctIndex) {
                              optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              optStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-500';
                          }

                          return (
                            <button
                              type="button"
                              key={optIdx}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${optStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-amber-600" />
                            )}
                            <span>{isCorrect ? 'ถูกต้องแล้ว! (Richtig)' : 'ยังไม่ถูกต้อง (Falsch)'}</span>
                          </div>
                          <span>{q.explanation_th}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!showResults && (
                <button
                  onClick={handleCheckQuiz}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  ตรวจคำตอบ (Check Answers)
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
