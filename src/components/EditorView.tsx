import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  Clock,
  Sparkles,
  RotateCcw,
  RotateCw,
  Send,
  Save,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { WritingTask } from '../types';
import {
  countGermanWords,
  countGermanChars,
  countParagraphs,
  estimateReadingTimeMinutes,
} from '../utils/scoring';

interface EditorViewProps {
  tasks: WritingTask[];
  selectedTask: WritingTask;
  onSelectTask: (task: WritingTask) => void;
  onSubmit: (task: WritingTask, text: string) => Promise<void>;
  isSubmitting: boolean;
}

export const EditorView: React.FC<EditorViewProps> = ({
  tasks,
  selectedTask,
  onSelectTask,
  onSubmit,
  isSubmitting,
}) => {
  const [text, setText] = useState<string>(selectedTask.preset_draft || '');
  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});
  const [lastSaved, setLastSaved] = useState<string>('เพิ่งบันทึกแบบร่าง');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize when task changes
  useEffect(() => {
    setText(selectedTask.preset_draft || '');
    setCheckedRequirements({});
    setValidationError(null);
  }, [selectedTask]);

  // Autosave simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      setLastSaved(`บันทึกแบบร่างเมื่อ ${now.toLocaleTimeString('th-TH')}`);
    }, 1500);
    return () => clearTimeout(timer);
  }, [text]);

  const words = countGermanWords(text);
  const chars = countGermanChars(text);
  const paragraphs = countParagraphs(text);
  const readingTime = estimateReadingTimeMinutes(words);

  const isWordCountValid = words >= selectedTask.min_words && words <= selectedTask.max_words;
  const wordCountProgress = Math.min(100, Math.round((words / selectedTask.min_words) * 100));

  // Insert German Umlauts / Eszett at cursor
  const insertGermanChar = (char: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = text.substring(0, start) + char + text.substring(end);
    setUndoStack((prev) => [...prev, text]);
    setText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUndoStack((prev) => [...prev.slice(-20), text]);
    setRedoStack([]);
    setText(val);
    if (validationError && val.trim().length > 20) {
      setValidationError(null);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, text]);
    setUndoStack((u) => u.slice(0, -1));
    setText(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, text]);
    setRedoStack((r) => r.slice(0, -1));
    setText(next);
  };

  const handleLoadSampleDraft = () => {
    if (selectedTask.preset_draft) {
      setUndoStack((prev) => [...prev, text]);
      setText(selectedTask.preset_draft);
      setValidationError(null);
    }
  };

  const handleClear = () => {
    setUndoStack((prev) => [...prev, text]);
    setText('');
  };

  const handleRequirementToggle = (idx: number) => {
    setCheckedRequirements((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSubmit = async () => {
    if (!text || text.trim().length === 0) {
      setValidationError('กรุณาเขียนข้อความภาษาเยอรมันก่อนกดส่งประเมิน');
      return;
    }

    if (words < 30) {
      setValidationError(`ข้อความสั้นเกินไป (${words} คำ) ควรมีอย่างน้อย 30 คำขึ้นไปเพื่อให้ระบบประเมินไวยากรณ์ได้`);
      return;
    }

    setValidationError(null);
    await onSubmit(selectedTask, text);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Task Selector & Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                Niveau {selectedTask.cefr_level}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedTask.category}
              </span>
              <span className="text-xs text-slate-400">
                รหัสโจทย์: {selectedTask.task_id} (v{selectedTask.task_version})
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {selectedTask.title}
            </h1>
          </div>

          {/* Task switcher dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="task-select" className="text-xs text-slate-500 font-medium">
              สลับโจทย์:
            </label>
            <select
              id="task-select"
              value={selectedTask.id}
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value);
                if (found) onSelectTask(found);
              }}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.cefr_level}] {t.category}: {t.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Instructions (Left) + Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Task Requirements & Academic Outline (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>คำสั่งและข้อกำหนด (Task)</span>
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedTask.time_limit_minutes} นาที</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif sm:font-sans bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {selectedTask.instructions}
            </p>

            {/* Requirements Checklist */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ประเด็นที่ต้องตอบ (Checklist):
              </span>
              <div className="space-y-1.5">
                {selectedTask.requirements.map((req, idx) => {
                  const isChecked = !!checkedRequirements[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleRequirementToggle(idx)}
                      className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-snug">{req}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggested Outline */}
            {selectedTask.sample_outline && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  โครงสร้างข้อความที่แนะนำ (Gliederung):
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  {selectedTask.sample_outline.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Academic Mode Notice */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Academic Mode:</strong> ระบบปิดการตรวจแก้คำผิดอัตโนมัติระหว่างเขียน เพื่อวัดผลความสามารถจริงของผู้เรียน
              </span>
            </div>
          </div>
        </div>

        {/* Right: Academic Writing Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              {/* German Characters Bar */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 px-1 font-semibold">เยอรมัน:</span>
                {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => insertGermanChar(char)}
                    className="w-7 h-7 rounded text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center bg-white dark:bg-slate-700 shadow-2xs"
                    title={`พิมพ์ ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Undo / Redo & Sample Essay Action */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  title="Undo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  title="Redo"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {selectedTask.preset_draft && (
                  <button
                    type="button"
                    onClick={handleLoadSampleDraft}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 transition-colors flex items-center gap-1"
                    title="โหลดตัวอย่างงานเขียนที่มีข้อผิดพลาดจริงเพื่อทดสอบการประเมิน"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>โหลดตัวอย่างข้อเขียนจริง</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  ล้างข้อความ
                </button>
              </div>
            </div>

            {/* Textarea Area */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="Schreiben Sie hier Ihren Text auf Deutsch... (พิมพ์ข้อความคำตอบภาษาเยอรมันที่นี่)"
                rows={16}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full p-4 rounded-xl text-sm leading-relaxed font-sans text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-shadow placeholder:text-slate-400"
              />
            </div>

            {/* Live Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {/* Word Count Indicator with target range */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">จำนวนคำ:</span>
                  <span
                    className={`font-bold text-sm ${
                      isWordCountValid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : words < selectedTask.min_words
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {words}
                  </span>
                  <span className="text-slate-400">
                    / {selectedTask.min_words}–{selectedTask.max_words} Wörter
                  </span>
                </div>

                <div className="hidden sm:block w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${
                      words >= selectedTask.min_words ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${wordCountProgress}%` }}
                  />
                </div>
              </div>

              {/* Characters, Paragraphs, Time */}
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>{chars} ตัวอักษร</span>
                <span>•</span>
                <span>{paragraphs} ย่อหน้า</span>
                <span>•</span>
                <span>อ่าน ~{readingTime} นาที</span>
              </div>

              {/* Autosave status */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Save className="w-3 h-3 text-slate-400" />
                <span>{lastSaved}</span>
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                <span>ระบบจะประเมินตาม Rubric 100 คะแนนและวิเคราะห์ข้อผิดพลาดทุกจุด</span>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-blue-500/25 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>กำลังประเมินงานเขียน (4 ขั้นตอน)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งงานเขียนเพื่อรับผลประเมิน (Submit Writing)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Processing Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                AI Examiner กำลังตรวจประเมินงานเขียน
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ดำเนินการตามเกณฑ์มาตรฐานวิชาการ 4 ขั้นตอนอย่างเคร่งครัด
              </p>
            </div>

            <div className="space-y-2 text-left text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Stage 1: ตรวจสอบจำนวนคำและเงื่อนไขโจทย์</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>Stage 2: ตรวจจับข้อผิดพลาดตาม Taxonomy (GRM, VOC, COH)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                <span>Stage 3: คำนวณ Rubric 100 คะแนนและประเมิน CEFR Profile</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                <span>Stage 4: สร้างโมเดลงานเขียน B2/C1 และคำอธิบายภาษาไทย</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
