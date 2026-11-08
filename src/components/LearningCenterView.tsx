import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { GrammarLesson } from '../types';

interface LearningCenterViewProps {
  lessons: GrammarLesson[];
  activeLessonId?: string | null;
  onSelectLesson?: (id: string) => void;
}

export const LearningCenterView: React.FC<LearningCenterViewProps> = ({
  lessons,
  activeLessonId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    activeLessonId || (lessons[0]?.id ?? 'lesson-nebensaetze')
  );
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const selectedLesson = lessons.find((l) => l.id === selectedId) || lessons[0];

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
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Deutsches Grammatikzentrum
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          คลังความรู้ไวยากรณ์ภาษาเยอรมันเชิงวิชาการ (Learning Center)
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          บทเรียนไวยากรณ์ระดับ B1–C1 ออกแบบมาเพื่ออธิบายจุดที่ผู้เรียนชาวไทยมักทำผิดบ่อย พร้อมตัวอย่างประโยคเปรียบเทียบถูก-ผิด และแบบฝึกหัดประเมินตนเอง
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Lessons List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            เลือกหัวข้อบทเรียน ({lessons.length} บทเรียน):
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {lessons.map((lesson) => {
              const isSelected = lesson.id === selectedLesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        lesson.cefr_level === 'C1'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : lesson.cefr_level === 'B2'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Lesson Details & Interactive Quiz (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Title & Badge */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  Niveau {selectedLesson.cefr_level}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedLesson.german_title}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedLesson.title}
              </h2>
            </div>

            {/* Thai Detailed Explanation */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                คำอธิบายหลักการ (Erklärung):
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
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
                    className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples: Correct vs Incorrect side-by-side or stacked */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Correct examples */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ตัวอย่างที่ถูกต้อง (Richtig)</span>
                </h4>
                <div className="space-y-2">
                  {selectedLesson.correct_examples.map((ex, i) => (
                    <div key={i} className="text-xs space-y-0.5 border-b border-emerald-100 dark:border-emerald-900/30 pb-2 last:border-none">
                      <div className="font-semibold text-emerald-950 dark:text-emerald-200">
                        {ex.german}
                      </div>
                      <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                        {ex.thai}
                      </div>
                      {ex.note && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 italic">
                          💡 {ex.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Incorrect examples with reasons */}
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>ข้อผิดพลาดที่พบบ่อย (Falsch & Korrektur)</span>
                </h4>
                <div className="space-y-2">
                  {selectedLesson.incorrect_examples.map((ex, i) => (
                    <div key={i} className="text-xs space-y-1 border-b border-red-100 dark:border-red-900/30 pb-2 last:border-none">
                      <div className="font-semibold text-red-950 dark:text-red-200 line-through">
                        {ex.german}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                        → {ex.correction}
                      </div>
                      <div className="text-[10px] text-red-700 dark:text-red-300 leading-snug">
                        เหตุผล: {ex.why_wrong_th}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Mini-Quiz */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>แบบฝึกหัดทดสอบความเข้าใจ (Übungsaufgaben)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ตอบคำถามด้านล่างเพื่อวัดความเข้าใจในหลักการของบทเรียนนี้
                  </p>
                </div>

                {showResults && (
                  <button
                    onClick={handleResetQuiz}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
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
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        ข้อที่ {qIdx + 1}: {q.question}
                      </h4>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200';

                          if (showResults) {
                            if (optIdx === q.correctIndex) {
                              optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              optStyle = 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-200';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-500';
                          }

                          return (
                            <div
                              key={optIdx}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2 ${optStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                              : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5 mb-0.5">
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  ตรวจคำตอบ (Check Answers)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
