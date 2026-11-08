import React, { useState, useEffect, useRef } from 'react';
import {
  PenLine,
  Clock,
  Sparkles,
  RotateCcw,
  RotateCw,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Dices,
  Shuffle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WritingTask, CEFRLevel } from '../types';
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
  onRollRandomTask: (levelFilter?: string) => void;
  onSubmit: (task: WritingTask, text: string) => Promise<void>;
  isSubmitting: boolean;
}

export const EditorView: React.FC<EditorViewProps> = ({
  tasks,
  selectedTask,
  onSelectTask,
  onRollRandomTask,
  onSubmit,
  isSubmitting,
}) => {
  // Start with clean blank canvas so the learner writes their own text
  const [text, setText] = useState<string>('');
  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});
  const [lastSaved, setLastSaved] = useState<string>('พร้อมสำหรับการเขียน');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showOutline, setShowOutline] = useState<boolean>(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize when task changes - keep clean canvas
  useEffect(() => {
    setCheckedRequirements({});
    setValidationError(null);
  }, [selectedTask]);

  // Autosave status indicator
  useEffect(() => {
    if (!text.trim()) {
      setLastSaved('พร้อมสำหรับการเขียน');
      return;
    }
    const timer = setTimeout(() => {
      const now = new Date();
      setLastSaved(`บันทึกแบบร่าง ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`);
    }, 1200);
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
    if (validationError && val.trim().length > 10) {
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
    setValidationError(null);
  };

  const handleRequirementToggle = (idx: number) => {
    setCheckedRequirements((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSubmit = async () => {
    if (!text || text.trim().length === 0) {
      setValidationError('กรุณาเขียนข้อความภาษาเยอรมันในช่องพิมพ์ก่อนกดส่งตรวจ');
      return;
    }

    setValidationError(null);
    await onSubmit(selectedTask, text);
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'B1':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'B2':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'C1':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-200">
      {/* Centralized Random Exam Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ข้อสอบกลางมาตรฐาน (Zentraler Prüfungstest)</span>
              </span>

              <span className={`px-2 py-0.5 rounded-md font-bold text-xs border ${getLevelStyle(selectedTask.cefr_level)}`}>
                Niveau {selectedTask.cefr_level}
              </span>

              <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-slate-100 text-slate-700 border border-slate-200">
                {selectedTask.category}
              </span>

              <span className="text-slate-400 text-xs font-mono">
                {selectedTask.task_id}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {selectedTask.title}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              โจทย์ในการทำข้อสอบเป็นโจทย์กลางที่ถูกสุ่มขึ้นมาตามมาตรฐานสากล ระบบจะประเมินคะแนน CEFR จริง 100 คะแนนจากสิ่งที่คุณเขียน
            </p>
          </div>

          {/* Random Task Draw Controller */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              {['ALL', 'B1', 'B2', 'C1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedLevelFilter(lvl);
                    onRollRandomTask(lvl === 'ALL' ? undefined : lvl);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    selectedLevelFilter === lvl
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`สุ่มโจทย์เฉพาะระดับ ${lvl}`}
                >
                  {lvl === 'ALL' ? 'ทุกระดับ' : lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => onRollRandomTask(selectedLevelFilter === 'ALL' ? undefined : selectedLevelFilter)}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              title="สุ่มโจทย์ข้อสอบกลางชุดใหม่"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-600" />
              <span>สุ่มโจทย์ใหม่ (Draw Task)</span>
            </button>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                isFocusMode
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={isFocusMode ? 'ออกจากโหมดสมาธิ' : 'เปิดโหมดเขียนเต็มจอ (Focus Mode)'}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFocusMode ? 'ปกติ' : 'สมาธิ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className={`grid gap-6 items-start ${isFocusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* Left Column: Guidelines & Requirements Checklist (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              {/* Task Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-sm text-slate-900">
                    คำสั่งและข้อกำหนด
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>เวลาสอบ {selectedTask.time_limit_minutes} นาที</span>
                </div>
              </div>

              {/* Instructions text */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-sans">
                {selectedTask.instructions}
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    ประเด็นที่ต้องตอบ (Leitpunkte):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {Object.values(checkedRequirements).filter(Boolean).length} / {selectedTask.requirements.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedTask.requirements.map((req, idx) => {
                    const isChecked = !!checkedRequirements[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => handleRequirementToggle(idx)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs cursor-pointer select-none transition-all border ${
                          isChecked
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-snug">{req}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Outline Accordion */}
              {selectedTask.sample_outline && (
                <div className="border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowOutline(!showOutline)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors py-1 cursor-pointer"
                  >
                    <span>แนวทางการวางโครงสร้าง (Gliederung)</span>
                    {showOutline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showOutline && (
                    <ul className="mt-2 space-y-1.5 bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-100">
                      {selectedTask.sample_outline.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">{i + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Target Word Count Guide */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1 text-xs text-blue-950">
                <div className="font-bold flex items-center justify-between">
                  <span>เกณฑ์จำนวนคำที่กำหนด:</span>
                  <span className="text-blue-700">{selectedTask.min_words}–{selectedTask.max_words} คำ</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  * หากเขียนน้อยกว่า 50% ของเกณฑ์ ระบบจะลดคะแนนตามความเป็นจริง
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* Right Column: Writing Canvas (Editor) */}
        <section className={`${isFocusMode ? 'max-w-4xl mx-auto w-full' : 'lg:col-span-8'} space-y-4`}>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top Toolbar: Special German Characters & Editing Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              {/* German Letters Bar */}
              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 px-1 font-semibold hidden sm:inline">อักษรเยอรมัน:</span>
                {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => insertGermanChar(char)}
                    className="w-7 h-7 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-slate-200/80 shadow-2xs active:scale-95 cursor-pointer"
                    title={`แทรกตัวอักษร ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Tools: Undo / Redo / Sample / Clear */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                  title="ย้อนกลับ (Undo)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                  title="ทำซ้ำ (Redo)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {selectedTask.preset_draft && !text && (
                  <button
                    type="button"
                    onClick={handleLoadSampleDraft}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="โหลดตัวอย่างข้อเขียนเพื่อทดสอบระบบประเมิน"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>ตัวอย่างทดสอบ</span>
                  </button>
                )}

                {text && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    ล้างข้อความ
                  </button>
                )}
              </div>
            </div>

            {/* Main Textarea Canvas */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="Schreiben Sie hier Ihren Text auf Deutsch... (เริ่มต้นพิมพ์ข้อความภาษาเยอรมันของคุณที่นี่)"
                rows={isFocusMode ? 20 : 16}
                className="w-full p-4 rounded-xl text-sm leading-relaxed bg-slate-50/50 border border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans transition-all resize-y"
                style={{ minHeight: '320px' }}
              />

              {validationError && (
                <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* Real-time Word & Character Counter */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-slate-500">จำนวนคำที่เขียนจริง:</span>
                  <span className={`text-sm font-bold ${
                    isWordCountValid
                      ? 'text-emerald-600'
                      : words > selectedTask.max_words
                      ? 'text-amber-600'
                      : 'text-slate-900'
                  }`}>
                    {words}
                  </span>
                  <span className="text-slate-400 font-normal">
                    / {selectedTask.min_words}–{selectedTask.max_words} คำ
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>{chars} ตัวอักษร</span>
                  <span>•</span>
                  <span>{paragraphs} ย่อหน้า</span>
                  <span>•</span>
                  <span>เวลาอ่าน ~{readingTime} นาที</span>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  {lastSaved}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    words >= selectedTask.min_words && words <= selectedTask.max_words
                      ? 'bg-emerald-500'
                      : words > selectedTask.max_words
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, (words / selectedTask.min_words) * 100)}%` }}
                />
              </div>
            </div>

            {/* Submission Section */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                ระบบจะวิเคราะห์ประมวลผลข้อเขียนของคุณตามเกณฑ์ CEFR 7 หมวดอย่างเป็นกลางและเที่ยงตรง
              </p>

              <button
                type="button"
                disabled={isSubmitting || !text.trim()}
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังประมวลผลการตรวจตามเกณฑ์ CEFR...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งตรวจประเมินผลงานเขียน (Submit Writing)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
